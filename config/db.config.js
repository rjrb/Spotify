const { Sequelize, Op, Model, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, '..', 'songs.sqlite')
});

class Song extends Model { }

Song.init({
	id: {
		type: DataTypes.UUID,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true
	},
	artist: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	album: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	genre: {
		type: DataTypes.STRING,
		allowNull: false
	},
	year: {
		type: DataTypes.SMALLINT,
		allowNull: false
	},
	trackNumber: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	spotifyId: {
		type: DataTypes.STRING,
		allowNull: true
	},
	match: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	matched: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	sync: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	synced: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	spotifyAlts: {
		type: DataTypes.TEXT
	}
}, {
	sequelize,
	modelName: 'Song',
	tableName: 'songs',
	indexes: [{ unique: true, fields: ['artist', 'title', 'album'] }, { fields: ['genre'] }, { fields: ['spotifyId'] }]
});
(async () => {
	try {
		await Song.sync({ });
	} catch (e) {
		console.error(e);
	}
})();

module.exports = Song;
