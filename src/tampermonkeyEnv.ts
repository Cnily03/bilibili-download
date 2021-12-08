/*! tampermonkeyEnv.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
declare namespace ConfigCookie {
    interface globalOptions {
        /**
         * @default false
         */
        crypto?: boolean | cryptoOptions;
        /**
         * @default 2592000
         */
        maxAge?: number;
        /**
         * @default window.location.hostname
         */
        domain?: string;
        /**
         * @default window.location.pathname
         */
        path?: string;
    }

    interface cryptoOptions {
        encrypto: (str: string) => string;
        decrypto: (str: string) => string;
    }
}

const _default = {
    ConfigCookie: {
        globalOptions: {
            crypto: false,
            maxAge: 30 * 24 * 60 * 60,
            domain: window.escape(window.location.hostname),
            path: window.escape(window.location.pathname)
        },
        cryptoOptions: {
            encrypto: (str: string) => {
                return window.btoa(window.encodeURIComponent(str));
            },
            decrypto: (str: string) => {
                return window.decodeURIComponent(window.atob(str));
            }
        }
    }
}

class ConfigCookie {
    COOKIE_NAME: string;
    OPTIONS: { MAX_AGE: number; DOMAIN: string; PATH: string; };
    IS_CRYPTO: boolean;
    CRYPTO_INFO: ConfigCookie.cryptoOptions;
    constructor(cookieName: string, options?: ConfigCookie.globalOptions) {
        options = ConfigCookie.defaultify(options, _default.ConfigCookie.globalOptions);

        this.COOKIE_NAME = cookieName;
        this.OPTIONS = {
            MAX_AGE: options.maxAge,
            DOMAIN: options.domain,
            PATH: options.path
        }

        if (typeof options.crypto === 'boolean') {
            this.IS_CRYPTO = options.crypto;
            this.CRYPTO_INFO = _default.ConfigCookie.cryptoOptions;
        }
        else if (typeof options.crypto === "object") {
            this.IS_CRYPTO = true;
            this.CRYPTO_INFO = options.crypto;
        }
    }

    private static defaultify(options: any, defaultOptions: { [x: string]: any; }) {
        if (typeof options !== "object") options = {};
        const _keys = Object.keys(defaultOptions);
        _keys.forEach(_key => {
            if (typeof defaultOptions[_key] === "object")
                options[_key] = this.defaultify(options[_key], defaultOptions[_key]);
            else options[_key] = options[_key] || defaultOptions[_key];
        });
        return options;
    }

    autoEncrypto(str: string) {
        if (!this.IS_CRYPTO) return str;
        return this.CRYPTO_INFO.encrypto(str);
    }
    autoDecrypto(str: string) {
        if (!this.IS_CRYPTO) return str;
        return this.CRYPTO_INFO.decrypto(str);
    }
    jsonVal() {
        var cookieArr = document.cookie.split(";");
        for (var i = 0; i < cookieArr.length; i++) {
            var cookiePair = cookieArr[i].split("=");
            if (this.COOKIE_NAME == cookiePair[0].trim()) {
                return JSON.parse(this.autoDecrypto(cookiePair[1]));
            }
        }
        return {};
    }
    saveCookie(json: object, isDelete = false) {
        document.cookie = `${this.COOKIE_NAME}=${this.autoEncrypto(JSON.stringify(json))}; `
            + `max-age=${isDelete ? "0" : this.OPTIONS.MAX_AGE.toString()}; `
            + `domain=${this.OPTIONS.DOMAIN}; `
            + `path=${this.OPTIONS.PATH}`;
        if (!isDelete && !Object.keys(json).length) this.delCookie();
    }
    delCookie() {
        this.saveCookie({}, true);
    }
    get(name: string) {
        let obj = this.jsonVal();
        if (!Object.keys(obj).length) this.delCookie();
        return obj[name];
    }
    set(name: string, value: any) {
        let obj = this.jsonVal();
        obj[name] = value;
        this.saveCookie(obj);
        return value;
    }
    remove(name: string) {
        let obj = this.jsonVal();
        delete obj[name];
        this.saveCookie(obj)
        return true;
    }
}

/* --- */

class TampermonkeyPlugin {
    PLUGIN_NAME: string;
    CONFIG_COOKIE: ConfigCookie;
    constructor(pluginName: string, GM_info: any, options?: ConfigCookie.globalOptions) {
        this.PLUGIN_NAME = pluginName = "Tampermonkey." + pluginName.replace(/ /g, "-");
        this.CONFIG_COOKIE = new ConfigCookie(pluginName, options);

        // unsafeWindow
        (<any>window).unsafeWindow = window;
        // GM_info
        (<any>window).GM_info = GM_info;
        // GM_getValue & GM_setValue
        (<any>window).GM_getValue = (query: string) =>
            this.CONFIG_COOKIE.get(query);

        (<any>window).GM_setValue = (name: string, value: any) =>
            this.CONFIG_COOKIE.set(name, value);

        // GM_setClipboard
        (<any>window).GM_setClipboard = (text: string, type: string) => {
            if (type == "text") type = "text/plain";
            const copyReact = (e: any) => {
                e.clipboardData.setData(type, text);
                e.preventDefault();
            };
            document.addEventListener("copy", copyReact);
            try {
                document.execCommand("copy");
            } catch (e) {
                alert(
                    "你的浏览器不支持复制，请安装 Tampermonkey 插件使用 Bilibili Evolved."
                );
            }
            document.removeEventListener("copy", copyReact);
        };
        // GM_xmlhttpRequest
        (<any>window).GM_xmlhttpRequest = (json: any) => {
            json.onload = json.onload || (() => { });
            json.onerror = json.onerror || (() => { });
            json.method = json.method || "get";
            json.data = json.data || undefined;
            json.contentType = json.contentType || "application/x-www-form-urlencoded";
            json.responseType = json.responseType || "text";
            const xhr = new XMLHttpRequest();
            xhr.open(json.method, json.url, true);
            xhr.responseType = json.responseType;
            xhr.setRequestHeader(
                "Content-Type",
                json.contentType
            );
            xhr.onload = () => json.onload(xhr);
            xhr.onerror = () => json.onerror(xhr);
            xhr.send(json.data);
            return xhr;
        };
    }
}