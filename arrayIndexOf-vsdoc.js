/*
    arrayIndexOf Shim
    Allows the use of [].indexOf in browsers that do not implement it.
*/
window.perfshim("arrayIndexOf", function ()
{
    if (typeof Array.prototype.indexOf !== "function")
    {
        Array.prototype.indexOf = function (value, startIndex, comparer)
        {
            /// <summary>
            ///     Searches for the specified object and returns the index of the first occurrence within the range of elements in this instance that extends from the specified index to the last element. 
            /// </summary>
            /// <param name="value" type="Object">
            ///     The object to locate in this instance.
            /// </param>
            /// <param name="startIndex" type="Number" integer="true" optional="true">
            ///     The starting index of the search. 0 (zero) is valid in an empty array.
            /// </param>
            /// <param name="comparer" type="Function" optional="true">
            ///     A function to compare the items with. If left empty "===" is used.
            /// </param>
            /// <returns type="Number" integer="true">
            ///     The index of the first occurrence of value within the range of elements in this instance that extends from startIndex to the last element, if found; otherwise, the lower bound of the array minus 1. 
            /// </returns>

            // Either use the default comparer ('===' which is what the ES5 version uses) or the provided one.
            comparer = comparer || function (a, b)
            {
                return (a === b);
            };

            for (var i = (startIndex || 0); i < this.length; i++)
            {
                if (comparer(this[i], value))
                {
                    return i;
                }
            }
            return -1;
        };
    }
});