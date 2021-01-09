const dbService = require("../service/db.service");
const spotifyService = require("../service/spotify.service");
const { localStorage } = require("../config/storage.config");

exports.markSavedSongsInSpotify = async (req, res) => {
	if (!localStorage.getItem("access_token")) {
		throw "You must login first";
	}

	try {

		let songs = await dbService.findSongsToSync();
		if (songs.length == 0) {
			return 0;
		}
		console.log(`Songs to save: ${songs.length}`);

		let spotifyIds = songs.map(song => song.spotifyId);
		await spotifyService.registerSavedSongs(spotifyIds, localStorage.getItem("access_token"));

		spotifyIds = songs.map(song => song.spotifyId);
		await dbService.setSynced(spotifyIds);

		return spotifyIds.length;

	} catch (e) {
		console.error(error);
		throw "Error marking songs as saved in Spotify";
	}
};
