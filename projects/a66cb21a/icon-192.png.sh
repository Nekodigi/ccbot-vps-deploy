#!/bin/bash
# 192x192 PNGアイコンを生成
convert -size 192x192 xc:'#2196F3' \
  -gravity center \
  -fill white \
  -pointsize 120 \
  -font 'DejaVu-Sans-Bold' \
  -annotate +0+0 '3D' \
  icon-192.png 2>/dev/null || \
convert -size 192x192 \
  -define gradient:angle=135 \
  gradient:'#667eea'-'#764ba2' \
  -gravity center \
  \( -size 140x140 xc:white -draw "roundrectangle 0,0,140,140,20,20" \) \
  -composite \
  -gravity center \
  -fill '#2196F3' \
  -pointsize 80 \
  -annotate +0-10 '3D' \
  -pointsize 30 \
  -annotate +0+30 'AR' \
  icon-192.png
