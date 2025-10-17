from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # 背景色: #2563eb (プライマリカラー)
    img = Image.new('RGB', (size, size), color=(37, 99, 235))
    draw = ImageDraw.Draw(img)

    # チェックマークを描画
    # シンプルな✓マークを表現
    padding = size // 6
    check_color = (255, 255, 255)
    line_width = max(size // 20, 4)

    # チェックマークの座標
    start_x = padding + size // 8
    start_y = size // 2
    middle_x = size // 2 - padding // 2
    middle_y = size - padding * 2
    end_x = size - padding
    end_y = padding + size // 8

    # チェックマークを描画
    draw.line([(start_x, start_y), (middle_x, middle_y)], fill=check_color, width=line_width)
    draw.line([(middle_x, middle_y), (end_x, end_y)], fill=check_color, width=line_width)

    # 保存
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# アイコンを生成
create_icon(192, '/opt/bitnami/apache/htdocs/ccbot/projects/571e5352/icon-192.png')
create_icon(512, '/opt/bitnami/apache/htdocs/ccbot/projects/571e5352/icon-512.png')
