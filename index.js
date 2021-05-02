const config = require("./config.json")

const fs = require("fs")
const Discord = require("discord.js")
const chalk = require("chalk")
const winston = require("winston")
const client = new Discord.Client()
const utils = require("./utils")

client.logger = winston.createLogger({
    transports: new winston.transports.Console(),
    format: winston.format.printf(log => `${{
        error: chalk.red.bold("ERR"),
        info: chalk.green.bold("STD"),
        debug: chalk.cyan.bold("DBG")
    }[log.level]} ${log.message}`)
})

client.log = (lvl, msg) => {
    client.channels.fetch(config.consoleChannel).then(c => c.send(utils.stripAnsi(msg)))
    client.logger.log(lvl, msg)
}

client.commands = new Discord.Collection()
for (const file of fs.readdirSync('./cmd').filter(f => f.endsWith('.js') && !f.startsWith("."))) {
    const command = require(`./cmd/${file}`);
    client.commands.set(command.name, command);
}

client.tarot = {
    entries: [],
    limit: new Discord.Collection(),
    refreshTime: new Date(),
    useLimit: -1,
    tierColor: ["#0772b4", "#0a9c35", "#88cb03", "#ffbf00", "#bb2705"],
    lastUpdated: 0,
    updateInterval: 10800000 // 3hrs
}
client.says = {
    entries: [],
    lastUpdated: 0,
    updateInterval: 10800000 // 3hrs
}

setInterval(() => {
    client.tarot.limit = new Discord.Collection()
    client.log("info", "Refreshed tarot use limit!")
    client.tarot.refreshTime = new Date()
}, 3600000)

client.on("message", msg => require("./events/message").execute(client, msg))
client.on("ready", () => require("./events/ready").execute(client))

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

client.login(config.token)