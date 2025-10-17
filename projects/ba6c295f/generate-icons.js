// Node.js script to generate PWA icons
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const scale = size / 512;

    // Background with rounded corners
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(64 * scale, 0);
    ctx.lineTo(size - 64 * scale, 0);
    ctx.arcTo(size, 0, size, 64 * scale, 64 * scale);
    ctx.lineTo(size, size - 64 * scale);
    ctx.arcTo(size, size, size - 64 * scale, size, 64 * scale);
    ctx.lineTo(64 * scale, size);
    ctx.arcTo(0, size, 0, size - 64 * scale, 64 * scale);
    ctx.lineTo(0, 64 * scale);
    ctx.arcTo(0, 0, 64 * scale, 0, 64 * scale);
    ctx.closePath();
    ctx.fill();

    // Camera Body
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.moveTo(128 * scale + 16 * scale, 200 * scale);
    ctx.lineTo(384 * scale - 16 * scale, 200 * scale);
    ctx.arcTo(384 * scale, 200 * scale, 384 * scale, 200 * scale + 16 * scale, 16 * scale);
    ctx.lineTo(384 * scale, 392 * scale - 16 * scale);
    ctx.arcTo(384 * scale, 392 * scale, 384 * scale - 16 * scale, 392 * scale, 16 * scale);
    ctx.lineTo(128 * scale + 16 * scale, 392 * scale);
    ctx.arcTo(128 * scale, 392 * scale, 128 * scale, 392 * scale - 16 * scale, 16 * scale);
    ctx.lineTo(128 * scale, 200 * scale + 16 * scale);
    ctx.arcTo(128 * scale, 200 * scale, 128 * scale + 16 * scale, 200 * scale, 16 * scale);
    ctx.closePath();
    ctx.fill();

    // Lens outer
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(256 * scale, 296 * scale, 64 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Lens middle
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(256 * scale, 296 * scale, 48 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Lens inner
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.arc(256 * scale, 296 * scale, 32 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Flash
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(320 * scale, 224 * scale, 32 * scale, 24 * scale);

    // Viewfinder
    ctx.fillStyle = '#34495e';
    ctx.fillRect(168 * scale, 224 * scale, 48 * scale, 24 * scale);

    // AI Sparkles
    ctx.fillStyle = '#3498db';

    function drawSparkle(cx, cy, s) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - s, cy);
        ctx.closePath();
        ctx.fill();
    }

    drawSparkle(160 * scale, 168 * scale, 8 * scale);
    drawSparkle(352 * scale, 168 * scale, 8 * scale);
    drawSparkle(256 * scale, 424 * scale, 8 * scale);

    return canvas;
}

// Generate icons
try {
    const icon192 = createIcon(192);
    const buffer192 = icon192.toBuffer('image/png');
    fs.writeFileSync('icon-192.png', buffer192);
    console.log('Generated icon-192.png');

    const icon512 = createIcon(512);
    const buffer512 = icon512.toBuffer('image/png');
    fs.writeFileSync('icon-512.png', buffer512);
    console.log('Generated icon-512.png');

    console.log('All icons generated successfully!');
} catch (error) {
    console.error('Error generating icons:', error.message);
    console.log('Please install canvas: npm install canvas');
}
