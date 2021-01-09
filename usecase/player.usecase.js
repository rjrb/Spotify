const spotifyService = require("../service/spotify.service");
const { localStorage } = require("../config/storage.config");

exports.playSong = async (spotifyId) => {
	if (!localStorage.getItem("access_token")) {
		throw "You must login first";
	}

	const access_token = localStorage.getItem("access_token")
	await spotifyService.playSong(spotifyId, access_token);
};
