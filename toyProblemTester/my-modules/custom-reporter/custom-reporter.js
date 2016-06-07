var fs = require('fs');

module.exports = CustomReporter;

function CustomReporter(runner) {
  var passes = 0;
  var failures = 0;
  var txt = '';


  runner.on('start', function(){
    //process.stdout.log(arguments);
    txt += '*** ' + process.env.CUSTOM_REPORTER_CURRENT_SUBJECT + ' ***\n';
  });

  runner.on('pass', function(test) {
    passes++;
    // process.stdout.write('pass: ' + test.fullTitle());
    // process.stdout.write('\n  ');
    txt += 'pass: ' + test.fullTitle();
    txt += '\n';
  });

  runner.on('fail', function(test, err) {
    failures++;
    // process.stdout.write('fail: ' + test.fullTitle() + ' -- error: ' + err.message);
    // process.stdout.write('\n  ');
    txt += 'fail: ' + test.fullTitle() + ' -- error: ' + err.message;
    txt += '\n';
  });

  runner.on('end', function() {
    // process.stdout.write('end: ' + passes + '/' + (passes + failures));
    // process.stdout.write('\n  ');
    txt += 'end: ' + passes + '/' + (passes + failures);
    txt += '\n';
    txt += '\n';
    fs.appendFileSync(process.env.CUSTOM_REPORTER_TARGET_FILE, txt);
  });
}
