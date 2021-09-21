const {stripIndents} = require("common-tags")

module.exports = {
	name: "lack",
	description: stripIndents`
        昶昶，我缺乏什麼？
        也可以透過同時包含 **昶** 和 **需要 缺乏** 兩組關鍵字來觸發喔喔
    `,
	usage: [`${process.env.PREFIX} lack`],
	async execute(client, msg) {
		await client.lack.update(false)
		msg.channel.send(`你${Math.random() < 0.5 ? "缺乏" : "需要"}的是${client.lack.draw().text}。`)
	}
}