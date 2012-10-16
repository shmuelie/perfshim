/*
    addEventListener Shim
    Allows the use of addEventListener in browsers that do not implement it.
*/
window.perfshim("addEventListener", function ()
{
    if (typeof window.addEventListener !== "function")
    {
        extendDomElement("addEventListener", function (sEventType, fListener, useCapture)
        {
            /// <summary>
            ///     Registers an event handler for the specified event type. 
            /// </summary>
            /// <param name="sEventType" type="String">
            ///     The type of event type to register. 
            /// </param>
            /// <param name="fListener" type="Function">
            ///     The event handler function to associate with the event. 
            /// </param>
            /// <param name="useCapture" type="Boolean" optional="true">
            ///     A Boolean value that specifies the event phase to add the event handler for:
            ///     &10;True: Register the event handler for the capturing phase.
            ///     &10;False: Register the event handler for the bubbling phase. 
            /// </param>

            var onName = "on" + sEventType;
            var isFunction = (typeof this[onName] === "function");
            if ((!isFunction) && (this[onName] !== undefined) && (this[onName] !== null))
            {
                throw Error("The property '" + onName + "' for object '" + this.toString() + "' is set to something that is non-standard");
            }

            var fns = [fListener];
            // If there is already a event function and it's not "ours" then add it to the collection too.
            if (isFunction && (this[onName].functions === undefined))
            {
                fns.push(this[onName]);
                this[onName] = null;
            }
            if (!isFunction)
            {
                var $this = this;
                this[onName] = function (oEvent)
                {
                    // Some browsers use a global event object instead of passing it as a parameter.
                    if (!oEvent)
                    {
                        oEvent = window.event;
                    }

                    var fns = arguments.callee.functions;
                    for (var fnIndex = 0; fnIndex < fns.length; fnIndex++)
                    {
                        fns[fnIndex].call($this, oEvent);
                    }
                }
                this[onName].functions = [];
            }
            this[onName].functions = this[onName].functions.concat(fns);
        });

        extendDomElement("removeEventListener", function (sEventType, fListener, useCapture)
        {
            /// <summary>
            ///     Removes an event handler that the addEventListener method registered.
            /// </summary>
            /// <param name="sEventType" type="String">
            ///     The event type that the event handler is registered for. 
            /// </param>
            /// <param name="fListener" type="Function">
            ///     The event handler function to remove.
            /// </param>
            /// <param name="useCapture" type="Boolean" optional="true">
            ///     A Boolean value that specifies the event phase to remove the event handler from:
            ///     &10;True: Remove the capturing phase event handler. 
            ///     &10;False: Remove the bubbling phase event handler. 
            /// </param>


            var onName = "on" + sEventType;
            // Search for the function
            var itemIndex = this[onName].functions.indexOf(fListener);
            // If found remove.
            if (itemIndex != -1)
            {
                this[onName].functions.splice(itemIndex, 1);
            }
        });
    }
});