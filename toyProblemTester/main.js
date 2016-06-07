var Github = require('github-api');
var fs = require('fs');
var Mocha = require('mocha');
var check = require('syntax-error');
var Q = require('q');
var secrets = require('./secrets');
var fork = require('child_process').fork;

process.env.CUSTOM_REPORTER_TARGET_FILE = 'somecrap.txt';

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
  fs.writeFile('./temp/' + filename, data, 'utf8', function(err) {
    deferred.resolve();
  });
  return deferred.promise;
};

var getTestFile = function(problemName) {
  var deferred = Q.defer();
  orgRepo.read('solution', problemName + '/' + problemName + '.test.js', function(err, data) {
    if (err) {
      console.log(err);
    }
    deferred.resolve(data);
  });
  return deferred.promise;
};

var getStudentFile = function(studentUser, problemName) {
  console.log('GET STUDENT REPO :', studentUser, problemName);
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
  var cp = fork('./cp.js', ['funk', 'show']);
  cp.on('exit', function() {
    console.log('PROCESS EXIT');
    deferred.resolve();
  });
  return deferred.promise;
};

var downloadAndTestStudentCode = function(i) {
  var deferred = Q.defer();

  fs.writeFileSync(process.env.CUSTOM_REPORTER_TARGET_FILE, '');
  var innerFunc = function() {
    if (i < secrets.studentUsernames.length) {
      process.env.CUSTOM_REPORTER_CURRENT_SUBJECT = secrets.studentUsernames[i];
      getStudentFile(process.env.CUSTOM_REPORTER_CURRENT_SUBJECT, toyProblemName)
        .then(function(data) {
          return checkSyntax(data);
        })
        .then(function(data) {
          console.log('writeFile');
          return writeFile(data, 'subject.js');
        })
        .then(function() {
          return runTests();
        })
        .then(function() {
          console.log('unlink File');
          unlink('./temp/subject.js').then(function() {
            i++;
            innerFunc();
          });
        });
    } else {
      deferred.resolve();
    }
  };

  innerFunc();

  return deferred.promise;
};

var toyProblemName = process.argv[2];
mkdir('./temp/')
  .then(function() {
    return getTestFile(toyProblemName);
  })
  .then(function(data) {
    return writeFile(data, 'subject.test.js');
  }).then(function() {
    return downloadAndTestStudentCode(0);
  })
  .then(function() {
    console.log('UNLINK THE TEST FILE!!!!!!!(?)');
    return unlink('./temp/subject.test.js');
  })
  .then(function() {
    return rmdir('./temp/');
  })
  .then(function() {
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
