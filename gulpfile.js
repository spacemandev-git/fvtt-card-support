const gulp = require('gulp');

gulp.task('build', async () => {
  return new Promise((resolve,reject)=>{
    gulp.src('README.md').pipe(gulp.dest('dist/'))
    gulp.src('src/**').pipe(gulp.dest('dist/'))
    resolve();
  })
})
