const { MessageEmbed } = require("discord.js")
const utils = require("../utils")
const iconv = require("iconv-lite")
const client = require("../client")

module.exports = {
	name: "says",
	description: "昶語錄：傾聽昶昶的箴言",
	subdesciption: "也可以透過同時包含 **昶** 和 **說 講 話 看 想 覺得** 兩組關鍵字來觸發喔喔",
	usage: [
        `${process.env.PREFIX} says`,
        `${process.env.PREFIX} says <speech_id>`
	],
	async execute(msg, args) {
		try {
			await client.says.update()
			const s = client.says.draw(args[0])
			let title = s.says.format({ username: msg.member.displayName })
			let aut = s.author
			if (Math.random() < 0.002) {
				title = iconv.decode(Buffer.from(s.says), "Shift_JIS")
				aut = iconv.decode(Buffer.from(s.author), "Shift_JIS")
			}
			await msg.channel.send({ embeds: [
				new MessageEmbed({
					title: title,
					color: "#007799",
					footer: { text: `——${aut}` }
				})
			] })
		} catch (e) {
			if (e instanceof utils.InvalidInputError) msg.channel.send(`${e.message}`)
			else throw e
		}
	}
}