/*
    PerfShim Core 0.5
    Parts of this are from "JavaScript: The Definitive Guide".
*/

(function ()
{
    var globalEval = window.execScript || eval; // Makes "eval" work in global scope. Used to execute user given scripts once browser is "patched".
    var scriptUrls; // collection of URLs to load scripts from.
    var scripts = []; // collection of script to execute once browser is "patched".
    var loadedShims = {}; // True means that the shim is either loaded or doesn't need to be loaded (not used or browser implements).
    var callbackFunction = null; // Function to be called once browser is ready, if provided by user.
    var totalScripts = 0; // stores total amount of user scripts. Used to check if scripts is full yet.

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
    //  dependencies: an array of the name of other shims that this shim requires to be loaded first.
    var shims =
    {
        addEventListener:
        {
            name: "addEventListener",
            url: "addEventListener.js",
            scriptNeeds: function (script)
            {
                return (script.indexOf("addEventListener") !== -1);
            },
            environmentNeeds: function ()
            {
                return (typeof getTestElement().addEventListener !== "function");
            },
            dependencies: ["extendDOM"]
        },
        extendDOM:
        {
            name: "extendDOM",
            url: "extendDOM.js",
            environmentNeeds: function ()
            {
                return true;
            },
            scriptNeeds: function (script)
            {
                return false;
            },
            dependencies: []
        }
    };

    function onLoad(f)
    {
        /// <summary>
        ///     Register the function f to run when the document finishes loading.
        ///     &10;If the document has already loaded, run it asynchronously ASAP.
        /// </summary>
        /// <param name="f" type="Function">
        ///     The function to call once the DOM is loaded.
        /// </param>

        if (onLoad.loaded)                  // If document is already loaded
        {
            window.setTimeout(f, 0);        // Queue f to be run as soon as possible
        }
        else
        {
            window.addEventListener("load", f, false);
        }
    }
    // Start by setting a flag that indicates that the document is not loaded yet.
    onLoad.loaded = false;
    // And register a function to set the flag when the document does load.
    onLoad(function () { onLoad.loaded = true; });

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
            // check dependencies
            for (var dependencyIndex = 0; dependencyIndex < shim.dependencies.length; dependencyIndex++)
            {
                // get the dependency
                var dependancyShim = shims[shim.dependencies[dependencyIndex]];
                // if the environment needs the dependency, load it.
                if (dependancyShim.environmentNeeds())
                {
                    loadShim(dependancyShim);
                }
            }

            // mark that this shim is downloading.
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

        // make sure all scripts have been downloaded and processed.
        if ((scriptUrls.length != 0) || (scripts.length != totalScripts))
        {
            return;
        }

        // If any needed shim is not there exit
        var shim;
        for (shim in loadedShims)
        {
            if (loadedShims[shim] === false)
            {
                return;
            }
        }

        // All shims are loaded.
        // Clear namespace of self.
        delete window.perfshim;

        // run each shim.
        for (shim in loadedShims)
        {
            loadedShims[shim]();
        }

        // run each user script.
        while (scripts.length > 0)
        {
            globalEval(scripts.pop());
        }

        // if the user registered a call back call it.
        if (callbackFunction)
        {
            onLoad(callbackFunction);
        }
    }

    window.perfshim = function ()
    {
        /// <summary>
        ///     The primary function of PerfShim and the ONLY code that should exist on a page.
        ///     &10;The function takes a list of scripts to test for shim needs and load. Each script must be it's own argument; e.x perfshim("Script1.js", "Script2.js")
        //      &10;Optionally the first argument can be a function to call once all shims are loaded, each requested script has loaded, and the DOM is ready.
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
                if (arguments.length == 1)
                {
                    throw new Error("PerfShim requires at least one script to be loaded.");
                }
            }
            else
            {
                throw new Error("PerfShim requires at least one script to be loaded.");
            }
        }

        (function ()
        {
            for (var argIndex = 1; argIndex < arguments.length; argIndex++)
            {
                if (typeof arguments[argIndex] !== "string")
                {
                    throw new Error("All scripts must be strings");
                }
            }
        })();

        // Shim XMLHttpRequest if needed.
        // (This shim is included here because it is needed by perfshim itself.
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
        else if (typeof window.XMLHttpRequest !== "function")
        {
            throw new Error("Some JavaScript has replaced the XMLHttpRequest object with something else, to prevent conflicts PerfShim will not run");
        }

        // get the script URLs as a real array.
        scriptUrls = Array.prototype.slice.call(arguments, scriptsStartIndex);

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
            xhr.onreadystatechange = function ()
            {
                // Only care if the request is done.
                if (xhr.readystate === 4)
                {
                    if (xhr.status !== 200)
                    {
                        throw new Error("Unable to download script");
                    }

                    var contentType = xhr.getResponseHeader("Content-Type");
                    if (contentType !== "text/javascript")
                    {
                        throw new Error("PerfShim was given a 'script' that is not a script");
                    }

                    // Check if each shim is need.
                    for (var shimIndex = 0; shimIndex < shims.lenght; shimIndex++)
                    {
                        var shim = shims[shimIndex];
                        // If the shim has not been required by another script and is needed in the browser and is needed by the current script, load it.
                        if ((typeof loadedShims[shim.name] === undefined) && shim.environmentNeeds() && shim.scriptNeeds(xhr.responseText))
                        {
                            loadShim(shim);
                        }
                    }

                    // store the script to be executed once the environment is "safe".
                    scripts.push(xhr.responseText);

                    readyYet();
                }
            };
            xhr.send();
        }
    };

})();