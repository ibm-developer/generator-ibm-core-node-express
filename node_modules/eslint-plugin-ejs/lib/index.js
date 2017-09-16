/**
 * @fileoverview Parses out ejs declarations found in js files
 * @author Jack Moore
 */
"use strict";
var ejs = require('./processors/ejs.js');


//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import processors
module.exports.processors = {

    // add your processors here
    ".js": ejs,
    ".jsx": ejs
};
