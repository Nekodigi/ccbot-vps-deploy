import discord
from discord.ext import commands
import os
import asyncio
import uuid
import re
import shutil
import time
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
import requests
import csv
import io
import logging
from logging.handlers import RotatingFileHandler

load_dotenv()

def setup_logging():
    """Setup comprehensive logging with file output and console output"""
    logs_dir = Path('./logs')
    logs_dir.mkdir(exist_ok=True)
    logger = logging.getLogger('discord_bot')
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()
    file_handler = RotatingFileHandler(
        logs_dir / 'bot_detailed.log',
        maxBytes=10 * 1024 * 1024,
        backupCount=10,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(funcName)-25s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger

logger = setup_logging()

def log_info(msg):
    """Log to both console and file"""
    print(msg)
    logger.info(msg)

def get_project_url(project_id):
    """Get project URL from project ID"""
    if PROJECT_BASE_URL:
        return f"{PROJECT_BASE_URL.rstrip('/')}/{project_id}"
    return f"/projects/{project_id}"

async def generate_tags_with_ai(project_summary, prompt):
    """Generate tags using AI by extracting keywords"""
    if not openai_client:
        return []
    try:
        system_prompt = """あなたはプロジェクトのタグ生成の専門家です。
プロジェクトのサマリーとユーザーの指示から、検索やフィルタリングに適したキーワードをスペース区切りで生成してください。

要件:
- 3〜5個のキーワードを生成
- 各キーワードは3〜15文字程度
- 技術名、ジャンル、特徴を表すキーワード
- スペース区切りで出力（カンマや記号は不要）

例:
入力: 「じゃんけんゲーム」「じゃんけんゲームを作って」
出力: ゲーム じゃんけん JavaScript インタラクティブ

入力: 「ToDoリスト管理アプリ」「ToDoアプリを作成」
出力: ToDoリスト 管理アプリ タスク Web

入力: 「レスポンシブなポートフォリオ」「ポートフォリオサイト作成」
出力: ポートフォリオ レスポンシブ デザイン Web"""

        user_prompt = f"""プロジェクトサマリー: {project_summary}
ユーザーの指示: {prompt}

このプロジェクトに適したキーワードをスペース区切りで生成してください。"""

        response = await asyncio.wait_for(
            asyncio.to_thread(
                openai_client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=50,
                temperature=0.5
            ),
            timeout=15
        )

        keywords_text = response.choices[0].message.content.strip()
        tags = [tag.strip() for tag in keywords_text.split() if 3 <= len(tag.strip()) <= 15]
        return tags[:5]
    except Exception as e:
        logger.warning(f"Tag generation error: {e}")
        return []

def filter_project_files(files, project_path):
    """Filter out version folders from file list"""
    return [f for f in files if f.is_file() and not str(f.relative_to(project_path)).startswith('v')]

async def update_reaction(message, old_emoji, new_emoji):
    """Update message reaction"""
    try:
        await message.remove_reaction(old_emoji, bot.user)
        await message.add_reaction(new_emoji)
        logger.debug(f"Updated reaction to {new_emoji}")
    except discord.errors.Forbidden as e:
        logger.warning(f"Permission denied for reaction: {e}")
    except Exception as e:
        logger.warning(f"Failed to update reaction: {e}")

TOKEN = os.getenv('DISCORD_BOT_TOKEN')
COMMAND_BASE_PATH = os.getenv('COMMAND_BASE_PATH', './projects')
PROJECT_BASE_URL = os.getenv('PROJECT_BASE_URL', '')
PROMPT_ALIAS_SPREADSHEET_ID = os.getenv('PROMPT_ALIAS_SPREADSHEET_ID', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

openai_client = None
if OPENAI_API_KEY:
    openai_client = OpenAI(
        api_key=OPENAI_API_KEY,
        timeout=60.0,
        max_retries=2
    )

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

Path(COMMAND_BASE_PATH).mkdir(parents=True, exist_ok=True)

prompt_aliases = {}
prompt_alias_channels = {}
prompt_aliases_last_reload = 0
prompt_aliases_spreadsheet_url = ''
ALIAS_CACHE_DURATION = 60

def load_prompt_aliases_from_spreadsheet(spreadsheet_url_or_id, silent=False, force=False):
    """Load prompt aliases from Google Spreadsheet (public URL only)

    Args:
        spreadsheet_url_or_id: URL or ID of the Google Spreadsheet
        silent: If True, suppress detailed logging and print output
        force: If True, ignore cache and force reload
    """
    global prompt_aliases, prompt_alias_channels, prompt_aliases_last_reload, prompt_aliases_spreadsheet_url
    if not force:
        current_time = time.time()
        time_since_reload = current_time - prompt_aliases_last_reload
        if time_since_reload < ALIAS_CACHE_DURATION:
            if not silent:
                logger.info(f"Using cached prompt aliases (loaded {int(time_since_reload)}s ago)")
            return True, f"{len(prompt_aliases)}個のプロンプトエイリアス (キャッシュ)"
    try:
        if 'docs.google.com' in spreadsheet_url_or_id:
            match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', spreadsheet_url_or_id)
            if match:
                spreadsheet_id = match.group(1)
            else:
                return False, "無効なスプレッドシートURLです"
        else:
            spreadsheet_id = spreadsheet_url_or_id

        # Save full spreadsheet URL
        full_spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"

        csv_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv&gid=0"
        response = requests.get(csv_url, timeout=10)
        response.raise_for_status()
        csv_content = response.content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        new_aliases = {}
        new_channels = {}
        for row in csv_reader:
            tag = str(row.get('タグ名', row.get('tag', ''))).strip()
            prompt = str(row.get('プロンプト', row.get('prompt', ''))).strip()
            channel = str(row.get('対象チャンネル', row.get('channel', ''))).strip()
            if tag and prompt:
                new_aliases[tag] = prompt
                if channel:
                    new_channels[tag] = channel
        if not new_aliases:
            return False, "スプレッドシートが空か、正しい列名がありません（タグ名/tag, プロンプト/prompt）"
        prompt_aliases = new_aliases
        prompt_alias_channels = new_channels
        prompt_aliases_spreadsheet_url = full_spreadsheet_url
        prompt_aliases_last_reload = time.time()
        if not silent:
            tags_summary = [f"#{tag}" + (f"[{new_channels[tag]}]" if tag in new_channels else "") for tag in sorted(new_aliases.keys())]
            log_info(f"✅ Loaded {len(new_aliases)} prompt aliases: {', '.join(tags_summary)}")
        tag_list = ", ".join([f"#{tag}" for tag in sorted(new_aliases.keys())])
        return True, f"{len(new_aliases)}個のプロンプトエイリアスを読み込みました\n📋 タグ一覧: {tag_list}"
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403 or e.response.status_code == 404:
            return False, "スプレッドシートにアクセスできません。「リンクを知っている全員」に共有設定してください"
        else:
            return False, f"スプレッドシート読み込みエラー: HTTPステータス {e.response.status_code}"
    except Exception as e:
        return False, f"スプレッドシート読み込みエラー: {str(e)}"

def replace_prompt_aliases(prompt, channel_id=None, channel_name=None):
    """Replace prompt aliases in text and auto-append channel-specific prompts

    Returns:
        tuple: (final_prompt, user_instruction, alias_guidelines, replaced_tags, auto_appended)
    """
    logger.info(f"ALIAS_REPLACE | Channel: {channel_name} ({channel_id}) | Prompt: {prompt[:100]} | Available: {len(prompt_aliases)} aliases")
    user_instruction = prompt
    alias_contents = []
    replaced_tags = []
    auto_appended = []
    for tag, replacement in prompt_aliases.items():
        tag_pattern = f"#{tag}"
        if tag in prompt_alias_channels:
            allowed_channels_str = prompt_alias_channels[tag]
            allowed_channels = [ch.strip() for ch in allowed_channels_str.split(',')]
            is_target_channel = False
            if channel_id or channel_name:
                channel_id_str = str(channel_id) if channel_id else None
                for allowed in allowed_channels:
                    if (channel_name and allowed == channel_name) or (channel_id_str and allowed == channel_id_str):
                        is_target_channel = True
                        break
            if tag_pattern in user_instruction:
                logger.debug(f"Collecting #{tag} (channel-restricted, explicit)")
                alias_contents.append(f"[#{tag}]\n{replacement}")
                user_instruction = user_instruction.replace(tag_pattern, "").strip()
                replaced_tags.append(tag)
            elif is_target_channel:
                logger.debug(f"Auto-appending #{tag} (channel-matched)")
                alias_contents.append(f"[#{tag} - 自動適用]\n{replacement}")
                auto_appended.append(tag)
        else:
            if tag_pattern in user_instruction:
                logger.debug(f"Collecting #{tag} (unrestricted)")
                alias_contents.append(f"[#{tag}]\n{replacement}")
                user_instruction = user_instruction.replace(tag_pattern, "").strip()
                replaced_tags.append(tag)
    user_instruction = ' '.join(user_instruction.split())
    alias_guidelines = "\n\n".join(alias_contents) if alias_contents else ""
    if alias_guidelines:
        final_prompt = f"""【参考ガイドライン】
以下はプロジェクト作成時の参考ガイドラインです。

{alias_guidelines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ユーザーの指示】（最優先）
{user_instruction}

重要: ユーザーの指示と参考ガイドラインが矛盾する場合は、必ずユーザーの指示を優先してください。"""
    else:
        final_prompt = user_instruction
    logger.info(f"ALIAS_RESULT | Replaced: {replaced_tags} | Auto: {auto_appended} | Final length: {len(final_prompt)} chars")
    return final_prompt, user_instruction, alias_guidelines, replaced_tags, auto_appended

def backup_project_version(project_path):
    """Backup existing project to versioned subfolder"""
    try:
        project_path = Path(project_path)
        if not project_path.exists():
            return None
        version = 0
        while True:
            backup_path = project_path / f"v{version}"
            if not backup_path.exists():
                break
            version += 1
        backup_path.mkdir(parents=True, exist_ok=True)
        for item in project_path.iterdir():
            if item.is_file():
                shutil.copy2(item, backup_path / item.name)
            elif item.is_dir() and not item.name.startswith('v'):
                shutil.copytree(item, backup_path / item.name, dirs_exist_ok=True)
        return backup_path
    except Exception as e:
        print(f"Backup error: {e}")
        return None

async def list_project_files(project_path):
    """List files in project directory"""
    try:
        project_path = Path(project_path)
        if not project_path.exists():
            return "プロジェクトディレクトリが存在しません"
        files = []
        for item in sorted(project_path.rglob('*')):
            if item.is_file():
                rel_path = item.relative_to(project_path)
                files.append(f"  {rel_path}")
        if files:
            return "📄 **プロジェクトファイル:**\n" + "\n".join(files)
        else:
            return "📄 プロジェクトにファイルがありません"
    except Exception as e:
        return f"ファイル一覧取得エラー: {str(e)}"

async def update_html_meta_tags(project_path, summary, project_url, thumbnail_url):
    """Update HTML files with proper OGP meta tags"""
    try:
        project_path = Path(project_path)
        html_files = list(project_path.rglob('*.html'))
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                seo_description = summary[:120] if len(summary) <= 120 else summary[:117] + "..."
                new_meta_tags = f'''
    <!-- Open Graph / OGP - Auto-generated by Bot -->
    <meta property="og:title" content="{summary}">
    <meta property="og:description" content="{seo_description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{project_url}">
    <meta property="og:image" content="{thumbnail_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card - Auto-generated by Bot -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{summary}">
    <meta name="twitter:description" content="{seo_description}">
    <meta name="twitter:image" content="{thumbnail_url}">
'''
                if 'og:image' in content or 'twitter:image' in content:
                    print(f"🔄 {html_file.name}: 既存のOGPタグを更新します")
                    content = re.sub(
                        r'<!--\s*Open Graph.*?-->\s*(<meta\s+property="og:.*?>\s*)+',
                        '',
                        content,
                        flags=re.DOTALL | re.IGNORECASE
                    )
                    content = re.sub(
                        r'<meta\s+property="og:.*?>\s*',
                        '',
                        content,
                        flags=re.IGNORECASE
                    )
                    content = re.sub(
                        r'<!--\s*Twitter Card.*?-->\s*(<meta\s+name="twitter:.*?>\s*)+',
                        '',
                        content,
                        flags=re.DOTALL | re.IGNORECASE
                    )
                    content = re.sub(
                        r'<meta\s+name="twitter:.*?>\s*',
                        '',
                        content,
                        flags=re.IGNORECASE
                    )
                    print(f"✅ {html_file.name}: 既存のメタタグを削除しました")
                if '</head>' in content:
                    updated_content = content.replace('</head>', new_meta_tags + '  </head>')
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"✅ {html_file.name}: 生成されたサムネイルURLでOGPメタタグを更新しました")
                    print(f"   📸 画像URL: {thumbnail_url}")
                else:
                    print(f"⚠️ {html_file.name}: </head>タグが見つかりません")
            except Exception as e:
                print(f"❌ {html_file.name}: メタタグ更新エラー: {e}")
                import traceback
                traceback.print_exc()
        return True
    except Exception as e:
        print(f"❌ HTMLメタタグ更新エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

async def generate_project_summary_with_ai(project_path, prompt, stdout):
    """Generate a one-line summary using ChatGPT API"""
    if not openai_client:
        raise Exception("OpenAI client not configured")
    project_path = Path(project_path)
    if not project_path.exists():
        raise Exception("Project path does not exist")
    files = list(project_path.rglob('*'))
    files = filter_project_files(files, project_path)
    if not files:
        raise Exception("No files in project")
    file_list = "\n".join([f"- {f.relative_to(project_path)}" for f in files[:20]])
    if len(files) > 20:
        file_list += f"\n... 他{len(files) - 20}個のファイル"
    system_prompt = """あなたはプロジェクト要約の専門家です。
ユーザーの指示と生成されたファイルリストから、プロジェクトの内容を日本語で1文（30文字以内）で要約してください。
ユーザー目線で、プロジェクトの本質だけを簡潔に表現してください。
「Webページ」「プロジェクト」などの自明な情報は省略してください。
例:
- 「じゃんけんゲーム」
- 「ToDoリスト管理アプリ」
- 「天気予報API（Python）」
- 「レスポンシブなポートフォリオ」
- 「リアルタイムチャット」"""
    user_prompt = f"""ユーザーの指示: {prompt}

生成されたファイル:
{file_list}

この内容を1文で要約してください。"""
    response = await asyncio.wait_for(
        asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=100,
            temperature=0.7
        ),
        timeout=30
    )
    return response.choices[0].message.content.strip()

async def generate_claude_code_thumbnail(project_path, project_summary, prompt):
    """Generate thumbnail using Claude Code to create HTML, then screenshot with Playwright"""
    browser = None
    try:
        from playwright.async_api import async_playwright
        project_path = Path(project_path)
        thumbnail_html_path = project_path / "thumbnail.html"
        thumbnail_png_path = project_path / "thumbnail.png"
        logger.info(f"Thumbnail generation start for project: {project_path.name}")
        thumbnail_prompt = f"""Create a beautiful, modern thumbnail HTML page for this project.

Project: {project_summary}
User Request: {prompt}

Requirements:
- Single self-contained HTML file (no external dependencies)
- Size: 1200px width × 630px height (OGP standard)
- Design: Modern, clean, professional Japanese aesthetic
- Use CSS Grid/Flexbox for layout
- Include project title/description attractively
- Use appropriate colors, gradients, or geometric shapes
- Font: Use web-safe fonts or import Google Fonts
- Responsive and visually appealing
- Save as thumbnail.html

The HTML should have:
- Fixed viewport: 1200x630px
- Centered content
- Beautiful background (gradient, solid color, or subtle pattern)
- Clear, readable text with proper contrast
- Professional appearance suitable for social media preview

Example structure:
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1200, height=630">
    <title>Thumbnail</title>
    <style>
        body {{{{
            margin: 0;
            width: 1200px;
            height: 630px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }}}}
        .container {{{{
            text-align: center;
            color: white;
            padding: 40px;
        }}}}
        h1 {{{{
            font-size: 72px;
            margin: 0;
            font-weight: 700;
        }}}}
        p {{{{
            font-size: 32px;
            margin-top: 20px;
            opacity: 0.9;
        }}}}
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Title</h1>
        <p>Description</p>
    </div>
</body>
</html>"""
        escaped_prompt = thumbnail_prompt.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$').replace('`', '\\`')
        claude_command = f'claude -p --dangerously-skip-permissions "{escaped_prompt}"'
        stdout, stderr, returncode = await execute_command_with_timeout(
            claude_command,
            str(project_path),
            timeout=120
        )
        if not thumbnail_html_path.exists():
            logger.warning(f"Claude Code did not create thumbnail.html (rc={returncode})")
            return None
        logger.info(f"thumbnail.html created (rc={returncode}), starting Playwright screenshot")
        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch(
                    args=[
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-software-rasterizer',
                        '--disable-extensions',
                        '--disable-background-networking',
                        '--disable-sync',
                    ]
                )
                page = await browser.new_page(viewport={'width': 1200, 'height': 630})
                await page.goto(
                    f'file:///{thumbnail_html_path.resolve()}',
                    timeout=10000,
                    wait_until='networkidle'
                )
                await page.wait_for_timeout(1000)
                await page.screenshot(path=str(thumbnail_png_path), type='png')
            finally:
                if browser:
                    try:
                        await browser.close()
                    except Exception as close_error:
                        logger.warning(f"Browser close error: {close_error}")
        if thumbnail_png_path.exists() and thumbnail_png_path.stat().st_size > 0:
            logger.info(f"Thumbnail generation success: {thumbnail_png_path.name} ({thumbnail_png_path.stat().st_size} bytes)")
            return thumbnail_png_path
        else:
            logger.warning(f"Screenshot file missing or empty")
            return None
    except ImportError:
        logger.error("Playwright is not installed. Run: playwright install chromium")
        print("❌ Playwrightがインストールされていません。")
        print("インストール方法:")
        print("  pip install playwright")
        print("  playwright install chromium")
        return None
    except Exception as e:
        logger.error(f"Claude Code thumbnail generation error: {str(e)}", exc_info=True)
        print(f"❌ Claude Code サムネイル生成エラー: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        if browser:
            try:
                await browser.close()
            except:
                pass

async def generate_thumbnail_with_progress(project_summary, prompt, project_path):
    """Generate thumbnail using Claude Code"""
    if not project_path:
        raise Exception("Project path required for thumbnail generation")
    log_info(f"Claude Code thumbnail generation for {project_path}")
    thumbnail_path = await generate_claude_code_thumbnail(project_path, project_summary, prompt)
    if not thumbnail_path:
        raise Exception("Claude Code thumbnail generation failed")
    relative_path = thumbnail_path.relative_to(Path(COMMAND_BASE_PATH))
    thumbnail_url = f"{PROJECT_BASE_URL.rstrip('/')}/{relative_path.as_posix()}" if PROJECT_BASE_URL else f"/{relative_path.as_posix()}"
    log_info(f"Claude Code thumbnail generated successfully: {thumbnail_url}")
    return thumbnail_url

async def save_to_csv_gallery(project_id, summary, prompt, thumbnail_url=None, author_info=None):
    """Save project to CSV gallery"""
    try:
        csv_path = Path(COMMAND_BASE_PATH) / "projects.csv"

        # Generate tags using AI
        tags = await generate_tags_with_ai(summary, prompt)
        tags_str = ';'.join(tags) if tags else ''

        # Get project URL
        project_url = get_project_url(project_id)

        # Set thumbnail URL or use placeholder
        if not thumbnail_url:
            thumbnail_url = f"https://via.placeholder.com/400x300/667eea/ffffff?text={project_id}"

        # Extract author info
        author_name = ''
        channel_name = ''
        if author_info:
            author_name = author_info.get('display_name', '') or author_info.get('username', '')
            channel_name = author_info.get('channel_name', '')

        # Get created_at: check CSV for existing entry, otherwise use current time
        created_at = datetime.now().isoformat()
        csv_exists = csv_path.exists()
        existing_rows = []
        project_exists = False

        if csv_exists:
            try:
                with open(csv_path, 'r', encoding='utf-8', newline='') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row.get('url') == project_url:
                            # Update existing project
                            created_at = row.get('created_at', created_at)
                            row['title'] = summary
                            row['image_url'] = thumbnail_url
                            row['tags'] = tags_str
                            row['author'] = author_name
                            row['channel'] = channel_name
                            project_exists = True
                            print(f"プロジェクト {project_id} のCSVエントリを更新します")
                        existing_rows.append(row)
            except Exception as e:
                print(f"CSV読み込みエラー: {e}")

        # Write CSV
        if project_exists:
            with open(csv_path, 'w', encoding='utf-8', newline='') as f:
                if existing_rows:
                    fieldnames = ['url', 'title', 'image_url', 'created_at', 'tags', 'author', 'channel']
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(existing_rows)
            print(f"プロジェクト {project_id} をCSVギャラリーで更新しました")
        else:
            with open(csv_path, 'a', encoding='utf-8', newline='') as f:
                writer = csv.writer(f)
                if not csv_exists or csv_path.stat().st_size == 0:
                    writer.writerow(['url', 'title', 'image_url', 'created_at', 'tags', 'author', 'channel'])
                writer.writerow([
                    project_url,
                    summary,
                    thumbnail_url,
                    created_at,
                    tags_str,
                    author_name,
                    channel_name
                ])
            print(f"プロジェクト {project_id} をCSVギャラリーに追加しました")

        return True
    except Exception as e:
        print(f"CSVギャラリー保存エラー: {e}")
        return False

async def execute_command_with_timeout(command, cwd, timeout=300):
    """Execute a command with timeout and return output with proper cleanup"""
    process = None
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )
            return stdout.decode('utf-8', errors='ignore'), stderr.decode('utf-8', errors='ignore'), process.returncode
        except asyncio.TimeoutError:
            logger.warning(f"Command timeout after {timeout}s, attempting termination...")
            try:
                process.terminate()
                await asyncio.wait_for(process.wait(), timeout=5)
                logger.info("Process terminated via SIGTERM")
            except asyncio.TimeoutError:
                process.kill()
                try:
                    await asyncio.wait_for(process.wait(), timeout=2)
                    logger.warning("Process killed via SIGKILL (did not respond to SIGTERM)")
                except asyncio.TimeoutError:
                    logger.error("Process zombie (no response to SIGKILL)")
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=3)
                return stdout.decode('utf-8', errors='ignore'), stderr.decode('utf-8', errors='ignore'), -1
            except asyncio.TimeoutError:
                logger.error("Failed to communicate with killed process")
                return '', f'Command timed out after {timeout} seconds (forced termination)', -1
    except Exception as e:
        logger.error(f"Command execution error: {e}", exc_info=True)
        if process and process.returncode is None:
            try:
                process.kill()
                await asyncio.wait_for(process.wait(), timeout=2)
            except:
                pass
        return '', str(e), -1

def split_message(text, max_length=1990):
    """Split long messages into chunks"""
    if len(text) <= max_length:
        return [text]
    lines = text.split('\n')
    chunks = []
    current_chunk = ''
    for line in lines:
        if len(current_chunk) + len(line) + 1 <= max_length:
            current_chunk += line + '\n'
        else:
            if current_chunk:
                chunks.append(current_chunk)
            if len(line) > max_length:
                for i in range(0, len(line), max_length):
                    chunks.append(line[i:i+max_length])
                current_chunk = ''
            else:
                current_chunk = line + '\n'
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

@bot.event
async def on_ready():
    log_info(f'{bot.user} がDiscordに接続しました!')
    log_info(f'コマンド実行ベースパス: {COMMAND_BASE_PATH}')
    if PROMPT_ALIAS_SPREADSHEET_ID:
        success, message = load_prompt_aliases_from_spreadsheet(PROMPT_ALIAS_SPREADSHEET_ID, force=True)
        if success:
            log_info(f'✅ {message}')
        else:
            log_info(f'⚠️ {message}')

@bot.event
async def on_message(message):
    """Handle messages and auto-load spreadsheets"""
    if message.author == bot.user:
        return
    spreadsheet_pattern = r'https://docs\.google\.com/spreadsheets/d/([a-zA-Z0-9-_]+)'
    match = re.search(spreadsheet_pattern, message.content)
    if match:
        spreadsheet_url = match.group(0)
        success, msg = load_prompt_aliases_from_spreadsheet(spreadsheet_url, force=True)
        if success:
            await message.add_reaction('✅')
            await message.channel.send(f'✅ {msg}')
        else:
            await message.add_reaction('❌')
            await message.channel.send(f'❌ {msg}')
    await bot.process_commands(message)

@bot.command(name='cmd')
async def cmd_execute(ctx, project_id_or_url: str = None, *, command: str = None):
    """
    指定したプロジェクトディレクトリでコマンドを実行
    使い方: !cmd [プロジェクトID/URL] [コマンド]
    """
    if project_id_or_url is None:
        await ctx.send('❌ エラー: プロジェクトIDまたはURLが必要です。\n使い方: `!cmd [プロジェクトID/URL] [コマンド]`')
        return
    if command is None:
        await ctx.send('❌ エラー: コマンドが必要です。\n使い方: `!cmd [プロジェクトID/URL] [コマンド]`')
        return
    project_id = extract_project_id_from_url(project_id_or_url)
    project_path = Path(COMMAND_BASE_PATH) / project_id
    project_path.mkdir(parents=True, exist_ok=True)
    await ctx.send(f'⚙️ プロジェクト `{project_id}` でコマンドを実行中...')
    try:
        stdout, stderr, returncode = await execute_command_with_timeout(
            command,
            str(project_path),
            timeout=600
        )
        response = f'**プロジェクト:** `{project_id}`\n**コマンド:** `{command}`\n**終了コード:** `{returncode}`\n\n'
        if stdout:
            stdout_chunks = split_message(stdout)
            for i, chunk in enumerate(stdout_chunks):
                if i == 0:
                    await ctx.send(content=response + f'**実行結果:**\n```\n{chunk}\n```')
                else:
                    await ctx.send(f'```\n{chunk}\n```')
        if stderr:
            stderr_chunks = split_message(stderr)
            for chunk in stderr_chunks:
                await ctx.send(f'**エラー出力:**\n```\n{chunk}\n```')
        if not stdout and not stderr:
            await ctx.send(content=response + '✅ コマンドが完了しました(出力なし)')
    except Exception as e:
        await ctx.send(content=f'❌ コマンド実行エラー: {str(e)}')

def extract_project_id_from_url(text):
    """Extract project ID from URL or return original text"""
    if not text:
        return None
    text = text.strip().rstrip('/')
    if PROJECT_BASE_URL:
        base_url = PROJECT_BASE_URL.rstrip('/')
        pattern = re.escape(base_url) + r'/([a-zA-Z0-9_-]+)'
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    match = re.search(r'(?:^|/)projects/([a-zA-Z0-9_-]+)', text)
    if match:
        return match.group(1)
    match = re.search(r'https?://[^/]+/(?:.*/)?([a-zA-Z0-9_-]+)$', text)
    if match:
        potential_id = match.group(1)
        if potential_id not in ['index', 'home', 'projects', 'api', 'static']:
            return potential_id
    return text

@bot.command(name='claude')
async def claude_execute(ctx, *, full_input: str = None):
    """
    Claude Codeでプロンプトを実行
    使い方: !claude [プロンプト] または !claude [プロジェクトID/URL] [プロンプト]
    """
    guild_info = f" | Server: {ctx.guild.name} ({ctx.guild.id})" if ctx.guild else ""
    logger.info(f"REQUEST_START | User: {ctx.author.display_name} ({ctx.author.id}) | Channel: {ctx.channel.name if hasattr(ctx.channel, 'name') else 'DM'} ({ctx.channel.id}){guild_info} | Input: {full_input[:80]}")
    if full_input is None:
        logger.error("No arguments provided to !claude command")
        await ctx.send('❌ エラー: プロンプトが必要です。\n使い方: `!claude [プロンプト]` または `!claude [プロジェクトID] [プロンプト]`')
        return
    full_input = full_input.replace('　', ' ')
    parts = full_input.split(maxsplit=1)
    is_existing_project = False
    url_detected = False
    extracted_id = None
    if len(parts) == 1:
        prompt = parts[0]
        project_id = str(uuid.uuid4())[:8]
        logger.info(f"Pattern: new_project | ID: {project_id} | Prompt: {prompt[:80]}")
    elif len(parts) == 2:
        first_part = parts[0]
        second_part = parts[1]
        extracted_id = extract_project_id_from_url(first_part)
        if extracted_id != first_part:
            project_id = extracted_id
            prompt = second_part
            url_detected = True
            project_path_check = Path(COMMAND_BASE_PATH) / project_id
            if project_path_check.exists():
                files = list(project_path_check.rglob('*'))
                files = filter_project_files(files, project_path_check)
                if files:
                    is_existing_project = True
            logger.info(f"Pattern: url_update | ID: {project_id} | Existing: {is_existing_project} | Prompt: {prompt[:80]}")
        else:
            prompt = full_input
            project_id = str(uuid.uuid4())[:8]
            logger.info(f"Pattern: long_prompt | ID: {project_id} | Prompt: {prompt[:80]}")
    if PROMPT_ALIAS_SPREADSHEET_ID:
        success, message = load_prompt_aliases_from_spreadsheet(PROMPT_ALIAS_SPREADSHEET_ID, silent=True)
        if success:
            logger.debug(f"Prompt aliases ready: {len(prompt_aliases)} tags")
        else:
            logger.warning(f"⚠️ Failed to reload aliases: {message}")
    prompt = prompt.replace('　', ' ')
    channel_name = ctx.channel.name if hasattr(ctx.channel, 'name') else None
    all_mentioned_prompt_tags = re.findall(r'#(\w+)', prompt)
    prompt, _, _, replaced_tags, auto_appended = replace_prompt_aliases(prompt, ctx.channel.id, channel_name)
    unknown_prompt_tags = [tag for tag in all_mentioned_prompt_tags if tag not in prompt_aliases]
    thinking_msg = '🤔 タスクを受け付けました。作成には数分程度かかります...'
    if is_existing_project:
        thinking_msg += f'\n♻️ 既存プロジェクト `{project_id}` を更新します'
    elif url_detected or (len(parts) > 1 and extracted_id == project_id):
        thinking_msg += f'\n📁 プロジェクト `{project_id}` で作業します'
    all_alias_tags = replaced_tags + auto_appended + unknown_prompt_tags
    if all_alias_tags:
        tag_parts = []
        for tag in replaced_tags:
            tag_parts.append(f"#{tag}")
        for tag in auto_appended:
            tag_parts.append(f"#{tag}(自動)")
        for tag in unknown_prompt_tags:
            tag_parts.append(f"#{tag}⚠️")
        tags_list = ', '.join(tag_parts)
        thinking_msg += f'\n🏷️ {tags_list}'
        tag_summary = []
        if replaced_tags:
            tag_summary.append(f"Replaced: {', '.join(replaced_tags)}")
        if auto_appended:
            tag_summary.append(f"Auto: {', '.join(auto_appended)}")
        if unknown_prompt_tags:
            tag_summary.append(f"Unknown: {', '.join(unknown_prompt_tags)}")
        if tag_summary:
            logger.info(f"Tags applied | {' | '.join(tag_summary)}")
    original_message_ref = ctx.message
    try:
        await original_message_ref.add_reaction('⏳')
        logger.debug("Added ⏳ reaction to original message")
    except Exception as e:
        logger.warning(f"Failed to add reaction: {e}")
    project_path = Path(COMMAND_BASE_PATH) / project_id
    backup_path = None
    if project_path.exists():
        files = list(project_path.rglob('*'))
        files = filter_project_files(files, project_path)
        if files:
            backup_path = backup_project_version(project_path)
    project_path.mkdir(parents=True, exist_ok=True)
    project_url = f'{PROJECT_BASE_URL.rstrip("/")}/{project_id}' if PROJECT_BASE_URL else f'/projects/{project_id}'
    seo_instructions = """

【重要な実装方針】
- htdocsディレクトリ配置、Pure HTML/CSS/JS推奨
- HTMLページには基本的なSEOメタタグ（OGP, Twitter Card）を含めてください
- メタタグは後で置き換えるので、目印程度で構いません

【絶対に守るべきルール】
- 質問や確認は一切せず、必ず完全に動作するコードを生成してください
- 不明な点や曖昧な仕様がある場合は、合理的な判断で実装を完了させてください
- 「どうしますか？」「確認したいのですが」などのユーザーへの問いかけは禁止です
- プロジェクトを完成させることが最優先です。必ずファイルを生成してください
- 最低限、index.htmlを含む動作するプロジェクトを作成してください
"""
    enhanced_prompt = prompt + seo_instructions
    escaped_prompt = enhanced_prompt.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$').replace('`', '\\`')
    claude_command = f'claude -p --dangerously-skip-permissions "{escaped_prompt}"'
    try:
        stdout, stderr, returncode = await execute_command_with_timeout(
            claude_command,
            str(project_path),
            timeout=600
        )
        has_html = False
        for item in project_path.rglob('*.html'):
            if item.is_file():
                has_html = True
                break
        project_summary = await generate_project_summary_with_ai(project_path, prompt, stdout)
        thumbnail_url = await generate_thumbnail_with_progress(project_summary, prompt, project_path)
        author_info = {
            "user_id": str(ctx.author.id),
            "username": ctx.author.name,
            "display_name": ctx.author.display_name,
            "discriminator": ctx.author.discriminator,
            "channel_id": str(ctx.channel.id),
            "channel_name": ctx.channel.name if hasattr(ctx.channel, 'name') else "DM",
            "guild_id": str(ctx.guild.id) if ctx.guild else None,
            "guild_name": ctx.guild.name if ctx.guild else None
        }
        if has_html:
            await update_html_meta_tags(project_path, project_summary, project_url, thumbnail_url)
        await save_to_csv_gallery(project_id, project_summary, prompt, thumbnail_url, author_info)
        await update_reaction(original_message_ref, '⏳', '✅')
        logger.info(f"REQUEST_COMPLETE | ID: {project_id}")
        response = f'✅ [{project_summary}]({project_url})\n'
        if backup_path:
            response += f'💾 旧バージョンを `{backup_path.name}` に保存しました\n'
        main_msg = await ctx.send(response)
        thread = await main_msg.create_thread(
            name=f"詳細結果: {project_summary[:80]}",
            auto_archive_duration=1440
        )
        thread_link = f"https://discord.com/channels/{ctx.guild.id}/{thread.id}"
        await main_msg.edit(content=response + f'\n📋 [詳細ログ]({thread_link})')

        # Always show execution info
        execution_info = f"""📊 **実行情報:**
• **プロジェクトID:** `{project_id}`
• **終了コード:** `{returncode}`
• **HTMLファイル:** {'✅ あり' if has_html else '❌ なし'}
• **生成ファイル数:** {len(list(project_path.rglob('*')))}"""
        await thread.send(execution_info, silent=True)

        # Always show stdout
        if stdout:
            stdout_chunks = split_message(stdout, max_length=1800)
            for chunk in stdout_chunks:
                await thread.send(f'**Claude Code 実行ログ:**\n```\n{chunk}\n```', silent=True)
        else:
            await thread.send('**Claude Code 実行ログ:**\n```\n(出力なし)\n```', silent=True)

        # Always show stderr if present
        if stderr:
            stderr_chunks = split_message(stderr, max_length=1800)
            for chunk in stderr_chunks:
                await thread.send(f'**エラー出力:**\n```\n{chunk}\n```', silent=True)

        # Show file list
        if not has_html:
            file_list = await list_project_files(project_path)
            await thread.send(file_list, silent=True)
    except Exception as e:
        await update_reaction(original_message_ref, '⏳', '❌')
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"Claude Code execution error: {error_type}: {error_msg}", exc_info=True)

        # Send error message to channel
        await ctx.send(content=f'❌ エラーが発生しました: {error_msg}')

        # Create thread for detailed error logs
        try:
            error_thread_msg = await ctx.send(f'❌ エラー詳細: {error_type}')
            error_thread = await error_thread_msg.create_thread(
                name=f"エラー詳細: {project_id}",
                auto_archive_duration=1440
            )

            # Error summary
            error_summary = f"""🔴 **エラー詳細:**
• **プロジェクトID:** `{project_id}`
• **エラー種類:** `{error_type}`
• **エラーメッセージ:** {error_msg}
• **プロジェクトパス:** `{project_path}`"""
            await error_thread.send(error_summary, silent=True)

            # Show Claude Code execution logs if available
            if 'stdout' in locals() and stdout:
                stdout_chunks = split_message(stdout, max_length=1800)
                await error_thread.send('**Claude Code 実行ログ (stdout):**', silent=True)
                for chunk in stdout_chunks:
                    await error_thread.send(f'```\n{chunk}\n```', silent=True)
            else:
                await error_thread.send('**Claude Code 実行ログ (stdout):**\n```\n(ログなし - Claude Codeが実行される前にエラーが発生した可能性があります)\n```', silent=True)

            if 'stderr' in locals() and stderr:
                stderr_chunks = split_message(stderr, max_length=1800)
                await error_thread.send('**エラー出力 (stderr):**', silent=True)
                for chunk in stderr_chunks:
                    await error_thread.send(f'```\n{chunk}\n```', silent=True)

            if 'returncode' in locals():
                await error_thread.send(f'**終了コード:** `{returncode}`', silent=True)

            # Show generated files
            try:
                file_list = await list_project_files(project_path)
                await error_thread.send(file_list, silent=True)
            except Exception as list_error:
                await error_thread.send(f'ファイル一覧取得エラー: {str(list_error)}', silent=True)

            # Diagnostic information
            diagnostic = f"""🔍 **診断情報:**

**考えられる原因:**
1. **Claude Codeが質問だけして終了:** Claude Codeがコードを生成せず、ユーザーに質問や確認をして終了した可能性があります。上記の実行ログを確認してください。
2. **プロンプトが不明確:** プロンプトが具体的でない場合、Claude Codeは何を作るべきか判断できません。
3. **タイムアウト:** 処理に600秒以上かかった場合、タイムアウトします。
4. **ファイル生成失敗:** 必要なファイルが生成されなかった可能性があります。

**次のステップ:**
1. 上記の実行ログを確認
2. プロンプトをより具体的に修正
3. 必要に応じて `!cmd {project_id} ls -la` でディレクトリを確認"""
            await error_thread.send(diagnostic, silent=True)

            # Get full stack trace
            import traceback
            stack_trace = traceback.format_exc()
            if stack_trace and stack_trace != 'NoneType: None\n':
                trace_chunks = split_message(stack_trace, max_length=1800)
                await error_thread.send('**スタックトレース:**', silent=True)
                for chunk in trace_chunks:
                    await error_thread.send(f'```python\n{chunk}\n```', silent=True)

            thread_link = f"https://discord.com/channels/{ctx.guild.id}/{error_thread.id}"
            await error_thread_msg.edit(content=f'❌ エラー詳細: {error_type}\n📋 [詳細ログ]({thread_link})')
        except Exception as thread_error:
            logger.error(f"Failed to create error thread: {str(thread_error)}")
            await ctx.send(f'⚠️ エラーログの作成に失敗しました: {str(thread_error)}')

@bot.command(name='load_aliases')
async def load_aliases(ctx, spreadsheet_url: str = None):
    """
    プロンプトエイリアスをスプレッドシートから読み込み
    使い方: !load_aliases [スプレッドシートURL]
    """
    if spreadsheet_url is None:
        await ctx.send('❌ エラー: スプレッドシートURLが必要です。\n使い方: `!load_aliases [スプレッドシートURL]`')
        return
    success, message = load_prompt_aliases_from_spreadsheet(spreadsheet_url, force=True)
    if success:
        await ctx.send(f'✅ {message}')
    else:
        await ctx.send(f'❌ {message}')

@bot.command(name='list_aliases')
async def list_aliases(ctx):
    """
    読み込まれているプロンプトエイリアスを一覧表示
    使い方: !list_aliases
    """
    if not prompt_aliases:
        await ctx.send('📋 プロンプトエイリアスが読み込まれていません。')
        return
    response = '📋 **読み込み済みプロンプトエイリアス:**\n\n'
    for tag, prompt_text in sorted(prompt_aliases.items()):
        channel_info = ''
        if tag in prompt_alias_channels:
            channel_info = f' (チャンネル: {prompt_alias_channels[tag]})'
        display_prompt = prompt_text[:100] + '...' if len(prompt_text) > 100 else prompt_text
        response += f'• `#{tag}`{channel_info}\n  → {display_prompt}\n\n'
    chunks = split_message(response, max_length=1900)
    for chunk in chunks:
        await ctx.send(chunk)

@bot.command(name='help_bot')
async def help_bot(ctx):
    help_text = """
📚 **Discord Claude Code Bot - コマンド一覧**

**🤖 Claude Code 実行**
• `!claude [プロンプト]` - 新規プロジェクト作成
• `!claude [URL] [プロンプト]` - 既存プロジェクト更新

**⚙️ コマンド実行**
• `!cmd [プロジェクトID/URL] [コマンド]` - シェルコマンド実行

**📝 プロンプトエイリアス**
• `!load_aliases [スプレッドシートURL]` - エイリアス読み込み
• `!list_aliases` - エイリアス一覧表示

**使用例:**
```
# 新規作成
!claude じゃんけんゲームを作って

# 既存更新
!claude https://example.com/projects/abc123 ダークモード追加

# エイリアス使用
!claude #react ToDoアプリ作成
```
    """
    await ctx.send(help_text)

async def handle_command_error(ctx, error, usage_msg):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f'❌ エラー: 必要な引数が不足しています。\n使い方: {usage_msg}')
    else:
        await ctx.send(f'❌ エラーが発生しました: {str(error)}')

@cmd_execute.error
async def cmd_error(ctx, error):
    await handle_command_error(ctx, error, '`!cmd [プロジェクトID/URL] [コマンド]`')

@claude_execute.error
async def claude_error(ctx, error):
    await handle_command_error(ctx, error, '`!claude [プロンプト]` または `!claude [プロジェクトID/URL] [プロンプト]`')

if __name__ == '__main__':
    if not TOKEN:
        log_info('❌ エラー: DISCORD_BOT_TOKENが設定されていません')
        log_info('.envファイルにトークンを設定してください')
        log_info('https://discord.com/developers/applications')
        exit(1)
    if len(TOKEN) < 50:
        log_info(f'⚠️ 警告: トークンが短すぎます ({len(TOKEN)} 文字)')
    log_info('Discord Botを起動しています...')
    log_info(f'トークン長: {len(TOKEN)} 文字')
    log_info(f'コマンドベースパス: {COMMAND_BASE_PATH}')
    try:
        bot.run(TOKEN)
    except discord.errors.LoginFailure:
        log_info('❌ ログインエラー: トークンが無効です')
        log_info('https://discord.com/developers/applications でトークンを再生成してください')
        exit(1)
    except Exception as e:
        log_info(f'❌ エラー: {type(e).__name__}: {str(e)}')
        exit(1)
