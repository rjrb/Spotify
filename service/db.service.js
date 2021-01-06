const Song = require('../config/db.config');

exports.persistSong = (metadata) => {
	return Song.findOrCreate({
		where: {
			artist: metadata.common.artist,
			title: metadata.common.title,
			album: metadata.common.album || null,
		},
		defaults: {
			artist: metadata.common.artist,
			title: metadata.common.title,
			album: metadata.common.album,
			genre: metadata.common.genre.pop() || null,
			year: metadata.common.year,
			trackNumber: metadata.common.track.no,
		}
	})
		.then(song => {
			console.log(`Persisted song: ${song.title}`);
			return song;
		});
};

exports.findSongsToMatch = () => {
	return Song.findAll({
		where: {
			match: true, 
			matched: false, 
			synced: false, 
		}
	});
};

exports.setSpotifyId = (song, item) => {
	if (Array.isArray(item)) {
		song.spotifyAlts = JSON.stringify(item);
	} else {
		song.spotifyAlts = null;
		song.spotifyId = item.id;
		song.matched = true;
	}
	return song.save();
};

exports.findSongsToSync = () => {
	return Song.findAll({
		where: {
			matched: true, 
			sync: true, 
			synced: false
		}
	});
};

exports.setSynced = (spotifyIds) => {
	return Song.update(
		{
			synced: true
		},
		{
			where: {
				spotifyId: spotifyIds
			}
		}
	);
};
