/*
    stringTrim Shim
    Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
 */
window.perfshim("stringTrim", function ()
{
    "use strict";

    if (String.prototype.trim === undefined)
    {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function ()
        {
            return this.replace(rtrim, "");
        }
    }
});