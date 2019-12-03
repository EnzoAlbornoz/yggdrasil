const Loggable = require("./Loggable");

class Module extends Loggable {
	async onInit() {
		throw new Error("[Abstract Method] Implementation Required");
	}

	async onReady() {
		throw new Error("[Abstract Method] Implementation Required");
	}

	attach(yggApp) {
		// After typescript 3.8 -> Will change to this.#yggApp
		if (this.yggApp) {
			throw new Error("Module already attached");
		}
		this.yggApp = yggApp;
		return this;
	}
}

module.exports = Module;
