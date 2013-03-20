# jekyll-hook

A server that listens for webhook posts from GitHub, generates a site with Jekyll, and moves it somewhere to be served. Use this to run your own GitHub Pages-style web server. Great for when you need to serve your websites behind a firewall, need extra server-level features like HTTP basic auth (see `default` file for Nginx config with basic auth), or want to host your site directly on a CDN or file host like S3.

## Installation

- `build.sh` installs server dependencies for Ubuntu Linux
- run `$ npm install` to install app dependencies

## Configuration

Copy the following JSON to `config.json` in the application's root directory.

```json
{
    "gh_server": "github.com",
    "branch": "master",
    "temp_directory": "/home/ubuntu/jekyll-hook",
    "site_directory": "/usr/share/nginx/www",
    "email": {
       "user": "", 
       "password": "", 
       "host": "", 
       "ssl": true
    }
}
```

Configuration attributes:

- `gh_server` The GitHub server from which to pull code
- `branch` The branch to watch for changes
- `temp_directory` A directory to store code and site files
- `site_directory` A directory to publish the site
- `email` Optional. Settings for sending email alerts
    - `user` Sending email account's user name (e.g. `example@gmail.com`)
    - `password` Sending email account's password
    - `host` SMTP host for sending email account (e.g. `smtp.gmail.com`) 
    - `ssl` `true` or `false` for SSL

## Usage

- run once: `$ node app.js`
- use [forever](https://github.com/nodejitsu/forever) to run as server: `$ forever app.js`

## Web server

Serve content from a simple webserver link Nginx (the `default` file is a sample Nginx configuration with HTTP basic auth) or use s3cmd or rsync to mirror files on S3 or a CDN.
