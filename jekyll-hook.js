#!/usr/bin/env node

var config  = require('./config.json');
var fs      = require('fs');
var express = require('express');
var app     = express();
var queue   = require('queue-async');
var tasks   = queue(1);
var spawn   = require('child_process').spawn;
var email   = require('emailjs/email');
var mailer  = email.server.connect(config.email);

app.use(express.bodyParser());

// Receive webhook post
app.post('/hooks/jekyll/:branch', function(req, res) {

    // Close connection
    res.send(202);

    // Queue request handler
    tasks.defer(function(req, res, cb) {
        var data = JSON.parse(req.body.payload);
        var branch = req.params.branch;
        var params = [];

        // Parse webhook data for internal variables
        data.repo = data.repository.name;
        data.branch = data.ref.split('/')[2];
        data.owner = data.repository.owner.name;

        // End early if not permitted account
        if (config.accounts.indexOf(data.owner) === -1) {
            console.log(data.owner + ' is not an authorized account.');
            return;
        }

        // End early if not permitted branch
        if (data.branch !== branch) {
            console.log('Not ' + branch + ' branch.');
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

                if (typeof cb === 'function') cb();
                return;
            }

            // Run publish script
            run(config.scripts.publish, params, function(err) {
                if (err) {
                    console.log('Failed to publish: ' + data.owner + '/' + data.repo);
                    send('Your website at ' + data.owner + '/' + data.repo + ' failed to publish.', 'Error publishing site', data);

                    if (typeof cb === 'function') cb();
                    return;
                }

                // Done running scripts
                console.log('Successfully rendered: ' + data.owner + '/' + data.repo);
                send('Your website at ' + data.owner + '/' + data.repo + ' was succesfully published.', 'Succesfully published site', data);

                if (typeof cb === 'function') cb();
                return;
            });
        });
    }, req, res);

});

// Start server
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on port ' + port);

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
