const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js")

const entriesPerPage = 10

const available = ["says", "tarot", "lack", "greet"]

const getList = (type, client, page) => {
	switch (type) {
	case "says":
	case "lack": {
		let totalPages = Math.ceil(client.says.entries.length / entriesPerPage)
		page %= totalPages
		if (page < 0) page += totalPages
		return new MessageEmbed()
			.setTitle(`${client[type].name}條目列表`)
			.setColor(type === "says" ? "#c90000" : "#00abc9")
			.addField("\u200b",
				client.says.entries.slice(page * entriesPerPage, page * entriesPerPage + entriesPerPage)
					.map((e, i) => `\`${page * entriesPerPage + i + 1}.\` ${e.says} _by ${e.author}_`)
					.join("\n"))
			.setFooter(`第 ${page + 1} / ${totalPages} 頁（共${client.says.entries.length}條）`)
	}
	case "tarot": {
		page %= client.tarot.entries.length
		if (page < 0) page += client.tarot.entries.length
		const embed = client.commands.get("tarot").tarotEmbed(client, null, client.tarot.entries[page])
		let footer = `第 ${page + 1} / ${client.tarot.entries.length} 項`
		if (embed.footer !== null) footer += `・${embed.footer.text}`
		embed.setFooter(footer).setAuthor("昶羅牌條目列表")
		return embed
	}
	case "greet": {
		page %= client.greet.entries.length
		if (page < 0) page += client.greet.entries.length
		const entry = client.greet.entries[page]
		return new MessageEmbed()
			.setTitle("昶問候條目列表")
			.setColor("#059a16")
			.setDescription(`抽中機率 ${(entry.weight / client.greet.weightSum * 100).toFixed(2)} %`)
			.addField("早上", entry.morning, true)
			.addField("中午", entry.evening, true)
			.addField("晚上", entry.night, true)
			.setFooter(`第 ${page + 1} / ${client.greet.entries.length} 條`)
	}
	}
}

const row = id => new MessageActionRow().addComponents(
	new MessageButton({
		label: "10", emoji: "⏪", style: "SECONDARY",
		customId: `ctloList,${id},-10`
	}),
	new MessageButton({
		emoji: "◀️", style: "SECONDARY",
		customId: `ctloList,${id},-1`
	}),
	new MessageButton({
		emoji: "▶️", style: "SECONDARY",
		customId: `ctloList,${id},1`
	}),
	new MessageButton({
		label: "10", emoji: "⏩", style: "SECONDARY",
		customId: `ctloList,${id},10`
	}))

module.exports = {
	name: "list",
	description: "查看 **昶語錄** **昶羅牌** **昶昶缺** **昶問候** 的條目列表",
	usage: [`${process.env.PREFIX} list <says|tarot|lack|greet>`],
	async execute(client, msg, args) {
		if (available.includes(args[0])) {
			const sent = await msg.channel.send({
				embeds: [getList(args[0], client, 0)],
				components: [row(msg.id)]
			})
			sent.page = 0
			const collector = sent.createMessageComponentCollector({
				componentType: "BUTTON",
				time: 30000
			})
			collector.on("collect", i => {
				if (!i.customId.startsWith(`ctloList,${msg.id}`)) return
				i.deferUpdate()
				sent.page += +i.customId.split(",")[2]
				collector.resetTimer()
				sent.edit({embeds: [getList(args[0], client, sent.page)]})
			}).on("end", () => {
				sent.components[0].components.forEach(b => b.setDisabled(true))
				sent.edit({components: sent.components})
			})
		} else msg.channel.send(`窩不知道你要找什麼\n可用：\`${available.join("`▫️`")}\``)
	}
}