const Discord = require("discord.js")
const bent = require("bent")
const config = require("../config.json")
const {stripIndents} = require("common-tags")

parseTarot = (ctx) => {
    let tarot = {}
    for (let arg of ctx.split(", ")) {
        arg = arg.split(": ")
        tarot[arg[0]] = arg[1]
    }
    return tarot
}

let tarots, lastUpdated = 0
const updateSays = async (client, forceUpdate) => {
    if (!forceUpdate && new Date().getTime() - lastUpdated < 1200000) return
    tarots = (await bent(
        `https://spreadsheets.google.com/feeds/list/${config.sheetSrc.sheetId}/${config.sheetSrc.tarot}/public/values?alt=json`,
        "json")()).feed.entry.map(e => parseTarot(e.content.$t))
    lastUpdated = new Date().getTime()
    client.logger.log("info", "Updated ctlo tarot entries!")
}

module.exports = {
    name: "tarot",
    description: stripIndents`
        昶羅牌：讓昶昶告訴你今天的運勢
        也可以透過同時包含「昶」和「看|想|覺得」兩組關鍵字來觸發喔喔
        *感謝 @佳節 提供素材*
    `,
    arg: false,
    useLimit: 3,
    cooldown: 10,
    usage: `${config.prefix} tarot`,
    async execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id) {
            if (args[0] === "update") {
                updateSays(client, true).then(() =>
                    msg.channel.send(`已更新昶羅牌！（目前共有 ${tarots.length} 個條目）`))
                return
            } else if (args[0] === "refresh") {
                if (args[1] === "all") {
                    client.tarotLimit = new Discord.Collection()
                    msg.channel.send("已重置所有使用者的昶羅牌使用次數！")
                    return
                }
                client.tarotLimit.set(args[1], this.useLimit)
                msg.channel.send(`已重置 **${args[1]}** 的昶羅牌使用次數！`)
                client.logger.log("info", `Reset user ${args[1]}'s ctlo tarot limit.`)
                return
            }
        }

        if (client.tarotLimit.has(msg.author.id)) {
            let count = client.tarotLimit.get(msg.author.id)
            if (count <= 0) {
                msg.channel.send(stripIndents`
                昶羅牌每 **${this.cooldown}分鐘** 只能使用 **${this.useLimit}** 次！
                使用次數將於 **${
                    this.cooldown * 60 + Math.floor((client.tarotRefreshTime.getTime() - new Date().getTime()) / 1000)
                }** 秒後刷新。
                `)
                return
            }
            client.tarotLimit.set(msg.author.id, count - 1)
        } else client.tarotLimit.set(msg.author.id, this.useLimit - 1)

        updateSays(client, false).then(() => {
            const tarot = tarots[Math.floor(Math.random() * tarots.length)]
            msg.channel.send(new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor("昶羅牌")
                .setTitle(tarot.phrase.format({
                    username: msg.member.nickname == null ? msg.author.username : msg.member.nickname
                }))
                .setDescription(`*${tarot.desc}*`)
                .setThumbnail(`https://raw.githubusercontent.com/Dogeon188/ctlobot/master/assets/tarot/tier${tarot.tier}.jpg`)
                .addField("\u200b", "\u200b")
                .addField("可能會發生的事情", "> " + tarot.forecast)
                .addField("應對方式", "> " + tarot.response)
            )
        })
    }
}