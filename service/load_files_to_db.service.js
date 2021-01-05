const { persistSong } = require("./db.service");
const { readDirectory, parseFiles } = require("./file.service");

exports.loadFilesToDatabase = async () => {
	const audioFiles = await readDirectory();
	const metadataList = await parseFiles(audioFiles, []);
	for (const metadata of metadataList) {
		await persistSong(metadata);
	}
	return metadataList.length;
};
