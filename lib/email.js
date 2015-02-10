'use strict';

var email = require('emailjs/email');

module.exports.send = function (config, body, subject, data) {
    var mailer  = email.server.connect(config);

    if (config && config.isActivated && data.pusher.email) {
      var message = {
        text: body,
        from: config.user,
        to: data.pusher.email,
        subject: subject
      };
      mailer.send(message, function(err) { if (err) console.warn(err); });
    }
};
