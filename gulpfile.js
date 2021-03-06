const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const posthtml = require('gulp-posthtml');
const posthtmlInclude = require('posthtml-include');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssNormalize = require('postcss-normalize');
const cssMQPacker = require('css-mqpacker');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const cheerioCleanSvg = require('gulp-cheerio-clean-svg');
const replace = require('gulp-replace');
const svgstore = require('gulp-svgstore');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const isDevelopment = process.env.NODE_ENV === 'development';

function reload(done) {
  browserSync.reload();
  done();
}

gulp.task('clean', () => del('./build'));

gulp.task('fonts', () => gulp
  .src('./src/fonts/**/*.{woff,woff2}', {
    base: './src',
  })
  .pipe(gulp.dest('./build'))
  .on('end', browserSync.reload));

gulp.task('libs', () => gulp
  .src('./src/js/libs/**/*.js', {
    base: './src',
  })
  .pipe(gulp.dest('./build'))
  .on('end', browserSync.reload));

gulp.task('html', () => gulp
  .src('./src/*.html')
  .pipe(posthtml([posthtmlInclude()]))
  .pipe(gulp.dest('./build'))
  .on('end', browserSync.reload));

gulp.task('style', () => gulp
  .src('./src/sass/main.scss')
  .pipe(
    plumber({
      errorHandler: notify.onError({
        title: 'Gulp',
        subtitle: 'Failure!',
        message: 'Error: <%= error.message %>',
        sound: false,
      }),
    }),
  )
  .pipe(gulpIf(isDevelopment, sourcemaps.init()))
  .pipe(sass())
  .pipe(
    postcss([
      postcssNormalize(),
      autoprefixer(),
      cssMQPacker({
        sort: true,
      }),
    ]),
  )
  .pipe(gulpIf(!isDevelopment, csso()))
  .pipe(
    rename({
      extname: '.min.css',
    }),
  )
  .pipe(gulpIf(isDevelopment, sourcemaps.write()))
  .pipe(gulp.dest('./build/css'))
  .pipe(browserSync.stream()));

gulp.task('images:min', () => gulp
  .src('./src/img/**/*.{png,jpg}')
  .pipe(
    imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.jpegtran({ progressive: true }),
    ]),
  )
  .pipe(gulp.dest('./build/img')));

gulp.task('webp', () => gulp
  .src('./src/img/**/*.{png,jpg}')
  .pipe(webp({ quality: 90 }))
  .pipe(gulp.dest('./build/img')));

gulp.task('clean-svg', () => gulp
  .src('./src/img/**/*.svg')
  .pipe(svgmin())
  .pipe(
    cheerio(
      cheerioCleanSvg({
        removeSketchType: true,
        removeEmptyGroup: true,
        removeEmptyDefs: true,
        removeEmptyLines: true,
        removeComments: true,
        tags: ['title', 'desc'],
        attributes: ['id', 'style', 'clip*', 'stroke*'],
      }),
    ),
  )
  .pipe(replace('&gt;', '>'))
  .pipe(gulp.dest('./build/img')));

gulp.task('sprite:create', () => gulp
  .src('./build/img/sp-*.svg')
  .pipe(
    cheerio(
      cheerioCleanSvg({
        attributes: ['fill*'],
      }),
    ),
  )
  .pipe(
    svgstore({
      inlineSvg: true,
    }),
  )
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('./build/img')));

gulp.task('sprite:clean', () => del('./build/img/sp-*.svg'));

gulp.task('sprite', gulp.series('sprite:create', 'sprite:clean', 'html'));

gulp.task(
  'images',
  gulp.series(gulp.parallel('images:min', 'webp', gulp.series('clean-svg', 'sprite')), reload),
);

const options = developmentMode => ({
  mode: developmentMode ? 'development' : 'production',
  entry: './src/js/main.js',
  output: {
    filename: './js/bundle.min.js',
  },
});

gulp.task('scripts', () => gulp
  .src('./src/js/main.js')
  .pipe(webpackStream(options(isDevelopment), webpack))
  .pipe(gulp.dest('build/'))
  .on('end', browserSync.reload));

gulp.task('serve', () => {
  browserSync.init({
    server: './build/',
    notify: false,
    ui: false,
  });
});

gulp.task('watch', () => {
  gulp.watch('./src/fonts/**/*.{woff,woff2}', gulp.series('fonts'));
  gulp.watch('./src/img/**/*.{png,jpg,svg,gif}', gulp.series('images'));
  gulp.watch('./src/js/libs/**/*.js', gulp.series('libs'));
  gulp.watch('./src/**/*.html', gulp.series('html'));
  gulp.watch('./src/sass/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch(['./src/js/**/*.js', '!./src/js/libs'], gulp.series('scripts'));
});

gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('fonts', 'images', 'libs', 'style', 'scripts')),
);

gulp.task('start', gulp.series('build', gulp.parallel('watch', 'serve')));
