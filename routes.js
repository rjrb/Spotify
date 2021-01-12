const express = require("express");
const { v4: uuidv4 } = require('uuid');
const appController = require("./controller/app.controller");
const { checkAccess } = require("./service/session.service");
const router = express.Router();

router.all('*', checkAccess);
router.get("/ping", (req, res) => { res.send({ ping: uuidv4() }) });
router.get("/login", appController.login);
router.get("/callback", appController.callback);
router.get("/refresh", appController.refreshToken);
router.post("/load", appController.loadSongsIntoDb);
router.post("/match", appController.matchSongsWithSpotify);
router.post("/save", appController.markSavedSongsInSpotify);
router.get("/token", appController.isTokenValid);
router.get("/manual", appController.getSongsToManuallyValidate);
router.patch("/songs/:id", appController.setMatchedSong);
router.post("/play/:id", appController.playSongInSpotifyPlayer);
router.get("/search", appController.searchSong);

module.exports = router;
