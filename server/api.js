/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
const tileSize = 16;
const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Tile = require("./models/tile");
const Level = require("./models/level");
const Pattern = require("./models/pattern");

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

router.post("/wipe", async (req, res) => {
  await Tile.deleteMany({});
  await Pattern.deleteMany({});
  await Level.deleteMany({});
  res.send(true);
});

router.post("/removePlayer", (req, res) => {
  if (req.user) editLogic.removePlayer(req.user._id);
  res.send({});
});

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
 * .name
 * .layer
 * .image : clamped array of numbers
 */
router.post("/newTile", async (req, res) => {
  const pattern = await new Pattern({
    width: tileSize,
    height: tileSize,
    image: req.body.image,
  }).save();
  const tile = await new Tile({
    name: req.body.name,
    layer: req.body.layer,
    image: pattern._id,
  }).save();
  res.send(tile._id);
  // TODO DISCREPENCY: req.body.image is actual image, but Tile.image
  // is a String reference to tile. must deal with this once we get
  // image storage set up
});

/**
 * req.query.tileIds is a list of tileIds
 */
router.post("/tilesWithId", async (req, res) => {
  console.log("entered tilesWithId api call");
  console.log("req.body.tileIds: " + req.body.tileIds.toString());
  const tileIdList = req.body.tileIds;
  console.log("tileIdList var length: " + tileIdList.length);
  const ret = {};
  for (let i = 0; i < tileIdList.length; i++) {
    console.log("entered loop");
    const tileId = tileIdList[i];
    console.log("tileId variable: " + tileId);
    // TODO fetch tile, do ret[tileId] = tileObject, and after looping, send back ret
    // tileObject has to contain actual image
    const tile = await Tile.findOne({ _id: tileId });
    console.log("found tile: " + tile);
    const pattern = await Pattern.findOne({ _id: tile.image });
    console.log("found pattern, proof: " + pattern.image[0]);
    const tileObject = {
      _id: tile._id,
      name: tile.name,
      layer: tile.layer,
      width: pattern.width,
      height: pattern.height,
      image: pattern.image,
    };
    ret[tileId] = tileObject;
  }
  console.log("ret: length: " + Object.keys(ret).length);
  res.send(ret);
});

/**
 * req.body contains attributes of the level (i.e. title, rows, cols, etc)
 */
router.post("/newLevel", (req, res) => {
  // request should have attributes of level
  const newLevel = new Level({ ...req.body });
  newLevel.save().then((level) => res.send(level));
});

router.post("/save", async (req, res) => {
  const levelId = editLogic.editState.players[req.user._id].levelId;
  const levelInEditState = editLogic.editState.levels[levelId];
  const level = await Level.findOne({ _id: levelId });
  level.title = levelInEditState.title;
  level.rows = levelInEditState.rows;
  level.cols = levelInEditState.cols;
  level.gridTiles = levelInEditState.gridTiles;
  level.availableTiles = levelInEditState.availableTiles;
  await level.save();
  res.send({});
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
