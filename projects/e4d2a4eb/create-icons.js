const fs = require('fs');

// Simple SVG to create icons
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1a1a2e"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="#e94560" opacity="0.2"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.28}" fill="#e94560" opacity="0.4"/>
  <text x="${size/2}" y="${size*0.62}" font-family="Arial, sans-serif" font-size="${size*0.3}" font-weight="bold" text-anchor="middle" fill="#f1f1f1">CC</text>
</svg>`;

// Create SVG files
fs.writeFileSync('icon-192.svg', createSVG(192));
fs.writeFileSync('icon-512.svg', createSVG(512));

console.log('SVG icons created successfully!');
console.log('To convert to PNG, use: convert icon-192.svg icon-192.png');
console.log('Or upload to https://cloudconvert.com/svg-to-png');
