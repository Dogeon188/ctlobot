const config = require("../config.json")

module.exports = {
    name: "greet",
    description: "被昶昶大聲問早。",
    arg: false,
    usage: `${config.prefix} greet`,
    async execute(client, msg, args) {
        if (msg.author.id === config.dogeon.id && args[0] === "update")
            return client.greet.update(true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${client.greet.entries.length}** 個條目）`))
        await client.greet.update(false)
        let t = new Date().getHours(), i
        if (t >= 18 || t < 4) i = "night"
        else if (t >= 11 && t < 18) i = "evening"
        else i = "morning"
        msg.channel.send(client.greet.random()[i])
    }
}