require("dotenv").config()

const chalk = require("chalk")
const client = require("./client")

process.on("uncaughtException", e => {
	client.log("error", `${e.message}\n${chalk.gray(e.stack)}`)
})

const app = require("express")()
app.all("*", (req, res) => {
	console.log(`Received request from ${req.originalUrl}`)
	res.send("I'm alive!")
})
app.listen(443, "0.0.0.0")

// client.on("debug", m => console.log(chalk.dim("DBG"), m))

client.login(process.env.TOKEN)
