var resolve = require('path').resolve;
var flag = require('node-env-flag');

module.exports = {
    'temp': resolve(__dirname, '../tmp'),
    'port': process.env.PORT || '8080',
    'branch': process.env.BRANCH || 'master',
    'repoName': process.env.REPONAME,
    'githubHook': '/hooks/jekyll',
    'gitUser': process.env.GIT_USER,
    'gitPass': process.env.GIT_PASS,
    'secret': process.env.SECRET,
    'email': {
        'isActivated': flag(process.env.EMAIL_ACTIVATED, false),
        'user': process.env.EMAIL_USER,
        'password': process.env.EMAIL_PASS,
        'host': process.env.EMAIL_HOST,
        'ssl': process.env.EMAIL_SSL
    },
    'copyDir': process.env.COPY_DIR,
    's3': {
        'isActivated': flag(process.env.S3_ACTIVATED, false),
        'bucket': process.env.S3_BUCKET,
        'options': {
            'maxAsyncS3': 20,
            's3RetryCount': 3,
            's3RetryDelay': 1000,
            'multipartUploadThreshold': 20971520,
            'multipartUploadSize': 15728640,
            's3Options': {
                'accessKeyId': process.env.S3_ACCESS_KEY_ID,
                'secretAccessKey': process.env.S3_ACCESS_SECRET_KEY
            }
        }
    }
};
