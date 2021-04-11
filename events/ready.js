const chalk = require("chalk")

module.exports = {
    name: "message",
    once: false,
    execute(client) {
        client.user.setPresence({
            activity: {
                name: "/ctlo help",
                type: "LISTENING"
            }
        })
        client.logger.log("info", `Logged in as ${chalk.blue(client.user.tag)}!`)
    }
}