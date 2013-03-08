/*
    typeOf Shim
    Is a more powerful version of the typeof operator
*/
window.perfshim("typeOf", function ()
{
    "use strict";
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
});