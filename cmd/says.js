const fs = require("fs")
const says = JSON.parse(fs.readFileSync("./assets/ctlo_says.json", 'utf8')).says

module.exports = {
    name: "says",
    description: "昶語錄",
    arg: false,
    usage: "/ctlo says",
    execute(client, msg, args) {
        msg.channel.send(`\`\`\`${
            says[Math.floor(Math.random() * says.length)].format({
                username: msg.author.username
            })
        }\n——昶昶，2021\`\`\``)
    }
}