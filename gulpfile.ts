const gulp = require('gulp');
const ts = require('gulp-typescript');
const project = ts.createProject('tsconfig.json')

gulp.task('compile', () => {
  return gulp.src('src/**/*.ts')
    .pipe(project())
    .pipe(gulp.dest('dist/'))
})

gulp.task('copy', async () => {
  return new Promise((resolve,reject)=>{
    gulp.src('src/module.json').pipe(gulp.dest('dist/'))
    gulp.src('src/lang/**/*.json').pipe(gulp.dest('dist/lang/'))
    gulp.src('src/lib/**/*.js').pipe(gulp.dest('dist/lib/')) 
    resolve();
  })
})

gulp.task('build', gulp.parallel('compile', 'copy'));