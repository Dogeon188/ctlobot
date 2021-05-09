const {exec} = require("child_process")

module.exports = {
    name: "_update",
    execute (client, msg, args) {
        msg.channel.send("嘗試更新昶昶機器人……")
        client.log("info", "Trying to update ctlobot!")
        exec("npm run update").stdout.pipe(process.stdout)
    }
}