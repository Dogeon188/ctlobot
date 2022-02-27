const parser = require("csv-parse")
const bent = require("bent")

const ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g

String.prototype.format = function (d) {
	return this.replace(
		/{(.+?)}/g,
		(match, param) => typeof d[param] !== "undefined" ? d[param] : match
	)
}

module.exports = {
	InvalidInputError: class extends Error {},
	stripAnsi(s) {
		if (typeof s !== "string") throw new TypeError(`Expected a string, got "${typeof s}"`)
		return s.replace(ansiRegex, "")
	},
	async getSpreadsheetSource(gid) {
		const ret = []
		const url = `/spreadsheets/d/e/2PACX-1vS2TzmX0blE38OLXfUP1Par35qq0D-_bhWpOaAv6fAmGmiap_RKGGMNGyO9dY7oSwFnJ7dGV3OXEacG/pub?gid=${gid}&single=true&output=csv`
		const redirected = (await bent("https://docs.google.com", "HEAD", 307)(url)).headers.location
		const p = parser({columns: true})
		p.write(await bent("string")(redirected))
		p.end()
		let i
		while ((i = p.read())) ret.push(i)
		p.destroy()
		return ret
	},
	isOp(id) {
		return process.env.OP.split(",").includes(id)
	}
}
