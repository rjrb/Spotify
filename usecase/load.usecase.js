const { persistSong } = require("../service/db.service");
const { readDirectory, parseFiles } = require("../service/file.service");

exports.loadFilesToDatabase = async () => {
	const audioFiles = await readDirectory();
	const metadataList = await parseFiles(audioFiles, []);
	for (const metadata of metadataList) {
		await persistSong(metadata);
	}
	return metadataList.length;
};
