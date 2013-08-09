# jekyll-hook

A server that listens for webhook posts from GitHub, generates a website with Jekyll, and moves it somewhere to be published. Use this to run your own GitHub Pages-style web server. Great for when you need to serve your websites behind a firewall, need extra server-level features like HTTP basic auth (see below for an NGINX config with basic auth), or want to host your site directly on a CDN or file host like S3. It's cutomizable with two user-configurable shell scripts and a config file.

## Installation

- run `$ npm install` to install app dependencies
- Set a [Web hook]() on your GitHub repository that points to your jekyll-hook server `http://example.com:8080/hooks/jekyll/:branch`, where `:branch` is the branch you want to publish. Usually this is `gh-pages` or `master` for `*.github.com` / `*.github.io` repositories.


## Configuration

Adjust `build.sh` and `publish.sh` to suit your workflow. By default, they generate a site with Jekyll and publish it to an NGINX web directory.

Copy `config.sample.json` to `config.json` in the root directory and customize.

Configuration attributes:

- `gh_server` The GitHub server from which to pull code
- `temp` A directory to store code and site files
- `scripts`
    - `build` A script to run to build the site
    - `publish` A script to run to publish the site
- `email` Optional. Settings for sending email alerts
    - `user` Sending email account's user name (e.g. `example@gmail.com`)
    - `password` Sending email account's password
    - `host` SMTP host for sending email account (e.g. `smtp.gmail.com`) 
    - `ssl` `true` or `false` for SSL
- `accounts` An array of accounts or organizations whose repositories can be used with this server
## Usage

- run as executable: `$ ./jekyll-hook.js`

## Publishing content

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

You probably want to configure your server to only respond POST requests from GitHub's public IP addresses, found on the webhooks settings page.

## Dependencies

Here's a sample script to install the approriate dependencies on an Ubuntu server:

```sh
#!/bin/sh

# Install node and depencencies
sudo apt-get update -y
sudo apt-get install python-software-properties python g++ make -y
# On Ubuntu 12.10 and greater, add-apt-repository is provided by the software-properties-common package
#sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update -y
sudo apt-get install nodejs -y

# Forever to keep server running
sudo npm install -g forever

# Git
sudo apt-get install git -y

# Ruby
sudo apt-get install ruby1.8 -y
sudo apt-get install rubygems -y

# Jekyll
sudo gem install jekyll --version "0.12.0"
sudo gem install rdiscount -- version "1.6.8"
sudo gem install json --version "1.6.1"

# Nginx for static content
sudo apt-get install nginx -y
```
