const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Chat bubble
    ctx.fillStyle = 'white';
    const bubbleSize = size * 0.5;
    const x = size * 0.25;
    const y = size * 0.2;
    const radius = bubbleSize * 0.15;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + bubbleSize - radius, y);
    ctx.quadraticCurveTo(x + bubbleSize, y, x + bubbleSize, y + radius);
    ctx.lineTo(x + bubbleSize, y + bubbleSize * 0.7 - radius);
    ctx.quadraticCurveTo(x + bubbleSize, y + bubbleSize * 0.7, x + bubbleSize - radius, y + bubbleSize * 0.7);
    ctx.lineTo(x + bubbleSize * 0.3, y + bubbleSize * 0.7);
    ctx.lineTo(x + bubbleSize * 0.15, y + bubbleSize);
    ctx.lineTo(x + bubbleSize * 0.2, y + bubbleSize * 0.7);
    ctx.lineTo(x + radius, y + bubbleSize * 0.7);
    ctx.quadraticCurveTo(x, y + bubbleSize * 0.7, x, y + bubbleSize * 0.7 - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Dots inside bubble
    const dotRadius = size * 0.03;
    const dotY = y + bubbleSize * 0.35;

    ctx.beginPath();
    ctx.arc(x + bubbleSize * 0.3, dotY, dotRadius, 0, Math.PI * 2);
    ctx.arc(x + bubbleSize * 0.5, dotY, dotRadius, 0, Math.PI * 2);
    ctx.arc(x + bubbleSize * 0.7, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    return canvas;
}

// Generate 192x192
const canvas192 = createIcon(192);
const buffer192 = canvas192.toBuffer('image/png');
fs.writeFileSync('icon-192.png', buffer192);
console.log('Generated icon-192.png');

// Generate 512x512
const canvas512 = createIcon(512);
const buffer512 = canvas512.toBuffer('image/png');
fs.writeFileSync('icon-512.png', buffer512);
console.log('Generated icon-512.png');
