#!/bin/sh

if [[ $(git status -s) ]]
then
    echo "The working directory is dirty. Please commit any pending changes."
    exit 1;
fi

echo "Deleting old publication"
rm -rf dist
mkdir dist
git worktree prune
rm -rf .git/worktrees/dist/

echo "Checking out main branch into dist"
git worktree add -B main dist origin/main

echo "Removing existing files"
rm -rf dist/*

echo "Generating site"
hugo

echo "Updating master branch"
cd public && git add --all && git commit -m "Publishing to master (publish.sh)" && git push origin master && cd ..