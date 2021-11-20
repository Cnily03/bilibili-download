/*! dlbili.cur.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
const dlbiliCur = async (videoQuality) => {
    const API_V_URL = 'https://api.bilibili.com/x/player/playurl?';
    const VIDEO_QUALITY = videoQuality;
    const bvid = window.bvid; // B站储存的变量
    const cid = window.cid; // B站储存的变量
    const curPage = window.p + 1; // B站储存的变量
    const addJs = window.j; // 在外定义的 addJS 名称必须是 j
    // generate suffix with '.'
    const genSuffix = (str) => {
        let stri = str.replace(/\?.*/, '').split('.');
        return '.' + stri[stri.length - 1];
    }
    addJs('https://cdn.jsdelivr.net/gh/Stuk/jszip@3.7.1/dist/jszip.min.js');
    /**
     * Download a zip or video file then through urls
     * @param {Array} urls a video url array (360p will return not one url)
     * @param {String} filename the file name to output
     */
    const dl_urls = async (urls, filename, partname) => {
        const suffix = genSuffix(urls[0]);
        const urlObject = window.URL || window.webkitURL || window;
        var aEl = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        // download a file with a single url
        const dlSingle = (url) => {
            return new Promise((resolve) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    if (xhr.status === 200)
                        resolve(xhr.response);
                }
                xhr.send();
            })
        }
        // save files of a video
        const saveFiles = async (singleUrls) => {
            var itemArr = [];
            for (let i = 0; i < singleUrls.length; i++) {
                try {
                    let blobData = await dlSingle(singleUrls[i]);
                    itemArr.push({
                        name: partname + ' ' +
                            i.toString().padStart(singleUrls.length.toString().length, '0') + suffix,
                        blob: new Blob([blobData])
                    });
                } catch (e) {}
            }
            return itemArr;
        }
        var items = await saveFiles(urls);
        if (items.length - 1) {
            // more than one video (360p)
            var jszip = new JSZip();
            items.forEach(item => {
                if (item) jszip.file(item.name, item.blob);
            });
            jszip.generateAsync({
                type: 'blob'
            }).then((content) => {
                aEl.href = urlObject.createObjectURL(content);
                aEl.download = filename;
                aEl.click();
                urlObject.revokeObjectURL(aEl.href);
            });
        } else if (items.length) {
            // only one video
            aEl.href = urlObject.createObjectURL(items[0].blob);
            aEl.download = filename + suffix;
            aEl.click();
            urlObject.revokeObjectURL(aEl.href);
        } else alert('下载失败！');
    }
    // Part of function {dl_page} in dlbili.auto.js
    var urls = [];
    await new Promise((resolve) => {
        $.ajax({
            url: API_V_URL +
                'cid=' + cid +
                '&' + VIDEO_QUALITY +
                '&bvid=' + bvid,
            dataType: 'json',
            success: (data) => {
                resolve(data.data.durl)
            }
        })
    }).then(durl => {
        durl.forEach(ele => {
            urls.push(ele.url);
        });
    });
    // Part of function {legalFilename} in dlbili.auto.js
    var vTitleLegal = document.querySelector('span.tit').innerText
        .replace(/[\u002a\u002e\u003f\u0022\u003c\u003e\u007c\u002f\u005c]/g, '_');
    // Download
    dl_urls(urls, bvid + '_p' + curPage + ' ' + vTitleLegal, vTitleLegal + '_p' + curPage);
    alert('已发送下载！请等待后台下载完成。');
}
window.dlbCur = true;