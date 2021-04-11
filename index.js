// invite: https://discord.com/oauth2/authorize?client_id=779656199033454613&scope=bot

const fs = require("fs")
const Discord = require("discord.js")
const chalk = require("chalk");
const client = new Discord.Client()
require("dotenv").config()

require("./utils")
const {stripIndents} = require("common-tags");

const prefix = "/ctlo"

client.commands = new Discord.Collection()
for (const file of fs.readdirSync('./cmd').filter(f => f.endsWith('.js') && !f.startsWith("."))) {
    const command = require(`./cmd/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${chalk.green(client.user.tag)}!`)
    client.user.setPresence({
        activity: {
            name: "/ctlo help",
            type: "LISTENING"
        }
    })
})

client.on("message", msg => {
    try {
        if (msg.author.bot) return
        if (msg.content.startsWith(prefix)) {
            const args = msg.content.slice(prefix.length).trim()
                .match(/((?<!\\)".*?(?<!\\)"|\S+)/g)
                .forEachC((t, i, a) => {
                    if (t[0] === '"') a[i] = t.slice(1, -1)
                    a[i] = a[i].replace('\\"', '"')
                })
            // const args = msg.content.slice(prefix.length).trim().split(" ")
            const cmdName = args.shift().toLowerCase()
            if (!client.commands.has(cmdName) || cmdName === "foo") {
                msg.channel.send(stripIndents`
                我不知道你想表達什麼喔
                可用操作：${[client.commands.keyArray()].join(" ")}
                使用 \`/ctlo help\` 以獲得更多訊息
            `)
                return
            }
            client.commands.get(cmdName).execute(client, msg, args)
        } else if (/昶.*[說看]/.test(msg.content))
            client.commands.get("says").execute(client, msg, [])
    } catch (e) {
        msg.channel.send(stripIndents`
        ERROR
        \`${e.toString()}\``)
        console.log(`${chalk.red.bold("ERROR")} ${e.toString()}`)
    }
})

client.login(process.env.TOKEN)