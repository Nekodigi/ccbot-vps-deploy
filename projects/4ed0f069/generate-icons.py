from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # 画像作成
    img = Image.new('RGB', (size, size), '#0f0f1e')
    draw = ImageDraw.Draw(img)
    
    center_x = size // 2
    center_y = size // 2
    radius = int(size * 0.3)
    
    # 外側の円
    draw.ellipse(
        [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
        outline='#00d4ff',
        width=max(2, size // 100)
    )
    
    # 縦の楕円
    ellipse_width = int(radius * 0.6)
    draw.ellipse(
        [center_x - ellipse_width // 2, center_y - radius, 
         center_x + ellipse_width // 2, center_y + radius],
        outline='#00d4ff',
        width=max(2, size // 100)
    )
    
    # 状態ベクトル
    end_x = center_x + int(radius * 0.5)
    end_y = center_y - int(radius * 0.7)
    draw.line(
        [center_x, center_y, end_x, end_y],
        fill='#06ffa5',
        width=max(3, size // 60)
    )
    
    # 点
    point_radius = max(3, size // 60)
    draw.ellipse(
        [end_x - point_radius, end_y - point_radius, 
         end_x + point_radius, end_y + point_radius],
        fill='#06ffa5'
    )
    
    # テキスト "Q"
    try:
        font_size = size // 8
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "Q"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = center_x - text_width // 2
    text_y = center_y + radius + size // 20
    
    draw.text((text_x, text_y), text, fill='#00d4ff', font=font)
    
    # 保存
    img.save(filename)
    print(f"Created {filename}")

# アイコンを生成
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')
