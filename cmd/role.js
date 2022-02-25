const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js")
const client = require("../client")

module.exports = {
	name: "role",
	description: "設定自選身份組（本功能僅限310班群使用）",
	subdescription: "因為藍色光頭最多只能夠用兩個身份組，所以特別搞了這個來方便自選",
	usage: [`${process.env.PREFIX} role`],
	async execute(msg) {
		if (msg.guild.id !== "762481400842027018") {
			msg.channel.send("很抱歉，本伺服器不支援此功能！")
			return
		}
		await client.role.update()
		const embed = new MessageEmbed()
			.setTitle("調整身份組")
			.setDescription("按下面的按鈕來開關自己的身份組\n藍色代表你現在擁有這個身份組\n灰色代表你沒有這個身份組")
			.setColor("#4bc722")
		const rows = []
		let i = 5, j = -1
		for (let entry of client.role.entries) {
			if (i >= 5) {
				j++
				i = 0
				rows.push(new MessageActionRow())
			}
			const fetchedRole = await msg.guild.roles.fetch(entry.roleId)
			rows[j].addComponents(new MessageButton({
				label: fetchedRole.name,
				emoji: entry.emoji,
				style: (msg.member.roles.cache.has(entry.roleId) ? "PRIMARY" : "SECONDARY"),
				customId: `ctloRole,${msg.id},${msg.author.id},${entry.roleId},${j},${i}`
			}))
			embed.addField(entry.emoji + " " + fetchedRole.name, entry.desc, true)
			i++
		}
		const sent = await msg.channel.send({embeds: [embed], components: rows})

		const collector = sent.createMessageComponentCollector({
			componentType: "BUTTON",
			time: 30000
		})
		collector.on("collect", i => {
			if (!i.customId.startsWith(`ctloRole,${msg.id},${msg.author.id},`)) return
			if (i.member.id !== msg.author.id) {
				i.deferUpdate()
				msg.channel.send(`<@${i.member.id}> 還想亂調別人身份組啊`).then(m => {
					setTimeout(() => m.delete(), 5000)
				})
				return
			}
			i.deferUpdate()
			collector.resetTimer()
			let [roleId, rowNum, colNum] = i.customId.split(",").slice(3, 6)
			if (i.member.roles.cache.has(roleId)) {
				i.member.roles.remove(roleId)
				sent.components[rowNum].components[colNum].setStyle("SECONDARY")
			} else {
				i.member.roles.add(roleId)
				sent.components[rowNum].components[colNum].setStyle("PRIMARY")
			}
			sent.edit({components: sent.components})
		}).on("end", () => {
			sent.components = [new MessageActionRow().addComponents(
				new MessageButton({
					label: "操作逾時", style: "SECONDARY", disabled: true,
					customId: `ctloRole,${msg.id},${msg.author.id},-1`
				})
			)]
			sent.edit({components: sent.components})
		})
	}
}