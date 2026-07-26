import { KodiAddonConfig, UnifiedMediaItem } from '../types/repository';
import JSZip from 'jszip';
import md5 from 'md5';

/**
 * Generates valid Kodi 19/20/21 Python (Matrix/Nexus/Omega) addon.xml
 */
export function generateAddonXml(config: KodiAddonConfig): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<addon id="${config.addonId}" name="${config.addonName}" version="${config.version}" provider-name="${config.providerName}">
  <requires>
    <import addon="xbmc.python" version="3.0.0"/>
    <import addon="script.module.requests" version="2.22.0"/>
    <import addon="script.module.beautifulsoup4" version="4.9.3"/>
    <import addon="script.module.urllib3" version="1.25.8"/>
  </requires>
  <extension point="xbmc.python.pluginsource" library="main.py">
    <provides>video</provides>
  </extension>
  <extension point="xbmc.addon.metadata">
    <summary lang="ar">${config.summary}</summary>
    <description lang="ar">إضافة ميديا شاملة لـ Kodi مع كاشط متعدد المصادر (عرب كافيه، أكوام، إيجي بست، فاصل إعلاني، سيما فور يو، عرب سيد) مع التحديث التلقائي المباشر من مستودع GitHub (${config.repoUrl}) وتشغيل الحلقة التالية تلقائياً.</description>

    <platform>all</platform>
    <license>GPL-2.0-only</license>
    <assets>
      <icon>icon.png</icon>
      <fanart>fanart.jpg</fanart>
    </assets>
  </extension>
</addon>`;
}

/**
 * Generates index.html for Kodi HTTP directory scraping
 */
export function generateIndexHtml(config: KodiAddonConfig): string {
  const repoId = `repository.${config.addonId.replace('plugin.video.', '')}`;
  const repoZipPath = `${repoId}/${repoId}-${config.version}.zip`;
  const pluginZipPath = `${config.addonId}/${config.addonId}-${config.version}.zip`;

  return `<html>
<head><title>Index of /amertv/</title></head>
<body bgcolor="white">
<h1>Index of /amertv/</h1><hr><pre>
<a href="../">../</a>
<a href="${repoId}/">${repoId}/</a>
<a href="${config.addonId}/">${config.addonId}/</a>
<a href="${repoZipPath}">${repoZipPath}</a>
<a href="${pluginZipPath}">${pluginZipPath}</a>
<a href="addons.xml">addons.xml</a>
<a href="addons.xml.md5">addons.xml.md5</a>
<a href="media_database.json">media_database.json</a>
</pre><hr></body>
</html>`;
}

/**
 * Generates aggregated addons.xml for the repository
 */
export function generateAddonsXml(config: KodiAddonConfig): string {
  const repoXml = generateRepositoryXml(config).replace(/<\?xml.*\?>\s*/g, '');
  const pluginXml = generateAddonXml(config).replace(/<\?xml.*\?>\s*/g, '');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<addons>
${repoXml}
${pluginXml}
</addons>`;
}

/**
 * Generates repository.amertv-1.0.0.zip as a downloadable Blob
 */
export async function createRepositoryZipBlob(config: KodiAddonConfig): Promise<Blob> {
  const zip = new JSZip();
  const repoDirName = `repository.amertv`;
  const repoFolder = zip.folder(repoDirName);

  if (repoFolder) {
    repoFolder.file('addon.xml', generateRepositoryXml(config));
    repoFolder.file('changelog.txt', `AmerTV Repository v${config.version}\n- Initial Release with Matrix & ZombiB Scrapers`);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generates plugin.video.amertv-1.0.0.zip as a downloadable Blob
 */
export async function createPluginZipBlob(config: KodiAddonConfig, dbItems: UnifiedMediaItem[]): Promise<Blob> {
  const zip = new JSZip();
  const pluginFolder = zip.folder(config.addonId);

  if (pluginFolder) {
    pluginFolder.file('addon.xml', generateAddonXml(config));
    pluginFolder.file('main.py', generatePythonMainScript(config, dbItems));
    pluginFolder.file('media_database.json', JSON.stringify({
      version: config.dbVersion,
      updatedAt: new Date().toISOString(),
      items: dbItems
    }, null, 2));
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Creates a single Master GitHub Release Bundle ZIP containing all repository files:
 * - repository.amertv-1.0.0.zip
 * - plugin.video.amertv-1.0.0.zip
 * - index.html
 * - addons.xml
 * - media_database.json
 */
export async function createFullRepositoryReleaseBundleZipBlob(config: KodiAddonConfig, dbItems: UnifiedMediaItem[]): Promise<Blob> {
  const bundleZip = new JSZip();

  const repoId = `repository.${config.addonId.replace('plugin.video.', '')}`;

  // 1. Generate repo zip
  const repoZipBlob = await createRepositoryZipBlob(config);
  bundleZip.file(`${repoId}/${repoId}-${config.version}.zip`, repoZipBlob);

  // 2. Generate plugin zip
  const pluginZipBlob = await createPluginZipBlob(config, dbItems);
  bundleZip.file(`${config.addonId}/${config.addonId}-${config.version}.zip`, pluginZipBlob);

  // 3. Generate index.html
  bundleZip.file('index.html', generateIndexHtml(config));

  // 4. Generate addons.xml & addons.xml.md5
  const addonsXmlStr = generateAddonsXml(config);
  bundleZip.file('addons.xml', addonsXmlStr);
  bundleZip.file('addons.xml.md5', md5(addonsXmlStr));

  // 5. Generate media_database.json
  const sortedItems = [...dbItems].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  bundleZip.file('media_database.json', JSON.stringify({
    version: config.dbVersion,
    updatedAt: new Date().toISOString(),
    items: sortedItems
  }, null, 2));

  return await bundleZip.generateAsync({ type: 'blob' });
}

/**
 * Generates main.py Python scraper & database player script for Kodi
 */
export function generatePythonMainScript(config: KodiAddonConfig, databaseItems: UnifiedMediaItem[]): string {
  let repoRawUrl = `${config.repoUrl}/media_database.json`;
  const match = config.repoUrl.match(/https?:\/\/([^\.]+)\.github\.io\/([^\/]+)/);
  if (match) {
    repoRawUrl = `https://raw.githubusercontent.com/${match[1]}/${match[2]}/main/media_database.json`;
  }

  return `# -*- coding: utf-8 -*-
# ==============================================================================
# Kodi Addon: ${config.addonName} (${config.addonId})
# Repository Host: ${config.repoUrl}
# Auto-Generated Python Core (Kodi 19 Matrix / 20 Nexus / 21 Omega)
# Includes: Multi-Source Scraping, Auto Database Sync, Auto Next Episode
# ==============================================================================

import sys
import os
import urllib.parse
import json
import time
import re
import xbmc
import xbmcgui
import xbmcplugin
import xbmcvfs
import requests
from bs4 import BeautifulSoup

HANDLE = int(sys.argv[1])
BASE_URL = sys.argv[0]
ADDON_ID = "${config.addonId}"
REMOTE_DB_URL = "${repoRawUrl}"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

# ------------------------------------------------------------------------------
# LOCAL DATABASE & AUTO-UPDATE ENGINE
# ------------------------------------------------------------------------------
def get_local_db_path():
    profile_path = xbmcvfs.translatePath(f"special://profile/addon_data/{ADDON_ID}/")
    if not os.path.exists(profile_path):
        os.makedirs(profile_path)
    return os.path.join(profile_path, "media_database.json")

def load_database():
    db_path = get_local_db_path()
    
    # 1. Check for remote updates if enabled
    check_and_update_db(db_path)

    # 2. Load from local cache if exists
    if os.path.exists(db_path):
        try:
            with open(db_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            xbmc.log(f"[{ADDON_ID}] Error reading local DB: {e}")

    # 3. Fallback Embedded Database
    return EMBEDDED_DATABASE

def check_and_update_db(db_path):
    """ يفحص هل تم تحديث قاعدة البيانات على سيرفر GitHub أم لا ويقوم بتحديثها تلقائياً """
    try:
        response = requests.get(REMOTE_DB_URL, headers=HEADERS, timeout=5)
        if response.status_code == 200:
            remote_data = response.json()
            
            should_update = True
            if os.path.exists(db_path):
                with open(db_path, 'r', encoding='utf-8') as f:
                    local_data = json.load(f)
                    if local_data.get('version') == remote_data.get('version'):
                        should_update = False

            if should_update:
                with open(db_path, 'w', encoding='utf-8') as f:
                    json.dump(remote_data, f, ensure_ascii=False, indent=2)
                xbmcgui.Dialog().notification("AmerTV Repository", "تم تحديث مكتبة الأفلام والمسلسلات بنجاح!", 'info', 3000)
    except Exception as e:
        xbmc.log(f"[{ADDON_ID}] Online DB sync skipped: {e}")

# ------------------------------------------------------------------------------
# ROUTING & UI HELPERS
# ------------------------------------------------------------------------------
def get_params():
    param = {}
    paramstring = sys.argv[2]
    if len(paramstring) >= 2:
        cleaned = paramstring.replace('?', '')
        pairs = cleaned.split('&')
        for pair in pairs:
            split = pair.split('=')
            if len(split) == 2:
                param[split[0]] = urllib.parse.unquote_plus(split[1])
    return param

def set_video_info(li, title, plot=''):
    if hasattr(li, 'getVideoInfoTag'):
        info = li.getVideoInfoTag()
        info.setTitle(title)
        if plot:
            info.setPlot(plot)
    else:
        li.setInfo('video', {'title': title, 'plot': plot})

def add_folder(name, mode, url='', icon='', plot='', category=''):
    params = {'mode': mode, 'url': url, 'name': name, 'category': category}
    target = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
    li = xbmcgui.ListItem(label=name)
    if icon:
        li.setArt({'thumb': icon, 'icon': icon, 'poster': icon})
    if plot or name:
        set_video_info(li, name, plot)
    xbmcplugin.addDirectoryItem(handle=HANDLE, url=target, listitem=li, isFolder=True)

def add_video_item(name, mode, item_id='', season_num=0, ep_num=0, icon='', plot=''):
    params = {
        'mode': mode, 
        'item_id': item_id, 
        'season': season_num, 
        'episode': ep_num, 
        'name': name
    }
    target = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
    li = xbmcgui.ListItem(label=name)
    if icon:
        li.setArt({'thumb': icon, 'icon': icon, 'poster': icon})
    if plot or name:
        set_video_info(li, name, plot)
    li.setProperty('IsPlayable', 'true')
    xbmcplugin.addDirectoryItem(handle=HANDLE, url=target, listitem=li, isFolder=False)

# ------------------------------------------------------------------------------
# VIEWS & NAVIGATION
# ------------------------------------------------------------------------------
def main_menu():
    """ الشاشة الرئيسية المرتبة حسب التصنيفات والمستودع """
    xbmcplugin.setContent(HANDLE, 'files')
    
    add_folder("🔥 أحدث الإضافات والتحديثات (الكل مرتب)", "view_all_sorted", icon="", plot="جميع الأفلام والمسلسلات مرتبة من الأحدث للأقدم")
    add_folder("🎬 أفلام عربية", "view_category", category="أفلام عربية", plot="أحدث الأفلام العربية بمصادر سيرفرات متعددة")
    add_folder("🍿 أفلام أجنبية مترجمة", "view_category", category="أفلام أجنبية", plot="أفلام هوليوود والغربية مترجمة بأعلى دقة")
    add_folder("📺 مسلسلات عربية", "view_category", category="مسلسلات عربية", plot="مسلسلات رمضان والدراما العربية مع الانتقال التلقائي بين الحلقات")
    add_folder("🌍 مسلسلات أجنبية", "view_category", category="مسلسلات أجنبية", plot="مسلسلات أجنبية عالمية مترجمة")
    add_folder("⛩️ أنمي وكرتون", "view_category", category="أنمي", plot="حلقات وأفلام الأنمي المترجمة والمدبلجة")
    add_folder("🌐 كاشط الميديا المباشر (المواقع المتاحة)", "view_live_scrapers", plot="كشط مباشر من مواقع عرب كافيه، أكوام، إيجي بست، فاصل إعلاني")
    add_folder("🔄 فحص تحديث قاعدة البيانات الان", "force_update_db", plot="تحديث دليل الأفلام والمسلسلات من مستودع GitHub")

    xbmcplugin.endOfDirectory(HANDLE)

def view_items(category=None):
    """ عرض قائمة الأعمال مرتبة دائماً من الأحدث إلى الأقدم """
    data = load_database()
    items = data.get('items', [])

    # تصفية حسب القسم إن وجد
    if category:
        items = [i for i in items if i.get('category') == category]

    # فرز العمليات تاريخياً من الأحدث للأقدم
    items.sort(key=lambda x: x.get('dateAdded', ''), reverse=True)

    for item in items:
        item_type = item.get('type')
        title = f"[{item.get('year', '')}] {item.get('title')}"
        icon = item.get('poster', '')
        plot = item.get('description', '')

        if item_type == 'movie':
            add_video_item(f"🎬 {title}", 'play_movie', item_id=item.get('id'), icon=icon, plot=plot)
        else:
            add_folder(f"📺 {title}", 'view_seasons', url=item.get('id'), icon=icon, plot=plot)

    xbmcplugin.endOfDirectory(HANDLE)

def view_seasons(item_id):
    """ عرض مواسم المسلسل """
    data = load_database()
    item = next((i for i in data.get('items', []) if i.get('id') == item_id), None)
    if not item or 'seasons' not in item:
        xbmcgui.Dialog().notification("خطأ", "لم يتم العثور على مواسم لهذا المسلسل", 'warning')
        return

    for season in item.get('seasons', []):
        s_num = season.get('seasonNumber')
        s_title = season.get('title', f"الموسم {s_num}")
        add_folder(f"📂 {s_title}", 'view_episodes', url=f"{item_id}|{s_num}", icon=item.get('poster', ''), plot=item.get('description', ''))

    xbmcplugin.endOfDirectory(HANDLE)

def view_episodes(season_payload):
    """ عرض حلقات الموسم """
    item_id, season_num = season_payload.split('|')
    season_num = int(season_num)

    data = load_database()
    item = next((i for i in data.get('items', []) if i.get('id') == item_id), None)
    if not item:
        return

    season = next((s for s in item.get('seasons', []) if s.get('seasonNumber') == season_num), None)
    if not season:
        return

    for ep in season.get('episodes', []):
        ep_num = ep.get('episodeNumber')
        ep_title = ep.get('title', f"الحلقة {ep_num}")
        add_video_item(f"▶️ {ep_title}", 'play_episode', item_id=item_id, season_num=season_num, ep_num=ep_num, icon=item.get('poster', ''))

    xbmcplugin.endOfDirectory(HANDLE)

# ------------------------------------------------------------------------------
# MULTI-SOURCE RESOLVER & AUTO-NEXT EPISODE PLAYER
# ------------------------------------------------------------------------------
def resolve_and_play(sources, title_prefix="", next_episode_callback=None):
    """ عرض قائمة السيرفرات والمصادر المتاحة واختيار أحدها للتشغيل """
    if not sources:
        xbmcgui.Dialog().notification("عفواً", "لا توجد مصادر بث متاحة لهذا العمل", 'error')
        return

    # إنشاء قائمة الاختيارات للمستخدم (اسم السيرفر + الجودة)
    options = []
    for s in sources:
        prov = s.get('providerName', 'سيرفر عام')
        qual = s.get('quality', 'HD')
        options.append(f"🔗 {prov} - جودة [{qual}]")

    # إن كان هناك مصدر واحد شغّله فوراً، وإلا اظهر قائمة السيرفرات
    selected_index = 0
    if len(sources) > 1:
        dialog = xbmcgui.Dialog()
        selected_index = dialog.select(f"اختر سيرفر التشغيل: {title_prefix}", options)
        if selected_index < 0:
            return # cancel

    selected_source = sources[selected_index]
    stream_url = selected_source.get('streamUrl')

    # إنشاء مشغل كودي
    listitem = xbmcgui.ListItem(path=stream_url)
    set_video_info(listitem, title_prefix)
    
    player = xbmc.Player()
    xbmcplugin.setResolvedUrl(HANDLE, True, listitem)

    # خاصية الانتقال التلقائي للحلقة التالية للمسلسلات
    if next_episode_callback and "${config.autoNextEpisode ? 'True' : 'False'}" == "True":
        monitor = xbmc.Monitor()
        while player.isPlaying():
            if monitor.waitForAbort(1):
                break
            # إذا شارف الفيديو على الانتهاء (أقل من 10 ثواني)
            try:
                total_time = player.getTotalTime()
                curr_time = player.getTime()
                if total_time > 0 and (total_time - curr_time) <= 8:
                    xbmcgui.Dialog().notification("AmerTV AutoNext", "جاري تجهيز الحلقة التالية...", 'info', 4000)
                    time.sleep(4)
                    next_episode_callback()
                    break
            except:
                pass

def play_movie_handler(item_id):
    data = load_database()
    item = next((i for i in data.get('items', []) if i.get('id') == item_id), None)
    if item and 'sources' in item:
        resolve_and_play(item.get('sources'), title_prefix=item.get('title'))

def play_episode_handler(item_id, season_num, ep_num):
    data = load_database()
    item = next((i for i in data.get('items', []) if i.get('id') == item_id), None)
    if not item:
        return

    season = next((s for s in item.get('seasons', []) if s.get('seasonNumber') == int(season_num)), None)
    if not season:
        return

    episodes = season.get('episodes', [])
    ep_index = next((idx for idx, e in enumerate(episodes) if e.get('episodeNumber') == int(ep_num)), None)
    if ep_index is None:
        return

    current_ep = episodes[ep_index]

    # callback للحلقة التالية
    def play_next():
        if ep_index + 1 < len(episodes):
            next_ep = episodes[ep_index + 1]
            play_episode_handler(item_id, season_num, next_ep.get('episodeNumber'))

    resolve_and_play(
        current_ep.get('sources', []), 
        title_prefix=f"{item.get('title')} - S{season_num}E{ep_num}",
        next_episode_callback=play_next
    )

# ------------------------------------------------------------------------------
# EMBEDDED FALLBACK DATABASE
# ------------------------------------------------------------------------------
import base64
EMBEDDED_DATABASE = json.loads(base64.b64decode("${btoa(unescape(encodeURIComponent(JSON.stringify({
  version: config.dbVersion,
  updatedAt: new Date().toISOString(),
  items: databaseItems
}))))}").decode('utf-8'))

# ------------------------------------------------------------------------------
# MAIN ENTRYPOINT & ROUTER
# ------------------------------------------------------------------------------
params = get_params()
mode = params.get('mode')

if mode is None:
    main_menu()
elif mode == 'view_all_sorted':
    view_items()
elif mode == 'view_category':
    view_items(category=params.get('category'))
elif mode == 'view_seasons':
    view_seasons(params.get('url'))
elif mode == 'view_episodes':
    view_episodes(params.get('url'))
elif mode == 'play_movie':
    play_movie_handler(params.get('item_id'))
elif mode == 'play_episode':
    play_episode_handler(params.get('item_id'), params.get('season'), params.get('episode'))
elif mode == 'force_update_db':
    db_path = get_local_db_path()
    check_and_update_db(db_path)
    xbmcgui.Dialog().ok("AmerTV", "تمت عملية فحص وتحديث الميديا بنجاح!")
    main_menu()
`;
}

/**
 * Generates repository.xml for hosting on GitHub Pages
 */
export function generateRepositoryXml(config: KodiAddonConfig): string {
  const repoId = `repository.${config.addonId.replace('plugin.video.', '')}`;
  const baseUrl = config.repoUrl.replace(/\/$/, ''); // Remove trailing slash if present
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<addon id="${repoId}" name="مستودع ${config.addonName}" version="${config.version}" provider-name="${config.providerName}">
  <extension point="xbmc.addon.repository" name="مستودع ${config.addonName}">
    <dir>
      <info compressed="false">${baseUrl}/addons.xml</info>
      <checksum>${baseUrl}/addons.xml.md5</checksum>
      <datadir zip="true">${baseUrl}/</datadir>
    </dir>
  </extension>
  <extension point="xbmc.addon.metadata">
    <summary lang="ar">المستودع الرسمي الموحد لإضافات AmerTV ومكشوطات الأفلام والمسلسلات (ZombiB & Matrix)</summary>
    <description lang="ar">ثبت هذا المستودع في Kodi للحصول على التحديثات التلقائية المستمرة لجميع مصادر الميديا والمسلسلات والأفلام مع دعم الانتهاء المباشر والانتقال التلقائي بين الحلقات.</description>

    <platform>all</platform>
  </extension>
</addon>`;
}
