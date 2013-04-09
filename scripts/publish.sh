#!/bin/bash
set -e 

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
build=$6

# Set the path of the hosted site
site="/usr/share/nginx/www/$repo"

# Remove old site files, move new ones in place
rm -rf $site
mv $build $site
