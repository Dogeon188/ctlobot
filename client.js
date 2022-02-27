const {readdirSync} = require("fs")
const {Client, Collection, MessageEmbed} = require("discord.js")
const winston = require("winston")
const utils = require("./utils")
const chalk = require("chalk")

const client = new Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]})

module.exports = client

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
for (const file of readdirSync("./cmd").filter(f => f.endsWith(".js") && !f.startsWith("."))) {
	const command = require(`./cmd/${file}`)
	if (command.op) client.op.set(command.name, command)
	else client.commands.set(command.name, command)
}

client.iconURL = "https://cdn.discordapp.com/avatars/779656199033454613/1c8964f1fc0cca1b719a7db056f9fb7c.png"
client.helpEmbed = new MessageEmbed({
	author: {name: "昶昶機器人幫助文檔", iconURL: client.iconURL},
	title: "可用操作"
})
for (let cmd of client.commands.keys()) {
	client.helpEmbed.addField(cmd, client.commands.get(cmd).description, true)
}
client.helpEmbed.addField("\u200b", `使用 \`${process.env.PREFIX} help <指令>\` 以獲得更多訊息`)

class UpdatablePool {
	constructor(id, name, updateInterval, gid, drawer, updater) {
		this.id = id
		this.name = name
		this.updateInterval = updateInterval * 3600000
		this.gid = gid
		this.draw = drawer || function () {
			return this.entries[Math.floor(Math.random() * this.entries.length)]
		}
		this._updater = updater || (() => {
		})
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

client.role = new UpdatablePool("role", "310身份組管理", 240, "1774210288")
client.tarot = new UpdatablePool("tarot", "昶羅牌", 24, "1686809608")
client.says = new UpdatablePool(
	"says", "昶語錄", 3, "0",
	function (index) {
		if (index === undefined) return this.entries[Math.floor(Math.random() * this.entries.length)]
		let i = Math.round(+index)
		if (isNaN(i)) throw new utils.InvalidInputError(`無法將 **${index}** 解析為昶語錄編號！`)
		if (i > this.entries.length) {
			throw new utils.InvalidInputError(`昶語錄只有 **${this.entries.length}** 個條目而已，你輸入的 **${i}** 太大了啊啊啊`)
		}
		i -= 1
		if (i < 0) throw new utils.InvalidInputError("不可以使用小於1的編號！")
		return this.entries[i]
	}
)
client.greet = new UpdatablePool(
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
client.timetable = new UpdatablePool(
	"timetable", "翹課表", 240, "1236681904",
	function (day, time) {
		const times = [750, 900, 1000, 1100, 1200, 1350, 1450, 1600, 2500]

		let ret = {now: undefined, next: undefined}
		let date = new Date()
		let _day = (day ?? date.getDay()) - 1
		let period = -2, t = time ?? date.getHours() * 100 + date.getMinutes()

		times.some(v => {return period++, v > t})

		if (period !== -1) ret.now = this.entries[_day][period]
		ret.next = this.entries[_day][++period] ??
			this.entries[++_day % 7][0] ??
			this.entries[0][0]

		return ret
	},
	function () {
		let tmp = [[],[],[],[],[],[],[]]
		for (let entry of this.entries) {
			tmp[entry.day - 1][entry.class - 1] = entry
		}
		this.entries = tmp
	}
)

client.on("messageCreate", msg => require("./events/messageCreate").execute(msg))
client.once("ready", () => require("./events/ready").execute())