const axios = require('axios');
const { TrackInfo } = require('../model/track.model');
const { SimpleTrackInfo } = require('../model/simple.model');
const isEqual = require('lodash.isequal');

exports.searchSong = (song, access_token) => {
	let urlGet = "https://api.spotify.com/v1/search?" +
		`q=${createSpotifyQuery(song)}` +
		`&` +
		`type=track` +
		`&` +
		`market=CO`
	;
	console.log(urlGet);

	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};

	return axios.get(urlGet, options)
		.then(response => {
			if (response.status != 200) {
				throw `Error searching for song: ${song.title}`;
			}
			return response.data.tracks.items;
		})
	;
};

exports.extractTrackInfo = (items) => {
	if (items.length == 0) {
		return [];
	}
	if (items.length > 1 && !this.allItemsSameSong(items)) {
		return items.map(item => this.createTrackInfo(item));
	} else {
		return this.createTrackInfo(items[0]);
	}
};

exports.allItemsSameSong = (items) => {
	return items.map(item => this.createSimpleTrackInfo(item)).every((val, i, arr) => isEqual(val, arr[0]));
};

exports.createTrackInfo = (item) => {
	return new TrackInfo(item.id, item.artists[0].name, item.name, item.album.name, parseInt(item.album.release_date));
};

exports.createSimpleTrackInfo = (item) => {
	return new SimpleTrackInfo(item.artists[0].name, item.name, item.album.name);
};

exports.registerSavedSongs = async (spotifyIds, access_token) => {
	let sids50 = spotifyIds.splice(0, 50);
	if (sids50.length == 0) {
		return;
	}
	console.log(sids50);

	const urlPut = "https://api.spotify.com/v1/me/tracks";
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};

	axios.put(urlPut, { ids: sids50 }, options)
		.then(response => {
			console.log('Saved tracks statusCode:', response && response.status);
			if (response.status != 200) {
				throw "Error registering saved songs"
			}
			return this.registerSavedSongs(spotifyIds, access_token);
		})
	;
};

exports.playSong = (spotifyId, access_token) => {
	const urlPut = "https://api.spotify.com/v1/me/player/play";
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};

	const body = { uris: [`spotify:track:${spotifyId}`] };

	return axios.put(urlPut, body, options)
		.then(response => {
			console.log('Play song statusCode:', response && response.status);
			if (response.status != 204) {
				throw "Error playing song"
			}
		})
	;
};

exports.createPlaylist = async (playlistInfo, user_id, access_token) => {
	const urlPost = `https://api.spotify.com/v1/users/${user_id}/playlists`;
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};
	
	const body = {
		name: playlistInfo.name,
		description: playlistInfo.description,
		public: false,
		collaborative: false
	};
	
	return axios.post(urlPost, body, options)
		.then(response => {
			console.log('Create playlist statusCode:', response && response.status);
			return response.data;
		})
	;
};

exports.addSongsToPlaylist = (playlist_id, spotifyIds, access_token) => {
	let sids100 = spotifyIds.splice(0, 100);
	if (sids100.length == 0) {
		return;
	}
	console.log(sids100);

	const urlPost = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};

	const body = {
		uris: sids100.map(sid => `spotify:track:${sid}`)
	};

	return axios.post(urlPost, body, options)
		.then(response => {
			console.log('Add tracks to playlist statusCode:', response && response.status);
			if (response.status != 201) {
				throw "Error adding tracks into playlist"
			}
			return this.addSongsToPlaylist(playlist_id, spotifyIds, access_token);
		})
	;
};

exports.getCurrentPlaylists = (user_id, access_token) => {
	const urlPost = `https://api.spotify.com/v1/users/${user_id}/playlists?limit=50`;
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};

	return axios.get(urlPost, options)
		.then(response => {
			console.log('Get current playlists statusCode:', response && response.status);
			return response.data.items;
		})
	;
};

exports.getSongsInPlaylist = async (playlist_id, access_token) => {
	let queryParams = new URLSearchParams();
	queryParams.append("fields", "items(track.id),limit,next,offset,previous,total");
	queryParams.append("limit", "100");
	queryParams.append("offset", 0);
	
	const options = {
		headers: { 'Authorization': 'Bearer ' + access_token }
	};
	
	let spotifyIds = [];
	let response;
	let urlGet = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?${queryParams.toString()}`;
	do {

		response = await axios.get(urlGet, options);
		const songs = response.data.items.map(item => item.track.id);
		spotifyIds.push(...songs);

		urlGet = response.data.next;

	} while (response.data.next != null);

	return spotifyIds;
}

const createSpotifyQuery = (song) => {
	let parts = [];
	if (song.artist) {
		parts.push(`artist:${prepareForQuery(song.artist)}`)
	}
	if (song.title) {
		parts.push(`track:${prepareForQuery(song.title)}`)
	}
	if (song.album) {
		parts.push(`album:${prepareForQuery(song.album)}`)
	}
	return parts.join("+");
};

const regexSpecialChars = /\W|&/gi;
const regexAccents = /[\u0300-\u036f]/g;
const prepareForQuery = (value) => {
	return value
		.trim()
		.normalize("NFD").replace(regexAccents, "")
		.replace(regexSpecialChars, ' ')
		.split(/\s+/)
		.join('+')
	;
};
