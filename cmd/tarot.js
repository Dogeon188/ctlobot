const {MessageEmbed} = require("discord.js")
const client = require("../client")

const tierColors = [0x0772b4, 0x0a9c35, 0x88cb03, 0xffbf00, 0xbb2705]

module.exports = {
	name: "tarot",
	description: "昶羅牌：讓昶昶告訴你今天的運勢",
    subdescription: "也可以透過同時包含 **昶** 和 **占 卜 運 勢 預 測 猜** 兩組關鍵字來觸發喔喔",
	usage: [`${process.env.PREFIX} tarot`],
	tarotEmbed(msg, tarotEntry) {
		const embed = new MessageEmbed({
			title: tarotEntry.phrase.format({
				username: msg === null ? "`{username}`" : msg.member.displayName
			}),
			author: {name: "昶羅牌"},
			color: tierColors[tarotEntry.tier],
			description: "*" + tarotEntry.desc + "*",
			thumbnail: `https://raw.githubusercontent.com/Dogeon188/ctlobot/master/assets/tarot/tier${tarotEntry.tier}.jpg`,
		})
		.addField("\u200b", "\u200b")
		.addField("可能會發生的事情", "> " + tarotEntry.forecast)
		.addField("應對方式", "> " + tarotEntry.response)
		if (tarotEntry.author !== "") embed.setFooter({text: `素材提供：${tarotEntry.author}`})
		return embed
	},
	async execute(msg) {
		await client.tarot.update()
		await msg.channel.send({embeds: [this.tarotEmbed(msg, client.tarot.draw())]})
	}
}