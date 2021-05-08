const config = require("../config.json")
const {stripIndents} = require("common-tags")

module.exports = {
    name: "help",
    description: "昶昶機器人說明文檔。",
    arg: true,
    usage: [
        `${config.prefix} help`,
        `${config.prefix} help <command>`
    ],
    execute(client, msg, args) {
        if (args.length === 0) msg.channel.send(stripIndents`
            可用操作：\`${client.commands.keyArray().join("\` \`")}\`
            使用 \`${config.prefix} help <指令>\` 以獲得更多訊息`)
        else {
            if (!client.commands.has(args[0])) msg.channel.send(stripIndents`
                我們不提供${args[0]}的服務喔
                可用操作：\`${client.commands.keyArray().join("\` \`")}\`
            `)
            else {
                const desc = client.commands.get(args[0]).description
                let usg = client.commands.get(args[0]).usage, cnt = stripIndents`
                    ${typeof desc === "string" ? desc : desc(client)}
                    
                    使用方式：`
                if (typeof usg === "string") cnt += `\`${usg}\``
                else cnt += `\n\`${usg.join("\`\n\`")}\``
                msg.channel.send(cnt)
            }
        }
    }
}