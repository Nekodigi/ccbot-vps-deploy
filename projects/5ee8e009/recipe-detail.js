// レシピデータ（main.jsと同じデータを使用）
const recipes = [
    {
        id: 1,
        title: '豚の生姜焼き',
        category: 'japanese',
        categoryName: '和食',
        time: 20,
        description: '定番の和食メニュー。甘辛いタレと生姜の風味が食欲をそそります。',
        icon: '🍖',
        ingredients: [
            '豚ロース肉 300g',
            '玉ねぎ 1個',
            '生姜 1片',
            '醤油 大さじ3',
            'みりん 大さじ2',
            '酒 大さじ2',
            '砂糖 大さじ1',
            'サラダ油 適量'
        ],
        steps: [
            '生姜をすりおろし、玉ねぎは薄切りにする',
            '醤油、みりん、酒、砂糖、すりおろし生姜を混ぜ合わせてタレを作る',
            'フライパンに油を熱し、豚肉を中火で焼く',
            '豚肉に火が通ったら玉ねぎを加えて炒める',
            'タレを加えて全体に絡め、汁気が少なくなるまで煮詰める',
            '器に盛り付けて完成'
        ]
    },
    {
        id: 2,
        title: '親子丼',
        category: 'japanese',
        categoryName: '和食',
        time: 15,
        description: '鶏肉と卵のやさしい味わい。手軽に作れる人気の丼物です。',
        icon: '🍚',
        ingredients: [
            '鶏もも肉 200g',
            '玉ねぎ 1/2個',
            '卵 3個',
            'だし汁 200ml',
            '醤油 大さじ2',
            'みりん 大さじ2',
            '砂糖 大さじ1',
            'ご飯 2杯分',
            '三つ葉 適量'
        ],
        steps: [
            '鶏肉は一口大に切り、玉ねぎは薄切りにする',
            '鍋にだし汁、醤油、みりん、砂糖を入れて煮立てる',
            '鶏肉と玉ねぎを加えて中火で煮る',
            '鶏肉に火が通ったら溶き卵を回し入れる',
            '半熟状態になったら火を止める',
            'ご飯の上に盛り付け、三つ葉を添えて完成'
        ]
    },
    {
        id: 3,
        title: 'カルボナーラ',
        category: 'western',
        categoryName: '洋食',
        time: 25,
        description: '濃厚なクリームソースが絡む本格イタリアンパスタ。',
        icon: '🍝',
        ingredients: [
            'スパゲッティ 200g',
            'ベーコン 100g',
            '卵黄 3個',
            '生クリーム 150ml',
            'パルメザンチーズ 50g',
            'にんにく 1片',
            'オリーブオイル 大さじ2',
            '塩・黒胡椒 適量'
        ],
        steps: [
            'ベーコンは1cm幅に切り、にんにくはみじん切りにする',
            'ボウルに卵黄、生クリーム、パルメザンチーズを混ぜ合わせる',
            'スパゲッティを茹で始める',
            'フライパンでにんにくとベーコンを炒める',
            '茹で上がったパスタをフライパンに加える',
            '火を止めて卵液を加え、素早く混ぜ合わせる',
            '器に盛り付け、黒胡椒を振って完成'
        ]
    },
    {
        id: 4,
        title: 'ハンバーグステーキ',
        category: 'western',
        categoryName: '洋食',
        time: 35,
        description: 'ジューシーな肉汁が溢れる、家族みんなが大好きな定番料理。',
        icon: '🍔',
        ingredients: [
            '合いびき肉 400g',
            '玉ねぎ 1個',
            'パン粉 50g',
            '牛乳 50ml',
            '卵 1個',
            '塩・胡椒 適量',
            'ナツメグ 少々',
            'サラダ油 大さじ1',
            'ウスターソース 大さじ3',
            'ケチャップ 大さじ3',
            '赤ワイン 大さじ2'
        ],
        steps: [
            '玉ねぎをみじん切りにして炒め、冷ましておく',
            'パン粉を牛乳に浸しておく',
            'ボウルにひき肉、玉ねぎ、パン粉、卵、塩、胡椒、ナツメグを入れてよく練る',
            '4等分にして小判型に成形し、真ん中をくぼませる',
            'フライパンで両面を焼き、蓋をして中まで火を通す',
            'ハンバーグを取り出し、同じフライパンでソースの材料を煮詰める',
            'ハンバーグにソースをかけて完成'
        ]
    },
    {
        id: 5,
        title: '麻婆豆腐',
        category: 'chinese',
        categoryName: '中華',
        time: 20,
        description: 'ピリ辛で旨味たっぷり。ご飯が進む本格中華の定番。',
        icon: '🌶️',
        ingredients: [
            '絹ごし豆腐 1丁',
            '豚ひき肉 150g',
            '長ねぎ 1/2本',
            'にんにく 1片',
            '生姜 1片',
            '豆板醤 大さじ1',
            '甜麺醤 大さじ1',
            '鶏ガラスープ 150ml',
            '醤油 大さじ1',
            '酒 大さじ1',
            '片栗粉 大さじ1',
            'ごま油 小さじ1',
            '花椒 適量'
        ],
        steps: [
            '豆腐は2cm角に切り、長ねぎ、にんにく、生姜はみじん切りにする',
            'フライパンにごま油を熱し、にんにく、生姜、豆板醤を炒める',
            'ひき肉を加えて炒め、色が変わったら甜麺醤を加える',
            'スープ、醤油、酒を加えて煮立たせる',
            '豆腐を加えて5分ほど煮る',
            '水溶き片栗粉でとろみをつけ、長ねぎを加える',
            '器に盛り付け、花椒を振って完成'
        ]
    },
    {
        id: 6,
        title: 'チャーハン',
        category: 'chinese',
        categoryName: '中華',
        time: 15,
        description: 'パラパラに仕上がる本格チャーハン。簡単で美味しい！',
        icon: '🍚',
        ingredients: [
            'ご飯 2杯分',
            '卵 2個',
            '長ねぎ 1/2本',
            '焼き豚 100g',
            '鶏ガラスープの素 小さじ2',
            '醤油 小さじ2',
            '塩・胡椒 適量',
            'ごま油 大さじ1',
            'サラダ油 大さじ2'
        ],
        steps: [
            'ご飯は温かい状態にし、卵は溶いておく',
            '長ねぎと焼き豚はみじん切りにする',
            '中華鍋を強火で熱し、サラダ油を入れる',
            '溶き卵を入れてすぐにご飯を加え、素早く炒める',
            '長ねぎと焼き豚を加えて炒める',
            '鶏ガラスープの素、醤油、塩、胡椒で味を調える',
            '最後にごま油を回し入れて完成'
        ]
    },
    {
        id: 7,
        title: 'チーズケーキ',
        category: 'dessert',
        categoryName: 'デザート',
        time: 60,
        description: '濃厚でなめらかな口当たりのベイクドチーズケーキ。',
        icon: '🍰',
        ingredients: [
            'クリームチーズ 250g',
            '砂糖 80g',
            '卵 2個',
            '生クリーム 200ml',
            'レモン汁 大さじ2',
            '薄力粉 大さじ3',
            'ビスケット 100g',
            'バター 50g'
        ],
        steps: [
            'ビスケットを細かく砕き、溶かしバターと混ぜて型に敷き詰める',
            'クリームチーズを室温に戻し、柔らかくする',
            'クリームチーズと砂糖をよく混ぜる',
            '卵を1個ずつ加えてよく混ぜる',
            '生クリーム、レモン汁、ふるった薄力粉を加えて混ぜる',
            '型に流し入れ、170度のオーブンで45分焼く',
            '粗熱を取り、冷蔵庫で一晩冷やして完成'
        ]
    },
    {
        id: 8,
        title: 'ティラミス',
        category: 'dessert',
        categoryName: 'デザート',
        time: 30,
        description: 'イタリアの定番デザート。コーヒーとマスカルポーネの絶妙なハーモニー。',
        icon: '🍮',
        ingredients: [
            'マスカルポーネチーズ 250g',
            '卵黄 3個',
            '砂糖 80g',
            '生クリーム 200ml',
            'インスタントコーヒー 大さじ3',
            '熱湯 150ml',
            'フィンガービスケット 20本',
            'ココアパウダー 適量'
        ],
        steps: [
            'インスタントコーヒーを熱湯で溶かし、冷ましておく',
            '卵黄と砂糖を白っぽくなるまで混ぜる',
            'マスカルポーネチーズを加えてよく混ぜる',
            '生クリームを八分立てにし、チーズ生地に混ぜる',
            'ビスケットをコーヒー液に浸し、容器に並べる',
            'クリームを半量流し入れ、ビスケットとクリームを交互に重ねる',
            '冷蔵庫で3時間以上冷やし、ココアパウダーを振って完成'
        ]
    },
    {
        id: 9,
        title: '味噌汁',
        category: 'japanese',
        categoryName: '和食',
        time: 10,
        description: '毎日の食卓に欠かせない、ホッとする一杯。',
        icon: '🍲',
        ingredients: [
            'だし汁 600ml',
            '味噌 大さじ3',
            '豆腐 1/2丁',
            'わかめ 適量',
            '長ねぎ 適量'
        ],
        steps: [
            '豆腐は1cm角に切り、わかめは水で戻す',
            '長ねぎは小口切りにする',
            '鍋にだし汁を入れて温める',
            '豆腐とわかめを加えて煮る',
            '味噌を溶き入れる',
            '沸騰直前に火を止め、長ねぎを加えて完成'
        ]
    },
    {
        id: 10,
        title: 'グラタン',
        category: 'western',
        categoryName: '洋食',
        time: 40,
        description: 'アツアツでクリーミーなマカロニグラタン。',
        icon: '🧀',
        ingredients: [
            'マカロニ 150g',
            '鶏もも肉 200g',
            '玉ねぎ 1個',
            'マッシュルーム 5個',
            'バター 40g',
            '薄力粉 40g',
            '牛乳 500ml',
            'ピザ用チーズ 100g',
            '塩・胡椒 適量'
        ],
        steps: [
            'マカロニを茹でる。鶏肉、玉ねぎ、マッシュルームを切る',
            'フライパンでバターを溶かし、鶏肉と野菜を炒める',
            '薄力粉を加えて粉っぽさがなくなるまで炒める',
            '牛乳を少しずつ加えながら混ぜ、とろみをつける',
            'マカロニを加えて混ぜ、塩胡椒で味を調える',
            '耐熱皿に入れ、チーズをのせる',
            '220度のオーブンで15分焼いて完成'
        ]
    },
    {
        id: 11,
        title: 'エビチリ',
        category: 'chinese',
        categoryName: '中華',
        time: 25,
        description: 'プリプリのエビと濃厚なチリソースが絶品。',
        icon: '🦐',
        ingredients: [
            'エビ 300g',
            '長ねぎ 1本',
            'にんにく 1片',
            '生姜 1片',
            'ケチャップ 大さじ4',
            '豆板醤 小さじ2',
            '酒 大さじ2',
            '砂糖 大さじ1',
            '鶏ガラスープ 100ml',
            '片栗粉 大さじ1',
            'サラダ油 大さじ2'
        ],
        steps: [
            'エビは殻をむき、背わたを取る',
            '長ねぎ、にんにく、生姜はみじん切りにする',
            'エビに片栗粉をまぶす',
            'フライパンで油を熱し、エビを炒めて取り出す',
            '同じフライパンでにんにく、生姜、豆板醤を炒める',
            'ケチャップ、酒、砂糖、スープを加えて煮立てる',
            'エビを戻し、長ねぎを加えて絡めて完成'
        ]
    },
    {
        id: 12,
        title: 'パンケーキ',
        category: 'dessert',
        categoryName: 'デザート',
        time: 20,
        description: 'ふわふわ食感の幸せパンケーキ。朝食やおやつに最適。',
        icon: '🥞',
        ingredients: [
            'ホットケーキミックス 200g',
            '卵 1個',
            '牛乳 150ml',
            'バター 適量',
            'メープルシロップ 適量',
            '粉糖 適量'
        ],
        steps: [
            'ボウルに卵と牛乳を入れてよく混ぜる',
            'ホットケーキミックスを加えて混ぜる',
            'フライパンを中火で熱し、バターを溶かす',
            '生地を流し入れ、表面に気泡が出るまで焼く',
            'ひっくり返して裏面も焼く',
            '器に盛り、メープルシロップと粉糖をかけて完成'
        ]
    }
];

// ページ読み込み時にレシピ詳細を表示
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));

    if (!recipeId) {
        window.location.href = 'index.html';
        return;
    }

    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) {
        window.location.href = 'index.html';
        return;
    }

    renderRecipeDetail(recipe);
});

// レシピ詳細の描画
function renderRecipeDetail(recipe) {
    const detailContainer = document.getElementById('recipeDetail');

    const ingredientsHTML = recipe.ingredients.map(ingredient =>
        `<li>${ingredient}</li>`
    ).join('');

    const stepsHTML = recipe.steps.map((step, index) =>
        `<li data-step="${index + 1}">${step}</li>`
    ).join('');

    detailContainer.innerHTML = `
        <div class="recipe-detail-header">
            <span class="recipe-category">${recipe.categoryName}</span>
            <h1 class="recipe-detail-title">${recipe.title}</h1>
            <div class="recipe-detail-meta">
                <span>⏱ 調理時間: ${recipe.time}分</span>
            </div>
        </div>
        <div class="recipe-detail-body">
            <div class="recipe-detail-image">${recipe.icon}</div>

            <div class="recipe-section">
                <h2 class="recipe-section-title">料理の説明</h2>
                <p style="line-height: 1.8; color: #666;">${recipe.description}</p>
            </div>

            <div class="recipe-section">
                <h2 class="recipe-section-title">材料</h2>
                <ul class="ingredients-list">
                    ${ingredientsHTML}
                </ul>
            </div>

            <div class="recipe-section">
                <h2 class="recipe-section-title">作り方</h2>
                <ol class="steps-list">
                    ${stepsHTML}
                </ol>
            </div>
        </div>
    `;

    // タイトルを更新
    document.title = `${recipe.title} - 美味しいレシピブログ`;
}
