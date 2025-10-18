const fs = require('fs');
const path = require('path');

// Canvasパッケージが利用できない場合のフォールバック
// シンプルなPNGヘッダーを使用してプレースホルダー画像を作成

function createPlaceholderIcon(size, filename) {
  // 非常にシンプルな単色PNG（1x1ピクセルを引き伸ばし）
  // 実際の環境では、ブラウザでcreate-icons.htmlを開いてダウンロードすることを推奨

  console.log(`\n重要: ${filename}を生成するには、以下の手順を実行してください:`);
  console.log(`1. ブラウザで以下のURLを開く:`);
  console.log(`   https://vps.nekodigi.com/ccbot/projects/05bc2e0d/create-icons.html`);
  console.log(`2. 自動生成されたアイコンをダウンロード`);
  console.log(`3. プロジェクトのルートディレクトリに配置\n`);

  // 簡易的なSVGファイルの作成（ブラウザでPNGに変換可能）
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#2c3e50" rx="${size * 0.15}"/>
  <text x="50%" y="25%" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">PWA</text>
  <circle cx="50%" cy="55%" r="${size * 0.12}" fill="rgba(52, 152, 219, 0.9)"/>
  <circle cx="${50 - 10}%" cy="${55 + 6}%" r="${size * 0.1}" fill="rgba(52, 152, 219, 0.7)"/>
  <circle cx="${50 + 10}%" cy="${55 + 6}%" r="${size * 0.1}" fill="rgba(52, 152, 219, 0.7)"/>
  <rect x="${50 - 16}%" y="${55 + 12}%" width="${size * 0.32}" height="${size * 0.04}" rx="${size * 0.02}" fill="rgba(255, 255, 255, 0.9)"/>
</svg>`;

  const svgFilename = filename.replace('.png', '.svg');
  fs.writeFileSync(svgFilename, svgContent);
  console.log(`SVGファイルを作成しました: ${svgFilename}`);
}

// 192x192と512x512のアイコンを作成
console.log('PWAアイコン生成スクリプト');
console.log('='.repeat(50));

createPlaceholderIcon(192, 'icon-192x192.png');
createPlaceholderIcon(512, 'icon-512x512.png');

console.log('\n完了: SVGファイルを作成しました。');
console.log('PNGアイコンを生成するには、create-icons.htmlをブラウザで開いてください。');
