const {InvalidInputError} = require("../utils")
const {DiscordAPIError, MessageEmbed} = require("discord.js")
const { stripIndent } = require("common-tags")

const emojis = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬜"]

module.exports = {
	name: "poll",
	description: stripIndent`
	一個簡單(?)的投票功能

	channel - 標註頻道 或是直接用 \".\" 來表示當前頻道 預設也是當前頻道
	options - 特殊選項，可用的有下列幾項：
	> \`d\`可以加入補充敘述
	> \`i\`可以附圖片（請使用鏈結）
	> \`?\`可以多一個 **不確定**❔ 的選項`,
	usage: `${process.env.PREFIX} poll <title> (channel) (options)`,
	async execute(client, msg, args) {
		// TODO: count vote, announce result
		const pa = {
			title: args[0], channel: args[1] ?? ".",
			options: args[2] ?? ""
		}

		try {
			if (pa.title === undefined) throw new InvalidInputError("沒有給投票標題我開不了投票欸")

			let emj = []
			const embed = new MessageEmbed()
				.setColor("#b4821e")
				.setFooter(`由 ${msg.author.username} 發起的投票`)
				.setTitle(pa.title)

			const filter = m => m.author === msg.author
			if (pa.options.includes("c")) {
				let choices
				msg.channel.send("是選擇題呢，請在60秒以內輸入你要的選項，用空格分割。").then(m => {
					setTimeout(() => m.delete(), 5000)
				})
				await msg.channel.awaitMessages({filter, max: 1, time: 60000, errors: ["time"]})
					.then(collected => {
						collected.first().react("<:approved:871686327249272842>")
						choices = collected.first().content
							.match(/((?<!\\)".*?(?<!\\)"|\S+)/g)
						choices.forEach((t, i, a) => {
							if (t[0] === "\"") a[i] = t.slice(1, -1)
							a[i] = a[i].replace("\\\"", "\"")
						})
					}).catch(() => {
						throw new InvalidInputError("不給選項的話我開不了投票欸")
					})

				if (choices.length > emojis.length)
					throw new InvalidInputError(`投票選項不能超過 **${emojis.length}** 個！`)
				for (let i = 0; i < choices.length; i++) {
					embed.addField("\u200b", `${emojis[i]} **${choices[i]}**`, true)
					emj.push(emojis[i])
				}
			} else {
				emj = ["✅", "❌"]
				embed.addField("\u200b", "✅ **同意**", true)
				embed.addField("\u200b", "❌ **不同意**", true)
			}

			if (pa.options.includes("d")) {
				msg.channel.send("想在投票當中加入敘述的話，請在30秒以內輸入文字敘述。").then(m => {
					setTimeout(() => m.delete(), 5000)
				})
				await msg.channel.awaitMessages({filter, max: 1, time: 30000, errors: ["time"]})
					.then(collected => {
						collected.first().react("<:approved:871686327249272842>")
						embed.setDescription(collected.first().content)
					}).catch(() => msg.channel.send("你不說的話，我就當做沒問題囉。").then(m => {
						setTimeout(() => m.delete(), 5000)
					}))
			}
			if (pa.options.includes("i")) {
				msg.channel.send("想在投票當中加入圖片的話，請在30秒以內輸入圖片連結。").then(m => {
					setTimeout(() => m.delete(), 5000)
				})
				await msg.channel.awaitMessages({filter, max: 1, time: 30000, errors: ["time"]})
					.then(collected => {
						collected.first().react("<:approved:871686327249272842>")
						embed.setImage(collected.first().content)
					}).catch(() => msg.channel.send("你不說的話，我就當做沒問題囉。").then(m => {
						setTimeout(() => m.delete(), 5000)
					}))
			}

			if (pa.options.includes("?")) {
				embed.addField("\u200b", "❔**不確定**", true)
				emj.push("❔")
			}
			const c = (pa.channel === ".") ? msg.channel :
				(/<#.+>/.test(pa.channel)) ? await client.channels.fetch(pa.channel.match(/(?<=<#).+(?=>)/)[0]) :
					await client.channels.fetch(pa.channel)
			if (!c.isText())
				throw new InvalidInputError(`你給的頻道 **<#${pa.channel}>** 不是文字頻道欸`)
			if (!c.permissionsFor(client.user).has("SEND_MESSAGES"))
				throw new InvalidInputError(`看來我不能在 **<#${c.id}>** 發言呢 :cry:`)
			if (!c.permissionsFor(msg.author).has("SEND_MESSAGES"))
				throw new InvalidInputError(`看來你不能在 **<#${c.id}>** 發言呢 可憐啊`)
			c.send({embeds: [embed]}).then(async m => {
				for (let e of emj) await m.react(e)
			})
		} catch (e) {
			if (e instanceof DiscordAPIError) msg.channel.send(`你給的頻道ID\`${pa.channel}\`感覺不像是現存的頻道欸`)
			else if (e instanceof InvalidInputError) msg.channel.send(e.message)
			else throw e
		}
	}
}