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
                if (cmdName === "chat" && msg.author.id === config.dogeon.id) {
                    require("../special/chat").execute(client, msg, args)
                }
                else if (!client.commands.has(cmdName)) {
                    msg.channel.send(stripIndents`
                        我不知道你想表達什麼喔
                        可用操作：${[client.commands.keyArray()].join(" ")}
                        使用 \`${config.prefix} help\` 以獲得更多訊息
                    `)
                }
                else client.commands.get(cmdName).execute(client, msg, args)
            } else if (/昶/.test(msg.content) && /[說看講]/.test(msg.content) && !config.isBeta) {
                client.commands.get("says").execute(client, msg, [])
            }
        } catch (e) {
            msg.channel.send(stripIndents`
                ERROR
                \`${e.message}\`
            `)
            throw e
        }
    }
}