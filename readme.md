# Jekyll-hook

Jekyll-hook monitors changes on your GitHub and generates a website with
Jekyll when the repo is updated.

Jekyll-hook allows you to run your own Github Pages web server. Jekyll-hook builds your jekyll website and copies it to your web server or Amazon S3.

Jekyll-hook is quite useful if you need to serve your websites behind a
firewall, need extra server-level features like HTTP basic auth (see below for an
NGINX config with basic auth), or want to host your site directly on a CDN or
file host like S3.

The new version of Jekyll-hook is fully written in Node and no longer requires separate shell script files.

## Installation

Clone the repo

    $: git clone https://github.com/developmentseed/jekyll-hook.git

Browse to the repo and run:

    $: npm install
    $: bundle install

## Configuration

All Jekyll-hook configurations should be loaded into your session's environment.

You can either create a file named `.env` and add environment variables or export them manually using `export ENV_VARIABLE=value`

On Heroku, you should use `heroku config:set ENV_VARIABLE=value` command.

Here is the list of available environemnt variables:

``` bash
PORT=8080 # (optional)
BRANCH=master # The branch that has to be built (required)
REPONAME=en # Name of the repository (required)
GIT_USER=yourUsername  # only needed if your github repository is private (optional)
GIT_PASS=yourPassword  # only needed if your github repository is private (optional)
SECRET=yourSecret  # only needed if you set secret on Github's repo hook settings (optional)
EMAIL_ACTIVATED=true # Set if you like to receive emails when the build is completed (optional)
EMAIL_USER=  # (optional)
EMAIL_PASS=  # (optional)
EMAIL_HOST=  # (optional)
EMAIL_SSL=  # (optional)
COPY_DIR=  # The directory where built site will be copied e.g. the NGNIX website folder (optional)
S3_ACTIVATED=true # activate if you want to upload the built site to S3 (optional)
S3_BUCKET=bucketName # (optional)
S3_ACCESS_KEY_ID=myId # (optional)
S3_ACCESS_SECRET_KEY=mySecret # (optional)
```

## Heroku Deployment

If you are deploying the app to Heroku make sure to run:

    heroku config:set BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git

## Jekyll plugins

If you are using jekyll plugins, make sure to add them to `Gemfile` and run `bundle install` to regenerate the `Gemfile.lock`

## Webhook Setup on Github

Set a [Web hook](https://developer.github.com/webhooks/) on your GitHub repository
that points to your jekyll-hook server `http://example.com/hooks/jekyll`.

## Launch

    $: ./jekyll-hook.js

To launch in background run:

    $: forever start jekyll-hook.js

To launch as a service use [forever-service](https://www.npmjs.com/package/forever-service)

    $: forever-service install jekyll-hook --script jekyll-hook.js
    $: sudo start jekyll-hook
