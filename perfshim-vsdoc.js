/*
	PerfShim Core 0.8

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
*/

(function ()
{
	var globalEval = window.execScript || eval; // Makes "eval" work in global scope. Used to execute user given scripts once browser is "patched".
	var scriptUrls; // Collection of URLs to load scripts from.
	var scripts = []; // Collection of script to execute once browser is "patched".
	var loadedShims = {}; // undefined means that the shim isn't needed. False means it is being loaded. Function means it is loaded.
	var callbackFunction = null; // Function to be called once browser is ready, if provided by user.
	var totalScripts = 0; // Stores total amount of user scripts. Used to check if scripts is full yet.

	function getFirstScriptElement()
	{
		/// <summary>
		///     Gets the first script element in the page.
		/// </summary>
		/// <returns domElement="true" />

		getFirstScriptElement.element = document.getElementsByTagName("script")[0];
		return getFirstScriptElement.element;
	}

	function getTestElement()
	{
		/// <summary>
		///     Gets a DOM element for testing if shims are needed.
		/// </summary>
		/// <returns domElement="true" />

		getTestElement.element = getTestElement.element || document.createElement("div");
		return getTestElement.element;
	}

	// A collection of the shims.
	// A shim has the following members:
	//  name: the name of the shim, also it's key in the collection.
	//  url: the url to download the script from.
	//  scriptNeeds: a function that takes a script as the only parameter. returns if the script requires the ability that the shim patches.
	//  envrionmentNeeds: a function that returns if the browser needs to be patched or not.
	//  dependencies: a function that returns an array of the name of other shims that this shim requires to be loaded first.
	// shimes may have additional properties, the list above is just the minimal.
	// The order of the shims does matter because they WILL be executed in that order. This allows you to make sure that shims don't mess each other up.
	var shims =
	{
		"Element-Prototype":
		{
			name: "Element-Prototype",
			url: "Element-Prototype-vsdoc.js",
			regex: /(?:\s|;|^|(?:window\.))Element\.prototype(?:(?:\.\w)|\[)/,
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			environmentNeeds: function ()
			{
				return (window.Element === undefined);
			},
			dependencies: function ()
			{
				return [];
			}
		},
		"HTMLElement-Prototype":
		{
			name: "HTMLElement-Prototype",
			url: "HTMLElement-Prototype-vsdoc.js",
			regex: /(?:\s|;|^|(?:window\.))HTMLElement\.prototype(?:(?:\.\w)|\[)/,
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			environmentNeeds: function ()
			{
				return (window.HTMLElement === undefined);
			},
			dependencies: function ()
			{
				return [];
			}
		},
		addEventListener:
		{
			name: "addEventListener",
			url: "addEventListener-vsdoc.js",
			regex: new RegExp("(((\\w|])(\\[(\"|')addEventListener\\5\\]))|(\\w\\.addEventListener))(\\(|\\.call\\(|\\.apply\\(|\\[(\"|')call\\8\\]\\(|\\[(\"|')apply\\9\\]\\()"),
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			environmentNeeds: function ()
			{
				return (typeof getTestElement().addEventListener !== "function");
			},
			dependencies: function ()
			{
				if ((loadedShims["Element-Prototype"] === undefined) && (loadedShims["HTMLElement-Prototype"] === undefined) && shims["Element-Prototype"].environmentNeeds() && shims["HTMLElement-Prototype"].environmentNeeds())
				{
					return ["Element-Prototype"];
				}
				return [];
			}
		},
		arrayIndexOf:
		{
			name: "arrayIndexOf",
			url: "arrayIndexOf-vsdoc.js",
			regex: new RegExp("(((\\w|])(\\[(\"|')IndexOf\\5\\]))|(\\w\\.IndexOf))(\\(|\\.call\\(|\\.apply\\(|\\[(\"|')call\\8\\]\\(|\\[(\"|')apply\\9\\]\\()"),
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			environmentNeeds: function ()
			{
				return Array.prototype.indexOf === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		}/*,
		createElement:
		{
			name: "createElement",
			url: "createElement-vsdoc.js",
			regex: new RegExp("document\\.createElement\\((\"|')\\w+\\1,"),
			environmentNeeds: function ()
			{
				return (document.createElement.length === 1);
			},
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			dependencies: function ()
			{
				return [];
			}
		}*/
	};

	function loadShim(shim)
	{
		/// <summary>
		///     Loads a shim if it is not already loading.
		/// </summary>
		/// <param name="shimUrl" type="Object">
		///     The shim to load.
		/// </param>

		// If the shim is already loading or loaded do nothing.
		if (loadedShims[shim.name] === undefined)
		{
			// Check dependencies
			var dependencies = shim.dependencies();
			for (var dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++)
			{
				// Get the dependency
				var dependancyShim = shims[dependencies[dependencyIndex]];
				// If the environment needs the dependency, load it.
				if (dependancyShim.environmentNeeds())
				{
					loadShim(dependancyShim);
				}
			}

			// Mark that this shim is downloading.
			loadedShims[shim.name] = false;

			// Download the shim
			var scriptElement = document.createElement("script");
			scriptElement.src = shim.url;
			scriptElement.type = "text/javascript";
			getFirstScriptElement().parentNode.insertBefore(scriptElement, getFirstScriptElement());
		}
	}

	function readyYet()
	{
		/// <summary>
		///     Checks if all the shims have downloaded. If so runs them, then the users scripts.
		/// </summary>

		// Make sure all scripts have been downloaded and processed.
		if ((scriptUrls.length !== 0) || (scripts.length !== totalScripts))
		{
			return;
		}

		// If any needed shim is not there exit
		for (var shim in loadedShims)
		{
			if (loadedShims.hasOwnProperty(shim) && (loadedShims[shim] === false))
			{
				return;
			}
		}

		// All shims are loaded.
		// Clear namespace of self.
		try
		{
			delete window.perfshim;
		}
		catch (error)
		{
			window.perfshim = null;
		}

		// run each shim.
		for (var shimName in shims)
		{
			if (shims.hasOwnProperty(shimName) && (typeof loadedShims[shimName] === "function"))
			{
				loadedShims[shimName]();
			}
		}

		// Run each user script.
		while (scripts.length > 0)
		{
			globalEval(scripts.pop());
		}

		// If the user registered a call back call it.
		if (callbackFunction)
		{
			callbackFunction();
		}
	}

	function xhr_onreadystagechange()
	{
		// Only care if the request is done.
		if (this.readyState === 4)
		{
			if (this.status !== 200)
			{
				throw new Error("Unable to download script");
			}

			var contentType = this.getResponseHeader("Content-Type");
			if (contentType.indexOf("javascript") !== contentType.length - 10)
			{
				throw new Error("PerfShim was given a 'script' that is not a script");
			}

			// Check if each shim is need.
			for (var shimName in shims)
			{
				if (shims.hasOwnProperty(shimName))
				{
					var shim = shims[shimName];
					// If the shim has not been required by another script and is needed in the browser and is needed by the current script, load it.
					if ((loadedShims[shimName] === undefined) && shim.environmentNeeds() && shim.scriptNeeds(this.responseText))
					{
						loadShim(shim);
					}
				}
			}

			// Store the script to be executed once the environment is "safe".
			scripts.push(this.responseText);

			readyYet();
		}
	}

	window.perfshim = function ()
	{
		/// <summary>
		///     The primary function of PerfShim and the ONLY code that should exist on a page.
		///     &10;The function takes a list of scripts to test for shim needs and load. Each script must be it's own argument; e.x perfshim("Script1.js", "Script2.js")
		//      &10;Optionally the first argument can be a function to call once all shims are loaded and each requested script has loaded.
		/// </summary>

		if (arguments.length === 0)
		{
			throw new Error("PerfShim requires at least one script to be loaded.");
		}

		var scriptsStartIndex = 0;
		if (typeof arguments[0] !== "string")
		{
			if (typeof arguments[0] === "function")
			{
				scriptsStartIndex = 1;
				callbackFunction = arguments[0];
				if (arguments.length === 1)
				{
					throw new Error("PerfShim requires at least one script to be loaded.");
				}
			}
			else
			{
				throw new Error("PerfShim requires at least one script to be loaded.");
			}
		}

		for (var argIndex = 1; argIndex < arguments.length; argIndex++)
		{
			if (typeof arguments[argIndex] !== "string")
			{
				throw new Error("All scripts must be strings");
			}
		}

		// Shim XMLHttpRequest if needed.
		// (This shim is included here because it is needed by perfshim itself.)
		if (window.XMLHttpRequest === undefined)
		{
			window.XMLHttpRequest = function ()
			{
				try
				{
					// Use the latest version of the ActiveX object if available.
					return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
				}
				catch (e1)
				{
					try
					{
						// Otherwise fall back on an older version.
						return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
					}
					catch (e2)
					{
						throw new Error("PerfShim requires the either the XMLHttpRequest native object or ActiveX control. Neither is present in the current system.");
					}
				}
			};
		}
		else if ((typeof window.XMLHttpRequest !== "function") && (window.XMLHttpRequest.toString() !== "[object XMLHttpRequest]"))
		{
			throw new Error("Some JavaScript has replaced the XMLHttpRequest object with something else, to prevent conflicts PerfShim will not run");
		}

		// Get the script URLs as a real array.
		scriptUrls = Array.prototype.slice.call(arguments, scriptsStartIndex);
		totalScripts = scriptUrls.length;

		// To save "names" on window, reasign the name to the function needed by the shims.
		window.perfshim = function (shimName, fn)
		{
			/// <summary>
			///     TO ONLY BE CALLED BY PERFSHIM SHIM CODE
			//      &10; Called by shims to signify that they are downloaded and ready to run.
			/// </summary>
			/// <param name="shimName" type="String">
			///     The name of the shim.
			/// </param>
			/// <param name="fn" type="Function">
			///     The function to call to run the shim.
			/// </param>

			loadedShims[shimName] = fn;

			readyYet();
		};

		// Begin loading scripts.
		while (scriptUrls.length > 0)
		{
			// Get the next script
			var xhr = new XMLHttpRequest();
			var scriptUrl = scriptUrls.pop();
			xhr.open("GET", scriptUrl);
			xhr.onreadystatechange = xhr_onreadystagechange;
			xhr.send();
		}
	};

})();