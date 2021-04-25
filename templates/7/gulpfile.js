const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function startwatch() {
	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/sass/**/*', styles);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/img/src/**/*', images);
}

function scripts() {
	return src([ // Берём файлы из источников
		'app/js/*.js', '!app/js/*.min.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('app.min.js')) // Конкатенируем в один файл
	.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function scriptsBuild() {
	return src([ // Берём файлы из источников
		'app/js/*.js', '!app/js/*.min.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('app.min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('release/js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
	return src('app/scss/*.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
	.pipe(sass())
	.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.css
	.pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } } , format: 'beautify' } )) // Минифицируем стили
	.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function stylesBuild() {
	return src('app/scss/*.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
	.pipe(sass())
	.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.css
	.pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('release/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
	return src('app/img/src/**/*') // Берём все изображения из папки источника
	.pipe(newer('app/img/')) // Проверяем, было ли изменено (сжато) изображение ранее
	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('app/img/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
	return del('app/img/**/*', '!app/img/src/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

function cleanrelease() {
	return del('dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function crutch() { // Костыль
	return del('release/img/src', { force: true }) // Удаляем пустую папку "src" из release
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/img/**/*',
		'!app/img/src/**/*',
		'app/fonts/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('release')) // Выгружаем в папку с финальной сборкой
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.scriptsBuild = scriptsBuild;
exports.styles = styles;
exports.stylesBuild = stylesBuild;
exports.images = images;
exports.cleanimg = cleanimg;
exports.cleanrelease = cleanrelease;
exports.crutch = crutch;

exports.default = parallel(styles, images, scripts, browsersync, startwatch);
exports.build = series(cleanrelease, stylesBuild, scriptsBuild, buildcopy, crutch);
