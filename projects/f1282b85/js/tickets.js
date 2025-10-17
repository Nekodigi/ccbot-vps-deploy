// ユーザーのチケット一覧を取得
async function getUserTickets(userId) {
  try {
    const snapshot = await db.collection(`${getUserBasePath(userId)}/tickets`)
      .orderBy('purchasedAt', 'desc')
      .get();

    const tickets = [];
    snapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, tickets };
  } catch (error) {
    console.error('Get user tickets error:', error);
    return { success: false, error: 'チケットの取得に失敗しました', tickets: [] };
  }
}

// チケット詳細の取得
async function getTicketById(userId, ticketId) {
  try {
    const docRef = db.doc(`${getUserBasePath(userId)}/tickets/${ticketId}`);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { success: true, ticket: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'チケットが見つかりません' };
    }
  } catch (error) {
    console.error('Get ticket error:', error);
    return { success: false, error: 'チケットの取得に失敗しました' };
  }
}

// チケットのステータス更新
async function updateTicketStatus(userId, ticketId, status) {
  try {
    const docRef = db.doc(`${getUserBasePath(userId)}/tickets/${ticketId}`);
    await docRef.update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'ステータスを更新しました' };
  } catch (error) {
    console.error('Update ticket status error:', error);
    return { success: false, error: 'ステータスの更新に失敗しました' };
  }
}

// チケットを使用済みにする
async function markTicketAsUsed(userId, ticketId) {
  return updateTicketStatus(userId, ticketId, 'used');
}

// チケットをキャンセルする
async function cancelTicket(userId, ticketId) {
  try {
    const ticketResult = await getTicketById(userId, ticketId);
    if (!ticketResult.success) {
      return { success: false, error: 'チケットが見つかりません' };
    }

    const ticket = ticketResult.ticket;

    // イベント日時の確認 (イベント開始24時間前までキャンセル可能)
    const eventDate = new Date(ticket.eventDate);
    const now = new Date();
    const hoursDiff = (eventDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return { success: false, error: 'イベント開始24時間前以降はキャンセルできません' };
    }

    // トランザクション処理
    const ticketRef = db.doc(`${getUserBasePath(userId)}/tickets/${ticketId}`);
    const eventRef = db.doc(`${getEventsBasePath()}/${ticket.eventId}`);

    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      if (eventDoc.exists) {
        // イベントの在庫を戻す
        transaction.update(eventRef, {
          availableTickets: firebase.firestore.FieldValue.increment(ticket.quantity)
        });
      }

      // チケットをキャンセル状態に更新
      transaction.update(ticketRef, {
        status: 'cancelled',
        cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    return { success: true, message: 'チケットをキャンセルしました' };
  } catch (error) {
    console.error('Cancel ticket error:', error);
    return { success: false, error: 'チケットのキャンセルに失敗しました' };
  }
}

// QRコード生成 (qrcodeライブラリ使用)
async function generateQRCode(text, size = 256) {
  return new Promise((resolve, reject) => {
    // qrcode.js ライブラリがロードされているか確認
    if (typeof QRCode === 'undefined') {
      reject(new Error('QRCode library not loaded'));
      return;
    }

    try {
      // Canvas要素を作成
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(canvas.toDataURL());
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// チケットステータスのラベル取得
function getTicketStatusLabel(status) {
  const statusLabels = {
    active: '有効',
    used: '使用済み',
    cancelled: 'キャンセル済み'
  };
  return statusLabels[status] || '不明';
}

// チケットステータスのバッジクラス取得
function getTicketStatusBadgeClass(status) {
  const statusClasses = {
    active: 'badge-active',
    used: 'badge-used',
    cancelled: 'badge-used'
  };
  return statusClasses[status] || '';
}

// フィルタリング: 有効なチケットのみ
function filterActiveTickets(tickets) {
  return tickets.filter(ticket => ticket.status === 'active');
}

// フィルタリング: 使用済みチケット
function filterUsedTickets(tickets) {
  return tickets.filter(ticket => ticket.status === 'used');
}

// フィルタリング: キャンセル済みチケット
function filterCancelledTickets(tickets) {
  return tickets.filter(ticket => ticket.status === 'cancelled');
}

// ソート: 購入日時順
function sortTicketsByPurchaseDate(tickets, ascending = false) {
  return [...tickets].sort((a, b) => {
    const dateA = a.purchasedAt?.toDate?.() || new Date(a.purchasedAt);
    const dateB = b.purchasedAt?.toDate?.() || new Date(b.purchasedAt);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

// ソート: イベント日時順
function sortTicketsByEventDate(tickets, ascending = true) {
  return [...tickets].sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

// チケットの通知スケジュール設定
async function scheduleTicketNotification(userId, ticketId) {
  try {
    const ticketResult = await getTicketById(userId, ticketId);
    if (!ticketResult.success) {
      return { success: false, error: 'チケットが見つかりません' };
    }

    const ticket = ticketResult.ticket;
    const eventDate = new Date(ticket.eventDate);
    const now = new Date();

    // イベント開始1日前に通知
    const notificationDate = new Date(eventDate);
    notificationDate.setDate(notificationDate.getDate() - 1);

    if (notificationDate > now) {
      // 通知設定を保存 (実際の通知はService Workerで処理)
      const notificationRef = db.doc(`${getUserBasePath(userId)}/notifications/${ticketId}`);
      await notificationRef.set({
        ticketId: ticketId,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        notificationDate: notificationDate.toISOString(),
        sent: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, message: '通知を設定しました' };
    } else {
      return { success: false, error: 'イベント開始が近すぎるため通知を設定できません' };
    }
  } catch (error) {
    console.error('Schedule notification error:', error);
    return { success: false, error: '通知の設定に失敗しました' };
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getUserTickets,
    getTicketById,
    updateTicketStatus,
    markTicketAsUsed,
    cancelTicket,
    generateQRCode,
    getTicketStatusLabel,
    getTicketStatusBadgeClass,
    filterActiveTickets,
    filterUsedTickets,
    filterCancelledTickets,
    sortTicketsByPurchaseDate,
    sortTicketsByEventDate,
    scheduleTicketNotification
  };
}
