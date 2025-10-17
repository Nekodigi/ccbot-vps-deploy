// イベントの検索
async function searchEvents(filters = {}) {
  try {
    let query = db.collection(getEventsBasePath());

    // フィルターの適用
    if (filters.keyword) {
      // Firestoreは完全一致検索のため、クライアント側でフィルタリング
      const snapshot = await query.get();
      const events = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const keyword = filters.keyword.toLowerCase();
        if (
          data.title?.toLowerCase().includes(keyword) ||
          data.description?.toLowerCase().includes(keyword)
        ) {
          events.push({ id: doc.id, ...data });
        }
      });

      return { success: true, events };
    }

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.dateFrom) {
      query = query.where('date', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('date', '<=', filters.dateTo);
    }

    // データの取得
    const snapshot = await query.orderBy('date', 'asc').get();
    const events = [];

    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, events };
  } catch (error) {
    console.error('Search events error:', error);
    return { success: false, error: 'イベントの検索に失敗しました', events: [] };
  }
}

// 全イベントの取得
async function getAllEvents() {
  try {
    const snapshot = await db.collection(getEventsBasePath())
      .orderBy('date', 'asc')
      .get();

    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, events };
  } catch (error) {
    console.error('Get all events error:', error);
    return { success: false, error: 'イベントの取得に失敗しました', events: [] };
  }
}

// イベント詳細の取得
async function getEventById(eventId) {
  try {
    const docRef = db.doc(`${getEventsBasePath()}/${eventId}`);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { success: true, event: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'イベントが見つかりません' };
    }
  } catch (error) {
    console.error('Get event error:', error);
    return { success: false, error: 'イベントの取得に失敗しました' };
  }
}

// カテゴリー一覧の取得
function getCategories() {
  return [
    { value: '', label: 'すべて' },
    { value: 'music', label: '音楽' },
    { value: 'sports', label: 'スポーツ' },
    { value: 'theater', label: '演劇' },
    { value: 'art', label: 'アート' },
    { value: 'festival', label: 'フェスティバル' },
    { value: 'other', label: 'その他' }
  ];
}

// カテゴリー名の取得
function getCategoryLabel(categoryValue) {
  const categories = getCategories();
  const category = categories.find(c => c.value === categoryValue);
  return category ? category.label : 'その他';
}

// 日付のフォーマット
function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}年${month}月${day}日(${weekday}) ${hours}:${minutes}`;
}

// 価格のフォーマット
function formatPrice(price) {
  if (price === undefined || price === null) return '価格未定';
  return `¥${price.toLocaleString()}`;
}

// サンプルイベントの作成 (開発・テスト用)
async function createSampleEvents() {
  const sampleEvents = [
    {
      title: '東京ジャズフェスティバル 2025',
      description: '世界トップクラスのジャズアーティストが集結する音楽の祭典',
      category: 'music',
      date: '2025-11-15T19:00:00',
      location: '東京国際フォーラム',
      price: 8500,
      availableTickets: 500,
      imageUrl: ''
    },
    {
      title: 'サッカー国際親善試合',
      description: '日本代表 vs ブラジル代表の熱戦をスタジアムで観戦',
      category: 'sports',
      date: '2025-11-20T19:30:00',
      location: '国立競技場',
      price: 12000,
      availableTickets: 3000,
      imageUrl: ''
    },
    {
      title: '現代アート展覧会',
      description: '世界的に有名なアーティストの最新作品を展示',
      category: 'art',
      date: '2025-11-10T10:00:00',
      location: '東京都美術館',
      price: 2500,
      availableTickets: 200,
      imageUrl: ''
    },
    {
      title: 'ミュージカル「キャッツ」',
      description: '伝説的なミュージカルが日本で再演',
      category: 'theater',
      date: '2025-12-01T18:00:00',
      location: '帝国劇場',
      price: 15000,
      availableTickets: 800,
      imageUrl: ''
    },
    {
      title: '秋の音楽祭',
      description: 'クラシックからポップスまで、多彩なジャンルの音楽を楽しめる',
      category: 'festival',
      date: '2025-11-25T14:00:00',
      location: '横浜アリーナ',
      price: 6000,
      availableTickets: 1500,
      imageUrl: ''
    }
  ];

  try {
    const batch = db.batch();

    for (const event of sampleEvents) {
      const docRef = db.collection(getEventsBasePath()).doc();
      batch.set(docRef, {
        ...event,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    return { success: true, message: 'サンプルイベントを作成しました' };
  } catch (error) {
    console.error('Create sample events error:', error);
    return { success: false, error: 'サンプルイベントの作成に失敗しました' };
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchEvents,
    getAllEvents,
    getEventById,
    getCategories,
    getCategoryLabel,
    formatDate,
    formatPrice,
    createSampleEvents
  };
}
