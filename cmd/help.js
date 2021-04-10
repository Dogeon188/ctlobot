module.exports = {
    name: "help",
    description: "CtloBot doc.",
    arg: true,
    usage: "/ctlo help (<command>)",
    execute(client, msg, args) {
        if (args.length === 0) msg.channel.send("可用操作：poll says help\n使用`/ctlo help <指令>以獲得更多訊息`")
        else {
            if (!client.commands.has(args[0])) msg.channel.send(`我們不提供${args[0]}的服務喔\n可用操作：poll says help`)
            else msg.channel.send(`使用方式：\n\`${client.commands.get(args[0]).usage}\``)
        }
    }
}