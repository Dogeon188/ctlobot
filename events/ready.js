const chalk = require("chalk")
const {readFileSync} = require("fs")

const getGitHeadHash = () => {
	const rev = readFileSync(".git/HEAD").toString().trim()
	if (rev.indexOf(":") === -1) return rev
	else return readFileSync(".git/" + rev.substring(5)).toString().trim()
}

module.exports = {
	name: "message",
	async execute(client) {
		await client.user.setPresence({
			activities: [{
				name: `${process.env.PREFIX} help`,
				type: "LISTENING"
			}]
		})
		client.log("info", `Logged in as ${chalk.blue(client.user.tag)}!`)
		client.log("info", `Git hash: \`${chalk.blue(getGitHeadHash())}\``)
		await client.says.update(true)
		await client.tarot.update(true)
		await client.greet.update(true)
		await client.role.update(true)
	}
}