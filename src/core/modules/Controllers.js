const fs = require("fs");
const path = require("path");

const Module = require("../../lib/classes/Module");
const PROJECT = require("../Yggdrasil").project;

const MODULE_NAME = `${PROJECT}.controllers`;

class Controllers extends Module {
	/**
	 *
	 * @param {ControllersModuleOptions} options
	 * @param {string} context Module key to log and store in data structure
	 */
	constructor(options, context = MODULE_NAME) {
		super(context);
		/* Load controllers into module */
		/**
		 * @type {ControllersHolder} Local where external controllers are stored
		 */
		this.controllers = loadControllers(
			path.resolve(options.controllersDir)
		);
	}

	attach(yggApp) {
		attachControllers(this.controllers, yggApp);
		return super.attach(yggApp);
	}

	async onInit() {
		this.yggApp.controllers = Object.assign(
			this.yggApp.controllers || {},
			this.controllers
		);
		const processAll = Promise.all(
			Object.values(this.controllers).map(async controlller =>
				controlller.onInit()
			)
		);
		await processAll;
	}

	async onReady() {
		const processAll = Promise.all(
			Object.values(this.controllers).map(async controlller =>
				controlller.onReady()
			)
		);
		await processAll;
	}
}

/**
 *
 * @param {string} controllersDir
 * @param {string} prefix Some prefix to append on controller name
 */
function loadControllers(controllersDir, prefix = "") {
	/** @type {ControllersHolder} */
	const modules = {};

	if (fs.existsSync(controllersDir)) {
		for (const controller of fs.readdirSync(controllersDir)) {
			const filePath = path.join(controllersDir, controller);
			const ctrlName = prefix.concat(
				path.basename(controller, path.extname(controller))
			);
			if (fs.lstatSync(filePath).isDirectory()) {
				Object.assign(
					modules,
					loadControllers(filePath, ctrlName.concat("."))
				);
			} else if (path.extname(filePath) === ".js") {
				const ControllerClass = require(filePath);
				modules[ctrlName] = new ControllerClass(ctrlName);
			}
		}
	} else {
		throw new Error("Specified directory does not exist");
	}
	return modules;
}

/**
 *
 * @param {ControllersHolder} holder
 * @param {Object} yggApp
 */
function attachControllers(holder, yggApp) {
	Object.values(holder).forEach(controller => controller.attach(yggApp));
}

/**
 *  @typedef {Object} ControllersModuleOptions
	@property {string} controllersDir Absolute path of the folder containing controllers
 */

/**
 * @typedef {import("../../lib/classes/Controller.js")} Controller
 * @typedef {typeof import("../../lib/classes/Controller.js")} ControllerType
 * @typedef {Object<string,Controller>} ControllersHolder
 */

module.exports = Controllers;
