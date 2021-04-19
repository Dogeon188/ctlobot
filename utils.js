String.prototype.format = function(d) {
    return this.replace(
        /{(.+?)}/g,
        (match, param) => typeof d[param] != 'undefined' ? d[param] : match
    )
}