const dayjs = require("dayjs");

const timeZonePlugin = require("dayjs-ext/plugin/timeZone");
const dayjsUTC = require("dayjs/plugin/utc");

dayjs.extend(dayjsUTC);
dayjs.extend(timeZonePlugin);

module.exports = dayjs;
