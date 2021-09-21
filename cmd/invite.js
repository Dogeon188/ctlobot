const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js")

module.exports = {
	name: "invite",
	description: "昶昶具雞黍 邀我至田家 把我拉到更多的伺服器吧！",
	usage: [`${process.env.PREFIX} invite`],
	async execute(client, msg) {
		msg.channel.send({
			embeds: [
				new MessageEmbed()
					.setThumbnail("https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png")
					.setTitle("把我拉到更多的伺服器吧！")
					.setDescription("想要把我拉到其他的伺服器嗎？\n去找吧，我把邀請連結都放在這裡！")
					.setColor("#c72222")
			],
			components: [new MessageActionRow().addComponents(
				new MessageButton({
					url: `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`,
					label: "邀請連結", style: "LINK"
				}))]
		})
	}
}