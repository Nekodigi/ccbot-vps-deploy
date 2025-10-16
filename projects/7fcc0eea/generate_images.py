#!/usr/bin/env python3
"""
画像生成スクリプト
PWA用のアイコンとプレースホルダー画像を生成
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """アイコン画像を生成"""
    # グラデーション背景の作成
    img = Image.new('RGB', (size, size), '#2196F3')
    draw = ImageDraw.Draw(img)

    # 円形のデザイン
    margin = size // 8
    draw.ellipse(
        [(margin, margin), (size - margin, size - margin)],
        fill='#1976D2',
        outline='#FFFFFF',
        width=size // 40
    )

    # AR記号の描画
    center = size // 2
    symbol_size = size // 3

    # 三角形
    points = [
        (center, center - symbol_size // 2),
        (center - symbol_size // 2, center + symbol_size // 2),
        (center + symbol_size // 2, center + symbol_size // 2)
    ]
    draw.polygon(points, fill='#FFFFFF', outline='#BBDEFB')

    # 内側の円
    inner_radius = size // 10
    draw.ellipse(
        [(center - inner_radius, center - inner_radius),
         (center + inner_radius, center + inner_radius)],
        fill='#2196F3'
    )

    img.save(filename, 'PNG')
    print(f"Generated: {filename}")

def create_loading_image(filename):
    """ローディング画像を生成"""
    size = (800, 600)
    img = Image.new('RGB', size, '#F5F5F5')
    draw = ImageDraw.Draw(img)

    # 中央にローディングアイコン
    center_x, center_y = size[0] // 2, size[1] // 2

    # 外側の円
    radius = 60
    draw.ellipse(
        [(center_x - radius, center_y - radius),
         (center_x + radius, center_y + radius)],
        outline='#2196F3',
        width=8
    )

    # テキスト
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        font = ImageFont.load_default()

    text = "Loading..."
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    text_x = center_x - text_width // 2
    text_y = center_y + radius + 30

    draw.text((text_x, text_y), text, fill='#757575', font=font)

    img.save(filename, 'PNG')
    print(f"Generated: {filename}")

def create_og_image(filename):
    """OGP画像を生成"""
    size = (1200, 630)
    img = Image.new('RGB', size, '#2196F3')
    draw = ImageDraw.Draw(img)

    # グラデーション効果
    for i in range(size[1]):
        color_value = int(33 + (150 - 33) * (i / size[1]))
        draw.line([(0, i), (size[0], i)], fill=(color_value, 150, 243))

    # タイトル
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    except:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()

    # メインテキスト
    title = "AR Experience App"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    title_width = bbox[2] - bbox[0]
    title_x = (size[0] - title_width) // 2
    title_y = size[1] // 2 - 80

    draw.text((title_x, title_y), title, fill='#FFFFFF', font=font_title)

    # サブテキスト
    subtitle = "WebXR Powered AR Application"
    bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (size[0] - subtitle_width) // 2
    subtitle_y = title_y + 100

    draw.text((subtitle_x, subtitle_y), subtitle, fill='#BBDEFB', font=font_subtitle)

    # デコレーション
    margin = 100
    draw.rectangle(
        [(margin, margin), (size[0] - margin, size[1] - margin)],
        outline='#FFFFFF',
        width=4
    )

    img.save(filename, 'PNG')
    print(f"Generated: {filename}")

def create_screenshot(filename):
    """スクリーンショット画像を生成"""
    size = (1280, 720)
    img = Image.new('RGB', size, '#F5F5F5')
    draw = ImageDraw.Draw(img)

    # ヘッダー
    header_height = 120
    draw.rectangle([(0, 0), (size[0], header_height)], fill='#FFFFFF')

    try:
        font_header = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        font_header = ImageFont.load_default()
        font_body = ImageFont.load_default()

    # タイトル
    title = "AR Experience App"
    bbox = draw.textbbox((0, 0), title, font=font_header)
    title_width = bbox[2] - bbox[0]
    draw.text(((size[0] - title_width) // 2, 30), title, fill='#212121', font=font_header)

    # メインコンテンツエリア
    content_y = header_height + 40
    draw.rectangle(
        [(60, content_y), (size[0] - 60, content_y + 400)],
        fill='#FFFFFF',
        outline='#E0E0E0',
        width=2
    )

    # 3Dビューアのプレースホルダー
    viewer_text = "3D Model Viewer"
    bbox = draw.textbbox((0, 0), viewer_text, font=font_body)
    text_width = bbox[2] - bbox[0]
    draw.text(
        ((size[0] - text_width) // 2, content_y + 180),
        viewer_text,
        fill='#757575',
        font=font_body
    )

    # AR記号
    center_x = size[0] // 2
    center_y = content_y + 200
    symbol_size = 60

    draw.ellipse(
        [(center_x - symbol_size, center_y - symbol_size),
         (center_x + symbol_size, center_y + symbol_size)],
        fill='#2196F3',
        outline='#1976D2',
        width=3
    )

    img.save(filename, 'PNG')
    print(f"Generated: {filename}")

def main():
    """メイン処理"""
    print("Generating images...")

    # アイコン
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')

    # その他の画像
    create_loading_image('loading.png')
    create_og_image('og-image.png')
    create_screenshot('screenshot.png')

    print("\nAll images generated successfully!")

if __name__ == '__main__':
    main()
