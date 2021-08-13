const {readdirSync} = require("fs")
const {Collection, MessageEmbed} = require("discord.js")
const winston = require("winston")
const utils = require("./utils")
const chalk = require("chalk")

module.exports = async client => {
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

    class PoolContainer {
        constructor(id, name, updateInterval, gid, drawer, updater) {
            this.id = id
            this.name = name
            this.updateInterval = updateInterval * 3600000
            this.gid = gid
            this.draw = drawer || function () {
                return this.entries[Math.floor(Math.random() * this.entries.length)]
            }
            this._updater = updater || (() => {})
        }

        async update(force) {
            if (!force && new Date().getTime() - this.lastUpdated < this.updateInterval) return
            client.log("info", `Start updating ctlo ${this.id} entries...`)
            this.entries = await utils.getSpreadsheetSource(this.gid)
            this.lastUpdated = new Date().getTime()
            this._updater()
            client.log("info", `Updated ctlo ${this.id} entries! Now have ${chalk.blue.bold(this.entries.length)} entries.`)
        }
    }

    client.lack = new PoolContainer("lack", "昶昶缺", 24, "79624142")
    client.tarot = new PoolContainer("tarot", "昶羅牌", 24, "1686809608")
    client.says = new PoolContainer(
        "says", "昶語錄", 3, "0",
        function (msg, index) {
            if (index === undefined) return this.entries[Math.floor(Math.random() * this.entries.length)]
            let i = Math.round(+index)
            if (isNaN(i)) throw new utils.InvalidInputError(`無法將 **${index}** 解析為昶語錄編號！`)
            if (i > this.entries.length)
                throw new utils.InvalidInputError(`昶語錄只有 **${this.entries.length}** 個條目而已，你輸入的 **${i}** 太大了啊啊啊`)
            i -= 1
            if (i < 0) throw new utils.InvalidInputError(`不可以使用小於1的編號！`)
            return this.entries[i]
        }
    )
    client.greet = new PoolContainer(
        "greet", "昶問候", 24, "663619317",
        function () {
            let r = Math.random() * this.weightSum
            for (const e of this.entries) {
                r -= e.weight
                if (r < 0) return e
            }
        },
        function () {
            this.weightSum = 0
            this.entries.forEach((e, i, a) => {
                a[i].weight = +e.weight
                this.weightSum += e.weight
            })
        }
    )

    client.on("messageCreate", msg => require("./events/messageCreate").execute(client, msg))
    client.once("ready", () => require("./events/ready").execute(client))
}