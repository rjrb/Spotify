class CompareInfo {
	constructor(id, artist, title, album, year, spotifyAlts) {
		this.id = id;
		this.artist = artist;
		this.title = title;
		this.album = album;
        this.year = year;
        this.spotifyAlts = spotifyAlts;
	}
}
module.exports = {
	CompareInfo: CompareInfo
};
