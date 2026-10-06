/**
 * Cheap sanity check before SVGR: an export URL can answer 200 with an empty body or an HTML
 * error page. Well-formedness is left to svgo's parser, which throws on broken XML.
 */
const assertSvg = (content: string, source: string): void => {
    // ponytail: root-tag presence only; svgo rejects anything else downstream.
    if (!/<svg[\s>]/.test(content)) {
        throw new Error(`Not an SVG document: ${source}`);
    }
};

export { assertSvg };
