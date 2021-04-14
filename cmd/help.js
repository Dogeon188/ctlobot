const {stripIndents} = require("common-tags")
const config = require("../config.json")

module.exports = {
    name: "help",
    description: "昶昶機器人說明文檔",
    arg: true,
    usage: `${config.prefix} help (<command>)`,
    execute(client, msg, args) {
        if (args.length === 0) msg.channel.send(stripIndents`
            可用操作：poll says help
            使用 \`${config.prefix} help <指令>\` 以獲得更多訊息`)
        else {
            if (!client.commands.has(args[0])) msg.channel.send(stripIndents`
                我們不提供${args[0]}的服務喔
                可用操作：poll says help
            `)
            else {
                msg.channel.send(stripIndents`
                    ${client.commands.get(args[0]).description}
                    使用方式：\`${client.commands.get(args[0]).usage}\`
                `)
            }
        }
    }
}