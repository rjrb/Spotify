const { localStorage } = require("../config/storage.config");
const dbService = require("../service/db.service");
const spotifyService = require("../service/spotify.service");
const { Playlist } = require("../model/playlist.model");

exports.createAndAddSongsToPlaylist = async (playlistName, playlistDescription) => {
	try {
		let playlistInfo = await createUserPlaylist(playlistName, playlistDescription);
		console.log(playlistInfo);

		let songsAdded = await addSongsToPlaylist(playlistInfo.name, playlistInfo.id);
		console.log("Songs added", songsAdded);

		return { status: 200, message: `Playlist ${playlistInfo.name} created/updated - ${songsAdded.length} songs added` };

	} catch (e) {
		const errorMessage = `Error creating playlist: ${JSON.stringify(req.body)} / Adding songs`;
		console.log(errorMessage);
		console.log(e);
		return { status: e.status, message: errorMessage, error: e };
	}

};

const createUserPlaylist = async (playlistName, playlistDescription) => {
	const access_token = localStorage.getItem("access_token");
	if (!access_token) {
		throw { status: 401, message: "You must login first" };
	}

	const userId = process.env.USER_ID;
	if (!userId) {
		throw { status: 500, message: "User ID not defined in the environment" };
	}

	const availablePlaylists = await spotifyService.getCurrentPlaylists(userId, access_token);
	let playlistInfo = availablePlaylists
		.map(playlist => new Playlist(playlist.id, playlist.name, playlist.description))
		.find(playlist => playlist.name === playlistName)
	;
	if (!playlistInfo) {
		playlistInfo = new Playlist(null, playlistName, playlistDescription);
		const createResponse = await spotifyService.createPlaylist(playlistInfo, userId, access_token);
		playlistInfo.id = createResponse.id;
		console.log(`Playlist ${playlistInfo.name} created with ID ${playlistInfo.id}. Snapshot: ${createResponse.snapshot_id}`);
	} else {
		console.log(`Playlist ${playlistName} already exists`);
	}

	return playlistInfo;
};

const addSongsToPlaylist = async (genre, playlistId) => {
	const access_token = localStorage.getItem("access_token");
	if (!access_token) {
		throw { status: 401, message: "You must login first" };
	}

	const userId = process.env.USER_ID;
	if (!userId) {
		throw { status: 500, message: "User ID not defined in the environment" };
	}

	return Promise.all([dbService.getSongsByGenre(genre), spotifyService.getSongsInPlaylist(playlistId, access_token)])
		.then(responses => {
			const [songs, songsInPlaylist] = responses;
			console.log(songs);
			console.log(songsInPlaylist);

			const songsInPlaylistSet = new Set(songsInPlaylist);
			const spotifyIds = songs.map(song => song.spotifyId).filter(song => !songsInPlaylistSet.has(song));
			console.log(spotifyIds);

			if (spotifyIds.length == 0) {
				console.log(`All songs for genre ${genre} already in playlis ${playlistId}`);
				return Promise.all([[], null]);
			}

			const spotifyIdsTrace = [...spotifyIds];
			return Promise.all([spotifyIdsTrace, spotifyService.addSongsToPlaylist(playlistId, spotifyIds, access_token)]);
		})
		.then(responses => {
			const [spotifyIds, addResponse] = responses;
			console.log(spotifyIds);

			return spotifyIds;
		})
	;
};

exports.getGenres = () => {
	return dbService.getGenres()
		.then(genres => {
			return genres.map(genre => genre.genre).sort();
		})
	;
};
