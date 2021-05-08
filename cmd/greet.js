const config = require("../config.json")

module.exports = {
    name: "greet",
    description: "被昶昶大聲問早。",
    arg: false,
    usage: `${config.prefix} greet`,
    execute(client, msg, args) {
        let t = new Date().getHours(), s = Math.random() < client.says.chineseChance, i
        if (t >= 18 || t < 4) i = 2
        else if (t >= 11 && t < 18) i = 1
        else i = 0
        msg.channel.send((s ? ["早安國文課！", "午安國文課！", "晚安國文課！"] : ["同學們早。", "同學們午安。", "同學們晚安。"])[i])
    }
}