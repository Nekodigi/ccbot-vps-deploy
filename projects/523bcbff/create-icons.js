// Node.jsでPWAアイコンを生成するスクリプト
// シンプルなPNG生成（node-canvasを使用しない代替実装）

const fs = require('fs');
const path = require('path');

// シンプルな1x1ピクセルのPNGヘッダー（Base64デコード用）
// 実際のプロジェクトではnode-canvasやsharpを使用することを推奨

// 最小限のPNG生成（単色）
function createSimplePNG(size, colors) {
    // PNGの手動生成は複雑なため、代わりにSVGを使用
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#2c3e50"/>
  <rect x="${size * 0.15625}" y="${size * 0.15625}" width="${size * 0.6875}" height="${size * 0.6875}" rx="${size * 0.0391}" fill="#ffffff"/>
  <rect x="${size * 0.234375}" y="${size * 0.2734375}" width="${size * 0.234375}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#2c3e50"/>
  <rect x="${size * 0.53125}" y="${size * 0.2734375}" width="${size * 0.234375}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#2c3e50"/>
  <rect x="${size * 0.234375}" y="${size * 0.4921875}" width="${size * 0.234375}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#2c3e50"/>
  <rect x="${size * 0.53125}" y="${size * 0.4921875}" width="${size * 0.234375}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#e74c3c"/>
</svg>`;

    return svg;
}

// iconsディレクトリを作成
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// SVGファイルとして保存
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSimplePNG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSimplePNG(512));

console.log('SVGアイコンを生成しました');
console.log('注: PNG形式が必要な場合は、以下のコマンドでSVGをPNGに変換してください:');
console.log('  npm install sharp');
console.log('  または画像編集ソフトで手動変換');
