const utils = require("../utils")
const {stripIndents} = require("common-tags")

parseArgs = (msg) => {
    let args = msg.content.slice(process.env.PREFIX.length).trim()
        .match(/((?<!\\)".*?(?<!\\)"|\S+)/g)
    if (args === null) throw new Error("No command provided!")
    args.forEach((t, i, a) => {
            if (t[0] === '"') a[i] = t.slice(1, -1)
            a[i] = a[i].replace('\\"', '"')
        })
    return [args.shift().toLowerCase(), args]
}

module.exports = {
    name: "message",
    once: false,
    execute(client, msg) {
        try {
            if (msg.author.bot) return
            if (msg.content.startsWith(process.env.PREFIX + " ")) {
                const [cmdName, args] = parseArgs(msg)
                if (msg.author.id === process.env.DOGEON) {
                    if (client.op.has(cmdName)) return client.op.get(cmdName).execute(client, msg, args)
                }
                if (!client.commands.has(cmdName)) {
                    msg.channel.send(stripIndents`
                        我不知道你想表達什麼喔
                        可用操作：\`${client.commands.keyArray().join(" ")}\`
                        使用 \`${process.env.PREFIX} help\` 以獲得更多訊息
                    `)
                } else {
                    msg.channel.startTyping()
                    client.commands.get(cmdName).execute(client, msg, args)
                        .then(() => msg.channel.stopTyping(true))
                        .catch(e => {
                            msg.channel.stopTyping(true)
                            throw e
                        })
                }
            } else if (/昶|林小姐|敦紀|淳華/.test(msg.content) && !process.env.IS_BETA) {
                let ctloCmd
                if (/[早午晚]安/.test(msg.content)) ctloCmd = "greet"
                else if (/[占卜運勢預測塔羅]/.test(msg.content)) ctloCmd = "tarot"
                else if (/需要|缺乏/.test(msg.content)) ctloCmd = "lack"
                else if (/[說講話看想]|覺得/.test(msg.content)) ctloCmd = "says"
                if (ctloCmd !== undefined) {
                    msg.channel.startTyping()
                    client.commands.get(ctloCmd).execute(client, msg, [])
                        .then(() => msg.channel.stopTyping(true))
                        .catch(e => {
                            msg.channel.stopTyping(true)
                            throw e
                        })
                }
            }
        } catch (e) {
            if (e instanceof utils.InvalidInputError) msg.channel.send(e.message)
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