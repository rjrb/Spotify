const express = require("express");
const { v4: uuidv4 } = require('uuid');
const appController = require("./controller/app.controller");
const router = express.Router();

router.get("/ping", (req, res) => { res.send({ ping: uuidv4() }) });
router.get("/login", appController.login);
router.get("/callback", appController.callback);
router.get("/load", appController.loadSongsIntoDb);
router.get("/match", appController.matchSongsWithSpotify);
router.get("/save", appController.markSavedSongsInSpotify);
router.get("/token", appController.isTokenValid);

module.exports = router;
