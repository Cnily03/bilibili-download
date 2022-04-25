# Bilibili Downloads Script

该脚本的优点为便利性。只需要复制脚本后在控制台执行，即可达到下载B站视频的效果。

该控制台脚本旨在满足临时下载B站视频的需求，如快速下载、在他人的电脑下载等情况。

演示和脚本生成页： [cnily.top/bilibili-download](https://cnily.top/bilibili-download)

## 注意

- 暂时不支持下载番剧/电影视频，使用「只下载当前P」可下载课程视频。

- 「只下载当前P」不支持下载 4K 及以上画质视频。

- 若选择的画质是B站不支持的、或者登录状态不允许的，会自动降级至支持的最高画质。

- 移动端以电脑版网站浏览，在网址输入 `javascript: 脚本内容` 依然有效（部分套壳类浏览器不支持网址栏执行脚本，建议使用 Chrome / Edge 浏览器）。

## 推荐

如果你方便安装或已经安装了 Tampermonkey 插件，建议使用强大的B站功能增强脚本 [Bilibili Evolved](https://github.com/the1812/Bilibili-Evolved).

## 临时渲染 Tampermonkey 脚本

为了满足临时需求，该控制台脚本同时配设了临时增加 Bilibili Evolved 的功能。由于部分功能需要重载网页，所以数据储存的替代方案为采用 Cookie, 刷新网页后在再次在控制台执行脚本后即可生效。临时的 Bilibili Evolved 可能会有部分功能无法使用。

临时 Tampermonkey 脚本环境渲染[支持文件](https://github.com/Cnily03/bilibili-download/blob/master/src/tampermonkeyEnv.js)位于 [src](https://github.com/Cnily03/bilibili-download/tree/master/src) 目录内，目前只配置了 Bilibili Evolved 相关的环境，但已重写的兼容性 `grant` 函数对大部分 Tampermonkey 脚本仍能起效。
