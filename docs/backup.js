function blobDl(data, filename) {
    const urlObject = window.URL || window.webkitURL || window;
    const blob = new Blob([data]);
    const aEl = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    aEl.href = urlObject.createObjectURL(blob);
    aEl.download = filename;
    aEl.click();
}
var httpRequest = {
    /*{url, responseType, callback}*/
    get: json => {
        const f_url = json.url.replace(/\\/g, "/");
        const xhr = new XMLHttpRequest();
        xhr.open("GET", f_url, true);
        xhr.responseType = json.responseType || "text";
        xhr.onload = () => {
            json.callback(xhr);
        };
        xhr.send();
    },
    /*{url, data, contentType, responseType, callback}*/
    post: json => {
        const f_url = json.url.replace(/\\/g, "/");
        const xhr = new XMLHttpRequest();
        xhr.open("POST", f_url, true);
        xhr.setRequestHeader(
            "Content-Type",
            json.contentType || "application/x-www-form-urlencoded"
        );
        xhr.responseType = json.responseType || "text";
        xhr.onload = () => {
            json.callback(xhr);
        };
        xhr.send(json.data || null);
    },
};
const suffix = str => {
    let arr = str.replace(/\\?.*/, "").split(".");
    return "." + arr[arr.length - 1];
};

function downloadUrlFile(url, fileName) {
    httpRequest.get({
        url: url,
        responseType: "blob",
        callback: function (xhr) {
            if (xhr.status === 200) blobDl(xhr.response, fileName);
        },
    });
}
const dlAndZip = async (urlArr, fn) => {
    const suffix = suffix(urlArr[0]);
    const title = fn.replace(
        /[\\u002a\\u002e\\u003f\\u0022\\u003c\\u003e\\u007c\\u002f\\u005c]/g,
        "_"
    );
    const urlObj = window.URL || window.webkitURL || window;
    const aEl = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    var dlSingle = url => {
        return new Promise(resolve => {
            var x = new XMLHttpRequest();
            x.open("GET", url, true);
            x.responseType = "blob";
            x.onload = () => {
                if (x.status === 200) resolve(x.response);
            };
            x.send();
        });
    };
    var dlFiles = async urls => {
        var arr = [];
        for (let i = 0; i < urls.length; i++) {
            try {
                const data = await dlSingle(urls[i]);
                arr.push({
                    name:
                        i
                            .toString()
                            .padStart(urls.length.toString().length, "0") +
                        suffix,
                    blob: new Blob([data]),
                });
            } catch (e) {}
        }
        return arr;
    };
    var items = await dlFiles(urlArr);
    if (items.length - 1) {
        const zip = new JSZip();
        items.forEach(item => {
            if (item) zip.file(item.name, item.blob);
        });
        zip.generateAsync({
            type: "blob",
        }).then(content => {
            aEl.href = urlObj.createObjectURL(content);
            aEl.download = title;
            aEl.click();
            urlObj.revokeObjectURL(aEl.href);
        });
    } else if (items.length) {
        aEl.href = urlObj.createObjectURL(items[0].blob);
        aEl.download = title + suffix;
        aEl.click();
        urlObj.revokeObjectURL(aEl.href);
    } else alert("下载失败！");
};
