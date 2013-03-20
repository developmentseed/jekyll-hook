#!/bin/sh

# Install node and depencencies
sudo apt-get update -y
sudo apt-get install python-software-properties python g++ make -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update -y
sudo apt-get install nodejs npm -y

# Forever to keep server running
sudo npm install -g forever

# Git
sudo apt-get install git -y

# Ruby
sudo apt-get install ruby1.8 -y
sudo apt-get install rubygems -y

# Jekyll
sudo gem install jekyll --version "0.11.2"
sudo gem install rdiscount -- version "1.6.8"
sudo gem install json --version "1.6.1"

# Nginx for static content
sudo apt-get install nginx -y