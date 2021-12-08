(() => {
    const GM_info = {
        "script": {
            "name": "Bilibili Evolved",
            "description": "强大的哔哩哔哩增强脚本: 下载视频, 音乐, 封面, 弹幕 / 简化直播间, 评论区, 首页 / 自定义顶栏, 删除广告, 夜间模式 / 触屏设备支持",
            "version": "1.12.22",
            "grant": [
                "unsafeWindow",
                "GM_getValue",
                "GM_setValue",
                "GM_setClipboard",
                "GM_info",
                "GM_xmlhttpRequest",
                "GM.getValue",
                "GM.setValue",
                "GM.setClipboard",
                "GM.info",
                "GM.xmlHttpRequest"
            ],
            "icon": "https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/images/logo-small.png",
            "icon64": "https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/images/logo.png",
            "supportURL": "https://github.com/the1812/Bilibili-Evolved/issues",
            "downloadURL": "https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js",
            "updateURL": "https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js",
            "namespace": null,
            "homepage": "https://github.com/the1812/Bilibili-Evolved",
            "webRequest": [],
            "author": "Grant Howard, Coulomb-G",
            "copyright": "2021, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)",
            "antifeatures": {},
            "name_i18n": {},
            "description_i18n": {},
            "uuid": "da011f96-c16d-449b-afad-80e13aa1dad2",
            "position": 15,
            "blockers": [],
            "lastModified": 1637481306989,
            "sync": {
                "imported": false
            },
            "options": {
                "check_for_updates": false,
                "comment": null,
                "compatopts_for_requires": true,
                "compat_wrappedjsobject": false,
                "compat_metadata": false,
                "compat_foreach": false,
                "compat_prototypes": false,
                "noframes": null,
                "run_at": "document-start",
                "override": {
                    "use_includes": [],
                    "orig_includes": [],
                    "merge_includes": true,
                    "use_matches": [],
                    "orig_matches": [
                        "*://*.bilibili.com/*"
                    ],
                    "merge_matches": true,
                    "use_excludes": [],
                    "orig_excludes": [
                        "*://*.bilibili.com/*/mobile.html",
                        "*://*.bilibili.com/api/*",
                        "*://api.bilibili.com/*",
                        "*://api.*.bilibili.com/*",
                        "*://live.bilibili.com/h5/*",
                        "*://live.bilibili.com/*/h5/*",
                        "*://m.bilibili.com/*",
                        "*://mall.bilibili.com/*",
                        "*://member.bilibili.com/studio/bs-editor/*",
                        "*://www.bilibili.com/h5/*",
                        "*://www.bilibili.com/*/h5/*",
                        "*://bbq.bilibili.com/*"
                    ],
                    "merge_excludes": true,
                    "use_connects": [],
                    "merge_connects": true,
                    "use_blockers": [],
                    "orig_run_at": "document-start",
                    "orig_noframes": null,
                    "orig_connects": [
                        "raw.githubusercontent.com",
                        "cdn.jsdelivr.net",
                        "cn.bing.com",
                        "www.bing.com",
                        "translate.google.cn",
                        "translate.google.com",
                        "*"
                    ]
                }
            },
            "header": "// ==UserScript==\n ... // ==/UserScript==",
            "evilness": 0,
            "resources": [],
            "run-at": "document-start",
            "excludes": [
                "*://*.bilibili.com/*/mobile.html",
                "*://*.bilibili.com/api/*",
                "*://api.bilibili.com/*",
                "*://api.*.bilibili.com/*",
                "*://live.bilibili.com/h5/*",
                "*://live.bilibili.com/*/h5/*",
                "*://m.bilibili.com/*",
                "*://mall.bilibili.com/*",
                "*://member.bilibili.com/studio/bs-editor/*",
                "*://www.bilibili.com/h5/*",
                "*://www.bilibili.com/*/h5/*",
                "*://bbq.bilibili.com/*"
            ],
            "includes": [],
            "matches": [
                "*://*.bilibili.com/*"
            ],
            "unwrap": false
        },
        "scriptMetaStr": "// ==UserScript==\n ... // ==/UserScript==",
        "scriptSource": "// ==UserScript==\n ... // ==/UserScript==\n [scripts...]",
        "scriptWillUpdate": false,
        "version": "4.13.6138",
        "scriptHandler": "Tampermonkey",
        "isIncognito": false,
        "downloadMode": "native"
    };
    new TampermonkeyPlugin(GM_info.script.name, GM_info, {
        domain: "bilibili.com",
        path: "/"
    });
})()