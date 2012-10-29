﻿## PerfShim
The main problem with most shimming solutions is that you download to the 
browser and force it to parse and possibly execute code that is unnecessary. 

PerfShim (short for Performance Shim) solves this problem by analyzing your 
code. Then for each shim able code you use it check if the browser needs it. 
Only if both of those are true does it download a separate files, one per shim, 
that make the browser "safe" for your code.

### How To Use PerfShim
To use PerfShim on a page you start by including the perfshim-vsdoc.js file on 
your page. You do not include any of the scripts from your site that you want 
to use on the page (currently PerfShim only works with scripts from the same 
origin as the page so third-party scripts cannot be used with it). In an inline 
script on the page you call the perfshim function. The first argument can be a 
function that is on the page to be called once all shims are loaded and your 
scripts are loaded. (If you don't care about being 
alerted to this state then the first argument should be used like the rest.) 
The rest of the arguments are strings (can be relative or absolute) that point 
at your scripts you would like to use on the page.

Examples:
	perfshim(somefunction, "Script1.js", "Script2.js", ScriptN.js");
	perfshim("Script1.js", "Script2.js", ScriptN.js");

### History
Note about versions: The major and minor are used for the perfshim core 
(perfshim.js), the revision is used to signify new shims , and the build is 
used for updates to existing shims. The three "sections" will increase 
independently of each other.

Version 1.0.0.0
* more comments.
* logo.
* minified versions.

Version 0.8
* Lots of bug fixes
* removed createElement shim from list
* added shim for Array.indexOf
* removed extendDOM shim
* added Element and HTMLElement shims (which replace the removed extendDOM shim).
* lots of comments
* regular expression based processing of scripts for shims
* new dependency system for shims.

Version 0.6
* lots of bug fixes
* new shim for createElement
* added test case for addEventListener

Version 0.5
* First public release, includes shim for addEventListener and its dependency extendDOM.