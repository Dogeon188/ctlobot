const {stripIndents} = require("common-tags")
const Discord = require("discord.js")
const utils = require("../utils")

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過同時包含 **昶** 和 **說 講 話 看 想 覺得** 兩組關鍵字來觸發喔喔
    `,
    usage: [
        `${process.env.PREFIX} says`,
        `${process.env.PREFIX} says <speech_id>`
    ],
    async execute(client, msg, args) {
        try {
            await client.says.update(false)
            const s = client.says.random(msg, args[0])
            await msg.channel.send({embeds: [
                new Discord.MessageEmbed()
                    .setTitle(s.says.format({username: msg.member.displayName}))
                    .setFooter(`——${s.author}，2021`)
                    .setColor("#007799")
                ]})
        } catch (e) {
            if (e instanceof utils.InvalidInputError) msg.channel.send(`${e.message}`)
            else throw e
        }
    }
}