const Loggable = require("./Loggable");

class Controller extends Loggable {
	async onInit() {}

	async onReady() {}

	attach(yggApp) {
		// After typescript 3.8 -> Will change to this.#yggApp
		if (this.yggApp) {
			throw new Error("Module already attached");
		}
		this.yggApp = yggApp;
		return this;
	}
}

module.exports = Controller;
