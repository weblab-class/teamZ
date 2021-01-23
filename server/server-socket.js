const editLogic = require("./editLogic");
const playLogic = require("./playLogic");

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
  playLogic.update();
  if (count % updatePeriod === 0) {
    const instructions = editLogic.getInstructions();
    Object.keys(instructions).forEach((playerId) => {
      const sock = getSocketFromUserID(playerId);
      if (sock) sock.emit("update", instructions[playerId]);
    });
    const playInstructions = playLogic.getInstructions();
    Object.keys(playInstructions).forEach((playerId) => {
      const sock = getSocketFromUserID(playerId);
      if (sock) sock.emit("playUpdate", playInstructions[playerId]);
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
      socket.on("enableEdit", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.enableEdit(user._id);
      });
      socket.on("disableEdit", () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.disableEdit(user._id);
      });
      socket.on("addTile", (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.addTile(user._id, tileId);
      });
      socket.on("changeTile", (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.changeTile(user._id, tileId);
      });
      socket.on("modifyLevel", (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.modifyLevel(user._id, newValues);
      });
      socket.on("modifyPlayer", (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.modifyPlayer(user._id, newValues);
      });
      socket.on("resizeLevel", (deltas) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.resizeLevel(user._id, deltas);
      });
      socket.on("playKeyDown", (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.registerKeyDown(user._id, key);
      });
      socket.on("playKeyUp", (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.registerKeyUp(user._id, key);
      });
      socket.on("playModifyPlayer", (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.modifyPlayer(user._id, newValues);
      });
      socket.on("playRestartPlayer", () => {
        console.log("server socket received playRestartPlayer message");
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.restartPlayer(user._id);
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
