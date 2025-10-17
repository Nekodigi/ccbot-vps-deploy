// チケット購入
async function purchaseTicket(userId, eventId, quantity = 1) {
  try {
    // イベント情報の取得
    const eventResult = await getEventById(eventId);
    if (!eventResult.success) {
      return { success: false, error: 'イベントが見つかりません' };
    }

    const event = eventResult.event;

    // チケットの在庫確認
    if (event.availableTickets < quantity) {
      return { success: false, error: 'チケットの在庫が不足しています' };
    }

    // トランザクション処理
    const ticketRef = db.collection(`${getUserBasePath(userId)}/tickets`).doc();
    const eventRef = db.doc(`${getEventsBasePath()}/${eventId}`);

    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new Error('イベントが存在しません');
      }

      const currentAvailable = eventDoc.data().availableTickets;
      if (currentAvailable < quantity) {
        throw new Error('チケットの在庫が不足しています');
      }

      // チケットドキュメントの作成
      const ticketData = {
        eventId: eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        category: event.category,
        price: event.price,
        quantity: quantity,
        totalPrice: event.price * quantity,
        purchasedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active', // active, used, cancelled
        qrCode: generateTicketCode(ticketRef.id)
      };

      transaction.set(ticketRef, ticketData);

      // イベントの在庫を減らす
      transaction.update(eventRef, {
        availableTickets: currentAvailable - quantity
      });

      // ユーザーの購入履歴を更新
      const userProfileRef = db.doc(`${getUserBasePath(userId)}/profile/data`);
      transaction.update(userProfileRef, {
        purchaseHistory: firebase.firestore.FieldValue.arrayUnion({
          eventId: eventId,
          ticketId: ticketRef.id,
          purchasedAt: new Date().toISOString(),
          totalPrice: event.price * quantity
        })
      });
    });

    return { success: true, ticketId: ticketRef.id, message: 'チケットを購入しました' };
  } catch (error) {
    console.error('Purchase ticket error:', error);
    return { success: false, error: error.message || 'チケットの購入に失敗しました' };
  }
}

// チケットコードの生成
function generateTicketCode(ticketId) {
  // チケットIDをベースにユニークなコードを生成
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${ticketId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

// カート機能 (ローカルストレージ使用)
class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  // カートの読み込み
  loadCart() {
    try {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Load cart error:', error);
      return [];
    }
  }

  // カートの保存
  saveCart() {
    try {
      localStorage.setItem('cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Save cart error:', error);
    }
  }

  // アイテムの追加
  addItem(eventId, event, quantity = 1) {
    const existingItem = this.items.find(item => item.eventId === eventId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        eventId,
        title: event.title,
        date: event.date,
        location: event.location,
        price: event.price,
        quantity
      });
    }

    this.saveCart();
    return { success: true, message: 'カートに追加しました' };
  }

  // アイテムの削除
  removeItem(eventId) {
    this.items = this.items.filter(item => item.eventId !== eventId);
    this.saveCart();
    return { success: true, message: 'カートから削除しました' };
  }

  // 数量の更新
  updateQuantity(eventId, quantity) {
    const item = this.items.find(item => item.eventId === eventId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      return { success: true };
    }
    return { success: false, error: 'アイテムが見つかりません' };
  }

  // カートのクリア
  clear() {
    this.items = [];
    this.saveCart();
  }

  // 合計金額の計算
  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // アイテム数の取得
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // カート内容の取得
  getItems() {
    return this.items;
  }
}

// カートのインスタンスを作成
let cart;

// カートの初期化
function initializeCart() {
  cart = new Cart();
  return cart;
}

// カート内容の全購入
async function purchaseAllInCart(userId) {
  if (!cart || cart.getItemCount() === 0) {
    return { success: false, error: 'カートが空です' };
  }

  const results = [];
  const errors = [];

  for (const item of cart.getItems()) {
    const result = await purchaseTicket(userId, item.eventId, item.quantity);
    if (result.success) {
      results.push(result);
    } else {
      errors.push({ eventId: item.eventId, title: item.title, error: result.error });
    }
  }

  if (errors.length === 0) {
    cart.clear();
    return { success: true, results, message: '全てのチケットを購入しました' };
  } else if (results.length > 0) {
    cart.clear();
    return {
      success: true,
      results,
      message: '一部のチケットを購入しました',
      errors
    };
  } else {
    return { success: false, error: 'チケットの購入に失敗しました', errors };
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    purchaseTicket,
    generateTicketCode,
    Cart,
    initializeCart,
    purchaseAllInCart
  };
}
