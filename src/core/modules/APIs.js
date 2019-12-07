const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const Module = require("../../lib/classes/Module");
const PROJECT = require("../Yggdrasil").project;
const MODULE_NAME = `${PROJECT}.apis`;

const fastify = require("fastify");
const { scanOpenPorts } = require("../../lib/util/netscan");

class APIs extends Module {
	/**
	 *
	 * @param {APIsModuleOptions} options
	 * @param {string} context
	 */
	constructor(options, context = MODULE_NAME) {
		super(context);

		/**
		 * @type {Object.<string,(APIModelHTTP | APIModelService) &
			{
				routeList : APIRoute[],
				app: import("fastify").FastifyInstance}>
			}
			*/
		this.importedRoutes = {};

		// Create App
		options.apiModelList.forEach(apiModel => {
			const routeList = recursiveRequire(
				path.resolve(apiModel.routesDirPath)
			);

			const fastifyOptions = {
				logger: {
					// prettyPrint: true
					stream: wrapsWinstonStream(this, apiModel.name)
				},
				http2: options.useHttp2 !== undefined,
				https: options.useHttp2
					? {
							allowHTTP1: options.useHttp2.allowHttp1,
							key: options.useHttp2.key,
							cert: options.useHttp2.cert
					  }
					: undefined
			};
			const app = fastify(fastifyOptions);

			if (
				apiModel.type === API_TYPES.HTTP &&
				/** @type {APIModelHTTP} */ (apiModel).staticDirPath
			) {
				app.register(require("fastify-static"), {
					root: path.resolve(
						/** @type {APIModelHTTP} */ (apiModel).staticDirPath
					),
					prefix: "/static/"
				});
			}

			if (
				apiModel.type === API_TYPES.HTTP &&
				/** @type {APIModelHTTP} */ (apiModel).viewsDirPath
			) {
				app.register(require("point-of-view"), {
					engine: {
						handlebars: require("handlebars")
					},
					templates: path.resolve(
						/** @type {APIModelHTTP} */ (apiModel).viewsDirPath
					)
				});
			}

			this.importedRoutes[apiModel.name] = {
				...apiModel,
				routeList,
				app
			};
		});
	}

	async onInit() {
		for (const apiModel of Object.values(this.importedRoutes)) {
			apiModel.routeList.forEach(routeModel => {
				routeModel.methods.forEach(methodModel => {
					const ctrl = methodModel.controller;
					const hand = methodModel.handler;
					apiModel.app.route({
						url: routeModel.route,
						method: methodModel.type,
						handler: this.yggApp.controllers[ctrl][hand]
					});
				});
			});

			// Scan if port is open
			let port;
			if (Array.isArray(apiModel.port)) {
				if (/** @type {number[]} */ (apiModel.port).length > 1) {
					port = await scanOpenPorts(
						apiModel.port[0],
						apiModel.port[1]
					);
				} else {
					port = await scanOpenPorts(
						apiModel.port[0],
						apiModel.port[0]
					);
				}
			} else {
				port = await scanOpenPorts(apiModel.port, apiModel.port);
			}

			if (port) {
				// Listen to port
				apiModel.app.listen(port);
			} else {
				this.error(
					"No open port found for {",
					apiModel.name,
					"} on ",
					apiModel.port
				);
			}
		}
	}

	async onReady() {}

	static get apiTypes() {
		return API_TYPES;
	}

	static get httpTypes() {
		return HTTP_TYPES;
	}
}

/**
 * @description This function imports every js file of dirPath
 * into an array via DFS (Deep First Search)
 * @param {string} dirPath Path to directory to import routes
 * @returns {APIRoute[]} Array of API Routes
 */
function recursiveRequire(dirPath) {
	const importedRoutes = [];

	if (fs.lstatSync(dirPath).isDirectory()) {
		fs.readdirSync(dirPath).forEach(file => {
			const filePath = path.join(dirPath, file);
			if (fs.lstatSync(filePath).isDirectory()) {
				importedRoutes.push(...recursiveRequire(filePath));
			} else if (
				path.extname(filePath) === ".js" ||
				path.extname(filePath) === ".json"
			) {
				importedRoutes.push(...require(filePath));
			}
		});
	} else if (
		path.extname(dirPath) === ".js" ||
		path.extname(dirPath) === ".json"
	) {
		importedRoutes.push(...require(dirPath));
	}

	return importedRoutes;
}

/**
 *
 * @param {import("../../lib/classes/Loggable")} loggable
 * @param {string} apiName
 */
function wrapsWinstonStream(loggable, apiName) {
	const logWrap = {};

	function write(jsonData) {
		const { reqId, req, res, responseTime } = JSON.parse(jsonData);
		if (req) {
			logWrap[reqId] = req;
		}
		if (res) {
			loggable.logger.info(
				chalk`{green.bold ${
					logWrap[reqId].url
				}} {gray -- {red ${responseTime.toFixed(2)}} ms}`,
				{
					executor: chalk`{blue.bold ${logWrap[reqId].method}}`,
					context: apiName
				}
			);
			delete logWrap[reqId];
		}
	}

	return Object.create({
		write
	});
}

/**
 * @enum {string}
 */
const API_TYPES = {
	SERVICE: "service",
	HTTP: "http"
};

/**
 * @enum {string}
 * @typedef {import("fastify").HTTPMethod} HTTPMethod
 * @type {Object.<string,HTTPMethod>}
 */
const HTTP_TYPES = {
	GET: "GET",
	HEAD: "HEAD",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	OPTIONS: "OPTIONS",
	PATCH: "PATCH"
};

/**
 * @typedef {Object} APIsModuleOptions
 * @property {Array.<APIModelHTTP|APIModelService>} apiModelList
 * @property {HTTP2Config} [useHttp2]
 *
 * @typedef {Object} HTTP2Config
 * @property {string} key
 * @property {string} cert
 * @property {boolean} allowHttp1
 *
 *
 * @typedef {Object} APIModelService
 * @property {API_TYPES} type
 * @property {number | number[]} port
 * @property {string} routesDirPath
 * @property {string} name
 *
 * @typedef {Object} APIModelHTTP
 * @property {API_TYPES} type
 * @property {number | number[]} port
 * @property {string} routesDirPath
 * @property {string} name
 * @property {string} [viewsDirPath]
 * @property {string} [staticDirPath]
 * @property {Proxy} [proxy]
 * @property {Websocket} [websocket]
 *
 * @typedef {Object} Proxy
 * @property {string} proxyServiceName
 * @property {string} proxyRouteTo
 *
 * @typedef {Object} Websocket
 * @property {string} name
 *
 * @typedef {Object} APIRoute
 * @property {string} route URI of the route
 * @property {APIRouteMethod[]} methods
 *
 * @typedef {Object} APIRouteMethod
 * @property {HTTPMethod} type HTTP Type of request
 * @property {string} controller Controller to handle the request
 * @property {string} handler Function of the controller that will handle the request
 *
 */
module.exports = APIs;
