const { localStorage } = require("../config/storage.config");

exports.isTokenValid = (req, res) => {
    if(!localStorage.getItem("access_token")) {
        return res.status(401).send({message: "Please login"});
    }

    if(!localStorage.getItem("expiration")) {
        return res.status(403).send({message: "Please login again"});
    }

    const expiration = new Date(parseInt(localStorage.getItem("expiration")));
    if(new Date() > expiration) {
        return res.status(403).send({message: "Token expired, please login again"});
    }

    return res.status(200).send({message: "Token found and valid"});
};
