const fs = require('fs');
const path = require('path');

// Simple PNG generator using Canvas API fallback
// Since we don't have ImageMagick, we'll create a simple base64 encoded PNG

function createIcon(size) {
    // Create a simple red and black icon using data URL
    const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#000000"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size*0.3}" fill="none" stroke="#FF0000" stroke-width="${Math.max(4, size/24)}"/>
      <path d="M${size/2} ${size*0.3} L${size/2} ${size/2} L${size*0.65} ${size/2}" stroke="#FF0000" stroke-width="${Math.max(3, size/32)}" stroke-linecap="round" fill="none"/>
    </svg>
    `;
    return canvas;
}

// Create icons
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

fs.writeFileSync(path.join(assetsDir, 'icon-192.svg'), createIcon(192));
fs.writeFileSync(path.join(assetsDir, 'icon-512.svg'), createIcon(512));

console.log('SVG icons created successfully');
