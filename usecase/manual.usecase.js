const dbService = require("../service/db.service");
const { CompareInfo } = require('../model/compare.model');


exports.getSongsToManuallyValidate = async (query) => {
	let songs = await dbService.findSongsToManuallyValidate(query);

	let { totalItems, currentPage, totalPages, size } = songs;
	console.log(totalItems, currentPage, totalPages, size);

	let compareItems = songs.items.map(song => new CompareInfo(song.id, song.artist, song.title, song.album, song.genre, song.year, JSON.parse(song.spotifyAlts)));

	return compareItems;
};

exports.setMatchedSong = async (songId, spotifyId) => {
	await dbService.setMatched(songId, spotifyId);
};
