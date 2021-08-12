const updatable = {
    greet: "昶問候", lack: "昶缺乏",
    says: "昶語錄", tarot: "昶羅牌"
}

module.exports = {
    name: "update",
    op: true,
    async execute(client, msg, args) {
        if (Object.keys(updatable).includes(args[0])) return client[args[0]].update(true).then(() =>
            msg.channel.send(`已更新${updatable[args[0]]}！（目前共有 **${client[args[0]].entries.length}** 個條目）`))
        else msg.channel.send("這東西不能更新欸")
    }
}