#!/usr/bin/env python3
from PIL import Image, ImageDraw

def create_icon(size):
    # 新しい画像を作成
    img = Image.new('RGB', (size, size), color='#2c3e50')
    draw = ImageDraw.Draw(img)
    
    # カメラ本体
    center_x = size // 2
    center_y = size // 2
    camera_width = int(size * 0.6)
    camera_height = int(size * 0.45)
    
    camera_x1 = center_x - camera_width // 2
    camera_y1 = center_y - camera_height // 2
    camera_x2 = center_x + camera_width // 2
    camera_y2 = center_y + camera_height // 2
    
    draw.rounded_rectangle([camera_x1, camera_y1, camera_x2, camera_y2], 
                          radius=int(size * 0.02), fill='#3498db')
    
    # レンズ（外側）
    lens_radius = int(size * 0.15)
    lens_bbox = [center_x - lens_radius, center_y - lens_radius,
                 center_x + lens_radius, center_y + lens_radius]
    draw.ellipse(lens_bbox, fill='#ecf0f1')
    
    # レンズ（内側）
    inner_radius = int(lens_radius * 0.6)
    inner_bbox = [center_x - inner_radius, center_y - inner_radius,
                  center_x + inner_radius, center_y + inner_radius]
    draw.ellipse(inner_bbox, fill='#34495e')
    
    # シャッターボタン
    button_radius = int(size * 0.04)
    button_x = center_x + camera_width // 3
    button_y = center_y - camera_height // 3
    button_bbox = [button_x - button_radius, button_y - button_radius,
                   button_x + button_radius, button_y + button_radius]
    draw.ellipse(button_bbox, fill='#e74c3c')
    
    return img

# 192x192のアイコンを生成
icon_192 = create_icon(192)
icon_192.save('icon-192.png', 'PNG')

# 512x512のアイコンを生成
icon_512 = create_icon(512)
icon_512.save('icon-512.png', 'PNG')

print('PNGアイコンを生成しました: icon-192.png, icon-512.png')
