const config = require("../config.json")

const {stripIndents} = require("common-tags")
const Discord = require("discord.js")

class SaysIndexError extends Error {}

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過同時包含 **昶** 和 **說 講 話 看 想 覺得** 兩組關鍵字來觸發喔喔
    `,
    arg: true,
    usage: [
        `${config.prefix} says`,
        `${config.prefix} says <speech_id>`
    ],
    execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id && args[0] === "update")
            return client.says.update(client, true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${client.says.entries.length}** 個條目）`))

        client.says.update(client, false).then(() => {
            const s = client.says.entries[(() => {
                if (args.length > 0) {
                    let i = +args[0]
                    if (isNaN(i)) throw new SaysIndexError(`無法將 **${args[0]}** 解析為昶語錄ID！`)
                    if (i > client.says.entries.length)
                        throw new SaysIndexError(`昶語錄只有 **${client.says.entries.length}** 個條目而已，你輸入的 **${i}** 對我來說太大了啊啊啊`)
                    i -= 1
                    if (-client.says.entries.length <= i < 0) return client.says.entries.length + i
                    return i
                }
                return Math.floor(Math.random() * client.says.entries.length)
            })()]
            msg.channel.send(new Discord.MessageEmbed()
                .setTitle(s.says.format({
                    username: msg.member.displayName
                }))
                .setFooter(`——${s.author}，2021`)
                .setColor("#007799"))
        }).catch(e => {
            if (e instanceof SaysIndexError) msg.channel.send(`${e.message}`)
            else {
                msg.channel.send(stripIndents`
                哎呀，看來我這裡出了一點小問題
                麻煩把下面這一串鬼東西發給 <@706352093052665887> 方便他處理
                \`\`\`${e.stack}\`\`\`
                `)
                throw e
            }
        })
    }
}