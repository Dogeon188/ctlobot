const utils = require("../utils")
const {DiscordAPIError, MessageEmbed} = require("discord.js")

const emojis = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬜"]

module.exports = {
    name: "poll",
    description: "一個簡單的投票功能\n投票類型後面加`?`就可以多一個 **不確定** 的選項",
    arg: true,
    usage: [
        `${process.env.PREFIX} poll <bool|b>(?) <server_id|.> <poll_content>`,
        `${process.env.PREFIX} poll <choice|c>(?) <server_id|.> <poll_content> <choices...>`
    ],
    async execute(client, msg, args) {
        // TODO: count vote, announce result
        const pa = {
            type: args[0], server: args[1], unsure: args[0].endsWith("?"),
            content: args[2], choices: args.slice(3)
        }
        if (pa.unsure) pa.type = pa.type.slice(0, pa.type.length - 1)

        try {
            let cnt = "", emj = []
            const embed = new MessageEmbed()
                .setColor("#b4821e")
                .setFooter(`由 ${msg.author.username} 發起的投票`)
                .setTitle(pa.content)
            switch (pa.type) {
                case "bool":
                case "b":
                    emj = ["✅", "❌"]
                    embed.addField("\u200b", "✅ **贊成**", true)
                    embed.addField("\u200b", "❌ **不贊成**", true)
                    break
                case "choice":
                case "c":
                    if (pa.choices.length > emojis.length)
                        throw new utils.InvalidInputError(`投票選項不能超過 **${emojis.length}** 個！`)
                    cnt = pa.content
                    for (let i = 0; i < pa.choices.length; i++) {
                        embed.addField("\u200b", `${emojis[i]} **${pa.choices[i]}**`, true)
                        emj.push(emojis[i])
                    }
                    break
                default:
                    throw new utils.InvalidInputError(`未知的投票類型：\`${pa.type}\`\n目前支援的有：\`bool\` \`choice\``)
            }
            if (pa.unsure) {
                embed.addField("❔**不確定**", "\u200b", true)
                cnt += "**不確定**按❔"
                emj.push("❔")
            }
            const c = (pa.server === ".") ? msg.channel :
                (/<#.+>/.test(pa.server)) ? await client.channels.fetch(pa.server.match(/(?<=<#).+(?=>)/)[0]) :
                await client.channels.fetch(pa.server)
            if (!c.isText())
                throw new utils.InvalidInputError(`你給的頻道ID \`${pa.server}\` 不是文字頻道欸`)
            if (!c.permissionsFor(client.user).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來我不能在 **<#${c.id}>** 發言呢:cry:`)
            if (!c.permissionsFor(msg.author).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來你不能在 **<#${c.id}>** 發言呢 可憐啊`)
            c.send(embed).then(async m => {
                for (let e of emj) await m.react(e)
            })
        } catch (e) {
            if (e instanceof DiscordAPIError) msg.channel.send(`你給的頻道ID\`${pa.server}\`感覺不像是現存的頻道欸`)
            else if (e instanceof utils.InvalidInputError) msg.channel.send(e.message)
            else throw e
        }
    }
}