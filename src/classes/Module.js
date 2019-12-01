const Loggable = require("./Loggable");

class Module extends Loggable {
	async onInit() {
		throw new Error("[Abstract Method] Implementation Required");
	}

	async onReady() {
		throw new Error("[Abstract Method] Implementation Required");
	}

	attach(yggRef) {
		// After typescript 3.8 -> Will change to this.#yggref
		if (this.yggRef) {
			throw new Error("Module already attached");
		}
		this.yggRef = yggRef;
		return this;
	}
}

module.exports = Module;
