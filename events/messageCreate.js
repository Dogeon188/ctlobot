const { InvalidInputError, isOp } = require("../utils")
const { stripIndents } = require("common-tags")
const client = require("../client")

const parseArgs = (msg) => {
	let args = msg.content.slice(process.env.PREFIX.length).trim()
		.match(/((?<!\\)".*?(?<!\\)"|\S+)/g)
	if (args === null) throw new Error("No command provided!")
	args.forEach((t, i, a) => {
		if (t[0] === "\"") a[i] = t.slice(1, -1)
		a[i] = a[i].replace("\\\"", "\"")
	})
	return [ args.shift().toLowerCase(), args ]
} 

module.exports = {
	name: "messageCreate",
	execute(msg) {
		try {
			if (msg.author.bot) return
			if (msg.content.startsWith(process.env.PREFIX + " ")) {
				const [ cmdName, args ] = parseArgs(msg)
				if (isOp(msg.author.id) && client.op.has(cmdName)) {
					msg.channel.sendTyping()
					return client.op.get(cmdName).execute(msg, args)
				}
				if (!client.commands.has(cmdName)) {
					msg.channel.send(`我不知道你想表達什麼喔 用\`${process.env.PREFIX} help\`來確定一下你要幹嘛吧`)
				} else {
					msg.channel.sendTyping()
					client.commands.get(cmdName).execute(msg, args)
				}
			} else if (/昶|林小姐|敦紀|淳華|淑惠/.test(msg.content) && !process.env.IS_BETA) {
				let ctloCmd
				if (/[早午晚]安/.test(msg.content)) ctloCmd = "greet"
				else if (/[占卜運勢預測猜]/.test(msg.content)) ctloCmd = "tarot"
				else if (/[說講話看想]|覺得/.test(msg.content)) ctloCmd = "says"
				if (ctloCmd !== undefined) {
					msg.channel.sendTyping()
					client.commands.get(ctloCmd).execute(msg, [])
				}
			}
		} catch (e) {
			if (e instanceof InvalidInputError) msg.channel.send(e.message)
			else {
				msg.channel.send(stripIndents`
                哎呀，看來我這裡出了一點小問題
                麻煩把下面這一串鬼東西發給 <@706352093052665887> 方便他處理
                \`\`\`${e.stack}\`\`\`
                `)
				throw e
			}
		}
	}
}