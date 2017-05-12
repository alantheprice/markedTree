import {Link} from "./link.js";
import marked from "../node_modules/marked/marked.min.js"

export class MarkedConverter {

    /**
     * Creates an instance of MarkedConfig.
     * @param {(Link) => void} linkFoundCallback 
     * 
     * @memberof MarkedConfig
     */
    constructor(linkFoundCallback) {
        this.linkFoundCallback = linkFoundCallback;
    }

    /**
     * Get configuration for the markdown conversion.
     * 
     * @param {string} contextUrl 
     * @returns 
     * 
     * @memberof MarkedConfig
     */
    getConfig(contextUrl) {
        //TODO: Don't recreate the config each time this is called, but still keep url context.
        let renderer = this.getRenderer(contextUrl);
        return {
            renderer: renderer,
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: true
        };
    }

    /**""
     * 
     * 
     * @param {string} contextUrl 
     * @returns 
     * 
     * @memberof MarkedConfig
     */
    getRenderer(contextUrl) {
        let renderer = new marked.Renderer();
        renderer.link = this.getLinkFunction(contextUrl);
        return renderer;
    }

    getLinkFunction(contextUrl) {
        return (href, title, text) => {
            let link = Link.buildLink(href, contextUrl, text);
            this.onLinkFound(link);
            return link.getMarkup(false);
        }
    }

    /**
     * Converts the input markdown document to html.
     * 
     * @param {string} mdDocument - string Markdown document 
     * @param {string} contextUrl - The Parent url context needed for resolving relative paths.
     * @returns 
     * 
     * @memberof MarkedConverter
     */
    convert(mdDocument, contextUrl) {
        return marked(mdDocument, this.getConfig(contextUrl));
    }

    /**
     * Propogates the link found event.
     * 
     * @param {Link} link 
     * 
     * @memberof MarkedConfig
     */
    onLinkFound(link) {
        if (this.linkFoundCallback) {
            this.linkFoundCallback(link);
        }
    }

}