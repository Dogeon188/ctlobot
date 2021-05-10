const config = require("./config.json")

const {Client} = require("discord.js")
const chalk = require("chalk")

const client = new Client()
require("./init").initClient(client)

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

client.login(config.token)