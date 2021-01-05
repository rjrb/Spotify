$(document).ready(() => {
    new Spotify();
});

class Spotify {

    constructor() {
        this.baseUrl = "http://localhost:8888/spotify";
        console.log(this.baseUrl);
        this.initialize();
    }

    initialize() {
        $("#loading").hide();

        $("#load-songs").click(() => this.loadSongs());
        $("#match-songs").click(() => this.matchSongs());
        $("#register-songs").click(() => this.markSavedSongs());

        $.getJSON(`${this.baseUrl}/token`)
            .then(message => {
                console.log(message);
            })
            .catch(err => {
                console.log("No valid token found", err.responseJSON.message, err.status);
                console.error(err);
            })
        ;
    }

    async loadSongs() {
        if(!confirm("Sure you want to load your music files to the database?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.getJSON(`${this.baseUrl}/load`);
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
        if(!confirm("Sure you want to match your music database with Spotify?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.getJSON(`${this.baseUrl}/match`);
            const fin = new Date();
            alert("Successfully matched songs with Spotify.\n" + JSON.stringify(data) + "\nElapsed: " + (fin - ini) + "ms");
        } catch (e) {
            console.error(e);
            alert(`Error matching songs`);
        } finally {
            this.changeStatus(false);
        }
    }

    async markSavedSongs() {
        if(!confirm("Sure you want to mark as saved your matched songs in Spotify?")) {
            return;
        }

        const ini = new Date();
        this.changeStatus(true);
        try {
            let data = await $.getJSON(`${this.baseUrl}/save`);
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
        $("#loading").toggle();
        $("#load-songs").prop('disabled', inProcess);
        $("#match-songs").prop('disabled', inProcess);
        $("#register-songs").prop('disabled', inProcess);
    }

}
