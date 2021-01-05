const axios = require('axios');
const { TrackInfo } = require('../model/track_info');

exports.searchSong = (song, access_token) => {
	let urlGet = "https://api.spotify.com/v1/search?" +
		`q=artist:${this.prepareForQuery(song.artist)}+track:${this.prepareForQuery(song.title)}+album:${this.prepareForQuery(song.album)}` +
		`&` +
		`type=track` +
		`&` +
		`&market=CO`
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

exports.extractTrackInfo = (song, items) => {
	if(items.length == 0) {
		return [];
	}
	if (items.length > 1) {
		console.log(`Multiple options available for ${song.title}`);
		return items.map(item => this.createTrackInfo(item));
	} else {
		return this.createTrackInfo(items[0]);
	}
};

exports.createTrackInfo = (item) => {
	return new TrackInfo(item.id, item.artists[0].name, item.name, item.album.name, parseInt(item.album.release_date));
};

exports.registerSavedSongs = (spotifyIds, access_token) => {
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

const regex = /\W|&/gi;
exports.prepareForQuery = (value) => {
	return value.trim().replace(regex, ' ').split(/\s+/).join('+');
};
