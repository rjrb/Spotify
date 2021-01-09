$(document).ready(() => {
    window.spotify = new Spotify();
});

class Spotify {

    constructor() {
        this.baseUrl = "http://localhost:8888/spotify";
        console.log(this.baseUrl);
        this.currentPage = 0;
        this.initialize();
    }

    initialize() {
        $("#load-songs").click(() => this.loadSongs());
        $("#match-songs").click(() => this.matchSongs());
        $("#manual-match").click(() => this.manualMatch());
        $("#register-songs").click(() => this.markSavedSongs());
        $("#button-prev").click(() => this.prevManual());
        $("#button-next").click(() => this.nextManual());

        $.getJSON(`${this.baseUrl}/token`)
            .then(message => {
                console.log(message);
                this.disableButtons(false);
            })
            .catch(err => {
                console.log("No valid token found", err.responseJSON.message, err.status);
                console.error(err);
                this.disableButtons(true);
            })
            .always(() => $("#loading").hide())
        ;
    }

    async loadSongs() {
        if (!confirm("Sure you want to load your music files to the database?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.post(`${this.baseUrl}/load`);
            const fin = new Date();
            alert("Successfully loaded songs into database.\n" + JSON.stringify(data) + "\nElapsed: " + (fin - ini) + "ms");
        } catch (e) {
            console.error(e);
            alert(`Error loading songs`);
        } finally {
            this.changeStatus(false);
        }
    }

    async matchSongs() {
        if (!confirm("Sure you want to match your music database with Spotify?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.post(`${this.baseUrl}/match`);
            const fin = new Date();
            alert("Successfully matched songs with Spotify.\n" + JSON.stringify(data) + "\nElapsed: " + (fin - ini) + "ms");
        } catch (e) {
            console.error(e);
            alert(`Error matching songs`);
        } finally {
            this.changeStatus(false);
        }
    }

    async manualMatch() {
        $('#manual-match-modal').modal('show');
        this.getSongToMatch();
    }

    async getSongToMatch() {
        try {
            this.showLoading(true);

            let songs = await $.getJSON(`${this.baseUrl}/manual/?page=${this.currentPage}&size=1`);
            console.log(songs);

            const song = songs.shift();

            $("#info-id").val(song.id);
            $("#info-artist").text(song.artist);
            $("#info-title").text(song.title);
            $("#info-album").text(song.album);
            $("#info-genre").text(song.genre);
            $("#info-year").text(song.year);

            $("#info-alts").empty();
            song.spotifyAlts.forEach(spotifyAlt => $("#info-alts").append(this.generateListGroupItem(song.id, spotifyAlt)));

        } catch (e) {
            console.error(e);
            alert(`Error finding next song to manually match`);
        } finally {
            this.showLoading(false);
        }
    }

    async setSongMatched(songId, spotifyId) {
        if (!confirm("Sure you want to mark as matched this song?")) {
            return;
        }
        console.log(songId, spotifyId);
        
        try {

            this.showLoading(true);
    
            const body = { spotifyId: spotifyId };
            console.log(songId, body);

            await $.ajax({
                type: "PATCH",
                url: `${this.baseUrl}/songs/${songId}`,
                data: JSON.stringify(body),
                contentType: "application/json"
            });

            $("#result-message").text("Match saved");
            $('.toast').toast('show');

            this.nextManual();

        } catch (e) {
            console.error(e);
            alert(`Error setting manual match for song ${songId}`);
        } finally {
            this.showLoading(false);
        }
    }

    async prevManual() {
        if (this.currentPage <= 0) {
            return;
        }
        this.currentPage--;
        this.getSongToMatch();
    }

    async nextManual() {
        this.currentPage++;
        this.getSongToMatch();
    }

    async markSavedSongs() {
        if (!confirm("Sure you want to mark as saved your matched songs in Spotify?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.post(`${this.baseUrl}/save`);
            const fin = new Date();
            alert("Successfully marked saved songs in Spotify.\n" + JSON.stringify(data) + "\nElapsed: " + (fin - ini) + "ms");
        } catch (e) {
            console.error(e);
            alert(`Error marking songs as saved`);
        } finally {
            this.changeStatus(false);
        }
    }

    changeStatus(inProcess) {
        this.showLoading(inProcess);
        this.disableButtons(inProcess)
    }

    showLoading(state) {
        if (state) {
            $("#loading").show();
        } else {
            $("#loading").hide();
        }
    }

    disableButtons(disable) {
        $("#load-songs").prop('disabled', disable);
        $("#match-songs").prop('disabled', disable);
        $("#register-songs").prop('disabled', disable);
    }

    generateListGroupItem(songId, spotifyInfo) {
        return `
            <button type="button" class="list-group-item list-group-item-action" onclick="window.spotify.setSongMatched('${songId}', '${spotifyInfo.id}')">
                <div class="container">
                    <dl class="row">
                        <dt class="col-sm-2">Artist:</dt><dd class="col-sm-10">${spotifyInfo.artist}</dd>
                        <dt class="col-sm-2">Title:</dt><dd class="col-sm-10">${spotifyInfo.title}</dd>
                        <dt class="col-sm-2">Album:</dt><dd class="col-sm-10">${spotifyInfo.album}</dd>
                        <dt class="col-sm-2">Year:</dt><dd class="col-sm-10">${spotifyInfo.year}</dd>
                    </dl>
                </div>
            </button>
        `;
    }

}
