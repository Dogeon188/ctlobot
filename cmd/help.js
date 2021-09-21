const {MessageEmbed} = require("discord.js")

module.exports = {
	name: "help",
	description: "昶昶機器人幫助文檔。",
	usage: [
		`${process.env.PREFIX} help`,
		`${process.env.PREFIX} help <command>`
	],
	async execute(client, msg, args) {
		if (args.length === 0) msg.channel.send({embeds: [client.helpEmbed]})
		else {
			if (!client.commands.has(args[0]))
				msg.channel.send({content: `我們不提供 \`${args[0]}\` 的服務喔 確認一下你要幹嘛吧`, embeds: [client.helpEmbed]})
			else {
				msg.channel.send({
					embeds: [
						new MessageEmbed()
							.setDescription(client.commands.get(args[0]).description)
							.setAuthor(`${process.env.PREFIX} ${args[0]}`, "https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png")
							.addField("使用方式", "```" + client.commands.get(args[0]).usage.join("\n") + "```")
							.setColor("#36ad3e")
					]
				})
			}
		}
	}
}