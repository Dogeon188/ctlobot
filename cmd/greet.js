const {stripIndents} = require("common-tags")

module.exports = {
    name: "greet",
    description: stripIndents`
        被昶昶大聲問早。
        也可以透過同時包含 **昶** 和 **早安 午安 晚安** 兩組關鍵字來觸發喔喔
    `,
    usage: [`${process.env.PREFIX} greet`],
    async execute(client, msg, args) {
        await client.greet.update(false)
        let t = (new Date().getHours() + 8) % 24, i
        if (t >= 18 || t < 4) i = "night"
        else if (t >= 11 && t < 18) i = "evening"
        else i = "morning"
        msg.channel.send(client.greet.random()[i])
    }
}