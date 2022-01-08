var gulp = require("gulp");
var minifyCss = require("gulp-minify-css");
var compileTS = require("gulp-typescript").createProject("tsconfig.json");
var gulpFitler = require("gulp-filter");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var gulpClean = require("gulp-clean");
function reserveComment(node, comment) {
    return /^\!/.test(comment.value);
}
function clean(arr) {
    arr = typeof arr === "string" ? [arr] : arr;
    gulp.src(arr, { read: false }).pipe(gulpClean());
}
gulp.task("docs", cb => {
    // CSS
    gulp.src(["./docs/index.css"])
        .pipe(rename({ suffix: ".min" }))
        .pipe(minifyCss())
        .pipe(gulp.dest("./docs/"));
    // Javascript
    gulp.src(["./docs/index.js"])
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            uglify({
                mangle: true,
                output: { ascii_only: false },
            })
        )
        .pipe(gulp.dest("./docs/"));
    cb();
});
gulp.task("project:dist", () => {
    clean(["dist/**/*.min.js"]);
    var tsFitler = gulpFitler(["**/*.ts"], { restore: true });
    // dist
    return gulp.src(["dist/**/*.{ts,js}", "!**/*.min.js"], { base: "dist/" })
        .pipe(tsFitler)
        .pipe(compileTS()).js
        .pipe(tsFitler.restore)
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            uglify({
                mangle: { reserved: ["p", "j"] },
                output: { ascii_only: true, comments: reserveComment },
            })
        )
        .pipe(gulp.dest("dist/"));
});
gulp.task("project:src", () => {
    clean(["min/**/*.*"]);
    var tsFitler = gulpFitler(["**/*.ts"], { restore: true });
    // src -> min
    return gulp.src(["src/**/*.{ts,js}"], { base: "src/" })
        .pipe(tsFitler)
        .pipe(compileTS()).js
        .pipe(tsFitler.restore)
        .pipe(
            uglify({
                mangle: { reserved: ["p", "j"] },
                output: { ascii_only: true, comments: reserveComment },
            })
        )
        .pipe(gulp.dest("min/"));
});
gulp.task("project", gulp.series(["project:src", "project:dist"]));
gulp.task("watch", () => {
    gulp.watch(
        ["dist/**/*.js", "src/**/*.js", "!**/*.min.js"],
        gulp.parallel(["project"])
    );
    gulp.watch(["./index.css", "./index.js"], gulp.parallel(["docs"]));
});
gulp.task("default", gulp.parallel(["docs", "project"]));
