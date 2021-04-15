const bent = require("bent")
const {stripIndents} = require("common-tags")

const config = require("../config.json")
let says, saysLastUpdated = 0;
const updateSays = async (client, forceUpdate) => {
    if (!forceUpdate && new Date().getTime() - saysLastUpdated < 600000) return
    says = (await bent(config.saysSrc, "json")()).feed.entry.map(e => e.gsx$says.$t)
    saysLastUpdated = new Date().getTime()
    client.logger.log("info", "Updated ctlo says entries!")
}

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過同時包含「昶」和「說|看|講」兩組關鍵字來觸發喔喔
    `,
    arg: true,
    usage: `${config.prefix} says (<speech_id>)`,
    execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id && args[0] === "update") {
            updateSays(client, true)
            msg.channel.send("已更新昶語錄！")
            return
        }
        updateSays(client, false).then(() => {
            const cnt = says[(() => {
                if (args.length > 0) {
                    let i = +args[0]
                    if (isNaN(i)) throw new Error(`Invalid speech id ${args[0]}!`)
                    if (i >= says.length) throw new Error(`Index ${i} is too big for size ${says.length}!`)
                    return i
                }
                return Math.floor(Math.random() * says.length)
            })()].format({
                username: msg.member.nickname == null ? msg.author.username : msg.member.nickname
            })
            msg.channel.send(stripIndents`
            \`\`\`${cnt}
            ——昶昶，2021\`\`\``)
        }).catch(e => {
            msg.channel.send(stripIndents`
                ERROR
                \`${e.message}\`
            `)
            throw e
        })
    }
}