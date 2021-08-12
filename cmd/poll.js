const utils = require("../utils")
const {DiscordAPIError, MessageEmbed} = require("discord.js")

const emojis = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬜"]

module.exports = {
    name: "poll",
    description: "一個簡單的投票功能\n投票類型後面加`?`就可以多一個 **不確定** 的選項\n投票類型後面加`i`就可以附圖片",
    usage: [
        `${process.env.PREFIX} poll <server_id|.> b(?)(d)(i) <poll_content> <d?desc> <i?img_url>`,
        `${process.env.PREFIX} poll <server_id|.> c(?)(d)(i) <poll_content> <d?desc> <i?img_url> <choices...>`
    ],
    async execute(client, msg, args) {
        // TODO: count vote, announce result
        const pa = {
            server: args[0], type: args[1],
            content: args[2], choices: args.slice(3)
        }

        try {
            let emj = []
            const embed = new MessageEmbed()
                .setColor("#b4821e")
                .setFooter(`由 ${msg.author.username} 發起的投票`)
                .setTitle(pa.content)
            if (pa.type.includes("d")) embed.setDescription(pa.choices.shift())
            if (pa.type.includes("i")) embed.setImage(pa.choices.shift())
            if (pa.type.startsWith("b")) {
                emj = ["✅", "❌"]
                embed.addField("\u200b", "✅ **贊成**", true)
                embed.addField("\u200b", "❌ **不贊成**", true)
            } else if (pa.type.startsWith("c")) {
                if (pa.choices.length > emojis.length)
                    throw new utils.InvalidInputError(`投票選項不能超過 **${emojis.length}** 個！`)
                cnt = pa.content
                for (let i = 0; i < pa.choices.length; i++) {
                    embed.addField("\u200b", `${emojis[i]} **${pa.choices[i]}**`, true)
                    emj.push(emojis[i])
                }
            } else throw new utils.InvalidInputError(`未知的投票類型：\`${pa.type[0]}\`\n目前支援的有：\`b\`是非題 \`c\`選擇題`)
            if (pa.type.includes("?")) {
                embed.addField("\u200b", "❔**不確定**", true)
                emj.push("❔")
            }
            const c = (pa.server === ".") ? msg.channel :
                (/<#.+>/.test(pa.server)) ? await client.channels.fetch(pa.server.match(/(?<=<#).+(?=>)/)[0]) :
                await client.channels.fetch(pa.server)
            if (!c.isText())
                throw new utils.InvalidInputError(`你給的頻道 **<#${pa.server}>** 不是文字頻道欸`)
            if (!c.permissionsFor(client.user).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來我不能在 **<#${c.id}>** 發言呢 :cry:`)
            if (!c.permissionsFor(msg.author).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來你不能在 **<#${c.id}>** 發言呢 可憐啊`)
            c.send({embeds: [embed]}).then(async m => {
                for (let e of emj) await m.react(e)
            })
        } catch (e) {
            if (e instanceof DiscordAPIError) msg.channel.send(`你給的頻道ID\`${pa.server}\`感覺不像是現存的頻道欸`)
            else if (e instanceof utils.InvalidInputError) msg.channel.send(e.message)
            else throw e
        }
    }
}