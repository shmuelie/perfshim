## PerfShim
The main problem with most shimming solutions is that you download to the 
browser and force it to parse and possibly execute code that is unnecessary. 

PerfShim (short for Performance Shim) solves this problem by analyzing your 
code. Then for each shim able code you use it check if the browser needs it. 
Only if both of those are true does it download a separate files, one per shim, 
that make the browser "safe" for your code.

### How To Use PerfShim
To use PerfShim on a page you start by including the perfshim-vsdoc.js file on 
your page. You do not include any of the scripts from your site that you want 
to use on the page In an inline script on the page you call the perfshim 
function. 

PerfShim can be called in two ways: legacy or objective.

*	Legacy: A simple function call that consist of one or more arguments being 
	passed. If the first argument is a function then it is the callback method. 
	Every other argument (and the first if not a function) must be a string that 
	points to a script in the same origin as the webpage to be analyzed and then 
	executed once all shims are run. This mode is here for backward compatibility 
	with version 1.0
	
	Examples:

		perfshim(somefunction, "Script1.js", "Script2.js", ScriptN.js");
		perfshim("Script1.js", "Script2.js", ScriptN.js");

*	Objective: A function call where the only parameter should be an object 
	formatted based on the formatting bellow. It will be merged with the base 
	options as well as normalized for the following "ease of use" rules:

	1. Any options that take an array may have their value set to the 
	only value directly.
	2. executeScripts and noExecuteScripts can be set set as string(s)
	instead of objects if the script is not cross domain.

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
		neverShims: []
	}

### History
Note about versions: The major and minor are used for the perfshim core 
(perfshim.js), the revision is used to signify new shims , and the build is 
used for updates to existing shims. The three "sections" will increase 
independently of each other.

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