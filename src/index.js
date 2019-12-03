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

module.exports = {
	Yggdrasil: require("./core/Yggdrasil"),
	modules: {
		Controllers: require("./core/modules/Controllers")
	},
	classes: {
		Controller: require("./lib/classes/Controller"),
		Loggable: require("./lib/classes/Loggable"),
		Module: require("./lib/classes/Module")
	}
};
