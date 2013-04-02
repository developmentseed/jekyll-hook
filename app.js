var fs      = require('fs');
var express = require('express');
var app     = express();
var queue   = require('queue-async');
var exec    = require('child_process').exec;
var email   = require('emailjs/email');
var config  = require('./config.json');
var mailer  = email.server.connect(config.email);

app.use(express.bodyParser());

// Receive webhook post
app.post('/hooks/jekyll', function(req, res){
    var data = JSON.parse(req.body.payload);
    var q    = queue(1);
    var cmd  = '';

    // Close connection
    res.send(200);

    // Process webhook data
    data.repo    = data.repository.name;
    data.branch  = data.ref.split('/')[2];
    data.owner   = data.repository.owner.name;
    data.url     = 'git@' + config.gh_server + ':' + data.owner + '/' + data.repo + '.git';
    data.base    = config.temp_directory + '/' + data.owner + '/' + data.repo + '/' + data.branch;
    data.source  = data.base + '/' + 'code';
    data.dest    = data.base + '/' + 'site';
    data.baseurl = '/' + data.repo;
    data.site    = config.site_directory + '/' + data.repo;

    // End early if not master branch
    if (data.branch !== config.branch) {
        console.log('Not ' + config.branch + ' branch.');
        return;
    }

    // If repo doesn't exist locally, clone it
    if (!fs.existsSync(data.source)) {
        // Git clone repo from GitHub
        cmd = 'git clone ' + data.url + ' ' + data.source;
        q.defer(run, data, cmd);
    }

    // Git checkout appropriate branch, pull latest code
    cmd = 'cd ' + data.source +
          ' && git checkout ' + data.branch +
          ' && git pull origin ' + data.branch +
          ' && cd -';
    q.defer(run, data, cmd);

    // Run jekyll
    cmd = 'cd ' + data.source +
          ' && jekyll ' + data.source + ' ' + data.dest +
          ' --no-server --no-auto --base-url="' + data.baseurl + '"' +
          ' && cd -';
    q.defer(run, data, cmd);

    // Sync files (remove old files, copy new ones)
    cmd = 'rm -rf ' + data.site + ' && mv ' + data.dest + ' ' + data.site;
    q.defer(run, data, cmd);

    // Done processing
    q.await(function() {
        // Log success message
        console.log(
            'Successfully rendered: ' + data.owner + '/' + data.repo +
            '@' + data.after + ' to ' + data.site
        );

        // Send success email
        if (config.email && data.pusher.email) {
            var message = {
                text: 'Successfully rendered: ' + data.owner + '/' + data.repo +
                    '@' + data.after + ' to ' + data.site,
                from: config.email.user,
                to: data.pusher.email,
                subject: 'Successfully built ' + data.repo + ' site'
            };
            mailer.send(message, function(err, message) { console.log(err || message); });
        }
    });
});

// Start server
app.listen(8080);
console.log('Listening on port 8080');

function run(data, cmd, cb) {

    console.log('Running: ' + cmd);
    exec(cmd, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error !== null) {
            console.log('exec error: ' + error);

            // Send error email
            if (config.email && data.pusher.email) {
                var message = {
                    text: 'exec error: ' + error,
                    from: config.email.user,
                    to: data.pusher.email,
                    subject: '!! Failed to build ' + data.repo + ' site'
                };
                mailer.send(message, function(err, message) { console.log(err || message); });
            }

        } else {
            if (typeof cb === 'function') cb();
        }
    });
}
