const Loggable = require("../lib/classes/Loggable");
const Module = require("../lib/classes/Module");

const PROJECT_NAME = "yggdrasil";
const VERSION = "0.1.0";
const AUTHOR = "Enzo Coelho Albornoz <enzocoelhoalbornoz@gmail.com>";

class Yggdrasil extends Loggable {
	constructor() {
		super(PROJECT_NAME);
		/**
		 * @type {Object.<string,import("../lib/classes/Module")>}
		 * @description Local where framework modules are stored
		 */
		this.modules = {};
		/**
		 * @type {Object}
		 * @description Interface object where modules communicate
		 */
		this.app = {};
	}

	static get version() {
		return VERSION;
	}

	static get author() {
		return AUTHOR;
	}

	static get project() {
		return PROJECT_NAME;
	}

	/**
	 * @description Set the framework to use an specified module
	 * @param {import("../lib/classes/Module.js")} yggdrasilModule Module to use into this instance
	 */
	use(yggdrasilModule) {
		if (yggdrasilModule instanceof Module) {
			const moduleName = yggdrasilModule.constructor.name;
			if (this.modules[moduleName]) {
				throw new Error("Module already in use");
			} else {
				this.modules[moduleName] = yggdrasilModule.attach(this.app);
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
