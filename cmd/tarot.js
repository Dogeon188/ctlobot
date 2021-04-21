const Discord = require("discord.js")
const bent = require("bent")
const config = require("../config.json")
const {stripIndents} = require("common-tags")
let tarots, lastUpdated = 0

const parseTarot = ctx => {
    const ks = ["tier", "phrase", "desc", "forecast", "response", "author"]
    return Object.fromEntries(ks.map(k => [k, ctx[`gsx$${k}`].$t]))
}

const updateSays = async (client, forceUpdate) => {
    if (!forceUpdate && new Date().getTime() - lastUpdated < 1200000) return
    tarots = (await bent(
        `https://spreadsheets.google.com/feeds/list/${config.sheetSrc.sheetId}/${config.sheetSrc.tarot}/public/values?alt=json`,
        "json")()).feed.entry.map(parseTarot)
    lastUpdated = new Date().getTime()
    client.logger.log("info", `Updated ctlo tarot entries! (Now have ${tarots.length} entries)`)
}

const opCommands = {
    refresh: (c, m, a) => {
        if (a[1] === undefined) return m.channel.send("沒有提供使用者ID！")
        if (a[1] === "all") {
            c.tarotLimit = new Discord.Collection()
            m.channel.send("已重置所有使用者的昶羅牌使用次數！")
            return
        }
        c.tarotLimit.set(a[1], this.useLimit)
        m.channel.send(`已重置 **${a[1]}** 的昶羅牌使用次數！`)
        c.logger.log("info", `Reset user ${a[1]}'s tarot limit.`)
    },
    limit: (c, m, a) => {
        a[1] = +a[1]
        if (isNaN(a[1])) m.channel.send(`每 **${this.cooldown}** 分鐘的昶羅牌使用次數為 **${this.useLimit}** 次。`)
        else {
            this.useLimit = a[1]
            m.channel.send(`成功將每 **${module.exports.cooldown}** 分鐘的昶羅牌使用次數設為 **${a[1]}** 次！`)
            c.logger.log("info", `Set tarot use limit to ${a[1]} times.`)
        }
    },
    cooldown: (c, m, a) => {
        a[1] = +a[1]
        if (isNaN(a[1])) m.channel.send(`冷卻時間為 **${module.exports.cooldown}** 分鐘。`)
        else {
            this.cooldown = +a[1]
            m.channel.send(`成功將冷卻時間設為 **${a[1]}** 分鐘！`)
            c.logger.log("info", `Set tarot cooldown to ${a[1]} minutes.`)
        }
    }
}

module.exports = {
    name: "tarot",
    useLimit: 3,
    cooldown: 10,
    description: mdl => stripIndents`
        昶羅牌：讓昶昶告訴你今天的運勢
        也可以透過同時包含 **昶** 和 **占 卜 運 勢 預 測** 兩組關鍵字來觸發喔喔
        每 **${mdl.cooldown}** 分鐘只能使用 **${mdl.useLimit}** 次
        ||感謝 @佳節 提供素材||`,
    arg: false,
    usage: `${config.prefix} tarot`,
    async execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id) {
            switch (args[0]) {
                case "update": return updateSays(client, true).then(() =>
                    msg.channel.send(`已更新昶羅牌！（目前共有 ${tarots.length} 個條目）`))
                case "refresh": return opCommands.refresh(client, msg, args)
                case "limit": return opCommands.limit(client, msg, args)
                case "cooldown": return opCommands.cooldown(client, msg, args)
            }
        }

        if (client.tarotLimit.has(msg.author.id)) {
            let count = client.tarotLimit.get(msg.author.id)
            if (count >= this.useLimit) {
                msg.channel.send(stripIndents`
                **${msg.member.nickname == null ? msg.author.username : msg.member.nickname
                }**，昶羅牌每 **${this.cooldown}分鐘** 只能使用 **${this.useLimit}** 次！
                使用次數將於 **${
                    this.cooldown * 60 + Math.floor((client.tarotRefreshTime.getTime() - new Date().getTime()) / 1000)
                }** 秒後刷新。
                `)
                return
            }
            client.tarotLimit.set(msg.author.id, count + 1)
        } else client.tarotLimit.set(msg.author.id, 1)

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