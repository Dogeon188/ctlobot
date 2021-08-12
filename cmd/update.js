module.exports = {
    name: "update",
    op: true,
    async execute(client, msg, args) {
        switch (args[0]) {
            case "greet":
                return client.greet.update(true).then(() =>
                msg.channel.send(`已更新昶問候！（目前共有 **${client.greet.entries.length}** 個條目）`))
            case "lack":
                return client.lack.update(true).then(() =>
                msg.channel.send(`已更新昶缺乏！（目前共有 **${client.lack.entries.length}** 個條目）`))
            case "says":
                return client.says.update(true).then(() =>
                msg.channel.send(`已更新昶語錄！（目前共有 **${client.says.entries.length}** 個條目）`))
            case "tarot":
                return client.tarot.update(true).then(() =>
                msg.channel.send(`已更新昶羅牌！（目前共有 ${client.tarot.entries.length} 個條目）`))
            default:
                msg.channel.send("這東西不能更新欸")
        }
    }
}