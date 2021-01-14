const { localStorage } = require("../config/storage.config");
const { executeRefresh } = require("./login.service");

exports.isTokenValid = async (req, res) => {
	try {
		const successMessage = await validateAccessToken();
		return res.status(200).send({ message: successMessage });
	} catch (e) {
		return res.status(e.error).send({ message: e.message });
	}
};

exports.checkAccess = async (req, res, next) => {
	const url = stripTrailingSlash(req.path);
	console.log(url);

	const noAuthPaths = new Set(['/ping', '/login', '/callback', '/refresh']);
	if (!noAuthPaths.has(url)) {
		try {
			const successMessage = await validateAccessToken();
			console.log(successMessage);
		} catch (e) {
			console.error(e);
			return res.status(e.error).send({ message: "Unauthorized" });
		}
	}

	next();
};

const validateAccessToken = async () => {
	if (!localStorage.getItem("access_token")) {
		throw { error: 401, message: "Please login" };
	}

	if (!localStorage.getItem("expiration")) {
		throw { error: 403, message: "Please login again" };
	}

	const expiration = new Date(parseInt(localStorage.getItem("expiration")));
	if (new Date() > expiration) {
		try {
			await executeRefresh();
			return "Token refreshed";
		} catch (e) {
			console.log(e);
			throw { error: 403, message: "Unable to refresh access token, please login again" }
		}
	}

	return "Token found and valid";
};

const stripTrailingSlash = (str) => {
	return str.endsWith('/') ? str.slice(0, -1) : str;
};
