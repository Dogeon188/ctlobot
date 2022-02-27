const client = require("../client")

module.exports = {
	name: "greet",
	description: "被昶昶大聲問早。",
	subdescription: "也可以透過同時包含 **昶** 和 **早安 午安 晚安** 兩組關鍵字來觸發喔喔",
	usage: [ `${process.env.PREFIX} greet` ],
	async execute(msg) {
		await client.greet.update()
		let t = (new Date().getHours()) % 24, i
		if (t >= 18 || t < 4) i = "night"
		else if (t >= 11 && t < 18) i = "evening"
		else i = "morning"
		msg.channel.send(client.greet.draw()[i])
	}
}