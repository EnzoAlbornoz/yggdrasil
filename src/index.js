let dotenvPath;

switch (process.env.NODE_ENV) {
	case "test":
		dotenvPath = "../.env.test";
		break;
	case "prod":
	case "production":
		dotenvPath = "../.env";
		break;
	default:
		dotenvPath = "../.env.development";
		break;
}
require("dotenv").config({ path: dotenvPath });

module.exports = require("./core/Yggdrasil");
