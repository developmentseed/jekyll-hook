#!/usr/bin/env node

var config  = require('./config.json');
var fs      = require('fs');
var express = require('express');
var app     = express();
var spawn   = require('child_process').spawn;
var email   = require('emailjs/email');
var mailer  = email.server.connect(config.email);

app.use(express.bodyParser());

// Receive webhook post
app.post('/hooks/jekyll', function(req, res){
    var data = JSON.parse(req.body.payload);
    var params = [];

    // Parse webhook data for internal variables
    data.repo = data.repository.name;
    data.branch = data.ref.split('/')[2];
    data.owner = data.repository.owner.name;

    // Close connection
    res.send(202);

    // End early if not master branch
    if (data.branch !== config.branch) {
        console.log('Not ' + config.branch + ' branch.');
        return;
    }

    // Process webhook data into params for scripts
    /* repo   */ params.push(data.repo);
    /* branch */ params.push(data.branch);
    /* owner  */ params.push(data.owner);
    /* giturl */ params.push('git@' + config.gh_server + ':' + data.owner + '/' + data.repo + '.git');
    /* source */ params.push(config.temp + '/' + data.owner + '/' + data.repo + '/' + data.branch + '/' + 'code');
    /* build  */ params.push(config.temp + '/' + data.owner + '/' + data.repo + '/' + data.branch + '/' + 'site');

    // Run build script
    run(config.scripts.build, params, function(err) {
        if (err) {
            console.log('Failed to build: ' + data.owner + '/' + data.repo);
            send('Your website at ' + data.owner + '/' + data.repo + ' failed to build.', 'Error building site', data);
            return;
        }

        // Run publish script
        run(config.scripts.publish, params, function(err) {
            if (err) {
                console.log('Failed to publish: ' + data.owner + '/' + data.repo);
                send('Your website at ' + data.owner + '/' + data.repo + ' failed to publish.', 'Error publishing site', data);
                return;
            }

            // Done running scripts
            console.log('Successfully rendered: ' + data.owner + '/' + data.repo);
            send('Your website at ' + data.owner + '/' + data.repo + ' was succesfully published.', 'Succesfully published site', data);

        });
    });
});

// Start server
app.listen(8080);
console.log('Listening on port 8080');

function run(file, params, cb) {
    var process = spawn(file, params);

    process.stdout.on('data', function (data) {
        console.log('' + data);
    });
    
    process.stderr.on('data', function (data) {
        console.warn('' + data);
    });
    
    process.on('exit', function (code) {
        if (typeof cb === 'function') cb(code !== 0);
    });
}

function send(body, subject, data) {
    if (config.email && data.pusher.email) {
        var message = {
            text: body,
            from: config.email.user,
            to: data.pusher.email,
            subject: subject
        };
        mailer.send(message, function(err) { if (err) console.warn(err); });
    }
}
