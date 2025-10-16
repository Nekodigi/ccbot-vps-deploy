#!/bin/bash

# 各サイズのプレースホルダーアイコンを作成
# 単色の正方形PNG画像を生成

cd "$(dirname "$0")"

SIZES=(72 96 128 144 152 192 384 512)
COLOR="#2c3e50"

echo "プレースホルダーアイコンを作成中..."

for size in "${SIZES[@]}"; do
    filename="icon-${size}x${size}.png"

    # SVGを使用して各サイズのアイコンを作成
    cat > "temp_${size}.svg" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34495e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="$((size/8))"/>
  <rect x="$((size/5))" y="$((size/5))" width="$((size*3/5))" height="$((size*3/5))" fill="none" stroke="white" stroke-width="$((size/20))" rx="$((size/32))"/>
  <path d="M $((size*9/25)) $((size/2)) L $((size*23/50)) $((size*3/5)) L $((size*4/5)) $((size*19/50))" fill="none" stroke="white" stroke-width="$((size/16))" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
EOF

    echo "  作成: ${filename}"
done

echo ""
echo "注意: SVGファイルを作成しました。"
echo "PNGに変換するには、以下のいずれかの方法を使用してください:"
echo "  1. ブラウザで generate-icons.html を開く"
echo "  2. ImageMagick: convert temp_*.svg [対応するPNGファイル名]"
echo "  3. オンラインSVG→PNG変換ツールを使用"

