#!/bin/bash
# アイコン生成スクリプト（ImageMagickが利用可能な場合）
convert -size 192x192 xc:'#2563eb' -gravity center -pointsize 120 -fill white -annotate +0+0 'AI' icon-192.png
convert -size 512x512 xc:'#2563eb' -gravity center -pointsize 320 -fill white -annotate +0+0 'AI' icon-512.png
