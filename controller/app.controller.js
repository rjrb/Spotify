const loadService = require("../service/load_files_to_db.service");
const loginService = require("../service/login.service");
const matchService = require("../service/match_music_to_spotify.service");
const markSavedService = require("../service/mark_saved_songs_in_spotify.service");
const sessionService = require("../service/session.service");


exports.isTokenValid = async (req, res) => {
	sessionService.isTokenValid(req, res);
};

exports.login = async (req, res) => {
	loginService.login(req, res);
};

exports.callback = async (req, res) => {
	loginService.callback(req, res);
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
		console.error("Error matching songs against Spotify", e);
		res.status(500).json({ message: "Error matching songs against Spotify", error: e });
	}
};

exports.markSavedSongsInSpotify = async (req, res) => {
	try {
		let total = await markSavedService.markSavedSongsInSpotify();
		res.status(200).json({ message: "Success marking saved songs in Spotify", size: total });
	} catch (e) {
		console.error("Error matching songs against Spotify", e);
		res.status(500).json({ message: "Error marking saved songs in Spotify", error: e });
	}
};
