const config = require("./config.json")

const fs = require("fs")
const Discord = require("discord.js")
const chalk = require("chalk")
const winston = require("winston")
const client = new Discord.Client()

require("./utils")

client.logger = winston.createLogger({
    transports: new winston.transports.Console(),
    format: winston.format.printf(log => `${{
        error: chalk.red.bold("ERR"),
        info: chalk.green.bold("STD"),
        debug: chalk.cyan.bold("DBG")
    }[log.level]} ${log.message}`)
})

client.commands = new Discord.Collection()
for (const file of fs.readdirSync('./cmd').filter(f => f.endsWith('.js') && !f.startsWith("."))) {
    const command = require(`./cmd/${file}`);
    client.commands.set(command.name, command);
}

client.tarotLimit = new Discord.Collection()
client.tarotRefreshTime = new Date()
setInterval(() => {
    client.tarotLimit = new Discord.Collection()
    client.logger.log("info", "Refreshed tarot use limit!")
    client.tarotRefreshTime = new Date()
}, client.commands.get("tarot").cooldown * 60000)

client.on("message", msg => require("./events/message").execute(client, msg))
client.on("ready", () => require("./events/ready").execute(client))

process.on("uncaughtException", e => {
    client.logger.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

client.login(config.token)