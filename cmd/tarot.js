const Discord = require("discord.js")
const chalk = require("chalk")
const {stripIndents} = require("common-tags")

const ops = {
    refresh: (c, m, a) => {
        if (a[1] === undefined) return m.channel.send("沒有提供使用者ID！")
        if (a[1] === "all") {
            c.tarot.limit = new Discord.Collection()
            m.channel.send("已重置所有使用者的昶羅牌使用次數！")
            c.log("info", "Reset everyone's tarot limit.")
            return
        }
        c.tarot.limit.delete(a[1])
        m.channel.send(`已重置 **${a[1]}** 的昶羅牌使用次數！`)
        c.log("info", `Reset user ${chalk.blue.bold(a[1])}'s tarot limit.`)
    },
    limit: (c, m, a) => {
        a[1] = +a[1]
        if (isNaN(a[1])) {
            if (c.tarot.useLimit !== -1) m.channel.send(`每小時的昶羅牌使用次數為 **${c.tarot.useLimit}** 次。`)
            else m.channel.send("昶羅牌使用次數沒有限制！")
        }
        else {
            c.tarot.useLimit = a[1]
            if (a[1] === -1) {
                m.channel.send(`已成功關閉昶羅牌使用次數限制！`)
                c.log("info", "Turned off tarot use limit.")
            } else {
                m.channel.send(`成功將每小時的昶羅牌使用次數設為 **${c.tarot.useLimit}** 次！`)
                c.log("info", `Set tarot use limit to ${chalk.blue.bold(c.tarot.useLimit)} times.`)
            }
        }
    }
}

module.exports = {
    name: "tarot",
    description(client) {
        let s = stripIndents`
        昶羅牌：讓昶昶告訴你今天的運勢
        也可以透過同時包含 **昶** 和 **占 卜 運 勢 預 測 塔 羅** 兩組關鍵字來觸發喔喔`
        if (client.tarot.useLimit !== -1) s += `\n每小時只能使用 **${client.tarot.useLimit}** 次`
        return s
    },
    arg: false,
    usage: `${process.env.PREFIX} tarot`,
    tarotEmbed(client, msg, tarotEntry) {
        const embed = new Discord.MessageEmbed()
            .setColor(client.tarot.tierColor[tarotEntry.tier])
            .setAuthor("昶羅牌")
            .setTitle(tarotEntry.phrase.format({
                username: msg === null ? "{username}" : msg.member.displayName
            }))
            .setDescription(`*${tarotEntry.desc}*`)
            .setThumbnail(`https://raw.githubusercontent.com/Dogeon188/ctlobot/master/assets/tarot/tier${tarotEntry.tier}.jpg`)
            .addField("\u200b", "\u200b")
            .addField("可能會發生的事情", "> " + tarotEntry.forecast)
            .addField("應對方式", "> " + tarotEntry.response)
        if (tarotEntry.author !== "") embed.setFooter(`素材提供：${tarotEntry.author}`)
        return embed
    },
    async execute(client, msg, args) {
        if (msg.author.id === process.env.DOGEON) {
            switch (args[0]) {
                case "update":
                    return client.tarot.update(true).then(() =>
                        msg.channel.send(`已更新昶羅牌！（目前共有 ${client.tarot.entries.length} 個條目）`))
                case "refresh":
                    return ops.refresh(client, msg, args)
                case "limit":
                    return ops.limit(client, msg, args)
            }
        }

        if (client.tarot.limit.has(msg.author.id)) {
            let count = client.tarot.limit.get(msg.author.id)
            if (client.tarot.useLimit !== -1 && count >= client.tarot.useLimit) return msg.channel.send(stripIndents`
                **${msg.member.displayName}**，昶羅牌每一小時只能使用 **${client.tarot.useLimit}** 次！
                使用次數將於 **${
                    60 + Math.floor((client.tarot.refreshTime - new Date().getTime()) / 60000)
                }** 分鐘後刷新。
                `)
            client.tarot.limit.set(msg.author.id, count + 1)
        } else client.tarot.limit.set(msg.author.id, 1)

        await client.tarot.update(false)
        await msg.channel.send(this.tarotEmbed(client, msg, client.tarot.random()))
    }
}