const Canvas = require("canvas")
const Discord = require("discord.js")
const bent = require("bent")
const config = require("../config.json")
const {stripIndents} = require("common-tags")

parseTarot = (ctx) => {
    let tarot = {}
    for (let arg of ctx.split(", ")) {
        arg = arg.split(": ")
        tarot[arg[0]] = arg[1]
    }
    return tarot
}

let tarots, lastUpdated = 0
const updateSays = async (client, forceUpdate) => {
    if (!forceUpdate && new Date().getTime() - lastUpdated < 1200000) return
    tarots = (await bent(
        `https://spreadsheets.google.com/feeds/list/${config.sheetSrc.sheetId}/${config.sheetSrc.tarot}/public/values?alt=json`,
        "json")()).feed.entry.map(e => parseTarot(e.content.$t))
    lastUpdated = new Date().getTime()
    client.logger.log("info", "Updated ctlo tarot entries!")
}

module.exports = {
    name: "tarot",
    description: stripIndents`
        昶羅牌：讓昶昶告訴你今天的運勢
        也可以透過同時包含「昶」和「看|想|覺得」兩組關鍵字來觸發喔喔
    `,
    arg: false,
    usage: `${config.prefix} tarot`,
    execute(client, msg, args) {
        // TODO: html2canvas
        if (msg.author.id === config.dogeon.id && args[0] === "update") {
            updateSays(client, true).then(() =>
                msg.channel.send(`已更新昶羅牌！（目前共有 ${tarots.length} 個條目）`))
            return
        }
        updateSays(client, false).then(async () => {
            const tarot = tarots[Math.floor(Math.random() * tarots.length)]
            const canvas = Canvas.createCanvas(700, 250)
            const ctx = canvas.getContext('2d')

            ctx.drawImage(await Canvas.loadImage('assets/tarot/bg.png'), 0, 0, canvas.width, canvas.height)

            ctx.font = '60px "Microsoft Jhenghei"'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(tarot.title, 275, 100)
            ctx.font = '30px "Microsoft Jhenghei"'
            ctx.fillText(tarot.desc, 275, 160)

            roundRect(ctx, 25, 25, 200, 200, 10, false, false)
            ctx.clip()
            ctx.drawImage(await Canvas.loadImage(`assets/tarot/tier${tarot.tier}.jpg`), 25, 25, 200, 200)
            ctx.clip()

            await msg.channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'tarot.png'))
        })
    }
}