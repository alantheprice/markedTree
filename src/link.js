
 class Link {

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
     * @returns 
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
