const dbService = require("../service/db.service");
const matchUseCase = require("../usecase/match.usecase");
const { localStorage } = require("../config/storage.config");
const { CompareInfo } = require('../model/compare.model');
const { TrackInfo } = require('../model/track.model');


exports.getSongsToManuallyValidate = async (query) => {
	let songs = await dbService.findSongsToManuallyValidate(query);

	let { totalItems, currentPage, totalPages, size } = songs;
	console.log(totalItems, currentPage, totalPages, size);

	songs.items = songs.items.map(song => new CompareInfo(song.id, song.artist, song.title, song.album, song.genre, song.year, JSON.parse(song.spotifyAlts)));
	localStorage.setItem("last_page_visited", currentPage);

	return songs;
};

exports.setMatchedSong = async (songId, spotifyId) => {
	await dbService.setMatched(songId, spotifyId);
};

exports.searchSong = async (query) => {
	if (!localStorage.getItem("access_token")) {
		throw "You must login first";
	}

	const song = new TrackInfo(query.id, query.artist, query.title, query.album, null);
	return await matchUseCase.getSongMetadataFromSpotify(song);
};

exports.getLastPageVisited = () => {
	if (!localStorage.getItem("last_page_visited")) {
		return 0;
	}

	return +localStorage.getItem("last_page_visited");
};
