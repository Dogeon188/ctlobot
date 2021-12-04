const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js")
const {stripIndent} = require("common-tags")

const modRoles = [[
	["794818227590004776", "⛏️"], ["858007694706212924", "🎹"],
	["794818365126344744", "🀄"], ["915987535124107274", "🤖"]
], [
	["915984500356427857", "<:so_oil:829876013731020800>"],
	["915985425963835432", "<:usodarou:851678551094722590>"],
	["857083225988661248", "<:horny:806778679610966046>"]
]]

const rows = async (msg) => {
	let ret = []
	for (let i = 0; i < modRoles.length; i++) {
		let row = new MessageActionRow()
		for (let j = 0; j < modRoles[i].length; j++) {
			let role = modRoles[i][j], fetchedRole = await msg.guild.roles.fetch(role[0])
			row.addComponents(new MessageButton({
				label: fetchedRole.name,
				emoji: role[1],
				style: (msg.member.roles.cache.has(role[0]) ? "PRIMARY" : "SECONDARY"),
				customId: `ctloRole,${msg.id},${msg.author.id},${role[0]},${i},${j}`
			}))
		}
		ret.push(row)
	}
	return ret
}

module.exports = {
	name: "role",
	description: stripIndent`
	因為藍色光頭最多只能夠用兩個身份組，特此弄一個指令來讓各位自行選擇要哪些。
	
	以下是身份組的對應權限：
	\`\`\`
	@礦工 身份組：      可以閱覽 #麥塊討論區
	@雀士 身份組：      可以閱覽 #麻將
	@司機 身分組：      可以閱覽 #公路總局 與 #就是油圖
	@VT豚 身分組：      可以閱覽 #vtuber討論區 與 #就是油圖 
	@動漫宅 身分組：    可以閱覽 #動漫討論 與 #就是油圖 
	@茅昶晶彥 身分組：  可以閱覽 #dc機器人討論區 與 #機器人沙盒
	@自信音遊人 身份組：可以閱覽 #音遊討論區
	\`\`\``,
	usage: [`${process.env.PREFIX} roll`],
	async execute(client, msg) {
		if (msg.guild.id !== "762481400842027018") {
			msg.channel.send("很抱歉，本伺服器不支援此功能！")
			return
		}
		const sent = await msg.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("調整身份組")
					.setDescription("按下面的按鈕來開關自己的身份組")
					.setColor("#4bc722")
			],
			components: await rows(msg)
		})
		const collector = sent.createMessageComponentCollector({
			message: sent,
			componentType: "BUTTON",
			time: 30000
		})
		collector.on("collect", i => {
			if (!i.customId.startsWith(`ctloRole,${msg.id},${msg.author.id},`)) return
			if (i.member.id !== msg.author.id) return
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