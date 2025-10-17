#!/usr/bin/env python3
"""Generate PWA icons with red and black theme"""

import os
from PIL import Image, ImageDraw

# Create icons directory
os.makedirs('icons', exist_ok=True)

def generate_icon(size, filename):
    """Generate a single icon with the specified size"""
    # Create a black background
    img = Image.new('RGB', (size, size), color='#000000')
    draw = ImageDraw.Draw(img)

    # Calculate scaled dimensions
    scale = size / 512

    # Draw red circle (info icon)
    circle_center = (size // 2, int(size * 0.39))
    circle_radius = int(size * 0.156)
    draw.ellipse(
        [
            circle_center[0] - circle_radius,
            circle_center[1] - circle_radius,
            circle_center[0] + circle_radius,
            circle_center[1] + circle_radius
        ],
        fill='#dc3545'
    )

    # Draw red rounded rectangle (top element)
    rect1_x = int(size * 0.344)
    rect1_y = int(size * 0.547)
    rect1_w = int(size * 0.313)
    rect1_h = int(size * 0.078)
    draw.rounded_rectangle(
        [rect1_x, rect1_y, rect1_x + rect1_w, rect1_y + rect1_h],
        radius=int(size * 0.039),
        fill='#dc3545'
    )

    # Draw white rounded rectangles (info lines)
    rect2_x = int(size * 0.273)
    rect2_y = int(size * 0.664)
    rect2_w = int(size * 0.453)
    rect2_h = int(size * 0.078)
    draw.rounded_rectangle(
        [rect2_x, rect2_y, rect2_x + rect2_w, rect2_y + rect2_h],
        radius=int(size * 0.039),
        fill='#ffffff'
    )

    rect3_x = int(size * 0.273)
    rect3_y = int(size * 0.781)
    rect3_w = int(size * 0.453)
    rect3_h = int(size * 0.078)
    draw.rounded_rectangle(
        [rect3_x, rect3_y, rect3_x + rect3_w, rect3_y + rect3_h],
        radius=int(size * 0.039),
        fill='#ffffff'
    )

    # Save the image
    filepath = os.path.join('icons', filename)
    img.save(filepath, 'PNG')
    print(f'Created {filename}')

# Generate all required sizes
sizes = [
    (72, 'icon-72x72.png'),
    (96, 'icon-96x96.png'),
    (128, 'icon-128x128.png'),
    (144, 'icon-144x144.png'),
    (152, 'icon-152x152.png'),
    (192, 'icon-192x192.png'),
    (384, 'icon-384x384.png'),
    (512, 'icon-512x512.png')
]

for size, filename in sizes:
    generate_icon(size, filename)

print('Icon generation complete!')
