window.perfshim("extendDOM", function ()
{
    var addedFunctions = {};

    if (!window.Element && !window.HTMLElement)
    {
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
                elmt[name] = addedFunctions[name];
            }
            return elmt;
        }

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
                elmt[name] = addedFunctions[name];
            }
            return elmt;
        }

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
                    elmts[i][name] = addedFunctions[name];
                }
            }
            return elmts;
        }

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
                    elmts[i][name] = addedFunctions[name];
                }
            }
            return elmts;
        }
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

        if (window.Element)
        {
            Element.prototype[name] = fn;
        }
        else if (window.HTMLElement)
        {
            HTMLElement.prototype[name] = fn;
        }
        else
        {
            addedFunctions[name] = fn;
        }
    }
});