const Server = require("net").Server;

/**
 *
 * @param {number} rangeInit
 * @param {number} rangeEnd
 */
async function scanOpenPorts(rangeInit, rangeEnd) {
	for (let p = rangeInit; p <= rangeEnd; p++) {
		const { status } = await scanPort(p);
		if (status === PORT_STATUS.OPEN) {
			return p;
		}
	}

	return null;
}

/**
 * @brief Get status of an Port
 * @description Try to create an socket
 * @param {number} port
 */
function scanPort(port) {
	return new Promise((resolve, reject) => {
		if (port < 1024 || port > 49151) {
			reject(
				new Error("Invalid Port - Use an port in range [1024-49151]")
			);
		}
		const server = new Server();
		server.on("error", () =>
			server.close(() => resolve({ status: PORT_STATUS.CLOSED }))
		);

		server.on("listening", () =>
			server.close(() => resolve({ status: PORT_STATUS.OPEN }))
		);

		server.listen(port);
	});
}

/**
 * @enum {string}
 */
const PORT_STATUS = {
	OPEN: "open",
	CLOSED: "closed"
};

module.exports = {
	scanOpenPorts,
	scanPort,
	PORT_STATUS
};
