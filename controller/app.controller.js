const loginService = require("../service/login.service");
const sessionService = require("../service/session.service");
const loadUseCase = require("../usecase/load.usecase");
const matchUseCase = require("../usecase/match.usecase");
const saveUseCase = require("../usecase/save.usecase");
const manualUseCase = require("../usecase/manual.usecase");
const playUseCase = require("../usecase/player.usecase");


exports.isTokenValid = async (req, res) => {
	sessionService.isTokenValid(req, res);
};

exports.login = async (req, res) => {
	loginService.login(req, res);
};

exports.callback = async (req, res) => {
	loginService.callback(req, res);
};

exports.refreshToken = async (req, res) => {
	loginService.refreshToken(req, res);
};

exports.loadSongsIntoDb = async (req, res) => {
	try {
		let total = await loadUseCase.loadFilesToDatabase();
		res.status(200).json({ message: "Success loading files into database", size: total });
	} catch (e) {
		console.error("Error in load files into database process", e);
		res.status(500).json({ message: "Error loading files into database", error: e });
	}
};

exports.matchSongsWithSpotify = async (req, res) => {
	try {
		let total = await matchUseCase.matchSongsWithSpotify();
		res.status(200).json({ message: "Success matching songs with Spotify", size: total });
	} catch (e) {
		const errorMessage = "Error matching songs against Spotify";
		console.error(errorMessage, e);
		res.status(500).json({ message: errorMessage, error: e });
	}
};

exports.markSavedSongsInSpotify = async (req, res) => {
	try {
		let total = await saveUseCase.markSavedSongsInSpotify();
		res.status(200).json({ message: "Success marking saved songs in Spotify", size: total });
	} catch (e) {
		const errorMessage = "Error matching songs against Spotify";
		console.error(errorMessage, e);
		res.status(500).json({ message: errorMessage, error: e });
	}
};

exports.getSongsToManuallyValidate = async (req, res) => {
	try {
		const response = await manualUseCase.getSongsToManuallyValidate(req.query);
		res.send(response);
	} catch (e) {
		const errorMessage = "Error fetching songs to manually match against Spotify options";
		console.error(errorMessage, e);
		res.status(500).send({ message: errorMessage, error: e });
	}
};

exports.setMatchedSong = async (req, res) => {
	const songId = req.params.id;
	const spotifyId = req.body.spotifyId;

	try {
		await manualUseCase.setMatchedSong(songId, spotifyId);
		res.status(204).json();
	} catch (e) {
		const errorMessage = `Error setting song ${songId} as matched`;
		console.error(errorMessage, e);
		res.status(500).send({ message: errorMessage, error: e });
	}
};

exports.playSongInSpotifyPlayer = async (req, res) => {
	const spotifyId = req.params.id;

	try {
		await playUseCase.playSong(spotifyId);
	} catch (e) {
		const errorMessage = `Error requesting song to play ${spotifyId}`;
		console.error(errorMessage, e);
		res.status(500).send({ message: errorMessage, error: e });
	}
};
