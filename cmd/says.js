const bent = require("bent")
const {stripIndents} = require("common-tags")
const Discord = require("discord.js")
const chalk = require("chalk")
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
    client.log("info", `Updated ctlo says entries! Now have ${chalk.blue.bold(says.length)} entries.`)
}

const greet = msg => {
    let t = new Date().getHours(), s = Math.random() < 0.03, i
    if (t >= 18 || t < 4) i = 2
    else if (t >= 11 && t < 18) i = 1
    else i = 0
    msg.channel.send((s ? ["早安國文課！", "午安國文課！", "晚安國文課！"] : ["同學們早。", "同學們午安。", "同學們晚安。"])[i])
}

class SaysIndexError extends Error {}

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
                    if (isNaN(i)) throw new SaysIndexError(`無法將 **${args[0]}** 解析為昶語錄ID！`)
                    if (i > says.length) throw new SaysIndexError(`昶語錄只有 **${says.length}** 個條目而已，你輸入的 **${i}** 對我來說太大了啊啊啊`)
                    i -= 1
                    if (-says.length <= i < 0) return says.length + i
                    return i
                }
                return Math.floor(Math.random() * says.length)
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