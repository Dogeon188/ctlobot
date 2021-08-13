const {getGitHeadHash} = require("../utils")
const chalk = require("chalk")

module.exports = {
    name: "message",
    once: false,
    async execute(client) {
        await client.user.setPresence({
            activity: {
                name: `${process.env.PREFIX} help`,
                type: "LISTENING"
            }
        })
        client.log("info", `Logged in as ${chalk.blue(client.user.tag)}!`)
        client.log("info", `Git hash: \`${chalk.blue(getGitHeadHash())}\``)
        await client.says.update(true)
        await client.tarot.update(true)
        await client.lack.update(true)
        await client.greet.update(true)
    }
}