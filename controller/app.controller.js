const loadService = require("../service/load_files_to_db.service");
const loginService = require("../service/login.service");
const matchService = require("../service/match_music_to_spotify.service");
const markSavedService = require("../service/mark_saved_songs_in_spotify.service");
const sessionService = require("../service/session.service");
const dbService = require("../service/db.service");
const { CompareInfo } = require("../model/compare.model");


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
		let total = await loadService.loadFilesToDatabase();
		res.status(200).json({ message: "Success loading files into database", size: total });
	} catch (e) {
		console.error("Error in load files into database process", e);
		res.status(500).json({ message: "Error loading files into database", error: e });
	}
};

exports.matchSongsWithSpotify = async (req, res) => {
	try {
		let total = await matchService.matchSongsWithSpotify();
		res.status(200).json({ message: "Success matching songs with Spotify", size: total });
	} catch (e) {
		const errorMessage = "Error matching songs against Spotify";
		console.error(errorMessage, e);
		res.status(500).json({ message: errorMessage, error: e });
	}
};

exports.markSavedSongsInSpotify = async (req, res) => {
	try {
		let total = await markSavedService.markSavedSongsInSpotify();
		res.status(200).json({ message: "Success marking saved songs in Spotify", size: total });
	} catch (e) {
		const errorMessage = "Error matching songs against Spotify";
		console.error(errorMessage, e);
		res.status(500).json({ message: errorMessage, error: e });
	}
};

exports.getSongsToManuallyValidate = async (req, res) => {
	try {
		let songs = await dbService.findSongsToManuallyValidate(req.query);
		let compareItems = songs.rows.map(song => new CompareInfo(song.id, song.artist, song.title, song.album, song.genre, song.year, JSON.parse(song.spotifyAlts)));
		res.send(compareItems);
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
		await dbService.setMatched(songId, spotifyId);
		res.status(204).json();
	} catch (e) {
		const errorMessage = `Error setting song ${songId} as matched`;
		console.error(errorMessage, e);
		res.status(500).send({ message: errorMessage, error: e });
	}
};
