const dbService = require("../service/db.service");
const spotifyService = require("../service/spotify.service");
const { localStorage } = require("../config/storage.config");

exports.matchSongsWithSpotify = async () => {
	if (!localStorage.getItem("access_token")) {
		throw "You must login first";
	}

	const songs = await dbService.findSongsToMatch();
	console.log(`Songs to match: ${songs.length}`);

	for (const song of songs) {
		try {
			let trackInfo = this.getSongMetadataFromSpotify(song);
			if (trackInfo == null || trackInfo.length == 0) {
				console.log(`No match for ${song.artist} - ${song.title} - ${song.album}`);
				continue;
			}
			if (Array.isArray(trackInfo)) {
				console.log(`Multiple options available for ${song.artist} - ${song.title} - ${song.album}`);
			} else {
				console.log(`Match found for ${song.artist} - ${song.title}`);
			}
			await dbService.setSpotifyId(song, trackInfo);
		} catch (e) {
			console.log(`Error matching song ${song.title}`, e);
		}
	}

	return songs.length;
};

exports.getSongMetadataFromSpotify = async (song) => {
	let spotifyInfo = await spotifyService.searchSong(song, localStorage.getItem("access_token"));
	if (spotifyInfo.length == 0) {
		return null;
	}
	return spotifyInfo.map(item => spotifyService.createTrackInfo(item));
};
