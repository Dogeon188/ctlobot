const {MessageEmbed} = require("discord.js")
const {stripIndents} = require("common-tags")

const tierColors = [0x0772b4, 0x0a9c35, 0x88cb03, 0xffbf00, 0xbb2705]

module.exports = {
	name: "tarot",
	description: stripIndents`
        昶羅牌：讓昶昶告訴你今天的運勢
        也可以透過同時包含 **昶** 和 **占 卜 運 勢 預 測 猜** 兩組關鍵字來觸發喔喔`,
	usage: [`${process.env.PREFIX} tarot`],
	tarotEmbed(client, msg, tarotEntry) {
		const embed = new MessageEmbed()
			.setColor(tierColors[tarotEntry.tier])
			.setAuthor("昶羅牌")
			.setTitle(tarotEntry.phrase.format({
				username: msg === null ? "{username}" : msg.member.displayName
			}))
			.setDescription(`*${tarotEntry.desc}*`)
			.setThumbnail(`https://raw.githubusercontent.com/Dogeon188/ctlobot/master/assets/tarot/tier${tarotEntry.tier}.jpg`)
			.addField("\u200b", "\u200b")
			.addField("可能會發生的事情", "> " + tarotEntry.forecast)
			.addField("應對方式", "> " + tarotEntry.response)
		if (tarotEntry.author !== "") embed.setFooter(`素材提供：${tarotEntry.author}`)
		return embed
	},
	async execute(client, msg) {
		await client.tarot.update(false)
		await msg.channel.send({embeds: [this.tarotEmbed(client, msg, client.tarot.draw())]})
	}
}