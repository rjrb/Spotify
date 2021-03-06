const Song = require('../config/db.config');
const { Op } = require('sequelize');

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
			spotifyAlts: { [Op.is]: null }
		},
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
			spotifyId: { [Op.not]: null },
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

exports.findSongsToManuallyValidate = async (query) => {
	const { page, size, artist, title } = query;
	const limit = size ? +size : 1;
	const offset = page ? +page * limit : 0;

	let condition = {
		match: true,
		matched: false,
		synced: false,
		//		spotifyAlts: { [Op.not]: null },
		genre: { [Op.not]: ['Clásica', 'Classical'] },
	};

	if (artist) {
		condition.artist = { [Op.like]: `%${artist}%` };
	}

	if (title) {
		condition['title'] = { [Op.like]: `%${title}%` };
	}

	const result = await Song.findAndCountAll({
		limit: limit,
		offset: offset,
		where: condition,
		order: [['artist', 'ASC'], ['title', 'ASC']]
	});

	return {
		items: result.rows,
		totalItems: result.count,
		currentPage: page,
		totalPages: Math.ceil(result.count / limit),
		size: size
	};
};

exports.setMatched = (songId, spotifyId) => {
	return Song.update(
		{
			spotifyId: spotifyId,
			matched: true
		},
		{
			where: {
				id: songId
			}
		}
	);
};

exports.getGenres = () => {
	return Song.findAll({
		attributes: ['genre'],
		group: ['genre'],
		order: [['genre', 'ASC']]
	});
};

exports.getSongsByGenre = (genre) => {
	return Song.findAll({
		where: {
			genre: genre,
			matched: true,
			spotifyId: { [Op.not]: null }
		},
		order: [['artist', 'ASC'], ['title', 'ASC']]
	});
};
