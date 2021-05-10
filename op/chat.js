const utils = require("../utils")
const {TextChannel} = require("discord.js")

module.exports = {
    name: "_chat",
    async execute(client, msg, args) {
        try {
            if (args.length < 1) throw new utils.InvalidInputError("Didn't provide channel ID!")
            const c = await client.channels.fetch(args[0])
            if (!(c instanceof TextChannel))
                throw new utils.InvalidInputError(`Provided channel ID \`${args[0]}\` is not a text channel!`)
            c.send(args[1])
        } catch (e) {
            if (e instanceof utils.InvalidInputError) msg.channel.send(e.message)
            else throw e
        }
    }
}