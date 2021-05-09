const {TextChannel} = require("discord.js")

class ChatError extends Error {}

module.exports = {
    name: "_chat",
    async execute(client, msg, args) {
        try {
            if (args.length < 1) throw new ChatError("Didn't provide channel ID!")
            client.channels.fetch(args[0]).then(c => {
                if (!(c instanceof TextChannel))
                    throw new ChatError(`Provided channel ID \`${args[0]}\` is not a text channel!`)
                c.send(args[1])
            }).catch(e => { if (e instanceof ChatError) msg.channel.send(e.message) })
        } catch (e) { if (e instanceof ChatError) msg.channel.send(e.message) }
    }
}