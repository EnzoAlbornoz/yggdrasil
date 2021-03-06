const { createLogger, transports, format } = require("winston");
const chalk = require("chalk");
const strip = require("strip-ansi");

const caller = require("caller.js");

const dayjs = require("../util/dayjs");

const path = require("path");
/**
 * Class for enable Modules to log
 */
class Loggable {
	/**
	 * Class Constructor
	 * @param {string} context String
	 * representating the class context.
	 * Example: [Yggdrasil.Controllers]
	 */
	constructor(context) {
		/**
		 * @type {string}
		 * @description String representating the class context.
		 */
		this.context = (context || "").toLowerCase();
		/**
		 * @type {import("winston").Logger}
		 * @description Winston logger used on this class
		 */
		this.logger = createLogger({
			level: "debug",
			transports: [
				new transports.Console({
					level: "debug",
					format: format.combine(
						timestampFormat({
							format: "YYYY-MM-DD HH:mm:ss [UTC] Z"
						}),
						format.printf(
							({
								level,
								message,
								timestamp,
								context,
								executor
							}) => {
								switch (level) {
									case "silly":
									case "debug":
										return chalk`{gray [${timestamp}]} {white [${context}]} {magenta [${executor}]} {bold.greenBright ${message}}`;
									case "verbose":
									case "info":
										return chalk`{gray [${timestamp}]} {white [${context}]} {magenta [${executor}]} {bold.cyanBright ${message}}`;
									case "warn":
										return chalk`{gray [${timestamp}]} {white [${context}]} {magenta [${executor}]} {bold.yellowBright ${message}}`;
									case "error":
										return chalk`{gray [${timestamp}]} {white [${context}]} {magenta [${executor}]} {bold.redBright ${message}}`;
								}
							}
						)
					)
				}),
				new transports.File({
					level: "info",
					silent:
						process.env.LOG_ENABLE_OUTPUT.toLowerCase() === "false",
					filename: path.resolve(
						process.cwd(),
						"./temp/logs",
						"yggdrasil.log"
					),
					maxFiles: parseInt(process.env.LOG_OUTPUT_MAXFILES) || 10, // Total of Default 100 MB
					maxsize:
						parseInt(process.env.LOG_OUTPUT_LOGSIZE) || 10 ** 6, // 10 MB
					format: format.combine(
						format.timestamp(),
						stripAnsi(),
						format.json()
					)
				})
			]
		});
	}

	/**
	 * @description Logs a message [Debug Level]
	 * @param {*} message
	 * @param  {...any} optionalMessages
	 */
	async log(message, ...optionalMessages) {
		const chain = caller.getChain();
		let executor = "";
		for (let k = 0; k < chain.length; k++) {
			if (
				chain[k].typeName === this.constructor.name &&
				typeof this[chain[k].methodName] === "function"
			) {
				executor = chain[k].methodName;
				break;
			}
			if (k === chain.length - 1) {
				executor = this.log.name;
			}
		}
		const context = this.context;
		const messages = [message, ...optionalMessages];
		let parsedMessage = "";
		for (let i = 0; i < messages.length; i++) {
			let message = messages[i];

			if (typeof message === "object") {
				message = JSON.stringify(message);
			} else if (typeof message === "function") {
				message = message.toString();
			}

			parsedMessage += "".concat(message, " ");
		}

		this.logger.debug(parsedMessage.trim(), { executor, context });
	}

	/**
	 * @description Logs a message [Info Level]
	 * @param {*} message
	 * @param  {...any} optionalMessages
	 */
	async info(message, ...optionalMessages) {
		const chain = caller.getChain();
		let executor = "";
		for (let k = 0; k < chain.length; k++) {
			if (
				chain[k].typeName === this.constructor.name &&
				typeof this[chain[k].methodName] === "function"
			) {
				executor = chain[k].methodName;
				break;
			}
			if (k === chain.length - 1) {
				executor = this.info.name;
			}
		}
		const context = this.context;
		const messages = [message, ...optionalMessages];
		let parsedMessage = "";
		for (let i = 0; i < messages.length; i++) {
			let message = messages[i];

			if (typeof message === "object") {
				message = JSON.stringify(message);
			} else if (typeof message === "function") {
				message = message.toString();
			}

			parsedMessage += "".concat(message, " ");
		}

		this.logger.info(parsedMessage.trim(), { executor, context });
	}

	/**
	 * @description Logs a message [Warn Level]
	 * @param {*} message
	 * @param  {...any} optionalMessages
	 */
	async warn(message, ...optionalMessages) {
		const chain = caller.getChain();
		let executor = "";
		for (let k = 0; k < chain.length; k++) {
			if (
				chain[k].typeName === this.constructor.name &&
				typeof this[chain[k].methodName] === "function"
			) {
				executor = chain[k].methodName;
				break;
			}
			if (k === chain.length - 1) {
				executor = this.warn.name;
			}
		}
		const context = this.context;
		const messages = [message, ...optionalMessages];
		let parsedMessage = "";
		for (let i = 0; i < messages.length; i++) {
			let message = messages[i];

			if (typeof message === "object") {
				message = JSON.stringify(message);
			} else if (typeof message === "function") {
				message = message.toString();
			}

			parsedMessage += "".concat(message, " ");
		}

		this.logger.warn(parsedMessage.trim(), { executor, context });
	}

	/**
	 * @description Logs a message [Error Level]
	 * @param {*} message
	 * @param  {...any} optionalMessages
	 */
	async error(message, ...optionalMessages) {
		const chain = caller.getChain();
		let executor = "";
		for (let k = 0; k < chain.length; k++) {
			if (
				chain[k].typeName === this.constructor.name &&
				typeof this[chain[k].methodName] === "function"
			) {
				executor = chain[k].methodName;
				break;
			}
			if (k === chain.length - 1) {
				executor = this.error.name;
			}
		}
		const context = this.context;
		const messages = [message, ...optionalMessages];
		let parsedMessage = "";
		for (let i = 0; i < messages.length; i++) {
			let message = messages[i];

			if (typeof message === "object") {
				message = JSON.stringify(message);
			} else if (typeof message === "function") {
				message = message.toString();
			}

			parsedMessage += "".concat(message, " ");
		}

		this.logger.error(parsedMessage.trim(), { executor, context });
	}
}

const timestampFormat = format((info, opts) => {
	// @ts-ignore
	info.timestamp = dayjs().format(opts.format, {
		timeZone: process.env.TZ || "UTC"
	});
	return info;
});

const stripAnsi = format((info, opts) => {
	if (info.message) {
		info.message = strip(info.message);
	}

	if (info.contex) {
		info.contex = strip(info.contex);
	}

	if (info.executor) {
		info.executor = strip(info.executor);
	}

	return info;
});

module.exports = Loggable;
