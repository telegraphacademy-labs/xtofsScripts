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

var orgRepo = github.getRepo(secrets.orgName, secrets.repo);
var mkdir = Q.nfbind(fs.mkdir);
var unlink = Q.nfbind(fs.unlink);
var rmdir = Q.nfbind(fs.rmdir);

var writeFile = function(data, filename) {
  var deferred = Q.defer();
  //console.log('write file: ', filename);
  fs.writeFile('./temp/' + filename, data, 'utf8', function(err) {
    console.log(err);
    deferred.resolve();
  });
  return deferred.promise;
};

var getTestFile = function(problemName) {
  var deferred = Q.defer();
  //console.log('get test file');
  orgRepo.read('solution', problemName + '/' + problemName + '.test.js', function(err, data) {
    if (err) {
      console.log(err);
    }
    deferred.resolve(data);
  });
  return deferred.promise;
};

var getStudentFile = function(studentUser, problemName) {
  var deferred = Q.defer();
  var studentRepo = github.getRepo(studentUser, secrets.repo);
  studentRepo.read('master', problemName + '/' + problemName + '.js', function(err, data) {
    if (err) {
      console.log(err);
    }
    deferred.resolve(data);
  });
  return deferred.promise;
};

var checkSyntax = function(data) {
  var deferred = Q.defer();
  var err = check(data, 'somefile.name');
  if (err) {
    console.error('ERROR DETECTED' + Array(62).join('!'));
    console.error(err);
    console.error(Array(76).join('-'));
    deferred.reject(new Error('SYNTAX ERROR'));
  } else {
    deferred.resolve(data);
  }
  return deferred.promise;
};

var runTests = function() {
  var deferred = Q.defer();
  var mocha = new Mocha({
    //reporter: 'list' 
    reporter: 'custom-reporter'
  });
  mocha.addFile('./temp/subject.js');
  mocha.addFile('./temp/subject.test.js');
  var log = console.log;
  console.log = function() {};
  log('running tests...');
  process.env.CUSTOM_REPORTER_TARGET_FILE = 'somecrap.txt';
  mocha.run(function(failures) {
    log('argsI', arguments);
    console.log = log;
    deferred.resolve();
    // process.on('exit', function() {
    //   log('food', arguments); 
    //   //process.exit(failures);
    //   deferred.resolve(failures);
    // });
  }, function() {
    log(arguments);
    console.log = log;
    deferred.reject('something happened');
  });
  return deferred.promise;
};

var toyProblemName = 'rotatedArraySearch';
mkdir('./temp/')
  .then(function() {
    return getTestFile(toyProblemName);
  })
  .then(function(data) {
    return writeFile(data, 'subject.test.js');
  })
  .then(function() {
    return getStudentFile(secrets.studentUsernames[6], toyProblemName);
  })
  .then(function(data) {
    return checkSyntax(data);
  })
  .then(function(data) {
    return writeFile(data, 'subject.js');
  })
  .then(function() {
    return runTests();
  })
  .then(function() {
    //jconsole.log('eat shit');
    return unlink('./temp/subject.js');
  })
  .then(function() {
    return unlink('./temp/subject.test.js');
  })
  .then(function() {
    return rmdir('./temp/');
  })
  .then(function() {
    //console.log(arguments);
    console.log('finis');
  })
  .catch(function(err) {
    console.log('ERROR$$:  ' + err);
    switch (err.message) {
      case 'SYNTAX ERROR':
        unlink('./temp/subject.test.js')
          .then(function() {
            return rmdir('./temp/');
          })
          .done();
        break;
      default:
        unlink('./temp/subject.test.js')
          .then(function() {
            return unlink('./temp/subject.js');
          })
          .then(function() {
            return rmdir('./temp/');
          })
          .done();
        break;
    }
  })
  .done();
