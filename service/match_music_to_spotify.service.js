const dbService = require("./db.service");
const spotifyService = require("./spotify.service");
const { localStorage } = require("../config/storage.config");

exports.matchSongsWithSpotify = async () => {
	if (!localStorage.getItem("access_token")) {
		throw "You must login first";
	}

	const songs = await dbService.findSongsToMatch();
	console.log(`Songs to match: ${songs.length}`);

	for (const song of songs) {
		try {
			let spotifyInfo = await spotifyService.searchSong(song, localStorage.getItem("access_token"));
			if (spotifyInfo.length == 0) {
				continue;
			}
			let trackInfo = spotifyService.extractTrackInfo(song, spotifyInfo);
			await dbService.setSpotifyId(song, trackInfo);
		} catch (e) {
			console.log(`Error matching song ${song.title}`, e);
		}
	}

	return songs.length;
};
