var fs = require('fs');
var async = require('async');
var spawn = require('child_process').spawn;
var underscore = require('underscore');

function clone(repo, sourceDir, callback) {
  var command;
  if (!fs.existsSync(sourceDir)) {
    command = spawn('git', ['clone', repo, sourceDir]);
  }
  else {
    callback();
    return;
  }

  command.on('error', function(err){
    console.log(err);
    callback(err);
  });

  command.on('close', function(){
    callback();
  });
}

function checkout(sourceDir, branch, callback) {
  var command = spawn('git', ['--git-dir=' + sourceDir + '/.git', '--work-tree=' + sourceDir, 'checkout', branch]);

  command.on('error', function(err){
    console.log(err);
    callback(err);
  });

  command.on('close', function(){
    console.log('Git repo checked out.');
    callback();
  });
}

function pull(sourceDir, branch, callback) {
  var command = spawn('git', ['--git-dir=' + sourceDir + '/.git', '--work-tree=' + sourceDir, 'pull', 'origin', branch]);

  command.on('error', function(err){
    console.log(err);
    callback(err);
  });

  command.on('close', function(){
    callback();
  });
}

function jekyllBuild(sourceDir, callback) {
  var command = spawn('jekyll', ['build', '-s', sourceDir]);

  command.on('error', function(err){
    console.log(err);
    callback(err);
  });

  command.on('close', function(){
    console.log('Site built with jekyll.');
    callback();
  });
}

module.exports.jekyll = function (sourceDir, repo, branch, cb) {
  async.series([
    function(callback) {
      clone(repo, sourceDir, callback);
    },
    function(callback) {
      checkout(sourceDir, branch, callback);
    },
    function(callback) {
      pull(sourceDir, branch, callback);
    },
    function(callback) {
      jekyllBuild(sourceDir, callback);
    }],
  function(err) {
    if (cb) {
      return cb(err);
    }
    else {
      return;
    }
  });
};

// This library is only tested with github.com. Hard coding it until it is tested with other git hooks
module.exports.gitUrl = function (repo_path, username, password, type) {

  if ( type === 'ssh') {
    return 'git@github.com:' + repo_path + '.git';
  }
  else if ( !underscore.isUndefined(username) && !underscore.isUndefined(password) ) {
    return 'https://' + username + ':' + password + '@github.com/' + repo_path + '.git';
  }
  else {
    return 'https://github.com/' + repo_path + '.git';
  }

};

