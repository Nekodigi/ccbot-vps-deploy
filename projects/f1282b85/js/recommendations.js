// Firebase AI Logic SDKを使用したおすすめ機能

// AI推奨機能の初期化
async function initializeAI() {
  try {
    // Firebase AI Logic SDKが利用可能か確認
    if (typeof firebase.ai === 'undefined') {
      console.warn('Firebase AI Logic SDK is not available');
      return { success: false, error: 'AI機能が利用できません' };
    }

    // Gemini APIのセッションを作成
    const ai = firebase.ai();
    aiSession = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    return { success: true, message: 'AI機能を初期化しました' };
  } catch (error) {
    console.error('Initialize AI error:', error);
    return { success: false, error: 'AI機能の初期化に失敗しました' };
  }
}

// ユーザーの購入履歴に基づくおすすめイベントの取得
async function getRecommendedEvents(userId, allEvents) {
  try {
    // ユーザープロフィールと購入履歴を取得
    const profileResult = await getUserProfile(userId);
    if (!profileResult.success || !profileResult.data.purchaseHistory) {
      // 購入履歴がない場合は人気イベントを返す
      return getPopularEvents(allEvents);
    }

    const purchaseHistory = profileResult.data.purchaseHistory;
    if (purchaseHistory.length === 0) {
      return getPopularEvents(allEvents);
    }

    // 購入したイベントのIDを取得
    const purchasedEventIds = purchaseHistory.map(p => p.eventId);

    // 購入したイベントの詳細を取得
    const purchasedEvents = allEvents.filter(event =>
      purchasedEventIds.includes(event.id)
    );

    if (purchasedEvents.length === 0) {
      return getPopularEvents(allEvents);
    }

    // カテゴリーの集計
    const categoryCount = {};
    purchasedEvents.forEach(event => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });

    // 最も多いカテゴリーを取得
    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
    );

    // 同じカテゴリーで未購入のイベントを推奨
    const recommendations = allEvents
      .filter(event =>
        event.category === favoriteCategory &&
        !purchasedEventIds.includes(event.id) &&
        new Date(event.date) > new Date() // 未来のイベントのみ
      )
      .slice(0, 5);

    return {
      success: true,
      events: recommendations,
      reason: `お客様がよく購入される「${getCategoryLabel(favoriteCategory)}」カテゴリーのイベントです`
    };
  } catch (error) {
    console.error('Get recommended events error:', error);
    return getPopularEvents(allEvents);
  }
}

// AI を使用したパーソナライズされたおすすめ
async function getAIRecommendedEvents(userId, allEvents) {
  try {
    // AI機能が初期化されているか確認
    if (!aiSession) {
      const initResult = await initializeAI();
      if (!initResult.success) {
        // AIが使えない場合は通常の推奨機能を使用
        return getRecommendedEvents(userId, allEvents);
      }
    }

    // ユーザープロフィールと購入履歴を取得
    const profileResult = await getUserProfile(userId);
    if (!profileResult.success || !profileResult.data.purchaseHistory) {
      return getRecommendedEvents(userId, allEvents);
    }

    const purchaseHistory = profileResult.data.purchaseHistory;
    if (purchaseHistory.length === 0) {
      return getRecommendedEvents(userId, allEvents);
    }

    // 購入したイベントの詳細を取得
    const purchasedEventIds = purchaseHistory.map(p => p.eventId);
    const purchasedEvents = allEvents.filter(event =>
      purchasedEventIds.includes(event.id)
    );

    // 未購入の未来のイベント
    const availableEvents = allEvents.filter(event =>
      !purchasedEventIds.includes(event.id) &&
      new Date(event.date) > new Date()
    );

    if (availableEvents.length === 0) {
      return { success: true, events: [], reason: '現在おすすめできるイベントがありません' };
    }

    // AIにプロンプトを送信
    const prompt = `
あなたはイベント推奨システムです。以下のユーザーの購入履歴に基づいて、最もおすすめのイベントを選んでください。

購入履歴:
${purchasedEvents.map(e => `- ${e.title} (${getCategoryLabel(e.category)})`).join('\n')}

利用可能なイベント:
${availableEvents.map((e, i) => `${i + 1}. ${e.title} (${getCategoryLabel(e.category)}) - ${e.description}`).join('\n')}

上記のイベントから、ユーザーに最もおすすめの3つのイベントを選び、イベント番号のみをカンマ区切りで回答してください。
回答形式: 1,3,5
`;

    const result = await aiSession.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // AIの回答を解析
    const selectedIndices = text.split(',').map(n => parseInt(n.trim()) - 1);
    const recommendations = selectedIndices
      .filter(i => i >= 0 && i < availableEvents.length)
      .map(i => availableEvents[i])
      .slice(0, 3);

    return {
      success: true,
      events: recommendations,
      reason: 'AIがお客様の好みを分析して選んだおすすめイベントです'
    };
  } catch (error) {
    console.error('Get AI recommended events error:', error);
    // AIエラー時は通常の推奨機能にフォールバック
    return getRecommendedEvents(userId, allEvents);
  }
}

// 人気イベントの取得 (デフォルト推奨)
function getPopularEvents(allEvents) {
  const futureEvents = allEvents.filter(event => new Date(event.date) > new Date());

  // チケット販売数でソート (availableTicketsが少ない = 人気がある)
  const popular = [...futureEvents]
    .sort((a, b) => a.availableTickets - b.availableTickets)
    .slice(0, 5);

  return {
    success: true,
    events: popular,
    reason: '現在人気のイベントです'
  };
}

// 新着イベントの取得
function getNewEvents(allEvents) {
  const futureEvents = allEvents.filter(event => new Date(event.date) > new Date());

  // 作成日時でソート
  const newEvents = [...futureEvents]
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    })
    .slice(0, 5);

  return {
    success: true,
    events: newEvents,
    reason: '新着イベント'
  };
}

// カテゴリー別おすすめ
function getEventsByCategory(allEvents, category) {
  const futureEvents = allEvents.filter(event =>
    new Date(event.date) > new Date() &&
    event.category === category
  );

  return {
    success: true,
    events: futureEvents.slice(0, 5),
    reason: `${getCategoryLabel(category)}カテゴリーのイベント`
  };
}

// 価格帯別おすすめ
function getEventsByPriceRange(allEvents, minPrice, maxPrice) {
  const futureEvents = allEvents.filter(event =>
    new Date(event.date) > new Date() &&
    event.price >= minPrice &&
    event.price <= maxPrice
  );

  return {
    success: true,
    events: futureEvents.slice(0, 5),
    reason: `¥${minPrice.toLocaleString()} - ¥${maxPrice.toLocaleString()} の価格帯のイベント`
  };
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeAI,
    getRecommendedEvents,
    getAIRecommendedEvents,
    getPopularEvents,
    getNewEvents,
    getEventsByCategory,
    getEventsByPriceRange
  };
}
