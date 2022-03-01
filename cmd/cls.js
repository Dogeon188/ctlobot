const { InvalidInputError } = require("../utils")
const { DiscordAPIError } = require("discord.js")
const client = require("../client")

module.exports = {
	name: "cls",
	op: true,
	async execute(msg, args) {
		try {
			const channel = (args.length < 1) ?
				msg.channel :
				(/<#.+>/.test(args[0])) ?
					await client.channels.fetch(args[0].match(/(?<=<#).+(?=>)/)[0]) :
					await client.channels.fetch(args[0])
			if (!channel.isText())
				throw new InvalidInputError(`Provided channel ID \`${args[0]}\` is not a text channel!`)
			channel.messages.fetch({ limit: 100 }).then(async msgs => {
				let deleted = msgs.filter(
					m => m.author.id === client.user.id ||
						m.content.startsWith(process.env.PREFIX + " "))
				await channel.bulkDelete(deleted)
				msg.channel.send(
					`Cleared **${deleted.size}** messages from **${client.user.username}**.`
				).then(m => setTimeout(() => m.delete(), 1000))
			})
		} catch (e) {
			if (e instanceof InvalidInputError) msg.channel.send(e.message)
			if (e instanceof DiscordAPIError) msg.channel.send(`Invalid channel id \`${args[0]}\``)
			else throw e
		}
	}
}