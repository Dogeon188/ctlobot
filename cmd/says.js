const fs = require("fs")
const {stripIndents} = require("common-tags");
const says = JSON.parse(fs.readFileSync("./assets/ctlo_says.json", 'utf8')).says

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過包含「昶」和「說|看」先後兩個關鍵字來觸發喔喔
    `,
    arg: true,
    usage: "/ctlo says (<speech_id>)",
    execute(client, msg, args) {
        let cnt = says[(() => {
            if (args.length > 0) {
                let i = parseInt(args[0])
                if (isNaN(i)) throw new Error(`Invalid speech id ${args[0]}!`)
                if (i >= says.length) throw new Error(`Index ${i} is too big for size ${says.length}!`)
                return i
            }
            return Math.floor(Math.random() * says.length)
        })()
            ].format({
            username: msg.member.nickname == null ? msg.author.username : msg.member.nickname
        })
        msg.channel.send(stripIndents`
            \`\`\`${cnt}
            ——昶昶，2021\`\`\``)
    }
}