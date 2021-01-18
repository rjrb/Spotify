const loginService = require("../service/login.service");
const sessionService = require("../service/session.service");
const loadUseCase = require("../usecase/load.usecase");
const matchUseCase = require("../usecase/match.usecase");
const saveUseCase = require("../usecase/save.usecase");
const manualUseCase = require("../usecase/manual.usecase");
const playerUseCase = require("../usecase/player.usecase");
const playlistUseCase = require("../usecase/playlist.usecase");


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
		const errorMessage = `Error marking songs as saved in Spotify -> ${e.response.status} - ${e.response.data.error.message} - ${e.response.data.error.reason}`;
		console.log(errorMessage);
		console.log(e);
		res.status(e.response.status).send({ message: errorMessage, error: e });
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
		await playerUseCase.playSong(spotifyId);
		res.status(204).json();
	} catch (e) {
		const errorMessage = `Error requesting to play song: ${spotifyId} -> ${e.response.status} - ${e.response.data.error.message} - ${e.response.data.error.reason}`;
		console.log(errorMessage);
		console.log(e);
		res.status(e.response.status).send({ message: errorMessage, error: e });
	}
};

exports.searchSong = async (req, res) => {
	try {
		const tracks = await manualUseCase.searchSong(req.query);
		if (tracks == null) {
			return res.status(404).json({ message: "Song not found", error: "No match for your input criteria" });
		}
		res.status(200).json(tracks);
	} catch (e) {
		const errorMessage = `Error searching song: ${req.query} -> ${e.response.status} - ${e.response.data.error.message} - ${e.response.data.error.reason}`;
		console.log(errorMessage);
		console.log(e);
		res.status(e.response.status).send({ message: errorMessage, error: e });
	}
};

exports.getGenres = async (req, res) => {
	try {
		let genres = await playlistUseCase.getGenres();
		res.status(200).json(genres);
	} catch (e) {
		const errorMessage = `Error fetching genres`;
		console.log(errorMessage);
		console.log(e);
		res.status(500).send({ message: errorMessage, error: e });
	}
};

exports.createPlaylistAndAddSongs = async (req, res) => {
	console.log(req.body);
	try {
		let result = await playlistUseCase.createAndAddSongsToPlaylist(req.body.name, req.body.description);
		console.log(result);
		res.status(result.status).json({ message: result.message });
	} catch (e) {
		const errorMessage = `Error creating playlist: ${JSON.stringify(req.body)} / Adding songs`;
		console.log(errorMessage);
		console.log(e);
		res.status(e.status).json({ message: errorMessage, error: e });
	}
};

exports.getLastPageVisited = async (req, res) => {
	try {
		let lastPage = manualUseCase.getLastPageVisited();
		res.status(200).json({ message: lastPage });
	} catch (e) {
		console.log(e);
		res.status(500).json({ message: "Error restoring last page visited", error: e });
	}
};
