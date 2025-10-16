// 7つの習慣の詳細情報
const habitsDetails = {
    1: {
        title: "習慣1：主体的である",
        subtitle: "Be Proactive",
        content: `
            <h3>主体的である（Be Proactive）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>私たちは自分の行動を選択する自由と責任を持っている。刺激と反応の間には選択の自由がある。</p>
            </div>

            <h4>主体性とは</h4>
            <p>主体性とは、自分の人生の責任を引き受けることです。環境や条件、過去の経験に支配されるのではなく、自分の価値観に基づいて行動することを意味します。</p>

            <h4>反応的な言葉 vs 主体的な言葉</h4>
            <ul>
                <li><strong>反応的：</strong>「できない」「〜のせいだ」「仕方がない」</li>
                <li><strong>主体的：</strong>「できる方法を探そう」「別の方法を選択できる」「私は〜を選ぶ」</li>
            </ul>

            <h4>影響の輪と関心の輪</h4>
            <p>関心の輪（自分が関心を持つすべてのこと）の中に、影響の輪（自分が影響を与えられること）があります。主体的な人は影響の輪に集中し、それを拡大していきます。</p>

            <div class="example">
                <h4>実践例</h4>
                <p><strong>状況：</strong>上司が理不尽な要求をしてきた</p>
                <p><strong>反応的：</strong>「あの上司は最悪だ。何もできない」</p>
                <p><strong>主体的：</strong>「この状況で私にできることは何か？建設的な対話をしてみよう」</p>
            </div>

            <h4>実践のための質問</h4>
            <ul>
                <li>今日、何を選択しましたか？</li>
                <li>反応的な言葉を使っていませんか？</li>
                <li>自分の影響の輪に集中していますか？</li>
                <li>問題を他者のせいにしていませんか？</li>
            </ul>
        `
    },
    2: {
        title: "習慣2：終わりを思い描くことから始める",
        subtitle: "Begin with the End in Mind",
        content: `
            <h3>終わりを思い描くことから始める（Begin with the End in Mind）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>すべてのものは二度創られる。最初は知的創造（頭の中で）、次に物的創造（実際の行動）。</p>
            </div>

            <h4>人生の目的を明確にする</h4>
            <p>自分の人生の最期を想像してください。葬儀で家族や友人、同僚に何と言ってもらいたいですか？それがあなたの本当の価値観であり、人生の目的です。</p>

            <h4>ミッション・ステートメント</h4>
            <p>個人のミッション・ステートメントは、自分がどうありたいか（人格）、何をしたいか（貢献・功績）、そしてそれらの土台となる価値観と原則を表します。</p>

            <h4>中心の選択</h4>
            <p>人は様々なものを人生の中心に置きます：</p>
            <ul>
                <li>配偶者中心</li>
                <li>家族中心</li>
                <li>お金中心</li>
                <li>仕事中心</li>
                <li>所有物中心</li>
                <li>娯楽中心</li>
                <li>敵中心</li>
                <li>宗教中心</li>
                <li><strong>原則中心（最も安定している）</strong></li>
            </ul>

            <div class="example">
                <h4>ミッション・ステートメントの例</h4>
                <p>「私は、誠実さと思いやりを持って生き、家族に愛情を注ぎ、仕事を通じて社会に貢献し、生涯学び続ける人間でありたい。」</p>
            </div>

            <h4>実践のための質問</h4>
            <ul>
                <li>あなたの人生で最も大切なことは何ですか？</li>
                <li>10年後、どんな人間になっていたいですか？</li>
                <li>今の行動は、理想の自分に近づいていますか？</li>
                <li>自分のミッション・ステートメントを書いてみましたか？</li>
            </ul>
        `
    },
    3: {
        title: "習慣3：最優先事項を優先する",
        subtitle: "Put First Things First",
        content: `
            <h3>最優先事項を優先する（Put First Things First）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>効果的な人生の鍵は、「重要だが緊急ではないこと」（第二領域）に時間を使うこと。</p>
            </div>

            <h4>時間管理のパラダイム転換</h4>
            <p>時間管理とは、実際には自己管理です。活動を管理するのではなく、自分自身を管理することが重要です。</p>

            <h4>第二領域に集中する</h4>
            <p>第二領域の活動例：</p>
            <ul>
                <li>人間関係を築く</li>
                <li>長期的な計画を立てる</li>
                <li>予防活動（健康管理、設備の点検）</li>
                <li>自己啓発・学習</li>
                <li>準備と計画</li>
                <li>真のレクリエーション（心身の回復）</li>
            </ul>

            <h4>第二領域を増やすには</h4>
            <p>第二領域の時間を増やすには、第三領域（緊急だが重要でない）と第四領域（緊急でも重要でもない）の時間を減らす必要があります。</p>

            <div class="example">
                <h4>週間スケジュールの立て方</h4>
                <ol>
                    <li>役割を確認する（親、配偶者、マネージャー、個人など）</li>
                    <li>各役割での目標を設定する</li>
                    <li>週間スケジュールに第二領域の活動を先に入れる</li>
                    <li>日々の優先順位を調整する</li>
                </ol>
            </div>

            <h4>ノーと言う勇気</h4>
            <p>第二領域にイエスと言うためには、第三領域や第四領域にノーと言う必要があります。自分の優先順位を明確にし、それに基づいて決断しましょう。</p>

            <h4>実践のための質問</h4>
            <ul>
                <li>今週、第二領域の活動にどれだけ時間を使いましたか？</li>
                <li>どの第三領域・第四領域の活動を減らせますか？</li>
                <li>あなたの役割は何ですか？各役割での目標は？</li>
                <li>重要な人間関係に時間を投資していますか？</li>
            </ul>
        `
    },
    4: {
        title: "習慣4：Win-Winを考える",
        subtitle: "Think Win-Win",
        content: `
            <h3>Win-Winを考える（Think Win-Win）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>相互依存関係において、自分も相手も満足できる第三の案を目指す。豊かさマインドセットを持つ。</p>
            </div>

            <h4>6つの人間関係のパラダイム</h4>
            <ul>
                <li><strong>Win-Win：</strong>自分も勝ち、相手も勝つ（最も効果的）</li>
                <li><strong>Win-Lose：</strong>自分が勝ち、相手が負ける（競争的思考）</li>
                <li><strong>Lose-Win：</strong>自分が負けて、相手が勝つ（迎合）</li>
                <li><strong>Lose-Lose：</strong>両者とも負ける（報復）</li>
                <li><strong>Win：</strong>自分の勝ちだけを考える</li>
                <li><strong>Win-Win or No Deal：</strong>Win-Winが不可能なら取引しない</li>
            </ul>

            <h4>Win-Winの5つの柱</h4>
            <ol>
                <li><strong>人格：</strong>誠実さ、成熟性、豊かさマインドセット</li>
                <li><strong>関係：</strong>信頼残高が高い</li>
                <li><strong>合意：</strong>望む結果、ガイドライン、リソース、評価基準、結果</li>
                <li><strong>システム：</strong>Win-Winを支援する構造</li>
                <li><strong>プロセス：</strong>Win-Winの解決策を見出すプロセス</li>
            </ol>

            <h4>豊かさマインドセット vs 欠乏マインドセット</h4>
            <p><strong>欠乏マインドセット：</strong>パイは限られていると考える。誰かが成功すると、自分の分が減ると感じる。</p>
            <p><strong>豊かさマインドセット：</strong>すべての人に十分なものがあると信じる。他者の成功を喜べる。協力によってパイを大きくできる。</p>

            <div class="example">
                <h4>実践例</h4>
                <p><strong>状況：</strong>プロジェクトの予算配分で意見が対立</p>
                <p><strong>Win-Lose：</strong>「私の部門が優先されるべきだ」</p>
                <p><strong>Win-Win：</strong>「どうすれば両部門の目標を達成できるか、一緒に考えよう」</p>
            </div>

            <h4>実践のための質問</h4>
            <ul>
                <li>あなたは豊かさマインドセットを持っていますか？</li>
                <li>他者の成功を心から喜べますか？</li>
                <li>競争ではなく協力を選んでいますか？</li>
                <li>Win-Winを不可能にしている思い込みはありませんか？</li>
            </ul>
        `
    },
    5: {
        title: "習慣5：まず理解に徹し、そして理解される",
        subtitle: "Seek First to Understand, Then to Be Understood",
        content: `
            <h3>まず理解に徹し、そして理解される</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>相手を本当に理解してから、自分を理解してもらう。共感による傾聴が人間関係の基礎。</p>
            </div>

            <h4>4つの聞き方のレベル</h4>
            <ol>
                <li><strong>無視する：</strong>実際には聞いていない</li>
                <li><strong>聞くふりをする：</strong>「うん、うん」と相槌を打つだけ</li>
                <li><strong>選択的に聞く：</strong>会話の一部だけを聞く</li>
                <li><strong>注意して聞く：</strong>言葉に集中する</li>
                <li><strong>共感による傾聴：</strong>相手の立場に立ち、感情と意味を理解する（最も効果的）</li>
            </ol>

            <h4>共感による傾聴とは</h4>
            <p>共感による傾聴では、相手の参照枠の中に入り込みます。相手の見ている世界を理解し、相手が感じていることを感じ取ります。</p>

            <h4>効果的でない反応（自叙伝的反応）</h4>
            <ul>
                <li><strong>評価する：</strong>「それは間違っている」</li>
                <li><strong>探る：</strong>「なぜそうしたの？」（尋問）</li>
                <li><strong>助言する：</strong>「こうすべきだ」（求められていない）</li>
                <li><strong>解釈する：</strong>「本当は〜ということでしょ」</li>
            </ul>

            <h4>共感による傾聴の技法</h4>
            <ol>
                <li><strong>内容を繰り返す：</strong>「〜ということですね」</li>
                <li><strong>内容を言い換える：</strong>自分の言葉で確認</li>
                <li><strong>感情を反映する：</strong>「〜と感じているのですね」</li>
                <li><strong>内容と感情を言い換える：</strong>最も効果的</li>
            </ol>

            <div class="example">
                <h4>実践例</h4>
                <p><strong>相手：</strong>「もう学校なんて行きたくない！」</p>
                <p><strong>自叙伝的：</strong>「何を言ってるの。学校は大事よ」（評価）</p>
                <p><strong>共感的：</strong>「学校で何か辛いことがあったのね。話してくれる？」</p>
            </div>

            <h4>理解されるためには</h4>
            <p>相手を理解した後、自分の考えを論理的に（ロゴス）、情緒的に（パトス）、倫理的に（エトス）伝えます。</p>

            <h4>実践のための質問</h4>
            <ul>
                <li>あなたは話すことと聞くことのどちらに時間を使っていますか？</li>
                <li>相手の話を遮って、自分の話をしていませんか？</li>
                <li>相手の感情を理解しようとしていますか？</li>
                <li>アドバイスする前に、十分に聞いていますか？</li>
            </ul>
        `
    },
    6: {
        title: "習慣6：シナジーを創り出す",
        subtitle: "Synergize",
        content: `
            <h3>シナジーを創り出す（Synergize）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>全体の合計は個々の部分の総和より大きい。違いを尊重し、創造的な協力によって第三の案を生み出す。</p>
            </div>

            <h4>シナジーとは</h4>
            <p>シナジーとは、1+1が3にも4にも10にもなることです。関係者全員が協力して、誰も一人では達成できなかった結果を生み出します。</p>

            <h4>シナジーの本質</h4>
            <ul>
                <li>違いを尊重し、価値を認める</li>
                <li>相手の強みを活かす</li>
                <li>弱みを補完し合う</li>
                <li>新しい選択肢を創造する</li>
                <li>妥協ではなく、より良い第三の案を見つける</li>
            </ul>

            <h4>違いがシナジーを生む</h4>
            <p>人々の違い（肉体的、精神的、感情的、心理的違い）こそが、シナジーの源です。同じ考え方の人だけでは、新しいものは生まれません。</p>

            <h4>シナジーのレベル</h4>
            <ol>
                <li><strong>防衛的：</strong>「勝つか負けるか」（Win-Lose, Lose-Win）</li>
                <li><strong>尊重的：</strong>「互いを尊重するが、新しいものは生まれない」</li>
                <li><strong>シナジー的：</strong>「違いから学び、創造する」（Win-Win）</li>
            </ol>

            <div class="example">
                <h4>実践例：チームでの意思決定</h4>
                <p><strong>状況：</strong>新製品開発で、マーケティング部門とエンジニアリング部門の意見が対立</p>
                <p><strong>妥協：</strong>両者の中間案を採用（どちらも満足しない）</p>
                <p><strong>シナジー：</strong>両部門の視点を統合し、顧客ニーズを満たしながら技術的にも優れた革新的な解決策を創造</p>
            </div>

            <h4>シナジーを生むコミュニケーション</h4>
            <ul>
                <li>「あなたの見方は違うんですね。説明してください」</li>
                <li>「なるほど、その視点は考えていませんでした」</li>
                <li>「両方の良いところを活かせる方法はないでしょうか」</li>
                <li>「一緒にもっと良い案を考えましょう」</li>
            </ul>

            <h4>シナジーの障壁</h4>
            <ul>
                <li>不安と自己防衛</li>
                <li>エゴと傲慢さ</li>
                <li>違いへの恐れ</li>
                <li>「正しい答えは一つ」という思い込み</li>
            </ul>

            <h4>実践のための質問</h4>
            <ul>
                <li>あなたは違いを脅威と見ますか、それとも機会と見ますか？</li>
                <li>最近、シナジーを経験しましたか？</li>
                <li>妥協で満足していませんか？</li>
                <li>他者の視点を本当に理解しようとしていますか？</li>
            </ul>
        `
    },
    7: {
        title: "習慣7：刃を研ぐ",
        subtitle: "Sharpen the Saw",
        content: `
            <h3>刃を研ぐ（Sharpen the Saw）</h3>

            <div class="key-point">
                <h4>核心原則</h4>
                <p>継続的な自己再新再生。4つの側面（肉体、精神、知性、社会・情緒）をバランスよく磨き続ける。</p>
            </div>

            <h4>のこぎりを研ぐ話</h4>
            <p>森で木を切っている人に「のこぎりを研いだらどうですか？」と尋ねると、「木を切るのに忙しくて、のこぎりを研ぐ時間なんてない」と答えます。私たちも同じ過ちを犯していないでしょうか？</p>

            <h4>4つの側面の再新再生</h4>

            <h4>1. 肉体的側面</h4>
            <ul>
                <li><strong>運動：</strong>持久力、柔軟性、強さ</li>
                <li><strong>栄養：</strong>バランスの取れた食事</li>
                <li><strong>ストレス管理：</strong>適切な休息</li>
                <li><strong>予防：</strong>定期的な健康チェック</li>
            </ul>
            <p><em>第二領域の活動：週に3〜6時間の運動</em></p>

            <h4>2. 精神的側面</h4>
            <ul>
                <li><strong>価値観の明確化：</strong>何が本当に大切か</li>
                <li><strong>瞑想：</strong>静かな時間を持つ</li>
                <li><strong>自然との触れ合い：</strong>美しいものに触れる</li>
                <li><strong>祈りや内省：</strong>人生の意味を考える</li>
            </ul>

            <h4>3. 知的側面</h4>
            <ul>
                <li><strong>読書：</strong>優れた文学や知識に触れる</li>
                <li><strong>執筆：</strong>考えを整理し、表現する</li>
                <li><strong>計画立案：</strong>目標設定と実行計画</li>
                <li><strong>学習：</strong>新しいスキルや知識の習得</li>
            </ul>

            <h4>4. 社会・情緒的側面</h4>
            <ul>
                <li><strong>人間関係への投資：</strong>深い関係を築く（習慣4, 5, 6の実践）</li>
                <li><strong>奉仕：</strong>他者への貢献</li>
                <li><strong>共感：</strong>他者を理解する</li>
                <li><strong>シナジー：</strong>創造的な協力</li>
            </ul>

            <div class="example">
                <h4>バランスの取れた再新再生プログラム例</h4>
                <ul>
                    <li><strong>毎日：</strong>30分の運動、15分の瞑想、30分の読書</li>
                    <li><strong>毎週：</strong>家族との質の高い時間、ボランティア活動</li>
                    <li><strong>毎月：</strong>新しいスキルの学習、人間関係の見直し</li>
                    <li><strong>毎年：</strong>ミッション・ステートメントの見直し、長期目標の設定</li>
                </ul>
            </div>

            <h4>上方スパイラル</h4>
            <p>学び（知性）→決意（精神）→実行（肉体）→学び...のサイクルを繰り返すことで、螺旋状に成長していきます。</p>

            <h4>良心との調和</h4>
            <p>4つの側面をバランスよく磨くことで、良心の声がより明確に聞こえるようになります。良心は、私たちを導く内なる羅針盤です。</p>

            <h4>実践のための質問</h4>
            <ul>
                <li>4つの側面で、どれが最も疎かになっていますか？</li>
                <li>毎日、自己再新再生の時間を取っていますか？</li>
                <li>長期的な成長計画を持っていますか？</li>
                <li>あなたの「のこぎり」は鋭いですか？</li>
            </ul>
        `
    }
};

// モーダル関連
const modal = document.getElementById('habitModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close');

// 詳しく学ぶボタンのイベントリスナー
document.querySelectorAll('.learn-more').forEach(button => {
    button.addEventListener('click', function() {
        const habitNumber = parseInt(this.getAttribute('data-habit'));
        showHabitDetail(habitNumber);
    });
});

// 習慣の詳細を表示
function showHabitDetail(habitNumber) {
    const habit = habitsDetails[habitNumber];
    if (habit) {
        modalBody.innerHTML = habit.content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // スクロール防止
    }
}

// モーダルを閉じる
closeBtn.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// モーダル外をクリックで閉じる
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// ワークシート保存機能
const saveButton = document.getElementById('saveWorksheet');
const saveMessage = document.getElementById('saveMessage');

// ページ読み込み時にローカルストレージから復元
window.addEventListener('DOMContentLoaded', function() {
    loadWorksheet();
});

function loadWorksheet() {
    const mission = localStorage.getItem('mission');
    const quadrant2 = localStorage.getItem('quadrant2');
    const sharpen = localStorage.getItem('sharpen');

    if (mission) document.getElementById('mission').value = mission;
    if (quadrant2) document.getElementById('quadrant2').value = quadrant2;
    if (sharpen) document.getElementById('sharpen').value = sharpen;
}

saveButton.addEventListener('click', function() {
    const mission = document.getElementById('mission').value;
    const quadrant2 = document.getElementById('quadrant2').value;
    const sharpen = document.getElementById('sharpen').value;

    try {
        localStorage.setItem('mission', mission);
        localStorage.setItem('quadrant2', quadrant2);
        localStorage.setItem('sharpen', sharpen);

        saveMessage.textContent = '✓ 保存しました！';
        saveMessage.className = 'save-message success';

        setTimeout(() => {
            saveMessage.textContent = '';
            saveMessage.className = 'save-message';
        }, 3000);
    } catch (e) {
        saveMessage.textContent = '保存に失敗しました';
        saveMessage.className = 'save-message';
        console.error('保存エラー:', e);
    }
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// カードホバーアニメーション
document.querySelectorAll('.habit-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ページ読み込み時のアニメーション
window.addEventListener('load', function() {
    const cards = document.querySelectorAll('.habit-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }, index * 100);
    });
});
