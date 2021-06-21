const {stripIndents} = require("common-tags")

module.exports = {
    name: "greet",
    description: stripIndents`
        被昶昶大聲問早。
        也可以透過同時包含 **昶** 和 **早安 午安 晚安** 兩組關鍵字來觸發喔喔
    `,
    arg: false,
    usage: `${process.env.PREFIX} greet`,
    async execute(client, msg, args) {
        if (msg.author.id === process.env.DOGEON && args[0] === "update")
            return client.greet.update(true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${client.greet.entries.length}** 個條目）`))
        await client.greet.update(false)
        let t = (new Date().getHours() + 8) % 24, i
        if (t >= 18 || t < 4) i = "night"
        else if (t >= 11 && t < 18) i = "evening"
        else i = "morning"
        msg.channel.send(client.greet.random()[i])
    }
}