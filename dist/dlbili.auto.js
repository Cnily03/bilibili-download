/*! dlbili.auto.js v0.1.0 | MIT License | github.com/cnily03/bili-download */
const dlbiliAuto = async (videoQuality, enforceRPC = false) => {
    const CONFIG = {
        ENFOURCE_RPC: enforceRPC,
        VIDEO_QUALITY: videoQuality,
        MAX_DOWNLOAD_PAGES: 32,
        DEFAULT_RPC_URL: 'http://localhost:6800/jsonrpc',
        DEFAULT_RPC_METHOD: 'POST'
    };
    const API = {
        V_INFO: 'https://api.bilibili.com/x/web-interface/view?',
        V_URL: 'https://api.bilibili.com/x/player/playurl?'
    };
    var vInfoPages, vTitle, overFourk, pagesStrLen, rpc_s, rpc_f;
    const bvid = window.bvid; // B站储存的变量
    const curPage = window.p + 1; // B站储存的变量
    const cryptoBase64 = window.btoa; // window 本身含有的函数
    const addJs = window.j; // 在外定义的 addJS 名称必须是 j
    window.rpcUrl = window.rpcUrl || CONFIG.DEFAULT_RPC_URL;
    window.rpcMethod = window.rpcMethod || CONFIG.DEFAULT_RPC_METHOD;
    // Get video information
    await new Promise((resolve) => {
        $.ajax({
            url: API.V_INFO + 'bvid=' + bvid,
            type: 'GET',
            dataType: 'json',
            success: (dataBack) => {
                resolve(dataBack.data)
            }
        })
    }).then(resolvedData => {
        vInfoPages = resolvedData.pages;
        vTitle = resolvedData.title;
        pagesStrLen = vInfoPages.length.toString().length;
    });
    // generate suffix with '.'
    const genSuffix = (str) => {
        let stri = str.replace(/\?.*/, '').split('.');
        return '.' + stri[stri.length - 1];
    }
    // Unicodefy a string in order to encode with base64
    const unicodefy = (str) => {
        let stri = '';
        for (let i = 0; i < str.length; i++) {
            let ele = str[i];
            stri += (/[^\x00-\xFF]/.test(ele) ?
                '\\u' + ele.charCodeAt().toString(16).padStart(4, '0') :
                ele);
        }
        return stri;
    }
    // Make the name of a file legal so that it can exist on the system
    const legalFilename = (str) => {
        return str.replace(/[\u002a\u002e\u003f\u0022\u003c\u003e\u007c\u002f\u005c]/g, '_');
    }
    /**
     * Download through RPC (send RPC request)
     * @param {String} rqUrl the url of RPC
     * @param {String} rqMethod the method of RPC request
     * @param {Array} urlArr downloading request urls
     * @param {String} filename the file name to output
     */
    const dl_rpc = async (rqUrl, rqMethod, urlArr, filename) => {
        for (let i = 0; i < urlArr.length; i++) {
            var suffix = genSuffix(urlArr[i]);
            var rqData = {
                id: bvid + '-' + new Date().getTime(),
                method: 'aria2.addUri',
                params: [
                    [urlArr[i]], {
                        out: filename + (
                            urlArr.length - 1 ?
                            ' Part ' + i.toString().padStart(urlArr.length.toString().length, '0') :
                            ''
                        ) + suffix,
                        referer: window.location.href
                    }
                ]
            }
            // if GET
            if (['POST', 'GET'].indexOf(rqMethod))
                rqData.params = cryptoBase64(unicodefy(JSON.stringify(rqData.params)));
            await new Promise((resolve) => {
                $.ajax({
                    url: rqUrl,
                    data: rqMethod == 'GET' ? rqData : JSON.stringify(rqData),
                    type: rqMethod,
                    contentType: 'application/json-rpc',
                    dataType: 'json',
                    success: (data) => {
                        data.result ? rpc_s++ : rpc_f++;
                        resolve();
                    },
                    error: () => {
                        rpc_f++;
                        resolve();
                    }
                })
            })
        }
    }
    await addJs('https://cdn.jsdelivr.net/gh/Stuk/jszip@3.7.1/dist/jszip.min.js');
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
    /**
     * Download a video file when given a page
     * @param {Number} page the page of video(s) that need to download
     * @param {Boolean} isReturn whether to return an array[video urls, title of a single file]
     * @returns 
     */
    const dl_page = async (page = 1, isReturn = false) => {
        if (!isReturn && CONFIG.ENFOURCE_RPC) {
            dl_morePages([page]);
            return;
        }
        var urls = [];
        moreThanOneP = vInfoPages.length - 1 ? true : false;
        await new Promise((resolve) => {
            $.ajax({
                url: API.V_URL +
                    'cid=' + vInfoPages[page - 1].cid +
                    '&' + CONFIG.VIDEO_QUALITY + '&bvid=' + bvid,
                type: 'GET',
                dataType: 'json',
                success: (data) => {
                    resolve(data.data)
                }
            })
        }).then(data => {
            overFourk = data.quality >= 120;
            data.durl.forEach(ele => {
                urls.push(ele.url);
            });
        });
        // 4K directly downloading is not supported
        if (!isReturn && overFourk) {
            dl_morePages([page]);
            return;
        }
        let partname = legalFilename(moreThanOneP ? vInfoPages[page - 1].part : vTitle),
            filename = bvid + (moreThanOneP ? ('_p' + page.toString().padStart(pagesStrLen, '0')) : '') +
            ' ' + partname;
        if (isReturn) {
            return [urls, filename];
        } else {
            dl_urls(
                urls,
                filename,
                partname
            );
            alert('已发送下载！请等待后台下载完成。');
        }
    }
    /**
     * Downlaod one or more video files when given a array of pages
     * @param {Array} pages 
     */
    const dl_morePages = async (pages) => {
        var _rpcUrl, _rpcMethod;
        let isContinue = 0;
        _rpcUrl = prompt('请输入RPC地址\n（默认：' + rpcUrl + '）');
        if (_rpcUrl != null) {
            _rpcUrl = _rpcUrl || rpcUrl;
            isContinue = 0;
            do {
                _rpcMethod = prompt(
                    (isContinue ? '输入错误！只能输入 POST 或 GET\n\n' : '') +
                    '请输入RPC请求方法 ( POST | GET )\n（默认：' + rpcMethod + '）'
                );
                if (_rpcMethod != null) {
                    ['POST', 'GET', ''].includes(_rpcMethod.toUpperCase()) ?
                        (_rpcMethod = _rpcMethod || rpcMethod, isContinue = 0) :
                        isContinue = 1;
                } else isContinue = 0;
            } while (isContinue);
            if (_rpcMethod != null) {
                // download every page
                rpc_s = rpc_f = 0;
                for (let i = 0; i < pages.length; i++) {
                    let reqArr = await dl_page(pages[i], true);
                    // reqArr: [urls, filename]
                    await dl_rpc(rpcUrl, rpcMethod, reqArr[0], reqArr[1]);
                }
                if (rpc_s) {
                    alert('已尝试发送\n- 成功 ' + rpc_s + ' | 失败 ' + rpc_f + '\n请在你的RPC客户端查看下载。');
                    rpcUrl = _rpcUrl;
                    rpcMethod = _rpcMethod;
                } else alert(
                    '发送失败，你可以尝试这样做：' +
                    '\n- 检查你的RPC客户端是否开启' +
                    '\n- 检查RPC地址是否为 ' + _rpcUrl +
                    '\n- 检查RPC请求方法是否为 ' + _rpcMethod
                );
            }
        }
    }
    // Log pages on the console, and highlight the current page
    const logPages = () => {
        const consoleStyles = {
            title: 'color:#FFF;background-color:#0055BA;border-radius:10%;font-size:larger',
            page: 'color:#FFF;background-color:green;border-radius:20%;',
            pageCur: 'color:#FFF;background-color:#0055BA;border-radius:20%;',
            part: 'margin-left:10px;',
            partCur: 'color:#FFF;background-color:#C63;border-radius:20%;margin-left:10px;'
        }
        console.clear();
        console.info('%c 分P列表 ', consoleStyles.title);
        vInfoPages.forEach(ele => {
            console.info(
                '%c ' + ele.page.toString().padStart(pagesStrLen, '0') +
                ' %c ' + ele.part + ' ',
                ele.page == curPage ? consoleStyles.pageCur : consoleStyles.page,
                ele.page == curPage ? consoleStyles.partCur : consoleStyles.part
            );
        });
    }
    // Prompt and ask to input pages that the user want to download, when it lies more than one page
    const autoPrompt = (appendixText = '') => {
        var promptText = appendixText +
            '请在下框中输入你要下载的分集（默认为当前P）' +
            '\n（如输入「1,2,7-9,15」）' +
            '\n单次下载超过' + CONFIG.MAX_DOWNLOAD_PAGES + '集可能会有账号风险' +
            '\n- 分集列表已输出至控制台';
        let inputVal = prompt(promptText);
        if (inputVal !== null) {
            if (inputVal == '')
                dl_page(curPage);
            else {
                let dlPages = [],
                    flag = true;
                const detectAndPush = (page) => {
                    flag && page && page <= vInfoPages.length ?
                        (dlPages.includes(page) ? null : dlPages.push(page)) :
                        flag = false;
                }
                let inputArr = inputVal.split(',');
                inputArr.forEach(ele => {
                    ele.includes('-') ? (() => {
                        let rr = ele.split('-');
                        var u = parseInt(rr[0]) || 0,
                            v = parseInt(rr[1]) || 0;
                        let _u = u;
                        u = u > v ? v : u;
                        v = v > _u ? v : _u;
                        for (let i = u; i <= v; i++) {
                            detectAndPush(i);
                        }
                    })() : detectAndPush(parseInt(ele));
                });
                if (dlPages.length && flag) {
                    if (dlPages.length <= CONFIG.MAX_DOWNLOAD_PAGES) {
                        dlPages.sort((a, b) => {
                            return a - b;
                        });
                        dlPages.length - 1 ? dl_morePages(dlPages) : dl_page(dlPages[0]);
                    } else {
                        autoPrompt('为了您的账号安全，单次下载请不要超过' + CONFIG.MAX_DOWNLOAD_PAGES + '集。\n\n')
                    }
                } else {
                    autoPrompt('输入格式错误或者分P不存在，请重新输入！\n\n')
                }
            }
        }
    }

    if (vInfoPages.length - 1) {
        logPages();
        autoPrompt();
    } else dl_page();
}
window.dlbAuto = true;