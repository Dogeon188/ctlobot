const {readdirSync} = require("fs")
const {Collection, MessageEmbed} = require("discord.js")
const winston = require("winston")
const utils = require("./utils")
const chalk = require("chalk")

module.exports = async client => {
    winston.addColors({})
    client.logger = winston.createLogger({
        transports: new winston.transports.Console(),
        format: winston.format.printf(log => `${{
            error: chalk.red.bold("ERR"),
            info: chalk.green.bold("STD"),
            debug: chalk.cyan.bold("DBG")
        }[log.level]} ${log.message}`)
    })

    client.log = (lvl, msg) => {
        client.channels.fetch(process.env.CONSOLE).then(c => c.send(utils.stripAnsi(msg)))
        client.logger.log(lvl, msg)
    }

    client.commands = new Collection()
    client.op = new Collection()
    for (const file of readdirSync('./cmd').filter(f => f.endsWith('.js') && !f.startsWith("."))) {
        const command = require(`./cmd/${file}`)
        if (command.op) client.op.set(command.name, command)
        else client.commands.set(command.name, command)
    }

    client.helpEmbed = new MessageEmbed()
        .setAuthor("昶昶機器人幫助文檔", "https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png")
        .addField("可用操作", "`" + Array.from(client.commands.keys()).join("`▫️`") + "`")
        .addField("\u200b", `使用 \`${process.env.PREFIX} help <指令>\` 以獲得更多訊息`)

    client.tarot = {
        tierColor: [0x0772b4, 0x0a9c35, 0x88cb03, 0xffbf00, 0xbb2705],
        updateInterval: 86400000, // 24hrs
        random() { return this.entries[Math.floor(Math.random() * this.entries.length)] },
        async update(forceUpdate) {
            if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
            client.log("info", "Start updating ctlo tarot entries...")
            this.entries = await utils.getSpreadsheetSource("1686809608")
            this.lastUpdated = new Date().getTime()
            client.log("info", `Updated ctlo tarot entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
        }
    }

    client.says = {
        updateInterval: 10800000, // ,
        random(msg, index) {
            if (index === undefined) return this.entries[Math.floor(Math.random() * this.entries.length)]
            let i = +index
            if (isNaN(i) || !Number.isInteger(i)) throw new utils.InvalidInputError(`無法將 **${index}** 解析為昶語錄編號！`)
            if (i > this.entries.length)
                throw new utils.InvalidInputError(`昶語錄只有 **${this.entries.length}** 個條目而已，你輸入的 **${i}** 對我來說太大了啊啊啊`)
            i -= 1
            if (i < 0) throw new utils.InvalidInputError(`不可以使用小於1的編號！`)
            return this.entries[i]
        },
        async update(forceUpdate) {
            if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
            client.log("info", "Start updating ctlo says entries...")
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
            client.log("info", "Start updating ctlo greet entries...")
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

    client.lack = {
        updateInterval: 86400000, // 24hrs
        random() { return this.entries[Math.floor(Math.random() * this.entries.length)] },
        async update(forceUpdate) {
            if (!forceUpdate && new Date().getTime() - this.lastUpdated < this.updateInterval) return
            client.log("info", "Start updating ctlo lack entries...")
            this.entries = await utils.getSpreadsheetSource("79624142")
            this.lastUpdated = new Date().getTime()
            client.log("info", `Updated ctlo lack entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
        }
    }

    client.on("messageCreate", msg => require("./events/messageCreate").execute(client, msg))
    client.on("ready", () => require("./events/ready").execute(client))
}