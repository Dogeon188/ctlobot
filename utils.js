String.prototype.format = function(d) {
    return this.replace(
        /{(.+?)}/g,
        (match, param) => typeof d[param] != 'undefined' ? d[param] : match
    )
}

const ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g

stripAnsi = s => {
    if (typeof s !== 'string') throw new TypeError(`Expected a string, got "${typeof s}"`);
    return s.replace(ansiRegex, '');
}


