const {Client} = require("discord.js")
const chalk = require("chalk")

require("dotenv").config()


const client = new Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]})
require("./init")(client)

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

process.on("exit", () => {
    client.log("I'm dead X(")
})

const app = require("express")()
app.all("*", (req, res) => {
    client.log("info", `${chalk.cyan.bold("REQ")} Received keep-alive request from ${req.originalUrl}`)
    res.send("I'm alive!")
})
app.listen(443, "0.0.0.0")

// client.on("debug", m => console.log(chalk.dim("DBG"), m))

client.login(process.env.TOKEN)

