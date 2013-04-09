#!/bin/bash
set -e 

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
build=$6

# Check to see if repo exists. If not, git clone it
if [ ! -d $source ]; then
    git clone $giturl $source
fi

# Git checkout appropriate branch, pull latest code
cd $source
git checkout $branch
git pull origin $branch
cd -

# Run jekyll
cd $source
jekyll $source $build --no-server --no-auto -base-url="/$repo"
cd -
