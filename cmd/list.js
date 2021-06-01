const config = require("../config.json")
const {stripIndents} = require("common-tags")
const {MessageEmbed} = require("discord.js")

const entriesPerPage = 10

getSaysList = (client, page) => {
    let totalPages = Math.ceil(client.says.entries.length / entriesPerPage)
    page %= totalPages
    if (page < 0) page += totalPages
    return new MessageEmbed()
        .setTitle(`昶語錄條目列表`)
        .setColor("#c90000")
        .addField("\u200b",
            client.says.entries.slice(page * entriesPerPage, page * entriesPerPage + entriesPerPage)
                .map((e, i) => `\`${page * entriesPerPage + i + 1}.\` ${e.says} _by ${e.author}_`).join("\n"))
        .setFooter(`第 ${page + 1} / ${totalPages} 頁（共${client.says.entries.length}條）`)
}

getLackList = (client, page) => {
    let totalPages = Math.ceil(client.lack.entries.length / entriesPerPage)
    page %= totalPages
    if (page < 0) page += totalPages
    return new MessageEmbed()
        .setTitle(`昶缺乏條目列表`)
        .setColor("#00abc9")
        .addField("\u200b",
            client.lack.entries.slice(page * entriesPerPage, page * entriesPerPage + entriesPerPage)
                .map((e, i) => `\`${page * entriesPerPage + i + 1}.\` ${e.text}`).join("\n"))
        .setFooter(`第 ${page + 1} / ${totalPages} 頁（共 ${client.lack.entries.length} 條）`)
}

getTarotList = (client, page) => {
    page %= client.tarot.entries.length
    if (page < 0) page += client.tarot.entries.length
    const embed =  client.commands.get("tarot").tarotEmbed(client, null, client.tarot.entries[page])
    let footer = `第 ${page + 1} / ${client.tarot.entries.length} 項`
    if (embed.footer !== null) footer += `・${embed.footer.text}`
    embed.setFooter(footer).setAuthor("昶羅牌條目列表")
    return embed
}

getGreetList = (client, page) => {
    page %= client.greet.entries.length
    if (page < 0) page += client.greet.entries.length
    const entry = client.greet.entries[page]
    return new MessageEmbed()
        .setTitle(`昶問候條目列表`)
        .setColor("#059a16")
        .setDescription(`抽中機率 ${(entry.weight / client.greet.weightSum * 100).toFixed(2)} %`)
        .addField("早上", entry.morning, true)
        .addField("中午", entry.evening, true)
        .addField("晚上", entry.night, true)
        .setFooter(`第 ${page + 1} / ${client.greet.entries.length} 條`)
}

getAllList = (type, client, page) => {
    switch (type) {
        case "says": return getSaysList(client, page)
        case "tarot": return getTarotList(client, page)
        case "lack": return getLackList(client, page)
        case "greet": return getGreetList(client, page)
    }
}

module.exports = {
    name: "list",
    description: stripIndents`
        查看 **昶語錄** **昶羅牌** **昶昶缺** **昶問候** 的條目列表
    `,
    arg: true,
    usage: `${config.prefix} list <says|tarot|lack|greet>`,
    async execute(client, msg, args) {
        if (["says", "tarot", "lack", "greet"].includes(args[0])) {
            const sent = await msg.channel.send(getAllList(args[0], client, 0))
            sent.ctloPage = 0
            const filter = (r, u) => ["⬅️", "➡️"].includes(r.emoji.name) && !u.bot
            const collector = sent.createReactionCollector(filter, { time: 30000, dispose: true })
            const listener = (r, u) => {
                if (r.emoji.name === "⬅️") sent.ctloPage--
                else if (r.emoji.name === "➡️") sent.ctloPage++
                collector.resetTimer()
                collector.message.edit(getAllList(args[0], client, sent.ctloPage))
            }
            collector.on("collect", listener).on("remove", listener)
            sent.react("⬅️")
            sent.react("➡️")
        } else {
            msg.channel.send("窩不知道你要找什麼")
        }
    }
}