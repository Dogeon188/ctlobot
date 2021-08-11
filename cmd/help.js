const {stripIndents} = require("common-tags")
const {MessageEmbed} = require("discord.js")

module.exports = {
    name: "help",
    description: "昶昶機器人幫助文檔。",
    arg: true,
    usage: [
        `${process.env.PREFIX} help`,
        `${process.env.PREFIX} help <command>`
    ],
    async execute(client, msg, args) {
        if (args.length === 0) {
            const embed = new MessageEmbed()
                .setAuthor("昶昶機器人幫助文檔", "https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png")
                .addField("可用操作", "`" + Array.from(client.commands.keys()).join("`▫️`") + "`")
                .addField("\u200b", `使用 \`${process.env.PREFIX} help <指令>\` 以獲得更多訊息`)

            msg.channel.send({embeds: [embed]})
        }
        else {
            if (!client.commands.has(args[0])) msg.channel.send(stripIndents`
                我們不提供${args[0]}的服務喔
                可用操作：\`${client.commands.keyArray().join("\` \`")}\`
            `)
            else {
                const desc = client.commands.get(args[0]).description
                msg.channel.send({embeds: [
                    new MessageEmbed()
                        .setDescription(typeof desc === "string" ? desc : desc(client))
                        .setAuthor(`${process.env.PREFIX} ${args[0]}`, "https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png")
                        .addField("使用方式", "```" + client.commands.get(args[0]).usage.join("\n") + "```")
                    ]})
            }
        }
    }
}