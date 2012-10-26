/*
    Element.prototype Shim
    Allows the Element object to be used to access the prototype of DOM elements.
*/
window.perfshim("Element-Prototype", function ()
{
    if (window.Element === undefined)
    {
        window.Element = function ()
        {
            /// <summary>
            ///     Doesn't really point at a base class for DOM elements. Instead is used as a 'proxy'.
            /// <summary />
            /// <returns type="Element" />
        };

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
            for (var name in Element.prototype)
            {
                if (Element.prototype.hasOwnProperty(name))
                {
                    elmt[name] = Element.prototype[name];
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
            for (var name in Element.prototype)
            {
                if (Element.prototype.hasOwnProperty(name))
                {
                    elmt[name] = Element.prototype[name];
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
                for (var name in Element.prototype)
                {
                    if (Element.prototype.hasOwnProperty(name))
                    {
                        elmts[i][name] = Element.prototype[name];
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
                for (var name in Element.prototype)
                {
                    if (Element.prototype.hasOwnProperty(name))
                    {
                        elmts[i][name] = Element.prototype[name];
                    }
                }
            }
            return elmts;
        };
    }
});