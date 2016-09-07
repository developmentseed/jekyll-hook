# jekyll-hook

**Note:** This tool is **no longer maintained**. There are a number of newer and better approaches to update jekyll-powered websites. We use Continious Integration (e.g. Travis) as a replacement for jekyll-hook at Development Seed. Read more here: https://jekyllrb.com/docs/deployment-methods/

A server that listens for webhook posts from GitHub, generates a website with
Jekyll, and moves it somewhere to be published. Use this to run your own GitHub
Pages-style web server. Great for when you need to serve your websites behind a
firewall, need extra server-level features like HTTP basic auth (see below for an
NGINX config with basic auth), or want to host your site directly on a CDN or
file host like S3. It's cutomizable with two user-configurable shell scripts
and a config file.

*This guide is tested on Ubuntu 14.0*

## Dependencies Installation

First install main dependencies

    $: sudo apt-get update
    $: sudo apt-get install git nodejs ruby ruby1.9.1-dev npm

Symlink nodejs to node

    $: sudo ln -s /usr/bin/nodejs /usr/bin/node

To keep server running we use Forever:

    $: sudo npm install -g forever

We also need Jekyll and Nginx

    $: sudo gem install jekyll rdiscount json
    $: sudo apt-get install nginx

## Installation

Clone the repo

    $: git clone https://github.com/developmentseed/jekyll-hook.git

Install dependencies:

    $: cd jekyll-hook
    jekyll-hook $: npm install

If you receive an error similar to this `npm ERR! Error: EACCES, mkdir
'/home/ubuntu/tmp/npm-2223-4myn3niN'` run:

    $: sudo chown -R ubuntu:ubuntu /home/ubuntu/tmp
    $: npm install

*You should replace `ubuntu` with your username*

## Configuration

Copy `config.sample.json` to `config.json` in the root directory and customize:

    $: cp config.sample.json config.json
    $: vim config.json

Configuration attributes:

- `gh_server` The GitHub server from which to pull code, e.g. github.com
- `temp` A directory to store code and site files
- `public-repo` Whether the repo is public or private (default is public)
- `scripts`
    - `[branch-name]` (optional)
        - `build` The build script to run for a specific branch.
        - `publish` The publish script to run for a specific branch.
    - `#default`
        - `build` The build script to run if no match was found for the branch specified in the webhook.
        - `publish` The publish script to run if match was found for the branch specified in the webhook.
- `secret` Optional. GitHub webhook secret.
- `email` Optional. Settings for sending email alerts
    - `isActivated` If set to true email will be sent after each trigger
    - `user` Sending email account's user name (e.g. `example@gmail.com`)
    - `password` Sending email account's password
    - `host` SMTP host for sending email account (e.g. `smtp.gmail.com`)
    - `ssl` `true` or `false` for SSL
- `accounts` An array of accounts or organizations whose repositories can be used
with this server

You can also adjust `build.sh` and `publish.sh` to suit your workflow. By default,
they generate a site with Jekyll and publish it to an NGINX web directory.

## Webhook Setup on Github

Set a [Web hook](https://developer.github.com/webhooks/) on your GitHub repository
that points to your jekyll-hook server `http://example.com:8080/hooks/jekyll/:branch`, where `:branch` is the branch you want to publish. Usually this is `gh-pages` or `master` for `*.github.com` / `*.github.io` repositories.

For every branch you want to build/publish (as defined in the `scripts`) you need to set up a different webhook.

## Configure a webserver (nginx)

The default `publish.sh` is setup for nginx and copies `_site` folder to `/usr/share/nginx/html/rep_name`.

If you would like to copy the website to another location, make sure to update
nginx virtual hosts which is located at `/etc/nginx/nginx/site-available` on Ubuntu 14.

You also need to update `publish.sh`

For more information Google or [read this](https://www.digitalocean.com/community/tutorials/how-to-configure-the-nginx-web-server-on-a-virtual-private-server):

## Launch

    $: ./jekyll-hook.js

To launch in background run:

    $: forever start jekyll-hook.js

To kill or restart the background job:

```
    $: forever list
    info:    Forever processes running
    data:        uid  command         script         forever pid  logfile                        uptime
    data:    [0] ZQMF /usr/bin/nodejs jekyll-hook.js 4166    4168 /home/ubuntu/.forever/ZQMF.log 0:0:1:22.176
    $: forever stop 0
```

## Publishing content

### S3

To publish the site on Amazon S3, you need to install S3cmd. On Ubuntu run:

    $: sudo apt-get install s3cmd
    $: s3cmd --configure

For more information [read this](http://xmodulo.com/2013/06/how-to-access-amazon-s3-cloud-storage-from-command-line-in-linux.html).

`scripts/publish-s3.sh` does the rest of the job for you. Just make sure to add your bucket name there.

### More details on build.sh

The stock `build.sh` copies rendered site files to subdirectories under a web server's `www` root directory. For instance, use this script and NGINX with the following configuration file to serve static content behind HTTP basic authentication:

```
server {
    root /usr/share/nginx/www;
    index index.html index.htm;

    # Make site accessible from http://localhost/
    server_name localhost;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to index.html
        try_files $uri $uri/ /index.html;

        # Optional basic auth restriction
        # auth_basic "Restricted";
        # auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

Replace this script with whatever you need for your particular hosting environment.

You probably want to configure your server to only respond POST requests from GitHub's
public IP addresses, found on the webhooks settings page.
