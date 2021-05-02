const {exec} = require("child_process")

module.exports = {
    execute (client, msg, args) {
        console.log("Trying to update ctlobot!")
        exec("npm run update").stdout.pipe(process.stdout)
    }
}