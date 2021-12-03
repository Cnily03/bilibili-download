/*! tampermonkeyEnv.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
window.unsafeWindow = window;
// GM_getValue & GM_setValue
class PluginCookie {
    constructor(pluginName, options = { domain, maxAge }) {
        this.MAX_AGE =
            options.maxAge ||
            (typeof options === "number" ? options : null) ||
            30 * 24 * 60 * 60;
        this.DOMAIN =
            options.domain ||
            (typeof options === "string" ? options : null) ||
            window.location.host;
        this.PLUGIN_NAME = pluginName.replace(/ /g, "-");
        this.COOKIE_NAME = "Tampermonkey." + this.PLUGIN_NAME;
    }
    jsonVal() {
        var cookieArr = document.cookie.split(";");
        for (var i = 0; i < cookieArr.length; i++) {
            var cookiePair = cookieArr[i].split("=");
            if (this.COOKIE_NAME == cookiePair[0].trim()) {
                return JSON.parse(cookiePair[1]);
            }
        }
        return {};
    }
    get(name) {
        let obj = this.jsonVal();
        if (!Object.keys(obj).length) this.delCookie();
        return obj[name];
    }
    set(name, value) {
        let obj = this.jsonVal();
        obj[name] = value;
        document.cookie = `${this.COOKIE_NAME}=${JSON.stringify(
            obj
        )}; max-age=${this.MAX_AGE.toString()}; domain=${this.DOMAIN}`;
        if (JSON.stringify(obj) == "{}") this.delCookie();
        return value;
    }
    remove(name) {
        let obj = this.jsonVal();
        delete obj[name];
        document.cookie = `${this.COOKIE_NAME}=${JSON.stringify(
            obj
        )}; max-age=${this.MAX_AGE.toString()}; domain=${this.DOMAIN}`;
        if (!Object.keys(obj).length) this.delCookie();
        return true;
    }
    delCookie() {
        document.cookie = `${this.COOKIE_NAME}=; max-age=0; domain=${this.DOMAIN}`;
    }
}
var valSave = {
    add: pluginName => {
        valSave[pluginName] = new PluginCookie(pluginName);
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
