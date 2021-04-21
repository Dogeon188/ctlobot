const bent = require("bent")
const {stripIndents} = require("common-tags")
const config = require("../config.json")

let says, lastUpdated = 0

const parseSays = ctx => {
    const ks = ["says", "author"]
    return Object.fromEntries(ks.map(k => [k, ctx[`gsx$${k}`].$t]))
}

const updateSays = async (client, forceUpdate) => {
    if (!forceUpdate && new Date().getTime() - lastUpdated < 600000) return
    says = (await bent(
        `https://spreadsheets.google.com/feeds/list/${config.sheetSrc.sheetId}/${config.sheetSrc.says}/public/values?alt=json`,
        "json")()).feed.entry.map(parseSays)
    lastUpdated = new Date().getTime()
    client.logger.log("info", `Updated ctlo says entries! (Now have ${says.length} entries.)`)
}

const greet = msg => {
    let t = new Date().getHours()
    if (t >= 18 || t < 4) msg.channel.send("同學們晚安。")
    else if (t >= 11 && t < 18) msg.channel.send("同學們午安。")
    else msg.channel.send("同學們早。")
}

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過同時包含 **昶** 和 **說 講 話 看 想 覺得** 兩組關鍵字來觸發喔喔
    `,
    arg: true,
    usage: `${config.prefix} says (<speech_id>)`,
    execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id && args[0] === "update")
            return updateSays(client, true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${says.length}** 個條目）`))

        if (args[0] === "greet") return greet(msg)

        updateSays(client, false).then(() => {
            const s = says[(() => {
                if (args.length > 0) {
                    let i = +args[0]
                    if (isNaN(i)) throw new Error(`Invalid speech id ${args[0]}!`)
                    if (i >= says.length) throw new Error(`Index ${i} is too big for size ${says.length}!`)
                    if (-says.length <= i < 0) return says.length + i
                    return i
                }
                return Math.floor(Math.random() * says.length)
            })()]
            msg.channel.send(stripIndents`
            \`\`\`${s.says.format({
                username: msg.member.nickname == null ? msg.author.username : msg.member.nickname
            })}
            ——${s.author}，2021\`\`\``)
        }).catch(e => {
            msg.channel.send(`ERROR: \`${e.message}\``)
            throw e
        })
    }
}