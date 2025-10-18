// Node.js用のアイコン生成スクリプト（canvas未使用版）
// PNGを直接生成するために、シンプルなSVGを経由する方法を使用

const fs = require('fs');

function generateSVGIcon(size) {
    const cameraWidth = size * 0.6;
    const cameraHeight = size * 0.45;
    const centerX = size / 2;
    const centerY = size / 2;
    const lensRadius = size * 0.15;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2c3e50"/>
  <rect x="${centerX - cameraWidth/2}" y="${centerY - cameraHeight/2}" 
        width="${cameraWidth}" height="${cameraHeight}" fill="#3498db" rx="${size * 0.02}"/>
  <circle cx="${centerX}" cy="${centerY}" r="${lensRadius}" fill="#ecf0f1"/>
  <circle cx="${centerX}" cy="${centerY}" r="${lensRadius * 0.6}" fill="#34495e"/>
  <circle cx="${centerX + cameraWidth/3}" cy="${centerY - cameraHeight/3}" 
          r="${size * 0.04}" fill="#e74c3c"/>
</svg>`;
}

// SVGファイルを生成
fs.writeFileSync('icon-192.svg', generateSVGIcon(192));
fs.writeFileSync('icon-512.svg', generateSVGIcon(512));

console.log('SVGアイコンを生成しました。');
