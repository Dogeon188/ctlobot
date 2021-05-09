const config = require("./config.json")

const fs = require("fs")
const Discord = require("discord.js")
const winston = require("winston")
const utils = require("./utils")
const chalk = require("chalk")

module.exports.initClient = client => {
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

    client.op = new Discord.Collection()
    for (const file of fs.readdirSync('./op').filter(f => f.endsWith('.js') && !f.startsWith("."))) {
        const command = require(`./op/${file}`);
        client.op.set(command.name, command);
    }

    client.tarot = {
        limit: new Discord.Collection(),
        refreshTime: new Date().getTime(),
        useLimit: -1,
        tierColor: ["#0772b4", "#0a9c35", "#88cb03", "#ffbf00", "#bb2705"],
        updateInterval: 86400000, // 24hrs
        random() { return this.entries[Math.floor(Math.random() * this.entries.length)] },
        async update(forceUpdate) {
            if (!forceUpdate && new Date().getTime() - client.tarot.lastUpdated < this.updateInterval) return
            this.entries = await utils.getSpreadsheetSource("1686809608")
            this.lastUpdated = new Date().getTime()
            client.log("info", `Updated ctlo tarot entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
        }
    }

    client.says = {
        updateInterval: 10800000, // ,
        SaysError: class extends Error {},
        random(index) {
            if (index === undefined) return this.entries[Math.floor(Math.random() * this.entries.length)]
            let i = +index
            if (isNaN(i)) throw new this.SaysError(`無法將 **${index}** 解析為昶語錄編號！`)
            if (i > this.entries.length)
                throw new this.SaysError(`昶語錄只有 **${this.entries.length}** 個條目而已，你輸入的 **${i}** 對我來說太大了啊啊啊`)
            i -= 1
            if (i < 0) throw new this.SaysError(`不可以使用小於0的編號！`)
            return this.entries[i]
        },
        async update(forceUpdate) {
            if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
            this.entries = await utils.getSpreadsheetSource("0")
            this.lastUpdated = new Date().getTime()
            client.log("info", `Updated ctlo says entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
        }
    }

    client.greet = {
        updateInterval: 86400000, // 24hrs
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

    client.on("message", msg => require("./events/message").execute(client, msg))
    client.on("ready", () => require("./events/ready").execute(client))

    setInterval(() => {
        if (client.tarot.useLimit !== -1) {
            client.tarot.limit = new Discord.Collection()
            client.log("info", "Refreshed tarot use limit!")
        }
        client.tarot.refreshTime = new Date().getTime()
    }, 3600000)
}