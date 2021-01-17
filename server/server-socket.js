const editLogic = require("./editLogic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

// add what editLogic should do when new user enters or leaves, in
// addUser and removeUser respectively.
const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};

// send the current game state every 1/60 of a second.
setInterval(() => {
  sendGameState();
}, 1000 / 60);

let count = 0;
const updatePeriod = 2;
const sendGameState = () => {
  editLogic.update();
  if (count % updatePeriod === 0) {
    const instructions = editLogic.getInstructions();
    Object.keys(instructions).forEach((playerId) => {
      const sock = getSocketFromUserID(playerId);
      if (sock) sock.emit("update", instructions[playerId]);
    });
  }
  count = (count + 1) % updatePeriod;
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
      });
      socket.on("keyDown", (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerKeyDown(user._id, key);
      });
      socket.on("keyUp", (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerKeyUp(user._id, key);
      });
      socket.on("mouseMove", (cors) => {
        if (cors === null) {
          console.log("cors is null");
        }
        if (cors.x === null) {
          console.log("cors.x is null!!!");
        }
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseMove(user._id, cors.x, cors.y);
      });
      socket.on("mouseDown", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseDown(user._id);
      });
      socket.on("mouseUp", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseUp(user._id);
      });
      socket.on("addTile", (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.addTile(user._id, tileId);
      });
      socket.on("changeTile", (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.changeTile(user._id, tileId);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
