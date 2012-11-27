/*
    isArray Shim
    Allows the use of Array.isArray in browsers that do not implement it.
*/
window.perfshim("isArray", function ()
{
    "use strict";
    if (typeof Array.isArray !== "function")
    {
        Array.isArray = function (object)
        {
            /// <summary>
            ///     Tells if an object is of type Array.
            /// </summary>
            /// <param name="object" type="Object">
            ///     The object to check.
            /// </param>
            /// <returns type="Boolean" />

            return (typeof object === "object") && (Object.prototype.toString.call(object) === "[object Array]");
        };
    }
});