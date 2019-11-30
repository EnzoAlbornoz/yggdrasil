const Loggable = require("../classes/Loggable");

const PROJECT_NAME = "yggdrasil";
const VERSION = "0.1.0";
const AUTHOR = "Enzo Coelho Albornoz <enzocoelhoalbornoz@gmail.com>";

class Yggdrasil extends Loggable {
	constructor() {
		super(PROJECT_NAME);
	}

	static get version() {
		return VERSION;
	}

	static get author() {
		return AUTHOR;
	}
}

module.exports = Yggdrasil;
