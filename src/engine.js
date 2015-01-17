"use strict";

var DiffMatchPatch = require('diff-match-patch');
var dmp = new DiffMatchPatch();
var _ = require('lodash');

var applyPatch = (patch, text) => {
    var result = dmp.patch_apply(dmp.patch_fromText(patch), text);
    var status = result[1];
    if(_.every(status)) return result[0];
    console.error("Patch couldn't be applied");
};

var retrievePage = (root, ref) => {
    if(_.isEmpty(ref)) return root;
    var step = ref[0];
    var children = root.children;
    if(children.length <= step)
        throw "Cannot retrieve page: the reference " + ref + " is broken.";
    return retrievePage(children[step], ref.slice(1));

};

var insertPage = (root, ref, child) => {
    var page = retrievePage(root, ref);
    var children = page.children || [];
    children.push(child);
    page.children = children;
};

var deletePage = (root, ref) => {
    var children = root.children;
    var step = ref[0];
    if(ref.length == 1) {
        if(children.length <= step)
            throw "Cannot delete page: the reference " + ref + " is broken.";
        return children.splice(step, 1);
    } else
        return deletePage(children[step], ref.slice(1));
};

module.exports.applyDelta = (root, delta) => {
    var page = retrievePage(root, delta, ref);
    switch (delta.property) {
        case "title":
            page.title = delta.payload;
            break;
        case "body":
            page.body = applyPatch(delta.payload, page.body);
            break;
        case "page":
            _.assign(page, delta.payload);
            break;
        default:
            throw "Corrupted delta property: " + delta.property;
    }
};

module.exports.getPatch = (A, B) => dmp.patch_toText(dmp.patch_make(A, B));
module.exports.createPage = (title, body, children) => ({
    title: title,
    body: body,
    children: children
});
module.exports.createWiki = (rootPage, deltas) => ({
    root: rootPage,
    deltas: deltas
});
module.exports.deletePage = deletePage;
module.exports.insertPage = insertPage;
module.exports.retrievePage = retrievePage;
module.exports.applyPatch = applyPatch;
