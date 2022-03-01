const { stripIndents } = require("common-tags")
const { MessageEmbed } = require("discord.js")
const client = require("../client")

const skipStatus = {
	bad: "🔴 不宜翹課",
	danger: "🟠 可能不行",
	invalid: "🟣 以選修課程為準",
	ok: "🟢 可以翹課"
}

function timetableEmbed (ctx, type) {
	let ret = new MessageEmbed({
		author: { name: type + "節課程", iconURL: client.iconURL },
		title: ctx.name, color: (type === "當") ? "#2288cc" : "#cc8822",
		footer: {
			text: `星期${"日一二三四五六"[ctx.day]}・第${".一二三四五六七"[ctx.class]}節 ${
                [ "", "08:10~09:00", "09:10~10:00", "10:10~11:00", "11:10~12:00", "13:00~13:50", "14:00~14:50", "15:10~16:00" ][ctx.class]
            }`
		}
	}).addField(skipStatus[ctx.skip], ctx.note ?? "\u200b", true)
    
	if (ctx.skip === "invalid") {
		ret.addField("\u200b           \u200b", "\u200b", true)
			.addField("參考課程", stripIndents`
                ${ctx.nameAlt}
                \`${ctx.teacherAlt} 老師\`

                **${skipStatus[ctx.skipAlt]}**
                \u200b
            `, true)
	} else {
		ret.setDescription(ctx.teacher + " 老師")
	}
	return ret
}

function timetableDayEmbed (day) {
	let ret = new MessageEmbed({
		author: { name: "整日課表", iconURL: client.iconURL },
		title: `週${"日一二三四五六"[day]}課表`, color: "#88cc22"
	})
	for (let entry of client.timetable.entries[day]) {
		ret.addField(
			entry.class + "️⃣ " + entry.name,
			skipStatus[entry.skip].slice(0, 3) + (entry.skip === "invalid" ?
				skipStatus[entry.skipAlt].slice(0, 3) + " " + entry.nameAlt :
				entry.teacher + " 老師")
		)
	}
	return ret
}

module.exports = {
	name: "time",
	description: stripIndents`
        查看 🔹**當節和次節** 或 🔹**整天** 的310課表
        也有翹課指示燈喔
    `,
	subdescription: stripIndents`
        也可以輸入你要的時間
        例如「週四 下午1:30」可輸入\`${process.env.PREFIX} time 4 1330\`
        輸入時間不正確則默認為當前時間
		||因為JS的神祕機制，禮拜日請使用\`0\`而非\`7\`來代表||
    `,
	usage: [
		`${process.env.PREFIX} time [<day> <time>]`,
		`${process.env.PREFIX} time day [<day>]`
	],
	async execute(msg, args) {
		await client.timetable.update()
		if (args[0] === "day") {
			if ( args.length > 1 && (isNaN(+args[1]) || +args[1] < 0 || +args[1] > 6) ) {
				msg.channel.send("輸入時間不符合規範！已自動轉換為當前時間……")
			}
			args[1] = args[1] ?? new Date().getDay()

			msg.channel.send({ embeds: [ timetableDayEmbed(args[1]) ] })
		} else {
			if (args.length > 0 && (isNaN(+args[0]) || isNaN(+args[1]) ||
				+args[0] < 0 || +args[0] > 6 ||
				+args[1] < 0 || +args[1] > 2400)) {
				msg.channel.send("輸入時間不符合規範！已自動轉換為當前時間……").then(m => {
					setTimeout(() => m.delete(), 3000)
				})
				args = []
			}
			const timetable = client.timetable.draw(args[0], args[1])
			let embeds = []
			if (timetable.now !== undefined) {
				embeds.push(timetableEmbed(timetable.now, "當"))
			}
			embeds.push(timetableEmbed(timetable.next, "次"))
			await msg.channel.send({ embeds: embeds })
		}
	}
}