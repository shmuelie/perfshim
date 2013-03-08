/*
    addEventListener Shim
    Allows the use of addEventListener in browsers that do not implement it.
*/
/*global Element:true */
window.perfshim("addEventListener", function ()
{
    "use strict";
    if (typeof window.addEventListener !== "function")
    {
        var rootElement = Element || HTMLElement;
        rootElement.prototype.addEventListener = function (eventType, listenerFunction, useCapture)
        {
            /// <summary>
            ///     Registers an event handler for the specified event type.
            /// </summary>
            /// <param name="eventType" type="String">
            ///     The type of event type to register.
            /// </param>
            /// <param name="listenerFunction" type="Function">
            ///     The event handler function to associate with the event.
            /// </param>
            /// <param name="useCapture" type="Boolean" optional="true">
            ///     A Boolean value that specifies the event phase to add the event handler for:
            ///     &10;True: Register the event handler for the capturing phase.
            ///     &10;False: Register the event handler for the bubbling phase.
            /// </param>

            var onName = "on" + eventType; // Both of the following are needed many times so to save time they are stored.
            var isFunction = (typeof this[onName] === "function");

            if ((!isFunction) && (this[onName] !== undefined) && (this[onName] !== null))
            {
                throw new Error("The property '" + onName + "' for object '" + this.toString() + "' is set to something that is non-standard");
            }

            var listenerFunctions = [listenerFunction];
            // If there is already a event function and it's not "ours" then add it to the collection too.
            if (isFunction && (this[onName].functions === undefined))
            {
                listenerFunctions.push(this[onName]);
                this[onName] = null;
            }
            // At this point if there is a function it is "ours" so only create "our" function if it's "empty".
            if ((this[onName] === undefined) || (this[onName] === null))
            {
                var $this = this;
                this[onName] = function eventLoop (oEvent)
                {
                    // Some browsers use a global event object instead of passing it as a parameter.
                    if (!oEvent)
                    {
                        oEvent = window.event;
                    }

                    // Execute each function that has been registered for the event.
                    var functionsLength = eventLoop.functions.length;
                    for (var functionsIndex = 0; functionsIndex < functionsLength; functionsIndex++)
                    {
                        eventLoop.functions[functionsIndex].call($this, oEvent);
                    }
                };
                this[onName].functions = [];
            }
            // By now we know there is a function and it is "ours" so add the functions to the internal array.
            this[onName].functions = this[onName].functions.concat(listenerFunctions);
        };

        rootElement.prototype.removeEventListener = function (eventType, listenerFunction, useCapture)
        {
            /// <summary>
            ///     Removes an event handler that the addEventListener method registered.
            /// </summary>
            /// <param name="eventType" type="String">
            ///     The event type that the event handler is registered for.
            /// </param>
            /// <param name="listenerFunction" type="Function">
            ///     The event handler function to remove.
            /// </param>
            /// <param name="useCapture" type="Boolean" optional="true">
            ///     A Boolean value that specifies the event phase to remove the event handler from:
            ///     &10;True: Remove the capturing phase event handler.
            ///     &10;False: Remove the bubbling phase event handler.
            /// </param>


            var onName = "on" + eventType;
            // If "our" function isn't there don't do anything
            if ((typeof this[onName] !== "function") || (this[onName].functions === undefined))
            {
                return;
            }
            // Search for the function
            var itemIndex = this[onName].functions.indexOf(listenerFunction);
            // If found remove.
            if (itemIndex !== -1)
            {
                this[onName].functions.splice(itemIndex, 1);
            }
        };
    }
});