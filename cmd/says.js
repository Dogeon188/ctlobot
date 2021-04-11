const fs = require("fs")
const {stripIndents} = require("common-tags");
const says = JSON.parse(fs.readFileSync("./assets/ctlo_says.json", 'utf8')).says

module.exports = {
    name: "says",
    description: stripIndents`
        昶語錄：傾聽昶昶的箴言
        也可以透過包含「昶」和「說|看」先後兩個關鍵字來觸發喔喔
    `,
    arg: false,
    usage: "/ctlo says",
    execute(client, msg, args) {
        let cnt = says[
            args.length > 0 ? parseInt(args[0]) : Math.floor(Math.random() * says.length)
            ].format({
            username: msg.member.nickname == null ? msg.author.username : msg.member.nickname
        })
        msg.channel.send(stripIndents`
            \`\`\`${cnt}
            ——昶昶，2021\`\`\``)
    }
}