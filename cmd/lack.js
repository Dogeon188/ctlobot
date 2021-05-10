const config = require("../config.json")
const {stripIndents} = require("common-tags")

module.exports = {
    name: "lack",
    description: stripIndents`
        昶昶，我缺乏什麼？
        也可以透過同時包含 **昶** 和 **需要 缺乏** 兩組關鍵字來觸發喔喔
    `,
    arg: false,
    usage: `${config.prefix} lack`,
    async execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id && args[0] === "update")
            return client.lack.update(true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${client.lack.entries.length}** 個條目）`))
        await client.lack.update(false)
        msg.channel.send(`你${Math.random() < 0.5 ? "缺乏" : "需要"}的是${client.lack.random().text}。`)
    }
}