const editLogic = require("./editLogic");
const playLogic = require("./playLogic");
const constants = require("../constants");

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
    const editInstructions = editLogic.getInstructions();
    Object.keys(editInstructions).forEach((playerId) => {
      const sock = getSocketFromUserID(playerId);
      if (sock) sock.emit(constants.SOCKET_MESSAGE_TYPES.EDIT_UPDATE, editInstructions[playerId]);
    });
    const playInstructions = playLogic.getInstructions();
    Object.keys(playInstructions).forEach((playerId) => {
      const sock = getSocketFromUserID(playerId);
      if (sock) sock.emit(constants.SOCKET_MESSAGE_TYPES.PLAY_UPDATE, playInstructions[playerId]);
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
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_KEY_DOWN, (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerKeyDown(user._id, key);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_KEY_UP, (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerKeyUp(user._id, key);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_MOUSE_MOVE, (cors) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseMove(user._id, cors.x, cors.y);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_MOUSE_DOWN, () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseDown(user._id);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_MOUSE_UP, () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.registerMouseUp(user._id);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.ENABLE_EDIT, () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.enableEdit(user._id);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.DISABLE_EDIT, () => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.disableEdit(user._id);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.ADD_TILE, (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.addTile(user._id, tileId);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.CHANGE_TILE, (tileId) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.changeTile(user._id, tileId);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_MODIFY_LEVEL, (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.modifyLevel(user._id, newValues);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.EDIT_MODIFY_PLAYER, (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.modifyPlayer(user._id, newValues);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.RESIZE_LEVEL, (deltas) => {
        const user = getUserFromSocketID(socket.id);
        if (user) editLogic.resizeLevel(user._id, deltas);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.PLAY_KEY_DOWN, (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.registerKeyDown(user._id, key);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.PLAY_KEY_UP, (key) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.registerKeyUp(user._id, key);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.PLAY_MODIFY_PLAYER, (newValues) => {
        const user = getUserFromSocketID(socket.id);
        if (user) playLogic.modifyPlayer(user._id, newValues);
      });
      socket.on(constants.SOCKET_MESSAGE_TYPES.PLAY_RESTART_PLAYER, () => {
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
