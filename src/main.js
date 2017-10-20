import { Link } from "./link.js";
import { MarkedConverter } from "./markdownConverter.js";

export class Runner {

    constructor() {
        this.STARTING_DOCUMENT = "README.md";
        this.ROOT_NAME = "Root";
        this.currentHash = "#" + this.STARTING_DOCUMENT;
        this.markConverter = new MarkedConverter(link => this.linkFound(link));
        /**
         * @type {{[x: string]: Link}
         */
        this.links = {};
        this.init();
        window.onhashchange = () => this.handleHashChange();
    }

    init() {
        let link = Link.buildLink(this.STARTING_DOCUMENT, "./", this.ROOT_NAME);
        this.setDoc(link)
            .then((link) => this.setView(link))
            .then(() => this.buildLinkStructure())
            .then(() => {
                if (link.hashLink !== window.location.hash && window.location.hash !== "") {
                    this.handleHashChange();
                } else {
                    window.location.hash = this.currentHash;
                }
            });
    }

    handleHashChange() {
        if (location.hash === this.currentHash) {
            return;
        }
        var link = Link.buildLink(location.hash.replace("#", ""), "./");
        link = this.links[link.hashLink] || link;
        if (link.isExternal) {
            return;
        }
        this.setDoc(link)
            .then((link) => this.setView(link))
            .then(() => this.buildLinkStructure());
    }

    /**
     * 
     * 
     * @param {Link} link 
     * 
     * @memberof Runner
     */
    linkFound(link) {
        if (!this.links[link.hashLink]) {
            // only add new links so we don't innadvertantly overwrite existing values.
            this.links[link.hashLink] = link;
        }
    }

    /**
     * Gets document string for a url
     * 
     * @param {string} url 
     */
    setDoc(link) {
        link = this.links[link.hashLink] || link;
        if (link.markdownLoaded) {
            return Promise.resolve(this.links[link.hashLink]);
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
        
        this.setHtml("links", rendered);
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
            .catch((error) => {
                this.handleError(error);
                return "";
            });
    }

    /**
     * Maps the markdown 
     * 
     * @param {any} docString 
     * @param {Link} link 
     * @returns 
     * 
     * @memberof Runner
     */
    mapDoc(docString, link) {
        if (docString !== "") {
            link.markHtml = this.markConverter.convert(docString, link.href);
        } else {
            link.setEmptyView();
        }
        link.markdownLoaded = true;
        this.links[link.hashLink] = link;
        return link;
    }

    setView(link) {
        if (link.isExternal) {
            return;
        }
        this.currentHash = link.hashLink;
        this.setHtml("content", link.markHtml);
    }

    setHtml(id, innerHTML) {
        document.getElementById(id).innerHTML = innerHTML;
    }

    handleError(error) {
        window.location.hash = this.currentHash;
    }

}

new Runner();
