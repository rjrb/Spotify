const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
require('dotenv').config();

const routes = require('./routes');
const { localStorage } = require('./config/storage.config');

const port = process.env.PORT || 8888;

const app = express();

app
	.use('/spotify', express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser())
	.use(bodyParser.json())
	.use('/spotify', routes)
	.listen(port, () => console.info(`Started server on port ${port}`))
;

console.log(localStorage.getItem("access_token"));
console.log(new Date(parseInt(localStorage.getItem("expiration"))).toLocaleString());

module.exports = app;
