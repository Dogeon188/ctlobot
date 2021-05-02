const config = require("../config.json")
const {stripIndents} = require("common-tags")

const prefix = config.prefix

parseArgs = (msg) => {
    let args = msg.content.slice(prefix.length).trim()
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
            if (msg.content.startsWith(prefix)) {
                const [cmdName, args] = parseArgs(msg)
                if (msg.author.id === config.dogeon.id) {
                    if (cmdName === "chat") return require("../special/chat").execute(client, msg, args)
                    else if (cmdName === "update") return require("../special/update").execute(client, msg, args)
                }
                if (!client.commands.has(cmdName)) {
                    msg.channel.send(stripIndents`
                        我不知道你想表達什麼喔
                        可用操作：\`${client.commands.keyArray().join(" ")}\`
                        使用 \`${config.prefix} help\` 以獲得更多訊息
                    `)
                } else client.commands.get(cmdName).execute(client, msg, args)
            } else if (/昶|林小姐|敦紀|淳華/.test(msg.content) && !config.isBeta) {
                if (/[早午晚]安/.test(msg.content)) client.commands.get("says").execute(client, msg, ["greet"])
                else if (/[占卜運勢預測]/.test(msg.content)) client.commands.get("tarot").execute(client, msg, [])
                else if (/[說講話看想]|覺得/.test(msg.content)) client.commands.get("says").execute(client, msg, [])
            }
        } catch (e) {
            msg.channel.send(stripIndents`
                哎呀，看來我這裡出了一點小問題
                麻煩把下面這一串鬼東西發給 <@706352093052665887> 方便他處理
                \`\`\`${e.stack}\`\`\`
            `)
            throw e
        }
    }
}