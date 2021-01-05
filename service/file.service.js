const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

exports.readDirectory = () => {
	const directory = path.join(process.env.FILES_PATH);
	console.log(`Examining path ${directory}`);

	return new Promise((resolve, reject) => {
		fs.readdir(directory, (err, files) => {
			if (err) {
				reject(err);
			} else {
				let audioFiles = files.filter(file => file.split('.').pop() == "mp3").map(file => path.join(directory, file));
				console.log(`Found ${audioFiles.length} MP3 files`);
				resolve(audioFiles);
			}
		});
	});
};

exports.parseFiles = (audioFiles, metadataList) => {
	const audioFile = audioFiles.shift();
	if (audioFile) {
		return mm.parseFile(audioFile).then(metadata => {
			console.log(`Artist: ${metadata.common.artist} - Title: ${metadata.common.title} - Genre: ${metadata.common.genre} - Track: ${JSON.stringify(metadata.common.track)}`);
			metadataList.push(metadata);
			return this.parseFiles(audioFiles, metadataList);
		});
	}
	return metadataList;
};
