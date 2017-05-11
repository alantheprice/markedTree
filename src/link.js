
export class Link {

    /**
     * Creates an instance of Link.
     * @param {boolean} isExternal 
     * @param {string} fullPath 
     * @param {string} [linkText] 
     * 
     * @memberof Link
     */
    constructor(isExternal, fullPath, linkText) {
        this.isExternal = isExternal;
        this.directory = this.getDirectoryPath(fullPath);
        this.href = fullPath;
        this.hashLink = (isExternal)? fullPath : this.getHashLink(fullPath);
        this.linkText = linkText || fullPath;
        this.markdownLoaded = false;
        this.markHtml = "";
    }

    /**
     * Gets the hash for the haslink instance
     * 
     * @param {string} fullPath 
     * @returns {string}
     * 
     * @memberof Link
     */
    getHashLink(fullPath) {
        return "#" + fullPath.replace("./", "");
    }

    /**
     * Gets the directory path for the element
     * 
     * @param {string} fullPath 
     * @returns {string}
     * 
     * @memberof Link
     */
    getDirectoryPath(fullPath) {
        return fullPath.split("/").slice(0, -1).join("/");
    }

    /**
     * Gets the markup for the link element
     * @param {boolean} [isInList]
     * @returns {string}
     * 
     * @memberof Link
     */
    getMarkup(isInList) {
        let hl = `<a href="${this.hashLink}">${this.linkText}</a>`;
        if (isInList === false) {
            return hl;
        }
        return  `<li>${hl}</li>`;
    }
    

    setEmptyView() {
        this.markHtml = `<h3>Markdown doesn't have any data</h3>`;
    }

}


/**
 * Builds a link from a url and context url
 * 
 * @param {string} href 
 * @param {string} contextUrl - calling context url, needed to resolve relative paths.
 * @param {string} [linkText]
 * @returns {Link}
 */
Link.buildLink = function buildLink(href, contextUrl, linkText) {

    if (href.indexOf("http") === 0) {
        return new Link(true, href,  linkText);
    }
    contextUrl = contextUrl || "/";

    let path = contextUrl.split("/").reduce(Link.buildPath, "");
    let fullPath = [path, href.replace("./", "")].join("");
    return new Link(false, fullPath, linkText);
}

Link.buildPath = function buildPath(combined, next, index, arr) {
    if (arr.length === index + 1) {
        return (combined !== "")? combined + "/" : combined;
    }
    if (!next) {
        return combined;
    } else if (!combined) {
        return next;
    }
    return [combined, next].join("/");
}

