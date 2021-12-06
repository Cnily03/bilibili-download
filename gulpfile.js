var gulp = require("gulp");
var minifyCss = require("gulp-minify-css");
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
gulp.task("page", cb => {
    // CSS
    gulp.src(["./index.css"])
        .pipe(rename({ suffix: ".min" }))
        .pipe(minifyCss())
        .pipe(gulp.dest("./"));
    // Javascript
    gulp.src(["./index.js"])
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            uglify({
                mangle: true,
                output: { ascii_only: false },
            })
        )
        .pipe(gulp.dest("./"));
    cb();
});
gulp.task("project", cb => {
    clean(["dist/**/*.min.js", "min/**/*.*"]);
    // dist
    gulp.src(["dist/**/*.js", "!**/*.min.js"], { base: "dist/" })
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            uglify({
                mangle: { reserved: ["p"] },
                output: { ascii_only: true, comments: reserveComment },
            })
        )
        .pipe(gulp.dest("dist/"));
    // src -> min
    gulp.src(["src/**/*.js"], { base: "src/" })
        .pipe(
            uglify({
                mangle: true,
                output: { ascii_only: true, comments: reserveComment },
            })
        )
        .pipe(gulp.dest("min/"));
    cb();
});
gulp.task("watch", () => {
    gulp.watch(
        ["dist/**/*.js", "src/**/*.js", "!**/*.min.js"],
        gulp.parallel(["project"])
    );
    gulp.watch(["./index.css", "./index.js"], gulp.parallel(["page"]));
});
gulp.task("default", gulp.parallel(["page", "project"]));
