const fs = require('fs');

function generateSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" rx="${size * 0.08}" fill="white"/>
  <text x="${size / 2}" y="${size * 0.45}" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="#2196F3" text-anchor="middle" dominant-baseline="middle">3D</text>
  <text x="${size / 2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.12}" fill="#2196F3" text-anchor="middle" dominant-baseline="middle">AR</text>
</svg>`;
}

fs.writeFileSync('icon-192.svg', generateSVG(192));
fs.writeFileSync('icon-512.svg', generateSVG(512));
console.log('SVG icons generated successfully');
