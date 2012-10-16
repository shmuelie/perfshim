/*
    createElement Shim
    Extends document.createElement to accept and optional second argument that allows for properties to be set on creation.
    Based on jQuery ability jQuery("<div>",{id:'foo'})[0]
*/
window.perfshim("createElement", function ()
{
    if (document.createElement.length == 1)
    {
        var origCreateElement = document.createElement;

        document.createElement = function (tagName, properties)
        {
            /// <sumamry>
            ///     Creates the specified HTML element.
            /// </summary>
            /// <param name="tagName" type="String">
            ///     String that specifies the type of element to be created
            /// </param>
            /// <param name="properties" type="Object" optional="true">
            ///     An object that has the properties to set on the the created element.
            ///     &10; Any properties that do not exist on the element will be ignored.
            /// </param>
            /// <returns domElement="true" />

            var element = origCreateElement(tagName);
            if (typeof properties === "object")
            {
                for (var property in properties)
                {
                    if (element[property] !== undefined)
                    {
                        element[property] = properties[property];
                    }
                }
            }
            return element;
        }
    }
});