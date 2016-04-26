module.exports = CustomReporter;

function CustomReporter(runner) {
  var passes = 0;
  var failures = 0;

  runner.on('pass', function(test) {
    passes++;
    process.stdout.write('pass: ' + test.fullTitle());
    process.stdout.write('\n  ');
  });

  runner.on('fail', function(test, err) {
    failures++;
    process.stdout.write('fail: ' + test.fullTitle() + ' -- error: ' + err.message);
    process.stdout.write('\n  ');
  });

  runner.on('end', function() {
    process.stdout.write('end: ' + passes + '/' + (passes + failures));
    process.stdout.write('\n  ');
    process.exit(failures);
  });
}
