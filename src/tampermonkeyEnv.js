/*! tampermonkeyEnv.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
window.unsafeWindow = window;
// GM_getValue & GM_setValue
class ConfigCookie {
    /**
     * @param {String} cookieName 
     * @param {{
     *      crypto?: Boolean | Object,
     *      maxAge?: Number,
     *      domain?: String,
     *      path?: String,
     * }} options 
     */
    constructor(cookieName, options) {
        this.COOKIE_NAME = cookieName;

        options = typeof options === "object" ? options : {};

        if (typeof options.crypto === 'boolean')
            this.IS_CRYPTO = options.crypto, this.CRYPTO_INFO = {};
        else if (typeof options.crypto === "object")
            this.IS_CRYPTO = true, this.CRYPTO_INFO = options.crypto;
        else
            this.IS_CRYPTO = false, this.CRYPTO_INFO = {};

        this.OPTIONS = {
            MAX_AGE: options.maxAge || 30 * 24 * 60 * 60,
            DOMAIN: options.domain || window.location.hostname,
            PATH: options.path || escape(window.location.pathname)
        }
    }
    static encrypto(str, auto = false) {
        return window.btoa(window.encodeURIComponent(str));
    }
    static decrypto(str, auto = false) {
        return window.decodeURIComponent(window.atob(str));
    }
    autoEncrypto(str) {
        if (!this.IS_CRYPTO) return str;
        return ConfigCookie.encrypto(str);
    }
    autoDecrypto(str) {
        if (!this.IS_CRYPTO) return str;
        return ConfigCookie.decrypto(str);
    }
    jsonVal() {
        var cookieArr = document.cookie.split(";");
        for (var i = 0; i < cookieArr.length; i++) {
            var cookiePair = cookieArr[i].split("=");
            if (this.COOKIE_NAME == cookiePair[0].trim()) {
                return JSON.parse(this.autoDecrypto(cookiePair[1]), true);
            }
        }
        return {};
    }
    saveCookie(json, isDelete = false) {
        document.cookie = `${this.COOKIE_NAME}=${json === "" ?
            "" : this.autoEncrypto(JSON.stringify(json), true)}; `
            + `max-age=${isDelete ? "0" : this.OPTIONS.MAX_AGE.toString()}; `
            + `domain=${this.OPTIONS.DOMAIN}; `
            + `path=${this.OPTIONS.PATH}`;
        if (!isDelete && !Object.keys(json).length) this.delCookie();
    }
    delCookie() {
        this.saveCookie({}, true);
    }
    get(name) {
        let obj = this.jsonVal();
        if (!Object.keys(obj).length) this.delCookie();
        return obj[name];
    }
    set(name, value) {
        let obj = this.jsonVal();
        obj[name] = value;
        this.saveCookie(obj);
        return value;
    }
    remove(name) {
        let obj = this.jsonVal();
        delete obj[name];
        this.saveCookie(obj)
        return true;
    }
}
var valSave = {
    add: pluginName => {
        pluginName = "Tampermonkey." + pluginName.replace(/ /g, "-");
        valSave[pluginName] = new ConfigCookie(pluginName, {
            domain: "bilibili.com",
            path: "/"
        });
    },
    remove: pluginName => {
        delete valSave[pluginName];
    },
};
// valSave.add(window.GM_info.script.name);
valSave.add("Bilibili-Evolved");
window.GM_getValue = query => window.valSave["Bilibili-Evolved"].get(query);
window.GM_setValue = (name, value) =>
    window.valSave["Bilibili-Evolved"].set(name, value);
// GM_setClipboard
window.GM_setClipboard = (text, type) => {
    if (type == "text") type = "text/plain";
    const copyReact = e => {
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
window.GM_xmlhttpRequest = json => {
    const xhr = new XMLHttpRequest();
    xhr.open(json.method, json.url, true);
    xhr.responseType = json.responseType || "text";
    xhr.setRequestHeader(
        "Content-Type",
        json.contentType || "application/x-www-form-urlencoded"
    );
    xhr.onload = () => json.onload(xhr);
    xhr.onerror = () => json.onerror(xhr);
    xhr.send(json.data || null);
};
