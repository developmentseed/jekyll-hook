var githubhook = require('githubhook');
var join = require('path').join;
var fse = require('fs-extra');
var async = require('async');
var config  = require('./config.json');
var build = require('./lib/build.js');
var publish = require('./lib/publish.js');
var email = require('./lib/email.js');


var repo = config.repoName;

var githubHook = config.githubHook || '/hooks/jekyll';
var githubPort = process.env.PORT || '8080';
var github = githubhook({
  path: githubHook,
  port: githubPort,
  secret: config.secret,
  logger: console
});


var tmp = config.temp || join(__dirname, 'tmp');

// Create tmp directory if doesn't exist
fse.mkdirs(tmp, function (err) {
  if (err) return console.error(err);

  console.log('tmp directory created!');
});

github.on('push:' + repo , function (ref, data) {

  var gitUrl = build.gitUrl(data.repository.fullName, config.gitUser, config.gitPass);

  /* source */
  var sourceDir = join(tmp, repo, config.branch, 'code');

  /* build  */
  var buildDir = join(tmp, repo, config.branch, 'site');

  async.series([
    function(callback) {
      console.log('Starting the build process');
      build.jekyll(sourceDir, buildDir, gitUrl, config.branch, callback);
    },
    function(callback) {
      if (config.copyDir) {
        publish.copy(buildDir, config.copyDir, repo, callback);
      }
      else if (config.s3.isActivated) {
        publish.s3(config.s3, buildDir, callback);
      }
      else {
        callback();
      }
    }],
  function(err) {
    if (err) {
      console.log(err);
      endWithFailure(repo, data, err);
    }
    else {
      endWithSuccess(repo, data);
    }
  });

});

function endWithFailure(repo, data, err) {
  console.log('Process did not complete. Error: ' + err);

  email.send(
    config.email,
    'Your website at ' + repo + ' failed to build.' + err, 'Error building site',
    data
  );
}

function endWithSuccess(repo, data) {
  console.log('===> Process completed!');

  email.send(
    config.email,
    'Your website at ' + repo + ' was successfully published.',
    'Successfully published site', data
  );
}


github.listen();
