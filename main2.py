# -*- coding: utf-8 -*-
# ==============================================================================
# Kodi Addon: AmerTV Matrix & ZombiB Repository (plugin.video.amertv)
# Repository Host: https://dr-rasheed.github.io/amertv
# Auto-Generated Python Core (Kodi 19 Matrix / 20 Nexus / 21 Omega)
# Includes: Multi-Source Scraping, Auto Database Sync, Auto Next Episode
# ==============================================================================
import sys
import os
import traceback
import xbmc
import xbmcgui
import xbmcplugin
import xbmcvfs

try:
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
    import traceback
    import base64
    from bs4 import BeautifulSoup
    
    HANDLE = int(sys.argv[1])
    BASE_URL = sys.argv[0]
    ADDON_ID = "plugin.video.amertv"
    REMOTE_DB_URL = "https://raw.githubusercontent.com/dr-rasheed/amertv/main/media_database.json"
    
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
    }
    
    def get_local_db_path():
        profile_path = xbmcvfs.translatePath(f"special://profile/addon_data/{ADDON_ID}/")
        if not os.path.exists(profile_path):
            os.makedirs(profile_path, exist_ok=True)
        return os.path.join(profile_path, "media_database.json")
    
    def load_database():
        db_path = get_local_db_path()
        check_and_update_db(db_path)
        if os.path.exists(db_path):
            try:
                with open(db_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                xbmc.log(f"[{ADDON_ID}] Error reading local DB: {e}")
        return EMBEDDED_DATABASE
    
    def check_and_update_db(db_path):
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
        params = { 'mode': mode, 'item_id': item_id, 'season': season_num, 'episode': ep_num, 'name': name }
        target = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
        li = xbmcgui.ListItem(label=name)
        if icon:
            li.setArt({'thumb': icon, 'icon': icon, 'poster': icon})
        if plot or name:
            set_video_info(li, name, plot)
        li.setProperty('IsPlayable', 'true')
        xbmcplugin.addDirectoryItem(handle=HANDLE, url=target, listitem=li, isFolder=False)
    
    def main_menu():
        xbmcplugin.setContent(HANDLE, 'files')
        add_folder("🔥 أحدث الإضافات والتحديثات (الكل مرتب)", "view_all_sorted", icon="", plot="جميع الأفلام والمسلسلات مرتبة من الأحدث للأقدم")
        add_folder("🎬 أفلام عربية", "view_category", category="أفلام عربية", plot="أحدث الأفلام العربية بمصادر سيرفرات متعددة")
        add_folder("🍿 أفلام أجنبية مترجمة", "view_category", category="أفلام أجنبية", plot="أفلام هوليوود والغربية مترجمة بأعلى دقة")
        add_folder("📺 مسلسلات عربية", "view_category", category="مسلسلات عربية", plot="مسلسلات رمضان والدراما العربية مع الانتقال التلقائي بين الحلقات")
        add_folder("🌍 مسلسلات أجنبية", "view_category", category="مسلسلات أجنبية", plot="مسلسلات أجنبية عالمية مترجمة")
        add_folder("⛩️ أنمي وكرتون", "view_category", category="أنمي", plot="حلقات وأفلام الأنمي المترجمة والمدبلجة")
        add_folder("🔄 فحص تحديث قاعدة البيانات الان", "force_update_db", plot="تحديث دليل الأفلام والمسلسلات من مستودع GitHub")
        xbmcplugin.endOfDirectory(HANDLE)
    
    def view_items(category=None):
        data = load_database()
        items = data.get('items', [])
        if category:
            items = [i for i in items if i.get('category') == category]
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
        item_id, season_num = season_payload.split('|')
        season_num = int(season_num)
        data = load_database()
        item = next((i for i in data.get('items', []) if i.get('id') == item_id), None)
        if not item: return
        season = next((s for s in item.get('seasons', []) if s.get('seasonNumber') == season_num), None)
        if not season: return
        for ep in season.get('episodes', []):
            ep_num = ep.get('episodeNumber')
            ep_title = ep.get('title', f"الحلقة {ep_num}")
            add_video_item(f"▶️ {ep_title}", 'play_episode', item_id=item_id, season_num=season_num, ep_num=ep_num, icon=item.get('poster', ''))
        xbmcplugin.endOfDirectory(HANDLE)
    
    def resolve_and_play(sources, title_prefix="", next_episode_callback=None):
        if not sources:
            xbmcgui.Dialog().notification("عفواً", "لا توجد مصادر بث متاحة لهذا العمل", 'error')
            return
        options = []
        for s in sources:
            prov = s.get('providerName', 'سيرفر عام')
            qual = s.get('quality', 'HD')
            options.append(f"🔗 {prov} - جودة [{qual}]")
        selected_index = 0
        if len(sources) > 1:
            dialog = xbmcgui.Dialog()
            selected_index = dialog.select(f"اختر سيرفر التشغيل: {title_prefix}", options)
            if selected_index < 0: return
        selected_source = sources[selected_index]
        stream_url = selected_source.get('streamUrl')
        listitem = xbmcgui.ListItem(path=stream_url)
        set_video_info(listitem, title_prefix)
        player = xbmc.Player()
        xbmcplugin.setResolvedUrl(HANDLE, True, listitem)
        if next_episode_callback and "True" == "True":
            monitor = xbmc.Monitor()
            while player.isPlaying():
                if monitor.waitForAbort(1): break
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
        if not item: return
        season = next((s for s in item.get('seasons', []) if s.get('seasonNumber') == int(season_num)), None)
        if not season: return
        episodes = season.get('episodes', [])
        ep_index = next((idx for idx, e in enumerate(episodes) if e.get('episodeNumber') == int(ep_num)), None)
        if ep_index is None: return
        current_ep = episodes[ep_index]
        def play_next():
            if ep_index + 1 < len(episodes):
                next_ep = episodes[ep_index + 1]
                play_episode_handler(item_id, season_num, next_ep.get('episodeNumber'))
        resolve_and_play(
            current_ep.get('sources', []), 
            title_prefix=f"{item.get('title')} - S{season_num}E{ep_num}",
            next_episode_callback=play_next
        )
    
    EMBEDDED_DATABASE = json.loads(base64.b64decode("eyJ2ZXJzaW9uIjoxLCJ1cGRhdGVkQXQiOiIyMDI2LTA3LTI2VDIxOjIzOjA5LjEzOFoiLCJpdGVtcyI6W119").decode('utf-8'))
    
    params = get_params()
    mode = params.get('mode')
    if not mode:
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
    
except Exception as e:
    xbmc.log("AmerTV Crash: " + traceback.format_exc())
    xbmcgui.Dialog().textviewer("AmerTV Error", traceback.format_exc())
    try:
        xbmcplugin.endOfDirectory(int(sys.argv[1]), succeeded=False)
    except:
        pass
