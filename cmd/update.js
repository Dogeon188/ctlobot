const client = require("../client")

const updatable = {
	greet: "昶問候", says: "昶語錄", tarot: "昶羅牌",
	role: "310身份組管理", timetable: "曠課表"
}

module.exports = {
	name: "update",
	op: true,
	async execute(msg, args) {
		if (Object.keys(updatable).includes(args[0])) return client[args[0]].update(true).then(() =>
			msg.channel.send(`已更新${updatable[args[0]]}！（目前共有 **${client[args[0]].entries.length}** 個條目）`))
		else msg.channel.send("這東西不能更新欸")
	}
}