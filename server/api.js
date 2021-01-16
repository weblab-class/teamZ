/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Tile = require("./models/tile");
const Level = require("./models/level");

// import editLogic
const editLogic = require("./editLogic.js");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

/**
 * Sends back an empty tile (i.e. tile with layer "None")
 */
router.post("/emptyTile", async (req, res) => {
  // try to find an existing empty tile
  const emptyTile = await Tile.findOne({ layer: "None" });
  if (emptyTile) {
    res.send(emptyTile);
  } else {
    const newTile = new Tile({ name: "emptyTile", layer: "None", image: null });
    newTile.save().then((tile) => res.send(tile));
  }
});

/**
 * req.body contains attributes of tile
 */
router.post("/newTile", (req, res) => {
  const newTile = new Tile({ ...req.body });
  newTile.save().then((tile) => res.send(tile));
});

/**
 * req.body contains attributes of the level (i.e. title, rows, cols, etc)
 */
router.post("/newLevel", (req, res) => {
  // request should have attributes of level
  const newLevel = new Level({ ...req.body });
  newLevel.save().then((level) => res.send(level));
});

/**
 * request consists of levelId
 */
router.post("/joinLevel", async (req, res) => {
  const level = await Level.findOne({ _id: req.body.levelId });
  // assume level has all fields required as specified in editLogic
  editLogic.addPlayer(req.user._id, level, req.body.canvasWidth, req.body.canvasHeight);
  res.send({});
});

/**
 * req.query is the query
 */
router.get("/levels", (req, res) => {
  Level.find({ ...req.query }).then((levels) => res.send(levels));
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
