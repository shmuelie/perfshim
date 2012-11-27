## Code Convention

#### Short Version
Development code should be as verbose as possible. Leave minification for production.

#### Long Version

#### Identifiers
Identifiers (function, variable, and property names for example) should be as descriptive as possible. Length is not a concern.  All identifiers must use camelCase, except for constructor functions which should use CamelCase.

#### Operators
* ++ and -- are allowed
* != and == are not allowed, use !== and === instead
* Bitwise operators are not allowed.

#### Environment
* Strict Mode is required.
* Code is allowed to assume it will run in a browser.
* Code is not allowed to assume any code but that built into a browser or supplied by PerfShim will be present.
* ECMAScript 5 features are not allowed unless the feature is added by a shim.
* Console and Alert are allowed, but only in development code.
* Non-standard but accepted globals are not allowed.
* Web Workers are not allowed.

#### Loops
* For-In loops must be filter normally. Not filtered loops MUST have a comment explaining why not.
* Functions are not allowed inside loops.
* When looping through Arrays or Array-like objects store the length in a variable, unless the length is expected to change.

#### Other
* Braces {} must ALWAYS be used.
* Variables must be declared with "var".
* . is allowed in regular expressions.
* arguments.caller and arguements.callee are not allowed. Use the functions name to access it's self.
* Immediate functions must be wrapped in parentheses.
* All strings are to use " for the primary quoting. ' is to be used a quote inside the string.
* \_\_proto__ and \_\_iterator__ are not allowed.
* The debugger statement is allowed, but only in development code.
* eval is allowed, but all use must be carefully and fully explained.
* Semicolons may not be skipped.
* Using [] style property access is only allowed if the name is not known at compile time or is not a valid identifier.
* Switches must have more than one case. Use an IF instead.