const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js")
const client = require("../client")

module.exports = {
	name: "invite",
	description: "昶昶具雞黍 邀我至田家 把我拉到更多的伺服器吧！",
	usage: [`${process.env.PREFIX} invite`],
	async execute(msg) {
		msg.channel.send({
			embeds: [
				new MessageEmbed({
					title: "把我拉到更多的伺服器吧！",
					description: "想要把我拉到其他的伺服器嗎？\n去找吧，我把邀請連結都放在這裡！",
					color: "#c72222",
					thumbnail: client.iconURL
				})
			],
			components: [new MessageActionRow().addComponents(
				new MessageButton({
					url: `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`,
					label: "邀請連結", style: "LINK"
				}))]
		})
	}
}