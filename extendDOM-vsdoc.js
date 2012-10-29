/*
    extendDOM Shim
    Allows for DOM super type elements to be extended even in browsers that do 
    not support it.

    Because of the fact that even in browsers that allow DOM super types to be
    edited differ in how to do it, the shim always wraps the logic. The 
    difference is in that to the user the differences are abstracted and if
    need the ability is added.
*/
window.perfshim("extendDOM", function ()
{
    var addedFunctions = {};

    // If the Element and the HTMLElement objects do not exist then the real Shim is really needed
    if (!window.Element && !window.HTMLElement)
    {
        /*
        The shim works by replacing calls to document.createElement, 
        document.getElementById, document.getElementsByTagName, and
        document.getElementsByName with custom methods. The custom methods
        call the original method and then adds the consume items to the
        returned object(s).
        */

        // Store the original functions so we can call them in the custom one.
        var origCreateElement = document.createElement;
        var origGetElementById = document.getElementById;
        var origGetElementsByTagName = document.getElementsByTagName;
        var origGetElementsByName = document.getElementsByName;

        document.createElement = function (tagName)
        {
            /// <summary>
            ///     Creates the specified HTML element.
            /// </summary>
            /// <param name="tagName" type="String">
            ///     String that specifies the type of element to be created
            /// </param>
            /// <returns domElement="true" />

            var elmt = origCreateElement(tagName);
            for (var name in addedFunctions)
            {
                if (addedFunctions.hasOwnProperty(name))
                {
                    elmt[name] = addedFunctions[name];
                }
            }
            return elmt;
        };

        document.getElementById = function (elementId)
        {
            /// <summary>
            ///     Returns a reference to the element by its ID.
            /// </summary>
            /// <param name="elementId" type="String">
            ///     A case-sensitive string representing the unique ID of the element being sought.
            /// </param>
            /// <returns domElement="true" />

            var elmt = origGetElementById(elementId);
            for (var name in addedFunctions)
            {
                if (addedFunctions.hasOwnProperty(name))
                {
                    elmt[name] = addedFunctions[name];
                }
            }
            return elmt;
        };

        document.getElementsByTagName = function (tagName)
        {
            /// <summary>
            ///     Returns a NodeList of elements with the given tag name.
            /// </summary>
            /// <param name="tagName" type="String">
            ///     A string representing the name of the elements. The special string "*" represents all elements.
            /// </param>
            /// <returns type="Array" elementDomElement="true" />

            var elmts = origGetElementsByTagName(tagName);
            for (var i = 0; i < elmts.length; i++)
            {
                for (var name in addedFunctions)
                {
                    if (addedFunctions.hasOwnProperty(name))
                    {
                        elmts[i][name] = addedFunctions[name];
                    }
                }
            }
            return elmts;
        };

        document.getElementsByName = function (elementName)
        {
            /// <summary>
            ///     Gets a collection of objects based on the value of the NAME or ID attribute.
            /// </summary>
            /// <param name="elementName" type="String">
            ///     A String that specifies the value of a NAME attribute.
            /// </param>
            /// <returns type="Array" elementDomElement="true" />

            var elmts = origGetElementsByName(elementName);
            for (var i = 0; i < elmts.length; i++)
            {
                for (var name in addedFunctions)
                {
                    if (addedFunctions.hasOwnProperty(name))
                    {
                        elmts[i][name] = addedFunctions[name];
                    }
                }
            }
            return elmts;
        };
    }

    window.extendDomElement = function (name, fn)
    {
        /// <summary>
        ///     Extends DOM elements in Cross-Browser manner.
        /// </summer>
        /// <param name="name" type="String">
        ///     Name of the new field.
        /// </param>
        /// <param name="fn" type="Object">
        ///     The value of the new field (usually a function but can be a value)
        /// </param>

        if (window.Element !== undefined)
        {
            window.Element.prototype[name] = fn;
        }
        else if (window.HTMLElement !== undefined)
        {
            window.HTMLElement.prototype[name] = fn;
        }
        else
        {
            addedFunctions[name] = fn;
        }
    };
});