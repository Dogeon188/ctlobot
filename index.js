const {Client} = require("discord.js")
const chalk = require("chalk")

require("dotenv").config()

const client = new Client()
require("./init").initClient(client)

process.on("uncaughtException", e => {
    client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

const app = require("express")()
app.get("/", (req, res) => {res.send("I'm alive!")})
app.listen(443, "0.0.0.0")

client.login(process.env.TOKEN)