const config = require("../config.json")
const Discord = require("discord.js")

module.exports = {
    name: "poll",
    description: "一個簡單的投票功能，目前只開放管理員使用",
    arg: true,
    usage: [
        `${config.prefix} poll <bool|b> <server_id> <poll_content>`,
        `${config.prefix} poll <choice|c> <server_id> <poll_content> <choices...>`
    ],
    execute(client, msg, args) {
        // TODO: end time, count vote, announce result

        if (!msg.member.hasPermission("ADMINISTRATOR")) throw new Error("Permission denied.")

        const pa = {
            type: args[0], server: args[1],
            content: args[2], choices: args.slice(3)
        }

        let cnt = "", emj = []
        switch (pa.type) {
            case "bool":
            case "b":
                cnt = `${pa.content}\n贊成按:o: 不贊成按:x:`
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
                throw new Error(`Unexpected type of poll ${pa.type}!`)
        }
        client.channels.fetch(pa.server).then(c => {
            if (!(c instanceof Discord.TextChannel))
                throw new Error(`Provided channel ID \`${pa.server}\` is not a text channel!`)
            c.send(cnt).then(m => {
                for (let e of emj) m.react(e)
            })
        })
    }
}