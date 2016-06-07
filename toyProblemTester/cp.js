var Mocha = require('mocha');

// module.exports = ( function(){
//   process.send('foo');
// } )();
console.log('FOOOOOOOOOOOOOOOOOOO', process.argv);

var mocha = new Mocha({
  //reporter: 'list' 
  reporter: 'custom-reporter'
});
mocha.addFile('./temp/subject.js');
mocha.addFile('./temp/subject.test.js');
var log = console.log;
console.log = function() {};
log('running tests...');
mocha.run(function(failures) {
  log('argsI-***************************', arguments);
  console.log = log;
}, function() {
  log(arguments);
  console.log = log;
});

// process.exit();
