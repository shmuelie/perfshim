/*
    XMLHttpRequest Shim
    Allows for the usage of the XMLHttpRequest object in IE versions that did not implement it as a native object.
*/
window.perfshim("xmlHttpRequest", function ()
{
    "use strict";
    if (window.XMLHttpRequest === undefined)
    {
        var xhr = null;
        try
        {
            // Use the latest version of the ActiveX object if available.
            new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
            xhr = "Msxml2.XMLHTTP.6.0";
        }
        catch (error1)
        {
            try
            {
                // Otherwise fall back on an older version.
                new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
                xhr = "Msxml2.XMLHTTP.3.0";
            }
            catch (error2)
            {
            }
        }

        window.XMLHttpRequest = function ()
        {
            if (xhr)
            {
                return new window.ActiveXObject(xhr);
            }
            else
            {
                throw new TypeError("No XHR to create");
            }
        };
    }
});