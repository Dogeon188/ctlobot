const {InvalidInputError} = require("../utils")

module.exports = {
    name: "chat",
    op: true,
    async execute(client, msg, args) {
        try {
            if (args.length < 1) throw new InvalidInputError("Didn't provide channel ID!")
            const c = await client.channels.fetch(args[0])
            if (!c.isText())
                throw new InvalidInputError(`Provided channel ID \`${args[0]}\` is not a text channel!`)
            c.send(args[1])
        } catch (e) {
            if (e instanceof InvalidInputError) msg.channel.send(e.message)
            else throw e
        }
    }
}