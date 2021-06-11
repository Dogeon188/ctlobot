const {Client} = require("discord.js")
const chalk = require("chalk")

require("dotenv").config()

const client = new Client()
require("./init").initClient(client)

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

client.login(process.env.TOKEN)