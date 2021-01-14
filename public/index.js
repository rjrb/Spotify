$(document).ready(() => {
    window.spotify = new Spotify();
});

class Spotify {

    constructor() {
        this.baseUrl = "http://localhost:8888/spotify";
        console.log(this.baseUrl);
        this.currentPage = 0;
        this.totalPages = Number.POSITIVE_INFINITY;
        this.initialize();
    }

    initialize() {
        $("#load-songs").click(() => this.loadSongs());
        $("#match-songs").click(() => this.matchSongs());
        $("#manual-match").click(() => this.manualMatch());
        $("#register-songs").click(() => this.markSavedSongs());
        $("#create-playlist").click(() => this.createPlaylist());
        $("#button-prev").click(() => this.prevManual());
        $("#button-next").click(() => this.nextManual());
        $("#button-search").click(() => this.manualSearch());

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

        $.getJSON(`${this.baseUrl}/genres`)
            .then(genres => {
                console.log(genres);
                genres.forEach(genre => {
                    $("#list-genres").append($('<option></option>').attr('value', genre).text(genre));
                });
            })
            .catch(err => {
                console.log("Error fetching genres", err.responseJSON.message, err.status);
                console.error(err);
            })
        ;

        $('#search-artist, #search-title, #search-album').keyup(e => {
            if(e.keyCode === 13) {
                this.manualSearch();
                e.preventDefault();
            }
        });

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

            let page = await $.getJSON(`${this.baseUrl}/manual/?page=${this.currentPage}&size=1`);
            this.currentPage = page.currentPage;
            this.totalPages = page.totalPages;
            
            const song = page.items.shift();
            console.log(song);

            $("#info-id").val(song.id);
            $("#info-artist").text(song.artist);
            $("#search-artist").val(song.artist);
            $("#info-title").text(song.title);
            $("#search-title").val(song.title);
            $("#info-album").text(song.album);
            $("#search-album").val(song.album);
            $("#info-genre").text(song.genre);
            $("#info-year").text(song.year);

            $("#info-status").text(`${+this.currentPage + 1} / ${this.totalPages}`);

            $("#info-alts").empty();
            if(!song.spotifyAlts) {
                return;
            }
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
        
        try {

            this.showLoading(true);
    
            const body = { spotifyId: spotifyId };

            await $.ajax({
                type: "PATCH",
                url: `${this.baseUrl}/songs/${songId}`,
                data: JSON.stringify(body),
                contentType: "application/json"
            });

            $("#result-message").text("Match saved");
            $('.toast').toast('show');

            this.getSongToMatch();

        } catch (e) {
            console.error(e);
            alert(`Error setting manual match for song ${songId}`);
        } finally {
            this.showLoading(false);
        }
    }

    async prevManual() {
        if (this.currentPage <= 0) {
            this.currentPage = this.totalPages;
        }
        this.currentPage--;
        this.getSongToMatch();
    }

    async nextManual() {
        if(this.currentPage >= this.totalPages - 1) {
            this.currentPage = -1;
        }
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

    async playSong(spotifyId) {
        $.post(`${this.baseUrl}/play/${spotifyId}`)
            .then(() => console.log(`Play song request successful for ${spotifyId}`))
            .catch(error => {
                console.log(error);
                alert(`${error.responseJSON.message}`);
            })
        ;
    }

    async manualSearch() {
        const songId = $("#info-id").val();
        const artist = $("#search-artist").val();
        const title = $("#search-title").val();
        const album = $("#search-album").val();

        const urlParams = new URLSearchParams();
        urlParams.append("songId", songId);
        urlParams.append("artist", artist);
        urlParams.append("title", title);
        urlParams.append("album", album);

        this.showLoading(true);
        $.getJSON(`${this.baseUrl}/search?${urlParams.toString()}`)
            .then(response => {
                console.log(response);
                $("#info-alts").empty();
                response.forEach(spotifyAlt => $("#info-alts").append(this.generateListGroupItem(songId, spotifyAlt)));
                $('#manual-match-modal').modal('handleUpdate');
            })
            .catch(error => {
                console.log(error);
                alert(`${error.responseJSON.message}`);
            })
            .always(() => 
                this.showLoading(false)
            )
        ;
    }

    async createPlaylist() {
        const genre = $("#list-genres").val();
        if (!confirm(`Sure you want to create a playlist for the genre ${genre} in Spotify?`)) {
            return;
        }

        const body = {
            name: genre,
            description: `Playlist for genre ${genre}`
        };
        console.log(body);

        this.changeStatus(true);
        $.ajax({
                type: "POST",
                url: `${this.baseUrl}/playlist`,
                data: JSON.stringify(body),
                contentType: "application/json"
            })
            .then(response => {
                console.log(response);
                alert(`${response.message}`);
            })
            .catch(error => {
                console.log(error);
                alert(`${error.message}`);
            })
            .always(() => 
                this.changeStatus(false)
            )
        ;
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
        $("#manual-match").prop('disabled', disable);
        $("#register-songs").prop('disabled', disable);
    }

    generateListGroupItem(songId, spotifyInfo) {
        return `
            <div class="list-group-item list-group-item-action" >
                <div class="container">
                    <div class="row">
                        <div class="col-sm-9">
                            <dl class="row">
                                <dt class="col-sm-2">Artist:</dt><dd class="col-sm-10">${spotifyInfo.artist}</dd>
                                <dt class="col-sm-2">Title:</dt><dd class="col-sm-10">${spotifyInfo.title}</dd>
                                <dt class="col-sm-2">Album:</dt><dd class="col-sm-10">${spotifyInfo.album}</dd>
                                <dt class="col-sm-2">Year:</dt><dd class="col-sm-10">${spotifyInfo.year}</dd>
                            </dl>
                        </div>
                        <div class="col-sm-3 d-dlex flex-column align-items-center h-100">
                            <button class="btn btn-primary btn-block" onclick="window.spotify.setSongMatched('${songId}', '${spotifyInfo.id}')">
                                <em class="fas fa-check mr-2"></em>
                                Match
                            </button>
                            <button class="btn btn-outline-info btn-block" onclick="window.spotify.playSong('${spotifyInfo.id}')">
                                <em class="fas fa-play mr-2 "></em>
                                Play
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}
