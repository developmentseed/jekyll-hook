var fse = require('fs-extra');
var join = require('path').join;
var async = require('async');
var s3 = require('s3');

module.exports.copy = function (buildDir, copyDir, repo, cb) {

  var dst = join(copyDir, repo);

  async.series([
    function(callback) {
      fse.remove(dst, callback);
    },
    function(callback) {
      fse.copy(buildDir, dst, callback);
    }],
  function(err) {
    if (cb) return cb(err);
  });
};


module.exports.s3 = function (config, buildDir, cb) {

  var client = s3.createClient(config.options);

  var params = {
    localDir: buildDir,
    deleteRemoved: true,
    s3Params: {
      Bucket: config.bucket,
    },
  };

  var uploader = client.uploadDir(params);

  uploader.on('error', function(err) {
    console.error('unable to sync:', err.stack);
    if (cb) return cb(err);
  });

  uploader.on('progress', function() {
    console.log('progress', uploader.progressAmount, uploader.progressTotal);
  });

  uploader.on('end', function() {
    console.log('done uploading');
    if (cb) return cb();
  });

};
