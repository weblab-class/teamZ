# PlayPix

## What is it?
PlayPix serves as both a level editor and a pixel art creator. People are free to create or play others' levels, guiding a playable character to the finish, or make pieces of pixel art for others to marvel at.

## What we provide

- Google Auth (Skeleton.js & auth.js)
  - Disclaimer: Auth isn't being taught until the second week.
- Socket Infrastructure (client-socket.js & server-socket.js)
  - Disclaimer: Socket isn't being taught until the second week.
- User Model (auth.js & user.js)

## What you need to change

- Change the font in utilities.css [Done]
- Change the Frontend CLIENT_ID for Google Auth (Skeleton.js) (we'll talk about it at the end of week 2) [Done]
- Change the Server CLIENT_ID for Google Auth (auth.js) (we'll talk about it at the end of week 2) [Done]
- Change the Database SRV for Atlas (server.js) [Done]
- Change the Database Name for MongoDB (server.js) [Done]
- Add a favicon to your website at the path client/dist/favicon.ico [Done]
- Update website title in client/dist/index.html [Done]
- Update this README file ;) [Done]
- Update the package.json file with your app name :) (line 2) [Done]

## Socket stuff
Note: we'll be getting to this in lecture in week 2, so don't worry if you don't know it yet

- If you're not using realtime updating or don't need server->client communication, you can remove socket entirely! (server-socket.js, client-socket.js, and anything that imports them)
- If you are using socket, consider what you want to do with the FIXME in server-socket.js


## How to integrate into your own project

On GitHub download this repository as a zip file, then extract the files into your own repository.
Warning: make sure you copy the hidden files too: .babelrc, .gitignore, .npmrc, and .prettierrc

## don't touch

the following files students do not need to edit. feel free to read them if you would like.

```
client/src/index.js
client/src/utilities.js
client/src/client-socket.js
server/validator.js
server/server-socket.js
.babelrc
.npmrc
.prettierrc
package-lock.json
webpack.config.js
```

## Good luck on your project :)
