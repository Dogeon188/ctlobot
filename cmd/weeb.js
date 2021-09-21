// ref: https://github.com/teddy21019/weeb-message/blob/master/
const {InvalidInputError} = require("../utils")

const postfixes = {
    normal: [
        "笑", "燦笑", "推眼鏡", "摸頭", "茶", "歪頭", "汗顏", "？",
        "ㄏㄏ", "喂！", "遠望", "探頭", "搔頭", "嘆", "扶額", "咳咳"
    ],
    dark: ["黑化", "捶牆壁", "撕心裂肺地笑著", "憤怒", "憤怒槌牆", "深深恨著自己"]
}

const prefixes = ["嘛", "欸都", "唔姆..", "呀咧呀咧"]

generateWeeb = (s) => {
    let baseChance = (s === '') ? 0.5 : 0.2
    let have_www = Math.random() < baseChance
    let www_number = (Math.floor(Math.random() * 5 ) + 2) * have_www
    let www = "w".repeat(www_number)

    let use_postfix = Math.random() < 0.1 ? 'dark' : 'normal'
    let have_postfix = Math.random() < baseChance
    let postfix_index = Math.floor(Math.random() * postfixes[use_postfix].length)
    let postfix = have_postfix ? ('（' + postfixes[use_postfix][postfix_index]) : ''

    let have_prefix = Math.random() < baseChance
    let prefix_index = Math.floor(Math.random() * prefixes.length)
    let prefix = have_prefix ? (prefixes[prefix_index] + ' ') : ''

    return `${prefix}${s}${www}${postfix}`
}

module.exports = {
    name: "weeb",
    description: "肥宅對話產生器 昶昶Ver.",
    usage: [`${process.env.PREFIX} weeb`],
    async execute(client, msg, args) {
        const filter = m => m.author === msg.author

        msg.channel.send("欸都 請在60秒以內輸入你想要轉換的文章www（搔頭燦笑").then(m => {
            setTimeout(() => m.delete(), 5000)
        })
        await msg.channel.awaitMessages({filter, max: 1, time: 60000, errors: ["time"]})
            .then(collected => {
                let lines = collected.first().content.split('\n')
                msg.channel.send(lines.map(generateWeeb).join('\n')).catch(e => {
                    msg.channel.send('唔姆.. 看來文章太長了呢 我沒辦法送過來（遠望')
                })
            }).catch(() => {throw new InvalidInputError("呀咧呀咧 沒有文章我就沒辦法幫你轉了（撕心裂肺地笑著")})
    }
}