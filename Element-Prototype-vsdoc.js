/*
    Element.prototype Shim
    Allows the Element object to be used to access the prototype of DOM elements.
*/
window.perfshim("Element-Prototype", function ()
{
    "use strict";
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
        var originalCreateElement = document.createElement;
        var originalGetElementById = document.getElementById;
        var originalGetElementsByTagName = document.getElementsByTagName;
        var originalGetElementsByName = document.getElementsByName;

        /*
            For each function we create a function that calls the original and then loops through the added properties adding them to the returned element(s).
        */

        document.createElement = function (tagName)
        {
            /// <summary>
            ///     Creates the specified HTML element.
            /// </summary>
            /// <param name="tagName" type="String">
            ///     String that specifies the type of element to be created
            /// </param>
            /// <returns domElement="true" />

            var element = originalCreateElement(tagName);
            for (var name in window.Element.prototype)
            {
                if (window.Element.prototype.hasOwnProperty(name))
                {
                    element[name] = window.Element.prototype[name];
                }
            }
            return element;
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

            var element = originalGetElementById(elementId);
            for (var name in window.Element.prototype)
            {
                if (window.Element.prototype.hasOwnProperty(name))
                {
                    element[name] = window.Element.prototype[name];
                }
            }
            return element;
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

            var elements = originalGetElementsByTagName(tagName);
            var elementsLength = elements.length;
            for (var elementIndex = 0; elementIndex < elementsLength; elementIndex++)
            {
                for (var name in window.Element.prototype)
                {
                    if (window.Element.prototype.hasOwnProperty(name))
                    {
                        elements[elementIndex][name] = window.Element.prototype[name];
                    }
                }
            }
            return elements;
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

            var elements = originalGetElementsByName(elementName);
            var elementsLength = elements.length;
            for (var elementIndex = 0; elementIndex < elementsLength; elementIndex++)
            {
                for (var name in window.Element.prototype)
                {
                    if (window.Element.prototype.hasOwnProperty(name))
                    {
                        elements[elementIndex][name] = window.Element.prototype[name];
                    }
                }
            }
            return elements;
        };
    }
});