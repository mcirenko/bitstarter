#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://www.example.com";
var out = {};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


/*
var assertUrlValid = function(infile) {
    Validate URL 
};
*/
 
var cheerioHtmlFile = function(htmlfile,checksfile) {
    //console.log(cheerio.load(fs.readFileSync(htmlfile)));
    checkHtmlFile(cheerio.load(fs.readFileSync(htmlfile)),checksfile);
};



var restUrl = function(url,checksfile) {
    //console.log("in restUrl");
    rest.get(url).on('complete',function(data) {
	//console.log("data:::::::::"+cheerio.load(data))
	checkHtmlFile(cheerio.load(data), checksfile)
    });	
};



var loadChecks = function(checksfile) {
    //console.log("in loadChecks");
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFileInit = function(htmlfile,checksfile,url) {
    //console.log("in init");
    if (url) {
	//console.log(url);
	restUrl(url,checksfile);
    }
    else {
	cheerioHtmlFile(htmlfile,checksfile);
    }	
    //return out;
};



var checkHtmlFile = function(html, checksfile) {
    //console.log("in checkHtmlFile");
    //console.log("html:"+html);
    //$ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    //console.log("past loadChecks");
    //var out = {};
    for(var ii in checks) {
        var present = html(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    //console.log("past for loop");
    //console.log(out);
    //return out;
    console.log(JSON.stringify(out,null,4));
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to index.html', null, URL_DEFAULT) 
        .parse(process.argv);
    var checkJson = checkHtmlFileInit(program.file, program.checks, program.url);
    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
