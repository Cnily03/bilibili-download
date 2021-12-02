var gulp = require("gulp");
var minifyCss = require("gulp-minify-css");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
gulp.task("page", done => {
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
    done();
});
gulp.task("project", done => {
    // dist
    gulp.src(["dist/**/*.js", "!**/*.min.js"], { base: "dist/" })
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            uglify({
                mangle: { reserved: ["p"] },
                output: { ascii_only: true },
            })
        )
        .pipe(gulp.dest("dist/"));
    // source
    gulp.src(["src/**/*.js", "!**/*.min.js"], { base: "src/" })
        .pipe(
            uglify({
                mangle: true,
                output: { ascii_only: true },
            })
        )
        .pipe(gulp.dest("min/"));
    done();
});
gulp.task("watch", () => {
    gulp.watch(
        ["dist/**/*.js", "src/**/*.js", "!**/*.min.js"],
        gulp.series(["project"])
    );
    gulp.watch(["./index.css", "./index.js"], gulp.series(["page"]));
});
gulp.task("default", gulp.series(["page", "project"]));
