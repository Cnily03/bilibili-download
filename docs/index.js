// git params via url
const queryParams = (function () {
    let searchTxt = window.location.search.substring(1);
    let searchArr = searchTxt.split("&");
    let obj = {};
    searchArr.forEach(query => {
        const p = query.split("=");
        if (p.length - 1 && p[0]) {
            obj[unescape(p[0])] = unescape(p[1]);
        }
    });
    return obj;
})();

// const
const DLBILI = {
    REPO: "bilibili-download@master",
    HOST: "https://cdn.jsdelivr.net/gh/Cnily03",
    get DIR() {
        delete DLBILI.DIR;
        return DLBILI.DIR = `/${DLBILI.REPO}/`
    },
    SUB_DIR: "dist/",
};
const QUAILITY_TABLE = {
    HDR: 125,
    "4K": 120,
    "1080p60": 116,
    "1080p+": 112,
    "1080p": 80,
    "720p60": 74,
    "720p": 64,
    "480p": 32,
    "360p": 16,
    "240p": 6,
};
const js_addJS =
    "j=t=>new Promise(r=>{let e=document.createElement('script');e.type='text/javascript',e.src=t,e.readyState?e.onreadystatechange=(()=>{['loaded','complete'].includes(e.readyState)&&r()}):e.onload=(()=>{r()});document.getElementsByTagName('head')[0].appendChild(e)});";

// handle params
var query = queryParams.query || "";
var quality = queryParams.quality || "1080p+";
var enforceRPC = !!queryParams["enforce-rpc"];
var isUrlbarStyle = !!queryParams["urlbar"];
const qs = [query, quality, enforceRPC];
quality = QUAILITY_TABLE[quality];

// Genrate url param of quality
function genQnParam(Quality = quality) {
    return (
        `qn=${Quality}` + (Quality == QUAILITY_TABLE["4K"] ? "&fourk=1" : "")
    );
}

// Generate or update bilibili visiting url
function updateBiliUrl(Query = query) {
    if (Query.length) {
        Query = Query.replace(/(.*\/)|(\?.*)/g, ""); // URL -> av/BV
        Query = Query.replace(/[^a-z0-9]/gi, ""); // reserve a-z A-Z 0-9
        var vType;
        if (Query.length - 1) {
            vType = [null, "av", "BV"][
                ["av", "bv"].indexOf(Query.slice(0, 2).toLowerCase()) + 1
            ];
            Query = vType ? Query.slice(2, Query.length) : Query;
        }
        if (Query) {
            vType = vType || (/^[0-9]*$/.test(Query) ? "av" : "BV");
            url =
                vType == "av" && /[^0-9]/.test(Query) ?
                    null :
                    "https://b23.tv/" + vType + Query;
            window.biliVideoUrl = url;
            return url;
        } else return (window.biliVideoUrl = null);
    } else return (window.biliVideoUrl = null);
}
var biliVideoUrl = updateBiliUrl();

// Generate string in 'eval()'
const putAsync = str => {
    return `(async()=>{${str}})()`;
};

// Zip and crypto js string with base64
const zipTxt = str => {
    function needTransf(str) {
        // str 是单个字符
        return /[^\x00-\xFF]/.test(str);
    }
    let newStr = "";
    for (let i = 0; i < str.length; i++) {
        const ele = str[i];
        newStr += needTransf(ele) ?
            "\\u" + ele.charCodeAt().toString(16).padStart(4, "0") :
            ele;
    }
    return "eval(window.atob('" + window.btoa(newStr) + "'))";
};
// Generate uncrypted js string;
const genEvalStr = {
    gen: (filename, funcRun, detectVar) => {
        return putAsync(
            js_addJS +
            `if(!${detectVar})await j('${DLBILI.HOST}${DLBILI.DIR}${DLBILI.SUB_DIR}${filename}');` +
            funcRun
        );
    },
    auto: () => {
        return genEvalStr.gen(
            "dlbili.auto.min.js",
            "dlbiliAuto('" + genQnParam() + (enforceRPC ? ",1" : "") + "')",
            "window.dlbAuto"
        );
    },
    cur: () => {
        return genEvalStr.gen(
            "dlbili.cur.min.js",
            "dlbiliCur('" + genQnParam() + "')",
            "window.dlbCur"
        );
    },
    evolved: () => {
        return (
            js_addJS +
            `if(!window.biliEvolved)j('${DLBILI.HOST}${DLBILI.DIR}${DLBILI.SUB_DIR}addEvolved.min.js')`
        );
    },
};

function updateOutput() {
    const javascript_ = isUrlbarStyle ? "javascript:" : "";
    document.querySelector("#output #auto").value = javascript_ + zipTxt(genEvalStr.auto());
    if (quality < 120) {
        document.querySelector("#output #cur").value = javascript_ + zipTxt(genEvalStr.cur());
        document.querySelector("#output #cur").classList.remove("unsupport");
        document.querySelector("button#copy-cur").disabled = false;
    } else {
        document.querySelector("#output #cur").value =
            "4K 及以上画质不支持网页下载，请使用「" +
            document.querySelector("label[for='auto']").innerText +
            "」脚本";
        document.querySelector("#output #cur").classList.add("unsupport");
        document.querySelector("button#copy-cur").disabled = true;
    }
}
// 复制
var onCopy = {
    auto: false,
    cur: false,
};
var supportCopy = true;
const copyText = id => {
    if (onCopy[id]) return;
    onCopy[id] = true;
    if (supportCopy) {
        // 支持复制
        const copyReact = e => {
            e.clipboardData.setData(
                "text/plain",
                document.querySelector("textarea#" + id).value
            );
            e.preventDefault();
        };
        document.addEventListener("copy", copyReact);
        try {
            document.execCommand("copy");
            document.removeEventListener("copy", copyReact);
            document.querySelector("button#copy-" + id).innerText = "已复制";
            document
                .querySelector("button#copy-" + id)
                .classList.add("btn-success");
            setTimeout(() => {
                document.querySelector("button#copy-" + id).innerText = "复制";
                document
                    .querySelector("button#copy-" + id)
                    .classList.remove("btn-success");
            }, 500);
        } catch (err) {
            supportCopy = false;
            var copyAllDom = document.querySelectorAll("button.copy");
            for (let i = 0; i < copyAllDom.length; i++) {
                let copyDom = copyAllDom[i];
                copyDom.innerText = "选中全部";
            }
            alert("你的浏览器不支持自动复制，请手动复制！");
            document.querySelector("textarea#" + id).select();
        }
    } else {
        // 不支持复制
        document.querySelector("textarea#" + id).select();
        document.querySelector("button#copy-" + id).innerText = "请手动复制";
        document
            .querySelector("button#copy-" + id)
            .classList.add("btn-success");
        setTimeout(() => {
            document.querySelector("button#copy-" + id).innerText = "选中全部";
            document
                .querySelector("button#copy-" + id)
                .classList.remove("btn-success");
        }, 1000);
    }
    onCopy[id] = false;
};
// 页面渲染
function autoShowGoBiliBtn() {
    var goBiliBtn = document.querySelector("#go-bili");
    query = document.querySelector("input[name=query]").value;
    biliVideoUrl = updateBiliUrl();
    if (biliVideoUrl) {
        goBiliBtn.onclick = function () {
            window.open(biliVideoUrl);
        };
        goBiliBtn.style.display = "inline-block";
    } else {
        goBiliBtn.style.display = "none";
        goBiliBtn.onclick = null;
    }
}
document.addEventListener("DOMContentLoaded", function () {
    // 监测 quaility 变化，及时更新输出的 js
    document.querySelector("select[name=quality]").onchange = () => {
        quality = document.querySelectorAll("select[name=quality] option")[
            document.querySelector("select[name=quality]").selectedIndex
        ].value;
        quality = QUAILITY_TABLE[quality];
        updateOutput();
    };
    // 监测 enforce-rpc 变化，及时更新输出的 js
    const enforceRpcDom = document.querySelectorAll("input[name=enforce-rpc]");
    enforceRpcDom[1].onchange = () => {
        enforceRPC = enforceRpcDom[0].checked = enforceRpcDom[1].checked;
        updateOutput();
    };
    // 表单选择
    document.querySelector("input[name=query]").value = qs[0];
    document.querySelector("select[name=quality]").options[
        Object.keys(QUAILITY_TABLE).indexOf(qs[1])
    ].selected = true;
    enforceRpcDom[0].checked = enforceRpcDom[1].checked = qs[2];
    // javascript: <code>
    document.querySelector("#code-style").onclick = function () {
        if (isUrlbarStyle = !document.querySelector("#code-style").classList.contains("active"))
            document.querySelector("#code-style").classList.add("active");
        else
            document.querySelector("#code-style").classList.remove("active");
        document.querySelector("input[name=urlbar]").checked = isUrlbarStyle;
        updateOutput();
        const javascript_ = isUrlbarStyle ? "javascript:" : "";
        document.querySelector("#output-evolved #evolved").value = javascript_ + zipTxt(
            genEvalStr.evolved()
        );
    }
    isUrlbarStyle && document.querySelector("#code-style").classList.add("active");
    // 监听 input 显示按钮
    autoShowGoBiliBtn();
    if (document.querySelector("input[name=query]").oninput !== undefined)
        document.querySelector("input[name=query]").oninput = autoShowGoBiliBtn;
    else
        document.querySelector("input[name=query]").onpropertychange =
            autoShowGoBiliBtn;
    // 复制
    document.querySelector("button#copy-auto").onclick = function () {
        copyText("auto");
    };
    document.querySelector("button#copy-cur").onclick = function () {
        copyText("cur");
    };
    document.querySelector("button#copy-evolved").onclick = function () {
        copyText("evolved");
    };
    // JS输出
    updateOutput();
    const javascript_ = isUrlbarStyle ? "javascript:" : "";
    document.querySelector("#output-evolved #evolved").value = javascript_ + zipTxt(
        genEvalStr.evolved()
    );
});

document.addEventListener("DOMContentLoaded", function () {
    // Bilibili-Evolved 高度获取 & 展开/闭合事件
    window.evolvedBox = document.querySelector("#output-evolved .box");
    evolvedBox.classList.add("temp");
    document.documentElement.style.setProperty(
        "--evolved-height",
        evolvedBox.clientHeight + "px"
    );
    evolvedBox.classList.remove("temp");

    window.onAnimateEvolved = false;
    document.querySelector("#output-evolved #control").onclick = function () {
        if (!onAnimateEvolved) {
            onAnimateEvolved = true;
            if (!evolvedBox.classList.contains("open")) {
                // close -> open
                evolvedBox.classList.remove("close");
                evolvedBox.classList.add("open");
            } else if (evolvedBox.classList.contains("open")) {
                // open -> close
                evolvedBox.classList.remove("open");
                evolvedBox.classList.add("close");
            }
            onAnimateEvolved = false;
        }
    };

    //页脚监听
    var footerDom = document.querySelector("footer");
    //setInterval(() => {
    footerDom.style.transform =
        "translateY(" +
        (document.body.clientHeight - window.innerHeight ?
            0 :
            document.body.clientHeight -
            footerDom.offsetTop -
            footerDom.clientHeight) +
        "px)";
    //}, 1);
});