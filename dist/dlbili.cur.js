/*! dlbili.cur.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
const dlbiliCur = async videoQuality => {
    const API_V_URL = {
        NORMAL: "https://api.bilibili.com/x/player/playurl",
        EP: "https://api.bilibili.com/pugv/player/web/playurl"
    };
    const VIDEO_QUALITY = videoQuality;
    let urlLastpath = window.location.pathname.split("/").reverse()[0];
    const bvid = window.bvid || ""; // B站储存的变量
    const ep_id = urlLastpath.slice(0, 2) == "ep" ? urlLastpath.slice("2") : "";
    const cid = window.cid || ""; // B站储存的变量
    const curPage = window.p ? // B站储存的变量
        window.p + 1 :
        (function () {
            try {
                const _arr = document.querySelector(".list-box").childNodes;
                var i = 0;
                for (const _node of _arr) {
                    i++;
                    if (_node.classList[0] == "on") break;
                }
                return i;
            } catch (e) { return 0; }
        })();
    const addJs = window.j; // 在外定义的 addJS 名称必须是 j
    // generate suffix with '.'
    const genSuffix = str => {
        let stri = str.replace(/\?.*/, "").split(".");
        return "." + stri[stri.length - 1];
    };
    await addJs(
        "https://cdn.jsdelivr.net/gh/Stuk/jszip@3.7.1/dist/jszip.min.js"
    );
    /**
     * Download a zip or video file then through urls
     * @param {Array} urls a video url array (360p will return not one url)
     * @param {String} filename the file name to output
     */
    const dl_urls = async (urls, filename, partname) => {
        const urlObject = window.URL || window.webkitURL || window;
        var aEl = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        // download a file with a single url
        const dlSingle = url => {
            return new Promise(resolve => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    if (xhr.status === 200) resolve(xhr.response);
                };
                xhr.send();
            });
        };
        // save files of a video
        const saveFiles = async singleUrls => {
            var itemArr = [];
            for (let i = 0; i < singleUrls.length; i++) {
                try {
                    let blobData = await dlSingle(singleUrls[i].url);
                    let suffix = singleUrls[i].suffix || genSuffix(singleUrls[i].url);
                    itemArr.push({
                        name: `${partname}.part${i
                            .toString()
                            .padStart(
                                singleUrls.length.toString().length,
                                "0"
                            )}${suffix}`,
                        blob: new Blob([blobData]),
                    });
                } catch (e) { }
            }
            return itemArr;
        };
        var items = await saveFiles(urls);
        if (items.length - 1) {
            // more than one video (360p)
            var jszip = new JSZip();
            items.forEach(item => {
                if (item) jszip.file(item.name, item.blob);
            });
            jszip
                .generateAsync({
                    type: "blob",
                })
                .then(content => {
                    aEl.href = urlObject.createObjectURL(content);
                    aEl.download = filename;
                    aEl.click();
                    urlObject.revokeObjectURL(aEl.href);
                });
        } else if (items.length) {
            // only one video
            let suffix=urls[i].suffix || genSuffix(urls[i].url);
            aEl.href = urlObject.createObjectURL(items[0].blob);
            aEl.download = filename + suffix;
            aEl.click();
            urlObject.revokeObjectURL(aEl.href);
        } else alert("下载失败！");
    };
    // Part of function {dl_page} in dlbili.auto.js
    var urls = [];
    await new Promise(resolve => {
        $.ajax({
            url: ep_id ?
                `${API_V_URL.EP}?${VIDEO_QUALITY}&fnval=16&ep_id=${ep_id}` :
                `${API_V_URL.NORMAL}?${VIDEO_QUALITY}&cid=${cid}&bvid=${bvid}`,
            type: "GET",
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: data => {
                if (Object.keys(data.data).includes("durl"))
                    resolve(data.data.durl);
                else resolve(data.data.dash)
            },
        });
    }).then(info => {
        if (Array.isArray(info))
            info.forEach(ele => {
                urls.push({ url: ele.url });
            });
        else {
            urls.push({
                url: info.video[0].base_url,
                suffix: "." + info.video[0].mime_type.split("/").reverse()[0]
            });
            urls.push({
                url: info.audio[0].base_url,
                suffix: ".audio." + info.audio[0].mime_type.split("/").reverse()[0]
            });
        }
    });
    // Part of function {legalFilename} in dlbili.auto.js
    if (ep_id) {
        var vSeasonTitle = document.querySelector(".season-info h1.title").innerText;
        var vSeasonPart = document.querySelector(".on.list-box-li .title").innerText;
        const _name = curPage ?
            `${vSeasonTitle} - ${curPage.toString().padStart(
                document.querySelector(".list-box").childNodes.length.toString().length, "0"
            )} ${vSeasonPart}` :
            `${vSeasonPart} ${vSeasonPart}`;
        dl_urls(urls, _name, _name);
    } else {
        var vTitleLegal = document
            .querySelector(".video-title.tit")
            .innerText.replace(
                /[\u002a\u002e\u003f\u0022\u003c\u003e\u007c\u002f\u005c]/g,
                "_"
            );
        // Download
        dl_urls(
            urls,
            `${bvid}_p${curPage} ${vTitleLegal}`,
            `${vTitleLegal}_p${curPage}`
        );
    }
    alert("已发送下载！请等待后台下载完成。");
};
window.dlbCur = true;
