const axios = require('axios');
const querystring = require('querystring');
const { localStorage } = require('../config/storage.config');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URL;

exports.generateRandomString = (length) => {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

const stateKey = 'spotify_auth_state';

exports.login = async (req, res) => {
	const state = this.generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	const scope = 'user-read-private user-read-email user-library-modify';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		})
	);
};

exports.callback = async (req, res) => {
	const code = req.query.code || null;
	const state = req.query.state || null;
	const storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
		return;
	}

	res.clearCookie(stateKey);

	const params = new URLSearchParams();
	params.append('code', code);
	params.append('redirect_uri', redirect_uri);
	params.append('grant_type', 'authorization_code');

	const authOptions = {
		headers: {
			'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret, 'utf-8').toString("base64"),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	try {

		let response = await axios.post('https://accounts.spotify.com/api/token', params, authOptions);
		if (response.status == 200) {
			const access_token = response.data.access_token;
			const refresh_token = response.data.refresh_token;
			const expires_in = response.data.expires_in;
			
			let expiration = new Date();
			expiration.setSeconds(expiration.getSeconds() + expires_in);
			localStorage.setItem('access_token', access_token);
			localStorage.setItem('expiration', expiration.getTime())
			localStorage.setItem('refresh_token', refresh_token);
			console.log("Access Token: ", access_token);
			console.log("Access Token expiration: ", expiration);

			const options = {
				url: 'https://api.spotify.com/v1/me',
				headers: { 'Authorization': 'Bearer ' + access_token }
			};

			// use the access token to access the Spotify Web API
			axios.request(options)
				.then(resp => {
					console.log(resp.data);
				})
				.catch(error => {
					res.redirect('/spotify/#' + querystring.stringify({error: 'unable_to_access_user_account'}));
				})
			;

			res.redirect('/spotify/#' +	querystring.stringify({access_token: access_token}));
		}

	} catch (error) {
		console.error(error);
		res.redirect('/spotify/#' + querystring.stringify({error: 'invalid_token'}));
	}

};

exports.refreshToken = async (req, res) => {
	try {
		this.executeRefresh();
		return res.redirect('/spotify/#' +	querystring.stringify({access_token: access_token}));
	} catch (e) {
		console.log(e);
		if(e.name === "no_refresh_token") {
			return res.status(401).send({message: "Please login"});
		} else if (e.name === "failed_to_refresh_token") {
			return res.redirect('/spotify/#' + querystring.stringify({error: 'invalid_refresh_token'}));
		}
	}
};

exports.executeRefresh = async () => {
	if(!localStorage.getItem("refresh_token")) {
		console.log(`No refresh token found. Please login`);
		throw {
			name: "no_refresh_token",
			message: "No refresh token found. Please login"
		};
	}

	console.log(`Attempting to get new access token`);
	const refresh_token = localStorage.getItem("refresh_token");
	const params = new URLSearchParams();
	params.append('refresh_token', refresh_token);
	params.append('grant_type', 'refresh_token');

	const authOptions = {
		headers: {
			'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret, 'utf-8').toString("base64"),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	try {
		let response = await axios.post('https://accounts.spotify.com/api/token', params, authOptions)
		if (response.status == 200) {
			const access_token = response.data.access_token;
			const expires_in = response.data.expires_in;
			
			let expiration = new Date();
			expiration.setSeconds(expiration.getSeconds() + expires_in);
			localStorage.setItem('access_token', access_token);
			localStorage.setItem('expiration', expiration.getTime())
			console.log("Refreshed Access Token: ", access_token);
			console.log("Access Token expiration: ", expiration);
		}
	} catch (e) {
		console.error(e);
		throw {
			name: "failed_to_refresh_token"
		};
	}
};
