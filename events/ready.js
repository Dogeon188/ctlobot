const chalk = require("chalk")
const {readFileSync} = require("fs")
const client = require("../client")

const getGitHeadHash = () => {
	const rev = readFileSync(".git/HEAD").toString().trim()
	if (rev.indexOf(":") === -1) return rev
	else return readFileSync(".git/" + rev.substring(5)).toString().trim()
}

module.exports = {
	name: "message",
	async execute() {
		client.user.setPresence({
			activities: [{
				name: `${process.env.PREFIX} help`,
				type: "LISTENING"
			}]
		})
		client.log("info", `Logged in as ${chalk.blue(client.user.tag)}!`)
		client.log("info", `Git hash: \`${chalk.blue(getGitHeadHash())}\``)
		client.says.update(true)
		client.tarot.update(true)
		client.greet.update(true)
		client.role.update(true)
		client.timetable.update(true)
	}
}