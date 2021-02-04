/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
const constants = require("../constants");
const tileSize = constants.tileSize;
const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Tile = require("./models/tile");
const Level = require("./models/level");
const Pattern = require("./models/pattern");

const attributesOfLevel = [
  "_id",
  "title",
  "description",
  "creator",
  "rows",
  "cols",
  "gridTiles",
  "availableTiles",
  "startX",
  "startY",
  "charSprite",
  "background",
  "isPublished",
];

// import editLogic
const editLogic = require("./editLogic.js");
const playLogic = require("./playLogic.js");

const { uploadImagePromise, deleteImagePromise, downloadImagePromise } = require("./storageTalk");

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

router.post("/removePlayerFromGame", (req, res) => {
  if (req.user) playLogic.removePlayer(req.user._id);
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
 * .image : string representing image, base 64 encoded
 */
router.post("/newTile", (req, res) => {
  // console.log("/newTile called");
  if (typeof req.body.image !== "string") {
    throw new Error(
      "Can only handle images encoded as strings. Got type: " + typeof req.body.image
    );
  }
  uploadImagePromise(req.body.image)
    .then((imageName) => {
      return new Pattern({
        image: imageName,
      }).save();
    })
    .then((pattern) => {
      return new Tile({
        name: req.body.name,
        layer: req.body.layer,
        image: pattern._id,
      }).save();
    })
    .then((tile) => {
      res.send(tile._id);
    })
    .catch((err) => {
      console.log("ERR: upload image: " + err);
      res.status(500).send({
        message: "error uploading",
      });
    });
});

/**
 * req.body.image is string
 */
router.post("/newImage", (req, res) => {
  if (typeof req.body.image !== "string") {
    throw new Error(
      "Can only handle images encoded as strings. Got type: " + typeof req.body.image
    );
  }
  uploadImagePromise(req.body.image)
    .then((imageName) => {
      return new Pattern({
        image: imageName,
      }).save();
    })
    .then((pattern) => {
      res.send(pattern._id);
    })
    .catch((err) => {
      console.log("ERR: upload image: " + err);
      res.status(500).send({
        message: "error uploading",
      });
    });
});

/**
 * req.query.tileIds is a list of tileIds
 */
router.post("/tilesWithId", async (req, res) => {
  console.log("user name and id: " + req.user.googleid + ", " + req.user.name);
  const tileIdList = req.body.tileIds;
  const ret = {};
  for (let i = 0; i < tileIdList.length; i++) {
    const tileId = tileIdList[i];
    // fetch tile, do ret[tileId] = tileObject, and after looping, send back ret
    // tileObject has to contain actual image
    const tile = await Tile.findOne({ _id: tileId });
    const pattern = await Pattern.findOne({ _id: tile.image });
    const imageName = pattern.image;
    const imString = await downloadImagePromise(imageName);
    const tileObject = {
      _id: tile._id,
      name: tile.name,
      layer: tile.layer,
      image: imString,
    };
    ret[tileId] = tileObject;
  }
  res.send(ret);
});

/**
 * req.body.patternId
 * res sends back image string
 */
router.post("/fetchImage", async (req, res) => {
  const pattern = await Pattern.findOne({ _id: req.body.patternId });
  const imageName = pattern.image;
  const imString = await downloadImagePromise(imageName);
  res.send({ image: imString });
});

/**
 * req.body contains attributes of the level (i.e. title, rows, cols, etc)
 */
router.post("/newLevel", (req, res) => {
  // request should have attributes of level
  const newLevel = new Level(Object.assign({}, { ...req.body }, { creator: req.user._id }));
  newLevel.save().then((level) => res.send(level));
});

router.post("/save", async (req, res) => {
  if (!(req.user._id in editLogic.editState.players)) {
    return;
  }
  const levelId = editLogic.editState.players[req.user._id].levelId;
  console.log("playerDict: ", editLogic.editState.players[req.user._id]);
  console.log("save levelId: " + levelId);
  const levelInEditState = editLogic.editState.levels[levelId];
  const level = await Level.findOne({ _id: levelId });
  for (let i = 0; i < attributesOfLevel.length; i++) {
    const attr = attributesOfLevel[i];
    if (attr !== "_id") {
      level[attr] = levelInEditState[attr];
    }
  }
  await level.save();
  res.send({});
});

/**
 * request consists of levelId
 */
router.post("/joinLevel", async (req, res) => {
  const level = await Level.findOne({ _id: req.body.levelId });
  const levelCopy = {};
  for (let i = 0; i < attributesOfLevel.length; i++) {
    const attr = attributesOfLevel[i];
    levelCopy[attr] = level[attr];
  }
  // assume level has all fields required as specified in editLogic
  editLogic.addPlayer(req.user._id, levelCopy, req.body.canvasWidth, req.body.canvasHeight);
  res.send({});
});

/**
 * request consists of levelId
 */
router.post("/joinGame", async (req, res) => {
  const level = await Level.findOne({ _id: req.body.levelId });
  const levelPopulated = await Level.findOne({ _id: req.body.levelId }).populate("gridTiles");
  const modifiedGridTiles = [];
  let iPop = 0;
  for (let i = 0; i < level.gridTiles.length; i++) {
    if (level.gridTiles[i] === null) {
      modifiedGridTiles.push(null);
    } else {
      modifiedGridTiles.push(levelPopulated.gridTiles[iPop]);
      iPop++;
    }
  }
  // assume level has all fields required as specified in editLogic
  playLogic.addPlayer(
    req.user._id,
    level,
    modifiedGridTiles,
    req.body.canvasWidth,
    req.body.canvasHeight
  );
  res.send({});
});

/**
 * req.query is the query
 */
router.get("/levels", (req, res) => {
  Level.find({ ...req.query })
    .populate("creator")
    .then((levels) => res.send(levels));
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
