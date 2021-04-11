module.exports = {
    execute(client, msg, args) {
        client.channels.fetch(args[0]).then(c => c.send(args[1]))
    }
}