const {exec} = require("child_process")

setInterval(() => {
    console.log("Auto-updating ctlobot! (once every day)")
    exec("npm run update").stdout.pipe(process.stdout)
}, require("./config.json").updateInterval)
