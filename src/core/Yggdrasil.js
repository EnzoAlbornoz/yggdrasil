const Loggable = require("../classes/Loggable");
const Module = require("../classes/Module");

const PROJECT_NAME = "yggdrasil";
const VERSION = "0.1.0";
const AUTHOR = "Enzo Coelho Albornoz <enzocoelhoalbornoz@gmail.com>";

class Yggdrasil extends Loggable {
	constructor() {
		super(PROJECT_NAME);
		/**
		 * @type {Object.<string,import("../classes/Module")>}
		 */
		this.modules = {};
	}

	static get version() {
		return VERSION;
	}

	static get author() {
		return AUTHOR;
	}

	/**
	 * @description Set the framework to use an specified module
	 * @param {import("../classes/Module.js")} yggdrasilModule Module to use into this instance
	 */
	use(yggdrasilModule) {
		if (yggdrasilModule instanceof Module) {
			const moduleName = yggdrasilModule.constructor.name;
			if (this.modules[moduleName]) {
				throw new Error("Module already in use");
			} else {
				this.modules[moduleName] = yggdrasilModule.attach(this);
			}
		} else {
			throw new Error("Specified parameter is not a Module of Yggdrasil");
		}
	}

	async start() {
		if (this.modules) {
			const modulesOnInit = Object.values(this.modules).map(
				async yggModule => {
					await yggModule.onInit();
				}
			);
			await Promise.all(modulesOnInit);

			const modulesOnReady = Object.values(this.modules).map(
				async yggModule => {
					await yggModule.onReady();
				}
			);
			await Promise.all(modulesOnReady);
		}
	}
}

module.exports = Yggdrasil;
