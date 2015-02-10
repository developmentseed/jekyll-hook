'use strict';

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

  command.on('close', function(err){
    callback(err);
  });
}

function checkout(sourceDir, branch, callback) {
  var command = spawn('git', ['--git-dir=' + sourceDir + '/.git', '--work-tree=' + sourceDir, 'checkout', branch]);

  command.on('close', function(err){
    console.log('Git repo checked out.');
    callback(err);
  });
}

function pull(sourceDir, branch, callback) {
  var command = spawn('git', ['--git-dir=' + sourceDir + '/.git', '--work-tree=' + sourceDir, 'pull', 'origin', branch]);

  command.on('close', function(err){
    callback(err);
  });
}

function jekyllBuild(sourceDir, buildDir, callback) {
  var command = spawn('jekyll', ['build', '-s', sourceDir, '-d', buildDir]);

  command.on('close', function(err){
    console.log('Site built with jekyll.');
    callback(err);
  });
}

module.exports.jekyll = function (sourceDir, buildDir, repo, branch, cb) {
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
      jekyllBuild(sourceDir, buildDir, callback);
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

