# PerfShim
The main problem with most shimming/polyfilling solutions is that you download 
the code for the shims/polyfills to to the browser, parse them, and execute 
the code. You do all this even though the browser or page may not need the 
shims/polyfills. This not only take longer but in an increasingly mobile world 
the amount of data that needs to be downloaded should be minimized. 

PerfShim (short for Performance Shim) solves these problems in an interesting 
way. Instead of including every shim/polyfill in the main download, PerfShim 
analyzes your page's scripts, checks which shims/polyfills are used by the 
scripts, check if the shims are needed by the browser, and finally if they are 
needed by both downloads them to be executed.

## How To Use PerfShim
To use PerfShim on a page you start by including the perfshim.min.js file on 
your page. You do not include any of the scripts from your site that you want 
to use on the page, PerfShim will download them for you. In an inline script 
on the page you call the perfshim function. 

The only parameter is an object formatted based on the formatting bellow. It 
will be merged with the base options as well as normalized for the following 
"ease of use" rules:

1. Any options that take an array may have their value set to the only value 
   directly.
2. executeScripts and noExecuteScripts can be set set as string(s) instead of 
   objects if the script is not cross domain.

#### Objective Mode Object Scheme
	{
		/*
			An array of either strings or function objects. If a string
			the string should be the name of a function that will be in 
			the global namespace once all shims and user scripts have 
			been executed.
		*/
		callbacks: [],
		/*
			An array of objects that should be executed once all shims have 
			been run. The object should be formed as:

			{
				url: "", // The url to be called, does not need to be in the same origin.
				type: "normal" | "json" // The type of script that the URL points to. If 'normal', the script is in the same origin and should be download normally. If 'json' then the code is downloaded using JSONP. What ever is returned will have ToString() called and will be executed as a string once ready.
				method: "" | /regex/ // The regular expression or string to use in String.replace(String, String) on the URL to replace with the name of the callback method. If type is 'normal' may be excluded.
			}
		*/
		executeScripts: [],
		/*
			Same as executeScripts but scripts are only analyzed for 
			shims. Will not be executed after shims have run.
		*/
		noExecuteScripts: [],
		/*
			If false scripts will not be analyzed for what shims they 
			need. Shims will only be included if in mustShims.
		*/
		analyze: true,
		/*
			An array of string, listing the shims that should be loaded 
			whether need by any script or not.
		*/
		mustShims: [],
		/*
			An array of string, listing shims that should not be loaded 
			even if a script requires it. NOTE: If a shim is in both 
			mustShims and neverShims it will be included.
		*/
		neverShims: [],
			/*
				If true then scripts listed in either executeScripts or
				noExecuteScripts are added to the page via script tags instead 
				of using the global eval.
			*/
		attachScripts: false
	}

#### Examples
Downloads Script1.js and Script2.js form the same domain, analyzes them and 
then executes them

	perfshim({executeScripts: ["Script1.js", "Script2.js"]);

Downloads just Script.js (shows using shortcut for single items in a field that 
is normally an array)

	pershim({executeScripts: "Script.js"});

Downloads otherdomain.com/Script.js and Script.js

	perfshim({executeScripts: ["Script.js", {url:"otherdomain.com/Script.js", type: "json", method: "callback"}]);

#### attachScripts Warnings
The attachScripts option was added to fix three issues with using eval to 
execute the scripts:
1. eval is considered evil and should never be used. In fear that it could be 
   removed this slight future proofs PerfShim.
2. Debugging the scripts is a pain because they are not in their file but in an 
   eval script.
3. Code that is "eval"ed may not be optimized the same as code as "normal" 
   code. This can make code that PerfShim evals run slower.

On the flip side though there are two downsides to not "eval"ing the code that 
PerfShim downloads:
1. Depending on how the browser caches the JavaScript file it may redownload 
   the script. This defeats one of PerfShim's goals of minimizing bytes 
   downloaded.
2. There is the chance that the file that PerfShim downloads to scan and the 
   file the browser downloads to execute may be different. If the difference 
   requires a shim/polyfill the PerfShim did not "patch" then the script could 
   break.

Primarily because of the second downside PerfShim defaults to using eval still.


## How it Works
PerfShim works in a simple 7 step process:

1. Check on the options that can be checked in all environments. 
2. To check the remaining options as well as work PerfShim requires some 
   shims/polyfills. Check if the browser does not have them and if so download 
   them.
3. A second round of option verification occurs.
4. Each script to be analyzed is downloaded using XMLHttpRequest if from the 
   same origin, otherwise using JSONP.
5. Unless disabled each shim/polyfill is check against each script and the 
   browser to see if it is needed. If so it is downloaded. Shims/Polyfills may 
   also be forced to download using the mustShims option.
6. Once all the requested shims/polyfills have downloaded they are executed.
7. All scripts the user specified are to be executed are run using a global 
   eval.

## Shim/PolyfillCredits
* Canvas is from http://code.google.com/p/explorercanvas/ Taken March 7, 2013
* addEventListener contains code based on both John Resig's JavaScript Nija and
  MDN's sample code of how to create an addEventListener Polyfill from
  https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
* JSON from https://github.com/douglascrockford/JSON-js Taken March 7, 2013
* XMLHttpRequest based on code from David Flanagan's JavaScript: The Definitive
  Guide, 6th Edition.


## History
Note about versions: The major and minor are used for the perfshim core 
(perfshim.js), the revision is used to signify new shims , and the build is 
used for updates to existing shims. The three "sections" will increase 
independently of each other.

Version 3.0.4.7
* Removed Legacy calling mode
* Removed requirement on typeOf Shim
* Using minified perfshim.js works now.

Version 2.4.4.7
* Added code to help standardize the event object given in addEventListener shim

Version 2.4.4.6
* Added createElementShip back
* removed getTestElement
* removed loadScriptFile
* Re-orged functions

Version 2.3.4.6
* Complete Redo of repo
* Added Canvas Shim
* Added JSON Shim
* Removed -vsdoc from JS files
* Fixed bug in getFirstScriptElement where the node wasn't being cached

Verions 2.01.2.6
* README.md redone
* Bug fixed in perfshim core

Version 2.0.2.6
* Added New Shims: isArray and typeOf.
* XMLHttpRequest was pulled out of the core and now is it's own shim.
* Updated code to follow Code Conventions.
* Refactored a lot of code to make it smaller and easier to read.
* Bug Fixes
* Comments Updated.
* "Objective" calling mode added.
* Added types JS

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
