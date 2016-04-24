module.exports = CustomReporter;

function CustomReporter(runner) {
  var passes = 0;
  var failures = 0;

  runner.on('pass', function(test){
    passes++;
    console.log('pass: %s', test.fullTitle());
    process.stdout.write('pass: ' + test.fullTitle());
    process.stdout.write('\n  ');
  });

  runner.on('fail', function(test, err){
    failures++;
    console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
    process.stdout.write('fail: ' + test.fullTitle() + ' -- error: ' + err.message);
    process.stdout.write('\n  ');
  });

  runner.on('end', function(){
    console.log('end: %d/%d', passes, passes + failures);
    process.stdout.write('end: ' + passes + '/' + (passes + failures));
    process.stdout.write('\n  ');
    process.exit(failures);
  });
}
