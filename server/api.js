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

/**
 * For development purposes: wipes all MongoDB data
 */
router.post("/wipe", async (req, res) => {
  await Tile.deleteMany({});
  await Pattern.deleteMany({});
  await Level.deleteMany({});
  res.send(true);
});

/**
 * Removes user from editLogic state
 */
router.post("/removePlayer", (req, res) => {
  if (req.user) editLogic.removePlayer(req.user._id);
  res.send({});
});

/**
 * Removes user from playLogic state
 */
router.post("/removePlayerFromGame", (req, res) => {
  if (req.user) playLogic.removePlayer(req.user._id);
  res.send({});
});

/**
 * Creates a new tile.
 * req.body contains attributes of tile
 * .name: name of tile
 * .layer: layer of tile, must be "Platform" or "Background"
 * .image: base64 encoded string of tile image
 */
router.post("/newTile", (req, res) => {
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
 * Uploads an image.
 * req.body.image is base64 encoded string representing an image.
 * Sends back the _id of newly created Pattern document.
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
 * req.query.tileIds is a list of tileIds corresponding to tiles to fetch.
 * Sends a dictionary: {tileId: {_id, name, layer, image}},
 * where image is the base64 encoded string of the image associated with the corresponding tile
 */
router.post("/tilesWithId", async (req, res) => {
  const tileIdList = req.body.tileIds;
  const ret = {};
  for (let i = 0; i < tileIdList.length; i++) {
    const tileId = tileIdList[i];
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
 * req.body.patternId: _id associated with the the desired Pattern
 * res sends back base64 encoded image string associated with the desired Pattern
 */
router.post("/fetchImage", async (req, res) => {
  const pattern = await Pattern.findOne({ _id: req.body.patternId });
  const imageName = pattern.image;
  const imString = await downloadImagePromise(imageName);
  res.send({ image: imString });
});

/**
 * Creates a new level based on req.body,
 * which should contain attributes of the level (i.e. title, rows, cols, etc)
 */
router.post("/newLevel", (req, res) => {
  const newLevel = new Level(Object.assign({}, { ...req.body }, { creator: req.user._id }));
  newLevel.save().then((level) => res.send(level));
});

/**
 * Saves the level that the user is currently editing.
 */
router.post("/save", async (req, res) => {
  if (!(req.user._id in editLogic.editState.players)) {
    return;
  }
  const levelId = editLogic.editState.players[req.user._id].levelId;
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
 * Adds the user to the edit state of level with req.body.levelId
 */
router.post("/joinLevel", async (req, res) => {
  const level = await Level.findOne({ _id: req.body.levelId });
  editLogic.addPlayer(req.user._id, level.toObject(), req.body.canvasWidth, req.body.canvasHeight);
  res.send({});
});

/**
 * Adds the user to the play state of level with req.body.levelId
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
 * req.query contains the query for Level.
 * Sends back Levels that fit the query, with the creator field populated
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
