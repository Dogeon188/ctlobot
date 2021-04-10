// invite: https://discord.com/oauth2/authorize?client_id=779656199033454613&scope=bot

const fs = require("fs")
const Discord = require("discord.js")
const chalk = require("chalk");
const client = new Discord.Client()
require("dotenv").config()

require("./utils")

const prefix = "/ctlo"

client.commands = new Discord.Collection()
for (const file of fs.readdirSync('./cmd').filter(f => f.endsWith('.js'))) {
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
    if (/昶.*[說看]/.test(msg.content)) client.commands.get("says"). execute(client, msg, undefined)

    if (!msg.content.startsWith(prefix) || msg.author.bot) return
    const args = msg.content.slice(prefix.length).trim().split(" ")
    const cmdName = args.shift().toLowerCase()
    if (!client.commands.has(cmdName) || cmdName === "foo") {
        msg.channel.send("我不知道你想表達什麼喔\n可用操作：poll says help")
        return
    }
    client.commands.get(cmdName).execute(client, msg, args)
})

client.login(process.env.TOKEN)