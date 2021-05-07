const config = require("../config.json")
const utils = require("../utils")
const chalk = require("chalk")

module.exports = {
    name: "message",
    once: false,
    execute(client) {
        client.user.setPresence({
            activity: {
                name: `${config.prefix} help`,
                type: "LISTENING"
            }
        })
        client.log("info", `Logged in as ${chalk.blue(client.user.tag)}!`)
        client.log("info", `Git hash: ${utils.getGitHeadHash()}`)
    }
}