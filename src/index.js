let dotenvPath;

switch (process.env.NODE_ENV) {
	case "test":
		console.log("Loaded env TEST");
		dotenvPath = "../.env.test";
		break;
	case "prod":
	case "production":
		console.log("Loaded env PROD");
		dotenvPath = "../.env";
		break;
	default:
		console.log("Loaded env DEV");
		dotenvPath = "../.env.development";
		break;
}
require("dotenv").config({
	path: require("path").resolve(__dirname, dotenvPath)
});

module.exports = require("./core/Yggdrasil");
