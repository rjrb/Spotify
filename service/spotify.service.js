const axios = require('axios');
const querystring = require('querystring');
const { TrackInfo } = require('../model/track.model');
const { SimpleTrackInfo } = require('../model/simple.model');
const isEqual = require('lodash.isequal');

exports.searchSong = (song, access_token) => {
	let urlGet = "https://api.spotify.com/v1/search?" +
		`q=artist:${this.prepareForQuery(song.artist)}+track:${this.prepareForQuery(song.title)}+album:${this.prepareForQuery(song.album)}` +
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
	if(items.length == 0) {
		return [];
	}
	if (items.length > 1 && !this.allItemsSameSong(items)) {
		return items.map(item => this.createTrackInfo(item));
	} else {
		return this.createTrackInfo(items[0]);
	}
};

exports.allItemsSameSong = (items) => {
	return items.map( item => this.createSimpleTrackInfo(item) ).every( (val, i, arr) => isEqual(val, arr[0]) );
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

	const body = {uris: [`spotify:track:${spotifyId}`]};

	return axios.put(urlPut, body, options)
		.then(response => {
			console.log('Play song statusCode:', response && response.status);
			if (response.status != 204) {
				throw "Error playing song"
			}
		})
	;
};

const regexSpecialChars = /\W|&/gi;
const regexAccents = /[\u0300-\u036f]/g;
exports.prepareForQuery = (value) => {
	return value
		.trim()
		.normalize("NFD").replace(regexAccents, "")
		.replace(regexSpecialChars, ' ')
		.split(/\s+/)
		.join('+')
	;
};
