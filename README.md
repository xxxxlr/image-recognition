# SETUP

## Prerequisite(tested)
- node version: 5.0.0
- OS: Mac

## Dependencies
```
$ brew install graphicsmagick
project-root$ npm install
```

## API credential 
credential setup:
- follow https://cloud.google.com/vision/docs/common/auth to get xxxx.json as credential

- in .envrc, change the xxx.json file name to your newly generated credential json
```
$ source .envrc
```

## Run it
```
project-root$ node server.js
```

## Troubleshot:
error: google api complain: first parameter should either be a string or a buffer, with the auth session.

solution: check internet connection.