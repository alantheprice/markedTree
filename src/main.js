
class Runner {

    constructor() {
        this.STARTING_DOCUMENT = "README.md";
        this.ROOT_NAME = "Root";
        this.currentHash = "#" + this.STARTING_DOCUMENT;
        /**
         * @type {{[x: string]: Link}
         */
        this.links = {};
        window.onload = () => this.init();
        window.onhashchange = () => this.handleHashChange();
    }

    init() {
        let link = this.buildLink(this.STARTING_DOCUMENT, "./", this.ROOT_NAME);
        this.setDoc(link)
            .then((link) => this.setView(link))
            .then(() => this.buildLinkStructure());
    }

    handleHashChange() {
        if (location.hash === this.currentHash) {
            return;
        }
        let link = this.buildLink(location.hash.replace("#", ""), "./");
        if (link.isExternal) {
            this.openExternalLink(link);
            return;
        }
        this.setDoc(link)
            .then((link) => this.setView(link))
            .then(() => this.buildLinkStructure());
    }

    getMarkedOptions(contextUrl) {
        let renderer = new marked.Renderer();
        console.log(contextUrl);
        renderer.link = this.getLink(contextUrl);
        return {
            renderer: renderer,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        };
    }

    getLink(contextUrl) {
        return (href, title, text) => {
            let link = this.buildLink(href, contextUrl, text);
            this.links[link.hashLink] = link;
            return link.getMarkup(false);
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
    buildLink(href, contextUrl, linkText) {

        if (href.indexOf("http") === 0) {
            return new Link(true, href,  linkText);
        }
        contextUrl = contextUrl || "/";

        let path = contextUrl.split("/").reduce(this.buildPath, "");
        console.log(path);
        let fullPath = [path, href.replace("./", "")].join("");
        let link = new Link(false, fullPath, linkText);
        return this.links[link.hashLink] || link;
    }

    buildPath(combined, next, index, arr) {
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

    /**
     * Gets document string for a url
     * 
     * @param {string} url 
     */
    setDoc(link) {
        link = this.links[link.hashLink] || link;
        if (link.markHtml) {
            return Promise.resolve(this.links[link.hashLink])
        }
        return this.fetchDoc(link)
            .then((docString) => this.mapDoc(docString, link));
    }

    buildLinkStructure() {
        var foundNew = false;
        let promises = this.getLinksArray()
        .filter((link) => !link.isExternal)
        .map(link => {
            if (!link.markHtml) {
                foundNew = true;
                return this.setDoc(link);
            }
            return Promise.resolve();
        });
        Promise.all(promises).then(() => {
            if (!foundNew) {
                this.addLinksToSidebar();
                return;
            }
            this.buildLinkStructure();
        })
    }

    getLinksArray() {
        return Object.keys(this.links).map(key => {
            return this.links[key];
        });
    }

    addLinksToSidebar() {
        let root = this.links["#" + this.STARTING_DOCUMENT];

        let folders = this.getLinksArray()
            .filter((link) => {
                return (!link.isExternal);// && link.linkText !== this.ROOT_NAME);
            })
            .sort((a, b) => {
                if (a.linkText === this.ROOT_NAME || b.linkText === this.ROOT_NAME) {
                    return (a.linkText === this.ROOT_NAME)? -1 : 1;
                }
                return a.linkText.length - b.linkText.length;
            }).reduce((obj, next) => {
                obj[next.directory] = obj[next.directory] || {};
                obj[next.directory].links = obj[next.directory].links || [];
                obj[next.directory].links.push(next);
                return obj;
            }, {})

        let rendered = Object.keys(folders).sort((a, b) => {
            return a.length -b.length;
        })
        .map(key => {
            key = key || "";
            let title = `<div class="link-header">${key}</div>`;
            let rendered = folders[key].links.map(link => link.getMarkup()).join("\n");
            return `${title} <ul class="minimal"> ${rendered}</ul>`;
        }).join("\n");
        
       // let rootView = `<ul class="minimal">${root.getMarkup()}</ul>`;
        this.setHtml("links", rendered);//[rootView, rendered].join("\n"));
    }

    /**
     * Fetches the doc from the api.
     * 
     * @param {Link} link 
     * @returns 
     */
    fetchDoc(link) {
        return fetch(link.href)
            .then((response) => (response.ok)? response.text() : "")
            .catch((error) => this.handleError(error));
    }

    mapDoc(docString, link) {
        if (!docString || docString === "") {
            return;
        }
        link.markHtml = marked(docString, this.getMarkedOptions(link.href));
        this.links[link.hashLink] = link;
        return link;
    }

    setView(link) {
        if (link.isExternal) {
            this.openExternalLink(link);
            return;
        }
        this.currentHash = link.hashLink;
        window.location.hashLink = this.currentHash;
        this.setHtml("content", link.markHtml);
    }

    setHtml(id, innerHTML) {
        document.getElementById(id).innerHTML = innerHTML;
    }

    openExternalLink(link) {
        window.location.assign(link.href);
    }

    handleError(error) {
        window.location.hash = this.currentHash;
    }

}

new Runner();