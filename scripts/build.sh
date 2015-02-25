#!/bin/bash
set -e

# This script is meant to be run automatically
# as part of the jekyll-hook application.
# https://github.com/developmentseed/jekyll-hook

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
build=$6

# This function retry the input command 10 times
# in case the command returns non-zero indicating command failure
safeRunCommand() {
typeset cmnd="$*"
typeset ret_code
attempt=1

echo cmnd=$cmnd
eval $cmnd
ret_code=$?
while [ $ret_code != 0 ]; 
do
  printf "Error : [%d] when executing command: '$cmnd'" $ret_code

  if [ "$attempt" -ge 10 ];
  then
  	exit $ret_code
  fi

  echo "Retrying"
  echo "$attempt"
  let attempt=$attempt+1
  eval $cmnd
done
}


# Check to see if repo exists. If not, git clone it
if [ ! -d $source ]; then
    safeRunCommand "git clone $giturl $source"
fi

# Git checkout appropriate branch, pull latest code
cd $source
git checkout $branch
safeRunCommand "git pull origin $branch"
cd -

# Run jekyll
cd $source
jekyll build -s $source -d $build
cd -
