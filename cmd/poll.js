const config = require("../config.json")
const utils = require("../utils")
const {DiscordAPIError} = require("discord.js")

module.exports = {
    name: "poll",
    description: "一個簡單的投票功能\n投票類型後面加`?`就可以多一個 **不確定** 的選項",
    arg: true,
    usage: [
        `${config.prefix} poll <bool|b>(?) <server_id> <poll_content>`,
        `${config.prefix} poll <choice|c>(?) <server_id> <poll_content> <choices...>`
    ],
    async execute(client, msg, args) {
        // TODO: count vote, announce result
        const pa = {
            type: args[0], server: args[1], unsure: args[0].endsWith("?"),
            content: args[2], choices: args.slice(3)
        }
        if (pa.unsure) pa.type = pa.type.slice(0, pa.type.length - 1)

        let cnt = "", emj = []
        switch (pa.type) {
            case "bool":
            case "b":
                cnt = `${pa.content}\n**贊成**按✅ **不贊成**按❌ `
                emj = ["✅", "❌"]
                break
            case "choice":
            case "c":
                if (pa.choices.length > 9) throw new Error("Too many choices!")
                cnt = pa.content
                for (let i = 0; i < pa.choices.length; i++) {
                    if (i % 4 === 0) cnt += "\n"
                    cnt += `**${pa.choices[i]}** 按${i}\ufe0f\u20e3    `
                    emj.push(`${i}\ufe0f\u20e3`)
                }
                break
            default:
                throw new utils.InvalidInputError(`未知的投票類型：\`${pa.type}\``)
        }
        if (pa.unsure) {
            cnt += "**不確定**按❔"
            emj.push("❔")
        }
        try {
            const c = await client.channels.fetch(pa.server)
            if (!c.isText())
                throw new utils.InvalidInputError(`你給的頻道ID\`${pa.server}\`不是文字頻道欸`)
            if (!c.permissionsFor(client.user).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來我不能在 **<#${c.id}>** 發言呢QAQ`)
            if (!c.permissionsFor(msg.author).has('SEND_MESSAGES'))
                throw new utils.InvalidInputError(`看來你不能在 **<#${c.id}>** 發言呢 可憐啊`)
            c.send(cnt).then(async m => {
                for (let e of emj) await m.react(e)
            })
        } catch (e) {
            if (e instanceof DiscordAPIError) msg.channel.send(`你給的頻道ID\`${pa.server}\`感覺不像是現存的頻道欸`)
            else if (e instanceof utils.InvalidInputError) msg.channel.send(e.message)
            else throw e
        }
    }
}