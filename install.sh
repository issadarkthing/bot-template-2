#!/bin/bash

REPO=https://github.com/issadarkthing/bot-template-2.git

sudo apt -y update
sudo apt -y install git build-essential

# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# set node version
nvm install 18
nvm use 18

git clone $REPO
cd "$(basename "$REPO" .git)"

npm install
npm run build
npm install -g pm2

pm2 start dist/index.js
