(function() {
    "use strict";

    const STARTING_DOCUMENT = "README.md";
    const ROOT_NAME = "Root";
    var currentHash = "#" + STARTING_DOCUMENT;

    var links = [];


    window.onload = init;
    window.onhashchange = handleHashChange;

    function init() {
        let link = buildLink(STARTING_DOCUMENT, "./", ROOT_NAME);
        setDoc(link)
            .then((link) => setView(link))
            .then(() => buildLinkStructure());
    }

    function handleHashChange() {
        if (location.hash === currentHash) {
            return;
        }
        let link = buildLink(location.hash.replace("#", ""), "./");
        if (link.isExternal) {
            openExternalLink(link);
            return;
        }
        setDoc(link)
            .then((link) => setView(link))
            .then(() => buildLinkStructure());
    }

    function getMarkedOptions(contextUrl) {
        let renderer = new marked.Renderer();
        console.log(contextUrl);
        renderer.link = getLink(contextUrl);
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

    function getLink(contextUrl) {
        return (href, title, text) => {
            let link = buildLink(href, contextUrl, text);
            links[link.hash] = link;
            return `<a href="${link.hash}">${text}</a>`;
        }
    }

    /**
     * Builds a link from a url and context url
     * 
     * @param {string} href 
     * @param {string} contextUrl - calling context url, needed to resolve relative paths.
     * @param {string} [linkText]
     * @returns {{isExternal: boolean, href: string, hash: string, linkText: linkText, render: () => string)}
     */
    function buildLink(href, contextUrl, linkText) {

        if (href.indexOf("http") === 0) {
            return createLink(true, "",  href);
        }
        contextUrl = contextUrl || "/";

        let path = contextUrl.split("/").reduce(buildPath, "");
        console.log(path);
        let fullPath = [path, href.replace("./", "")].join("");
        let link = createLink(false, path, fullPath, linkText);
        return links[link.hash] || link;
    }

    function buildPath(combined, next, index, arr) {
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
     * Creates a line.
     * 
     * @param {boolean} isExternal 
     * @param {string} path 
     * @param {string} fullPath 
     * @param {string} [text]
     * @returns {{isExternal: boolean, href: string, hash: string, linkText: linkText, render: () => string)}
     */
    function createLink(external, path, fullPath, text) {
        let builtHash = "#" + fullPath.replace("./", "");
        return (function () {
            var isExternal = external;
            var directory = path;
            var href = fullPath;
            var hash = (external)? fullPath : builtHash;
            var linkText = text || fullPath;

            return {
                isExternal: isExternal,
                href: href,
                hash: hash,
                directory: path,
                linkText: linkText,
                render: render
            }

            function render() {
                return  `<li><a href="${hash}">${linkText}</a></li>`;
            }

        })();
    }

    /**
     * Gets document string for a url
     * 
     * @param {string} url 
     */
    function setDoc(link) {
        link = links[link.hash] || link;
        if (link.markHtml) {
            return Promise.resolve(links[link.hash])
        }
        return fetchDoc(link)
            .then((docString) => mapDoc(docString, link));
    }

    function buildLinkStructure() {
        var foundNew = false;
        let promises = getLinksArray()
        .filter((link) => !link.isExternal)
        .map(link => {
            if (!link.markHtml) {
                foundNew = true;
                return setDoc(link);
            }
            return Promise.resolve();
        });
        Promise.all(promises).then(() => {
            if (!foundNew) {
                addLinksToSidebar();
                return;
            }
            buildLinkStructure();
        })
    }

    function getLinksArray() {
        return Object.keys(links).map(key => {
            return links[key];
        });
    }

    function addLinksToSidebar() {
        let root = links["#" + STARTING_DOCUMENT];
        let folders = getLinksArray()
            .filter((link) => {
                return (!link.isExternal && link.linkText !== ROOT_NAME);
            }).reduce((obj, next) => {
                obj[next.directory] = obj[next.directory] || {};
                obj[next.directory].links = obj[next.directory].links || [];
                obj[next.directory].links.push(next);
                return obj;
            }, {})
        let rendered = Object.keys(folders).map(key => {
            key = key || "";
            let title = `<div>${key}</div>`;
            let rendered = folders[key].links.map(link => link.render()).join("\n");
            return `${title} <ul> ${rendered}</ul>`;
        }).join("\n");
        console.log(rendered);
        let rootView = `<ul>${root.render()}</ul>`;
        setHtml("links", [rootView, rendered].join("\n"));
    }

    /**
     * Fetches the doc from the api.
     * 
     * @param {object} link 
     * @returns 
     */
    function fetchDoc(link) {
        return fetch(link.href)
            .then((response) => (response.ok)? response.text() : "")
            .catch(handleError);
    }

    function mapDoc(docString, link) {
        if (!docString || docString === "") {
            return;
        }
        console.log(docString, link);
        link.markHtml = marked(docString, getMarkedOptions(link.href));
        links[link.hash] = link;
        return link;
    }

    function setView(link) {
        if (link.isExternal) {
            openExternalLink(link);
            return;
        }
        currentHash = link.hash;
        window.location.hash = currentHash;
        setHtml("content", link.markHtml);
    }

    function setHtml(id, innerHTML) {
        document.getElementById(id).innerHTML = innerHTML;
    }

    function openExternalLink(link) {
        window.location.assign(link.href);
    }

    function handleError(error) {
        // TODO: do more handling here.
        window.location.hash = currentHash;
    }

})();