const chalk = require("chalk");

module.exports = {
    name: "poll",
    description: "Simple poll generator.",
    arg: true,
    usage: "/ctlo poll <bool|choice> <duration> <poll_content> <choices...>",
    execute(client, msg, args) {
        const pa = {
            type: args[0], duration: args[1],
            content: args[2], choices: args.slice(3)
        }

        try {
            let cnt = "", emj = []
            switch (pa.type) {
                case "bool":
                    cnt = `${pa.content}\n贊成按:o: 不贊成按:x:`
                    emj = ["⭕", "❌"]
                    break
                case "choice":
                    if (pa.choices.length > 9) throw "Too many choices!"
                    cnt = pa.content
                    for (let i = 0; i < pa.choices.length; i++) {
                        if (i % 4 === 0) cnt += "\n"
                        cnt += `${pa.choices[i]} 按${i}\ufe0f\u20e3    `
                        emj.push(`${i}\ufe0f\u20e3`)
                    }
                    break
                default:
                    throw "Unexpected type of poll!"
            }
            client.channels.fetch(process.env.CHANNEL_ID).then(c => {
                c.send(cnt).then(msg => {
                    for (let e of emj) msg.react(e)
                })
            })
        } catch (e) {
            msg.channel.send(`Error: ${e.toString()}`)
            msg.channel.send("Format: `/ctlo poll <bool|choice> <duration> <poll_content> <choices...>`")
            console.log(`${chalk.red.bold("ERROR")} ${e.toString()}`)
        }
    }
}