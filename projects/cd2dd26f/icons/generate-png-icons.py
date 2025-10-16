#!/usr/bin/env python3
"""
PWAアイコン生成スクリプト
SVGからPNG形式の各サイズのアイコンを生成します
"""

import os
from PIL import Image, ImageDraw, ImageFont

# アイコンサイズのリスト
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size):
    """指定されたサイズのアイコンを生成"""

    # 画像を作成
    img = Image.new('RGB', (size, size), color=(44, 62, 80))
    draw = ImageDraw.Draw(img)

    # グラデーション風の効果（簡易版）
    for i in range(size):
        color_value = 44 + int((52 - 44) * (i / size))
        draw.line([(i, 0), (i, size)], fill=(color_value, color_value + 18, color_value + 30))

    # チェックマークと枠の描画
    padding = size * 0.2
    icon_size = size - (padding * 2)
    line_width = max(2, int(size * 0.06))

    # 正方形の枠
    frame_size = icon_size * 0.9
    frame_offset = (size - frame_size) / 2
    draw.rectangle(
        [frame_offset, frame_offset, frame_offset + frame_size, frame_offset + frame_size],
        outline='white',
        width=line_width
    )

    # チェックマーク
    check_line_width = max(3, int(size * 0.08))
    points = [
        (padding + icon_size * 0.2, padding + icon_size * 0.5),
        (padding + icon_size * 0.4, padding + icon_size * 0.7),
        (padding + icon_size * 0.8, padding + icon_size * 0.3)
    ]

    # チェックマークを2本の線として描画
    draw.line([points[0], points[1]], fill='white', width=check_line_width)
    draw.line([points[1], points[2]], fill='white', width=check_line_width)

    return img

def main():
    """メイン処理"""
    script_dir = os.path.dirname(os.path.abspath(__file__))

    print("PWAアイコンを生成中...")

    for size in SIZES:
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(script_dir, filename)

        # アイコンを生成
        icon = create_icon(size)

        # PNG形式で保存
        icon.save(filepath, 'PNG', optimize=True)

        print(f"✓ {filename} を生成しました")

    print("\nすべてのアイコンの生成が完了しました！")

if __name__ == '__main__':
    main()
