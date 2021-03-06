const { InvalidInputError } = require("../utils")
const { DiscordAPIError } = require("discord.js")
const client = require("../client")

module.exports = {
	name: "chat",
	op: true,
	async execute(msg, args) {
		try {
			if (args.length < 1) throw new InvalidInputError("Didn't provide channel ID!")
			const channel = (args[0] === ".") ?
				msg.channel :
				(/<#.+>/.test(args[0])) ?
					await client.channels.fetch(args[0].match(/(?<=<#).+(?=>)/)[0]) :
					await client.channels.fetch(args[0])
			if (!channel.isText())
				throw new InvalidInputError(`Provided channel ID \`${args[0]}\` is not a text channel!`)
			channel.send(args[1])
		} catch (e) {
			if (e instanceof InvalidInputError) msg.channel.send(e.message)
			if (e instanceof DiscordAPIError) msg.channel.send(`Invalid channel id \`${args[0]}\``)
			else throw e
		}
	}
}