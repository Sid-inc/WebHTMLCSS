const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'templates/5/' },
    notify: false,
    online: true
  });
}

function scripts() {
  return src([
    'templates/5/js/script.js'
  ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('templates/5/js/'))
    .pipe(browserSync.stream());
}

function startwatch() {
  watch(['templates/5/**/*.js', '!templates/5/**/*.min.js'], scripts);
  watch('templates/5/sass/**/*.scss', styles);
  watch('templates/5/*.html').on('change', browserSync.reload);
}

function styles() {
  return src('templates/5/sass/**/*.scss')
    .pipe(eval('sass')())
    .pipe(concat('min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ }))
    .pipe(dest('templates/5/styles/'))
    .pipe(browserSync.stream());
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.default = parallel(styles, scripts, browsersync, startwatch);