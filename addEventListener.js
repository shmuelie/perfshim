/*
    addEventListener Shim
    Allows the use of addEventListener in browsers that do not implement it.
*/
/*global Element:true */
window.perfshim("addEventListener", function ()
{
    "use strict";

    function fixEvent(oEvent)
    {
        /// <summary>
        ///     Make sure the Event object works like the official one.
        /// </summary>
        /// <param name="oEvent" type="Object">Suspect Event object</param>
        /// <returns type="Object" />
        /// <remarks>
        ///     Based on code from "Secrets of the JavaScript Ninja", Listing 13.3
        /// </remarks>

        function returnTrue()
        {
            return true;
        }

        function returnFalse()
        {
            return false;
        }

        if (oEvent.stopPropagation === undefined)
        {
            // Create a clone
            var newEvent = {};
            for (var eventPropertyName in oEvent)
            {
                newEvent[eventPropertyName] = oEvent[eventPropertyName];
            }

            // The event occurred on this element.
            if (newEvent.target === undefined)
            {
                newEvent.target = newEvent.srcElement || document;
            }

            // Handle which other element the event is related to
            newEvent.relatedTarget = (newEvent.fromElement === newEvent.target ? newEvent.toElement : newEvent.fromElement);

            // Stop the default browser action
            newEvent.preventDefault = function ()
            {
                newEvent.returnValue = false;
                newEvent.isDefaultPrevented = returnTrue;
            };
            newEvent.isDefaultPrevented = returnFalse;

            // Stop the event from bubbling
            newEvent.stopOmmediatePropagation = function ()
            {
                newEvent.isImmediatePropagationStopped = returnTrue;
                newEvent.stopPropagation();
            };
            newEvent.isImmediatePropagationStopped = returnFalse;

            // Handle mouse position
            if ((newEvent.clientX !== null) && (newEvent.clientX !== undefined))
            {
                var docElmt = document.documentElement;
                var bodyElmt = document.body;

                newEvent.pageX = newEvent.clientX + ((docElmt && docElmt.scrollLeft) || (bodyElmt && bodyElmt.scrollLeft) || 0) - ((docElmt && docElmt.clientLeft) || (bodyElmt && bodyElmt.clientLeft) || 0);
                newEvent.pageY = newEvent.clientY + ((docElmt && docElmt.scrollTop) || (bodyElmt && bodyElmt.scrollTop) || 0) - ((docElmt && docElmt.clientTop) || (bodyElmt && bodyElmt.clientTop) || 0);
            }

            // Handle Key presses
            newEvent.which = newEvent.charCode || newEvent.keyCode;

            // Fix button for mouse clicks
            // 0 == left, 1 == middle, 2 == right
            if ((newEvent.button !== null) && (newEvent.button !== undefined))
            {
                newEvent.button = (newEvent.button & 1 ? 0 : (newEvent.button & 4 ? 1 : (newEvent.button & 2 ? 2 : 0)));
            }
        }
        return oEvent;
    }

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

                    oEvent = fixEvent(oEvent);

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