Promise.all([
    j("https://cdn.jsdelivr.net/npm/jquery@3.4.0/dist/jquery.min.js"),
    j("https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"),
    j("https://cdn.jsdelivr.net/npm/jszip@3.1.5/dist/jszip.min.js"),
    j("https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js"),
    j("https://cdn.jsdelivr.net/npm/vuex@3.1.2/dist/vuex.js"),
    j("https://cdn.jsdelivr.net/gh/Cnily03/bilibili-download@master/min/tampermonkeyEnv.js"),
]).then(async () => {
    await j(
        "https://cdn.jsdelivr.net/gh/Cnily03/bilibili-download@master/min/bilibili-evolved/index.js"
    );
    j(
        "https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@1.12.22/bilibili-evolved.user.js"
    );
    window.biliEvolved = !0;
});
