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
			console.log("Access Token: ", access_token);
			console.log("Access Token expires in: ", expires_in);

			localStorage.setItem('access_token', access_token);
			let expiration = new Date();
			expiration.setMinutes(expiration.getMinutes() + 59);
			localStorage.setItem('expiration', expiration.getTime())
			localStorage.setItem('refresh_token', refresh_token);

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

			res.redirect('/spotify/#' +	querystring.stringify({access_token: access_token, refresh_token: refresh_token}));
		}

	} catch (error) {
		console.error(error);
		res.redirect('/spotify/#' + querystring.stringify({error: 'invalid_token'}));
	}

};
