# Chat App using Nodejs, Expressjs, Mongodb and SocketIO

This is a simple chat broadcasting app, which can be used for broadcasting message to a group.

### Important Instructions :

  - git clone : `git@github.com:rohit-raj/chatapp.git`
  - `npm i`
  - make changes to `default.json` inside config folder, by adding your mongodb url to url field.
  - `node app.js`
  - you can even use `pm2` to start the server.

Note: just make the changes in `default.json` file and make sure that the database exists.
You need not have to create the collection. When the server starts, it will automatically create the necessary collection and initialize them.

##### Libraries used:
  - [NodeJs][NodeJs]
  - [SocketIO][SocketIO]
  - [Express][Express]
  - [uuid][uuid]

Feel free to post questions and star.

[NodeJs]: <https://github.com/nodejs/node>
[SocketIO]: <https://github.com/socketio/socket.io-client>
[Express]: <https://github.com/expressjs/express>
[uuid]: <https://github.com/kelektiv/node-uuid>