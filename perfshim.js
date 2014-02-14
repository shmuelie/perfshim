/// <reference path="types.js" />

/*
	PerfShim Core 3.0.4.7

	# PerfShim
	The main problem with most shimming/pollyfilling solutions is that you download 
	the code for the shims/pollyfills to to the browser, parse them, and execute 
	the code. You do all this even though the browser or page may not need the 
	shims/pollyfills. This not only take longer but in an increasingly mobile world 
	the amount of data that needs to be downloaded should be minimized. 

	PerfShim (short for Performance Shim) solves these problems in an interesting 
	way. Instead of including every shim/pollyfill in the main download, PerfShim 
	analyzes your page's scripts, checks which shims/pollyfills are used by the 
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

	#### Examples
	Downloads Script1.js and Script2.js form the same domain, analyzes them and
	then executes them.

		perfshim({executeScripts: ["Script1.js", "Script2.js"]);

	Downloads just Script.js (shows using shortcut for single items in a field that
	is normally an array)

		pershim({executeScripts: "Script.js"});
*/

window.perfshim = function (userOptions)
{
	/// <summary>
	///     Start PerfShim logic.
	/// </summary>
	/// <param name="userOptions" type="Options">
	///     Options.
	/// </param>
	"use strict";
	var globalEval = window.execScript || eval; // Makes "eval" work in global scope. Used to execute user given scripts once browser is "patched".

	// Stores the actual script to be analyzed.
	var scripts =
		{
			executeScripts: [],
			noExecuteScripts: []
		};

	//#region Options

	var options =
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
		};

	//#endregion

	//#region Shims

	// A collection of the shims. For more details about the a shim see it's code file.
	// A shim has the following members:
	//  name: the name of the shim, also it's key in the collection.
	//  url: the url to download the script from.
	//  scriptNeeds: a function that takes a script as the only parameter. returns if the script requires the ability that the shim patches.
	//  envrionmentNeeds: a function that returns if the browser needs to be patched or not.
	//  dependencies: a function that returns an array of the name of other shims that this shim requires to be loaded first.
	// Shims may have additional properties, the list above is just the minimal.
	// The order of the shims does matter because they WILL be executed in that order. This allows you to make sure that shims don't mess each other up.
	var shims =
	{
		"Element-Prototype":
		{
			name: "Element-Prototype",
			url: "Scripts\\Element-Prototype.min.js",
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
			url: "Scripts\\HTMLElement-Prototype.min.js",
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
			url: "Scripts\\addEventListener.min.js",
			regex: new RegExp("(((\\w|])(\\[(\"|')addEventListener\\5\\]))|(\\w\\.addEventListener))(\\(|\\.call\\(|\\.apply\\(|\\[(\"|')call\\8\\]\\(|\\[(\"|')apply\\9\\]\\()"),
			scriptNeeds: function (script)
			{
				return this.regex.test(script);
			},
			environmentNeeds: function ()
			{
				return (typeof document.createElement("div").addEventListener !== "function");
			},
			dependencies: function (loadedShims)
			{
				if (loadedShims.hasOwnProperty("Element-Prototype") || loadedShims.hasOwnProperty("HTMLElement-Prototype") || !shims["Element-Prototype"].environmentNeeds() || !shims["HTMLElement-Prototype"].environmentNeeds())
				{
					return ["arrayIndexOf"];
				}
				return ["Element-Prototype", "arrayIndexOf"];
			}
		},
		arrayIndexOf:
		{
			name: "arrayIndexOf",
			url: "Scripts\\arrayIndexOf.min.js",
			regex: new RegExp("(((\\w|])(\\[(\"|')indexOf\\5\\]))|(\\w\\.indexOf))(\\(|\\.call\\(|\\.apply\\(|\\[(\"|')call\\8\\]\\(|\\[(\"|')apply\\9\\]\\()"),
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
		},
		xmlHttpRequest:
		{
			name: "xmlHttpRequest",
			url: "Scripts\\xmlHttpRequest.min.js",
			scriptNeeds: function (script)
			{
				return script.indexOf("new XMLHttpRequest()") !== -1;
			},
			environmentNeeds: function ()
			{
				return window.XMLHttpRequest === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		isArray:
		{
			name: "isArray",
			url: "Scripts\\isArray.min.js",
			scriptNeeds: function (script)
			{
				return script.indexOf("Array.isArray") !== -1;
			},
			environmentNeeds: function ()
			{
				return Array.isArray === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		typeOf:
		{
			name: "typeOf",
			url: "Scripts\\typeOf.min.js",
			scriptNeeds: function (script)
			{
				return script.indexOf("typeOf") !== -1;
			},
			environmentNeeds: function ()
			{
				return window.typeOf === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		JSON:
		{
			name: "JSON",
			url: "Scripts\\json2.min.js",
			scriptNeeds: function (script)
			{
				return script.indexOf("JSON.") !== -1;
			},
			environmentNeeds: function ()
			{
				return JSON === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		canvas:
		{
			name: "canvas",
			url: "Scripts\\canvas.min.js",
			scriptNeeds: function (script)
			{
				return script.indexOf("getContext") !== -1;
			},
			environmentNeeds: function ()
			{
				return document.createElement("canvas").getContext === undefined;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		createElement:
		{
			name: "createElement",
			url: "Scripts\\createElement.min.js",
			environmentNeeds: function ()
			{
				return true;
			},
			scriptNeeds: function ()
			{
				return false;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		fromCodePoint:
		{
			name: "fromCodePoint",
			url: "Scripts\\fromCodePoint.min.js",
			environmentNeeds: function ()
			{
				return String.fromCodePoint === undefined;
			},
			scriptNeeds: function (script)
			{
				return script.indexOf("String.fromCodePoint") !== -1;
			},
			dependencies: function ()
			{
				return [];
			}
		},
		codePointAt:
        {
            name: "codePointAt",
            url: "Scripts\\codePointAt.min.js",
            environmentNeeds: function ()
            {
                return String.prototype.codePointAt === undefined;
            },
            scriptNeeds: function (script)
            {
                return script.indexOf("codePointAt") !== -1;
            },
            dependencies: function ()
            {
                return [];
            }
        }
	};

	//#endregion

	function loadScriptViaTag(url)
	{
		/// <summary>
		///     Adds a script tag to the page to load a JavaScriptFile.
		/// </summary>
		/// <param name="url" type="String">
		///     The URL of the script.
		/// </param>

		loadScriptViaTag.firstScriptElement = loadScriptViaTag.firstScriptElement || document.getElementsByTagName("script")[0];

		var scriptElement = document.createElement("script");
		scriptElement.src = url;
		scriptElement.type = "text/javascript";
		loadScriptViaTag.firstScriptElement.parentNode.insertBefore(scriptElement, loadScriptViaTag.firstScriptElement);
	}

	function loadShim(shim, loadedShims)
	{
		/// <summary>
		///     Loads a shim if it is not already loading.
		/// </summary>
		/// <param name="shim" type="Shim">
		///     The shim to load.
		/// </param>
		/// <param name="loadedShims" type="Object">
		///     The dictionary that keeps track of the shims.
		/// </param>

		// If the shim is already loading or loaded do nothing.
		if (loadedShims[shim.name] === undefined)
		{
			// Check dependencies
			var dependencies = shim.dependencies(loadedShims);
			for (var dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++)
			{
				// Get the dependency
				var dependancyShim = shims[dependencies[dependencyIndex]];
				// If the environment needs the dependency, load it.
				if (dependancyShim.environmentNeeds())
				{
					loadShim(dependancyShim, loadedShims);
				}
			}

			// Mark that this shim is downloading.
			loadedShims[shim.name] = false;

			// Download the shim
			loadScriptViaTag(shim.url);
		}
	}

	function checkIfAllShimsLoaded(loadedShims, whenDoneCallback)
	{
		/// <summary>
		///     Checks if all the wanted shims have loaded. If so they are executed.
		/// </summary>
		/// <param name="loadedShims" type="Object">
		///     The dictionary of shims.
		/// </param>
		/// <param name="whenDoneCallback" type="Function">
		///     The function to call once all shims are loaded.
		/// </param>

		var loadedShim;

		for (loadedShim in loadedShims)
		{
			if (loadedShims.hasOwnProperty(loadedShim) && (loadedShims[loadedShim] === false))
			{
				return;
			}
		}

		whenDoneCallback();
	}

	function analyzeScripts()
	{
		/// <summary>
		///     Analyze downloaded scripts and download shims.
		/// </summary>

		var loadedShims = {};

		function checkIfScriptCollectionNeedsShim(shim, collection)
		{
			/// <summary>
			///     Checks if collection of scripts needs a shim.
			/// </summary>
			/// <param name="shim" type="Shim">
			///     The shim to test for.
			/// </param>
			/// <param name="collection" type="Array" elementType="String">
			///     The script collection to test.
			/// </param>
			/// <returns type="Boolean">
			///     True if the shim was needed, false otherwise.
			/// </returns>

			var collectionLength = collection.length;
			for (var collectionIndex = 0; collectionIndex < collectionLength; collectionIndex++)
			{
				if (shim.scriptNeeds(collection[collectionIndex]))
				{
					return true;
				}
			}

			return false;
		}

		function executeShimsAndScripts()
		{
			/// <summary>
			///     Executes the shims and then the scripts.
			/// </summary>

			for (var shimName in loadedShims)
			{
				if (shims.hasOwnProperty(shimName) && (typeof loadedShims[shimName] === "function"))
				{
					loadedShims[shimName]();
				}
			}

			var scriptsLength = options.executeScripts.length;
			for (var scriptsIndex = 0; scriptsIndex < scriptsLength; scriptsIndex++)
			{
				if (options.attachScripts)
				{
					loadScriptViaTag(options.executeScripts[scriptsIndex]);
				}
				else
				{
					globalEval(scripts.executeScripts[scriptsIndex]);
				}
			}

			var callbacksLength = options.callbacks.length;
			for (var callbacksIndex = 0; callbacksIndex < callbacksLength; callbacksIndex++)
			{
				var callback = options.callbacks[callbacksIndex];
				switch (typeof callback)
				{
					case "function":
						callback();
						break;
					case "string":
						window[callback]();
						break;
				}
			}

			// Cleanup to save some memory and not pollute the global.
			options = null;
			scripts = null;
			shims = null;
			window.perfshim = undefined;
		}

		window.perfshim = function (shimName, runFunction)
		{
			/// <summary>
			///     TO ONLY BE CALLED BY PERFSHIM SHIM CODE
			//      &10; Called by shims to signify that they are downloaded and ready to run.
			/// </summary>
			/// <param name="shimName" type="String">
			///     The name of the shim.
			/// </param>
			/// <param name="runFunction" type="Function">
			///     The function to call to run the shim.
			/// </param>

			loadedShims[shimName] = runFunction;

			checkIfAllShimsLoaded(loadedShims, executeShimsAndScripts);
		};

		for (var shimName in shims)
		{
			if (shims.hasOwnProperty(shimName))
			{
				var shim = shims[shimName];
				if (shim.environmentNeeds() && ((options.mustShims.indexOf(shimName) !== -1) || ((options.neverShims.indexOf(shimName) === -1) && options.analyze && (checkIfScriptCollectionNeedsShim(shim, scripts.executeScripts) && checkIfScriptCollectionNeedsShim(shim, scripts.noExecuteScripts)))))
				{
					loadShim(shim, loadedShims);
				}
			}
		}

		checkIfAllShimsLoaded(loadedShims, executeShimsAndScripts);
	}

	function downloadScripts()
	{
		/// <summary>
		///     Downloads scripts.
		/// </summary>

		function checkIfAllScriptsDownloaded()
		{
			/// <summary>
			///     Checks if all the scripts have downloaded.
			/// </summary>

			var executeScriptsLength = scripts.executeScripts.length;
			if (executeScriptsLength !== options.executeScripts.length)
			{
				return;
			}
			for (var executeScriptsIndex = 0; executeScriptsIndex < executeScriptsLength; executeScriptsIndex++)
			{
				if (typeof scripts.executeScripts[executeScriptsIndex] !== "string")
				{
					return;
				}
			}

			var noExecuteScriptLength = scripts.noExecuteScripts.length;
			if (noExecuteScriptLength !== options.noExecuteScripts.length)
			{
				return;
			}
			for (var noExecuteScriptsIndex = 0; noExecuteScriptsIndex < noExecuteScriptLength; noExecuteScriptsIndex++)
			{
				if (typeof scripts.noExecuteScripts[noExecuteScriptsIndex] !== "string")
				{
					return;
				}
			}

			analyzeScripts();
		}

		function loopThroughScripts(name)
		{
			/// <summary>
			///     Loops through a scripts collection.
			/// </summary>
			/// <param name="name" type="String">
			///     The name of collection to loop through.
			/// </param>

			function innerLoop(scriptIndex)
			{
				/// <summary>
				///     A function used for scoping inside the loop.
				/// </summary>
				/// <param name="scriptIndex">
				///     The index of the script look at.
				/// </param>

				var script = options[name][scriptIndex];
				if (script.type === "normal")
				{
					var xmlHttpRequest = new XMLHttpRequest();
					xmlHttpRequest.open("GET", script.url);
					xmlHttpRequest.onreadystatechange = function ()
					{
						// Only care if the request is done.
						if (this.readyState === 4)
						{
							if (this.status !== 200)
							{
								throw new Error("Unable to download script");
							}

							// Make sure the response is JavaScript
							var contentType = this.getResponseHeader("Content-Type");
							if (contentType.indexOf("javascript") === -1)
							{
								throw new Error("PerfShim was given a 'script' that is not a script");
							}

							scripts[name][scriptIndex] = this.responseText;

							checkIfAllScriptsDownloaded();
						}
					};
					xmlHttpRequest.send();
				}
				else
				{
					loadScriptViaTag(script.url);

					window.perfshim = function (data)
					{
						/// <summary>
						///     Called by JSONP code once downloaded.
						/// </summary>
						/// <param name="data" type="Object">
						///     The JSONP script (in some form).
						/// </param>

						scripts[name][scriptIndex] = data.toString();

						checkIfAllScriptsDownloaded();
					};
				}
			}

			var scriptsLength = options[name].length;
			for (var scriptsIndex = 0; scriptsIndex < scriptsLength; scriptsIndex++)
			{
				innerLoop(scriptsIndex);
			}
		}

		if ((options.executeScripts.length > 0) || (options.noExecuteScripts.length > 0))
		{

			loopThroughScripts("executeScripts");

			loopThroughScripts("noExecuteScripts");
		}
		else
		{
			analyzeScripts();
		}
	}

	function secondValidation()
	{
		/// <summary>
		///     Objective mode requires some shims for it to finish validation.
		/// </summary>

		function testScriptCollection(name)
		{
			/// <summary>
			///     Does validation for script options.
			/// </summary>
			/// <param name="name" type="String">
			///     The script option to validate
			/// </param>

			if ((userOptions[name] !== undefined) && (userOptions[name] !== null))
			{
				switch (typeof userOptions[name])
				{
					case "string":
						options[name].push({ url: userOptions[name], type: "normal" });
						break;
					case "object":
						if (Array.isArray(userOptions[name]))
						{
							var scriptsLength = userOptions[name].length;
							for (var scriptsIndex = 0; scriptsIndex < scriptsLength; scriptsIndex++)
							{
								if (typeof userOptions[name][scriptsIndex] === "string")
								{
									options[name].push({ url: userOptions[name][scriptsIndex], type: "normal" });
								}
								else if ((typeof userOptions[name][scriptsIndex] !== "object") || !scriptsObjectProcessor(userOptions[name][scriptsIndex], options[name]))
								{
									throw new Error("Invalid type in options." + name + " array.");
								}
							}
						}
						else if (!scriptsObjectProcessor(userOptions[name], options[name]))
						{
							throw new Error("options." + name + " was not a valid object");
						}
						break;
					default:
						throw new Error("options." + name + " was not valid");
				}
			}
		}

		function scriptsObjectProcessor(object, collection)
		{
			/// <summary>
			///     Processes the objects expected in executeScripts and noExecuteScripts.
			/// </summary>
			/// <param name="object" type="ScriptObject">
			///     The object to process.
			/// </param>
			/// <param name="collection" type="Array" elementType="Object">
			///     The collection to add the script objects to.
			/// </param>
			/// <returns type="Boolean">
			///     If the object was processed successfully.
			/// </returns>

			if ((object.url === undefined) || (object.url === null) || (typeof object.url !== "string") ||
				(object.type === undefined) || (object.type === null) || (typeof object.type !== "string"))
			{
				return false;
			}

			switch (object.type)
			{
				case "normal":
					collection.push({
						url: object.url,
						type: "normal"
					});
					return true;
				case "json":

					// For this logic we need the typeOf Shim. Therefore it is included here. The Shim still exists as a "downloadable" for cases when the user wants it but this was never run.
					if (window.typeOf === undefined)
					{
						window.typeOf = function (object, nullAsObject)
						{
							/// <summary>
							///     Returns the type of object.
							/// </summary>
							/// <param name="object">
							///     The object to test.
							/// </param>
							/// <param name="nullAsObject" optional="true" type="Boolean">
							///     If true null returns 'object' (the default behavior of typeof). If false returns 'null'.
							/// </param>
							/// <returns type="String">
							///     The type string. For native types the return type is identical to typeof (by default).
							/// </returns>

							nullAsObject = nullAsObject || true;

							var normalTypeOf = typeof object;

							if (normalTypeOf !== "object")
							{
								return normalTypeOf;
							}
							if (nullAsObject && (object === null))
							{
								return "object";
							}
							return Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
						};
					}

					if ((object.method === undefined) || (object.method === null) || !((typeof object.method === "string") || (window.typeOf(object.method) === "regex")))
					{
						return false;
					}

					collection.push({
						url: object.url,
						type: "json",
						method: object.method
					});

					return true;
				default:
					return false;
			}
		}

		function testShimsCollection(name)
		{
			/// <summary>
			///     Does validation for shim collections.
			/// </summary>
			/// <param name="name" type="String">
			///     The shim collection to test.
			/// </param>

			if ((userOptions[name] !== undefined) && (userOptions[name] !== null))
			{
				if (typeof userOptions[name] === "string")
				{
					options[name].push(userOptions[name]);
				}
				else if (Array.isArray(userOptions[name]))
				{
					var shimsLength = userOptions[name].length;
					for (var shimsIndex = 0; shimsIndex < shimsLength; shimsIndex++)
					{
						if (typeof userOptions[name][shimsIndex] === "string")
						{
							options[name].push(userOptions[name][shimsIndex]);
						}
						else
						{
							throw new Error("Invalid type in options." + name + " array.");
						}
					}
				}
				else
				{
					throw new Error("options." + name + " was not valid");
				}
			}
		}

		if ((userOptions.callbacks !== undefined) && (userOptions.callbacks !== null))
		{
			switch (typeof userOptions.callbacks)
			{
				case "string":
				case "function":
					options.callbacks.push(userOptions.callbacks);
					break;
				default:
					if (Array.isArray(userOptions.callbacks))
					{
						var callbacksLength = userOptions.callbacks.length;
						for (var callbacksIndex = 0; callbacksIndex < callbacksLength; callbacksIndex++)
						{
							switch (typeof userOptions.callbacks[callbacksIndex])
							{
								case "string":
								case "function":
									options.callbacks.push(userOptions.callbacks[callbacksIndex]);
									break;
								default:
									throw new Error("Invalid type in options.callback array.");
							}
						}
					}
					else
					{
						throw new Error("options.callback was not valid");
					}
					break;
			}
		}

		testScriptCollection("executeScripts");

		testScriptCollection("noExecuteScripts");

		testShimsCollection("mustShims");

		testShimsCollection("neverShims");

		downloadScripts();
	}

	function checkRequiredShims(requiredShims, whenFinishedCallback)
	{
		/// <summary>
		///     Checks if the required shims need to be downloaded and if so does so.
		/// </summary>
		/// <param name="requiredShims" type="Array" elementType="String">
		///     The shims that are required.
		/// </param>
		/// <param name="whenFinishedCallback" type="Function">
		///     The function to call once all required shims are there.
		/// </param>

		var loadedShims = {};
		var loadingShims = false;

		var requiredShimsLength = requiredShims.length;
		for (var requiredShimIndex = 0; requiredShimIndex < requiredShimsLength; requiredShimIndex++)
		{
			var requiredShim = shims[requiredShims[requiredShimIndex]];
			if (requiredShim.environmentNeeds())
			{
				loadingShims = true;
				loadShim(requiredShim, loadedShims);
			}
		}

		if (loadingShims)
		{
			window.perfshim = function (shimName, shimFunction)
			{
				/// <summary>
				///     When shims are done loading the 'register' it with this method.
				/// <summary>
				/// <param name="shimName" type="String">
				///     The name of the shim that is loaded.
				/// </param>
				/// <param name="shimFunction" type="Function">
				///     The function that will execute the shim.
				/// </param>

				loadedShims[shimName] = shimFunction;

				checkIfAllShimsLoaded(loadedShims, function ()
				{
					for (var loadedShim in loadedShims)
					{
						if (loadedShims.hasOwnProperty(loadedShim) && (typeof loadedShims[loadedShim] === "function"))
						{
							loadedShims[loadedShim]();
						}
					}
					whenFinishedCallback();
				});
			};
		}
		else
		{
			whenFinishedCallback();
		}
	}

	if ((userOptions === undefined) || (userOptions === null))
	{
		throw new Error("'userOptions' cannot be null or undefined");
	}

	if (typeof userOptions !== "object")
	{
		throw new Error("Argument must be an object.");
	}

	if ((userOptions.analyze !== undefined) && (userOptions.analyze !== null) && (typeof userOptions.analyze === "boolean"))
	{
		options.analyze = userOptions.analyze;
	}

	// To do more validation Objective mode requires some shims.
	checkRequiredShims(["xmlHttpRequest", "arrayIndexOf", "isArray"], secondValidation);
};