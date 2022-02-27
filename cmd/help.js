const { MessageEmbed } = require("discord.js")
const client = require("../client")

module.exports = {
	name: "help",
	description: "昶昶機器人幫助文檔。",
	usage: [`${process.env.PREFIX} help [<command>]`],
	async execute(msg, args) {
		if (args.length === 0) return msg.channel.send({ embeds: [ client.helpEmbed ] })
		if (!client.commands.has(args[0]))
			return msg.channel.send({
				content: `我們不提供 \`${args[0]}\` 的服務喔 確認一下你要幹嘛吧`,
				embeds: [ client.helpEmbed ]
			})
		let cmd = client.commands.get(args[0])
		msg.channel.send({ embeds: [
			new MessageEmbed({
				author: {
					name: `${process.env.PREFIX} ${args[0]}`,
					iconURL: client.iconURL
				},
				color: "#36ad3e"
			})
				.addField("說明", cmd.description + "\n" + (cmd.subdescription ?? ""))
				.addField("使用方式", "```md\n" + cmd.usage.join("\n") + "```")
		] })
	}
}