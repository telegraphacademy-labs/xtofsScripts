var Github = require('github-api');
var fs = require('fs');
var Mocha = require('mocha');
var check = require('syntax-error');
var Q = require('q');
var secrets = require('./secrets');

var github = new Github({
  username: secrets.githubUser,
  password: secrets.githubPass,
  auth: 'basic'
});

var mocha = new Mocha({
  reporter: 'custom-reporter'
});

var orgRepo = github.getRepo(secrets.orgName, secrets.repo);
var studentRepo = github.getRepo(secrets.studentUsernames[0], secrets.repo);

// repo2.read('solution', 'treeMap/treeMap.test.js', function(err, data) {
//   if (err) console.log(err);
//   fs.writeFile('suckit.test.js', data, 'utf8', function(err, someothercrap) {

//     if (err) console.log(err);
//     repo.read('master', 'treeMap/treeMap.js', function(err, data) {

//       if (err) console.log(err);

//       var err = check(data, 'somefile.name');
//       if (err) {
//         console.error('ERROR DETECTED' + Array(62).join('!'));
//         console.error(err);
//         console.error(Array(76).join('-'));
//       } else {
//         fs.writeFile('suckit.js', data, 'utf8', function(err, someothercrap) {

//           if (err) console.log(err);
//           mocha.addFile('suckit.js');
//           mocha.addFile('suckit.test.js');

//           var foobar = console.log;
//           console.log = function() {};

//           mocha.run(function(failures) {
//             foobar('ar gsI', arguments);
//             process.on('exit', function() {
//               foobar(arguments);
//               process.exit(failures);
//             });
//           }, function() {
//             console.log(arguments);
//           });
//         });
//       }
//     });
//   });
// });

var writeFile = function(data, filename) {
  var deferred = Q.defer();
  console.log('write file: ', filename);
  fs.writeFile(filename, data, 'utf8', function(err) {
    deferred.resolve();
  });
  return deferred.promise;
};

var getTestFile = function(problemName) {
  var deferred = Q.defer();
  console.log('get test file');
  orgRepo.read('solution', problemName + '/' + problemName + '.test.js', function(err, data) {
    if (err) {
      console.log(err);
    }
    writeFile(data, 'test.js').then(function() {
      deferred.resolve(data);
    });
  });

  return deferred.promise;
};


getTestFile('treeMap').then(function() {
  console.log('finis');
});
