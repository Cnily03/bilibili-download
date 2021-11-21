/*! tampermonkeyEnv.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
window.unsafeWindow = window;
window.valSaveObject = {};
window.GM_getValue = (t) => {
    return window.valSaveObject[t] || undefined;
}
window.GM_setValue = (e, t) => {
    window.valSaveObject[e] = t;
}
window.GM_setClipboard = (c, t) => {
    if (t == 'text') t = 'text/plain'
    const copyReact = (e) => {
        e.clipboardData.setData(t, c);
        e.preventDefault();
    }
    document.addEventListener('copy', copyReact);
    try {
        document.execCommand('copy');
    } catch (e) {
        alert('你的浏览器不支持复制，请安装 Tampermonkey 插件使用 Bilibili Evolved.');
    }
    document.removeEventListener('copy', copyReact);
}
window.GM_xmlhttpRequest = (json) => {
    const xhr = new XMLHttpRequest();
    xhr.open(json.method, json.url, true);
    xhr.responseType = json.responseType || 'text';
    xhr.setRequestHeader("Content-Type", json.contentType || "application/x-www-form-urlencoded");
    xhr.onload = () => json.onload(xhr);
    xhr.onerror = () => json.onerror(xhr);
    xhr.send(json.data || null);
}