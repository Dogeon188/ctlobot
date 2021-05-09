const config = require("./config.json")

const fs = require("fs")
const Discord = require("discord.js")
const chalk = require("chalk")
const winston = require("winston")
const utils = require("./utils")

const client = new Discord.Client()

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
    limit: new Discord.Collection(),
    refreshTime: new Date().getTime(),
    useLimit: -1,
    tierColor: ["#0772b4", "#0a9c35", "#88cb03", "#ffbf00", "#bb2705"],
    updateInterval: 10800000, // 3hrs
    async update(forceUpdate) {
        if (!forceUpdate && new Date().getTime() - client.tarot.lastUpdated < this.updateInterval) return
        this.entries = await utils.getSpreadsheetSource("1686809608")
        this.lastUpdated = new Date().getTime()
        client.log("info", `Updated ctlo tarot entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
    }
}
client.says = {
    updateInterval: 10800000, // 3hrs
    async update(forceUpdate) {
        if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
        this.entries = await utils.getSpreadsheetSource("0")
        this.lastUpdated = new Date().getTime()
        client.log("info", `Updated ctlo says entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
    }
}
client.greet = {
    updateInterval: 10800000, // 3hrs
    random() {
        let r = Math.random() * this.weightSum
        for (const e of this.entries) {
            r -= e.weight
            if (r < 0) return e
        }
    },
    async update(forceUpdate) {
        if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
        this.entries = await utils.getSpreadsheetSource("663619317")
        this.lastUpdated = new Date().getTime()
        this.weightSum = 0
        this.entries.forEach((e, i, a) => {
            a[i].weight = +e.weight
            this.weightSum += e.weight
        })
        client.log("info", `Updated ctlo greet entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
    }
}

setInterval(() => {
    if (client.tarot.useLimit !== -1) {
        client.tarot.limit = new Discord.Collection()
        client.log("info", "Refreshed tarot use limit!")
    }
    client.tarot.refreshTime = new Date().getTime()
}, 3600000)

client.on("message", msg => require("./events/message").execute(client, msg))
client.on("ready", () => require("./events/ready").execute(client))

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

client.login(config.token)