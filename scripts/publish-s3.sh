#!/bin/bash
set -e

# This script is meant to be run automatically
# as part of the jekyll-hook application.
# https://github.com/developmentseed/jekyll-hook

# This requires a forked version of `s3cmd` that correctly
# handleds --exclude files with the --delete-removed flag.
# Clone the fork https://github.com/developmentseed/s3cmd
# and install it with `python setup.py install`.

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
build=$6

# S3 bucket
bucket=# set your S3 bucket here #

if [[ "$repo" == *.github.* ]]
then

  # get list of sites
  excludes=$(s3cmd ls s3://$bucket/_sites/|awk -F\/ 'BEGIN{ORS=" ";} {print "--exclude '\''" $NF "/*'\''"}')
 
  # if root repo, sync --exclude _sites & sites
  eval "s3cmd sync --delete-removed --exclude '_sites/*' $excludes $build/ s3://$bucket/"

else

  # add repo name to _sites
  touch /tmp/$repo
  s3cmd put /tmp/$repo s3://$bucket/_sites/
  rm /tmp/$repo

  # if not root repo, sync to subdirectory
  s3cmd sync --delete-removed $build/ s3://$bucket/$repo/

fi
