/*
	This file exists so that there are "types" for the IDE to give auto complete and complaints on.
*/

function Shim()
{
	"use strict";
	/// <summary>
	///     A shim.
	/// </summary>
	/// <field name="name" type="String">
	///     The name of the shim.
	/// </field>
	/// <field name="url" type="String">
	///     The URL of the shim's JavaScript file.
	/// </field>

	this.name = "";
	this.url = "";
}

Shim.prototype.scriptNeeds = function (script)
{
	"use strict";
	/// <summary>
	///     Checks if a scripts needs this shim.
	/// </summary>
	/// <param name="script" type="String">
	///     The script to analyze.
	/// </param>
	/// <returns type="Boolean">
	///     Returns true if the script needs this shim, otherwise false.
	/// </returns>

	return true;
};

Shim.prototype.environmentNeeds = function ()
{
	"use strict";
	/// <summary>
	///     Checks if the environment needs this shim.
	/// </summary>
	/// <returns type="Boolean">
	///     Returns true if the environment needs this shim, otherwise false.
	/// </returns>

	return true;
};

Shim.prototype.dependencies = function (loadedShims)
{
	"use strict";
	/// <summary>
	///     Returns a collection of shim names that this shim requires to work.
	/// </summary>
	/// <param name="loadedShims" type="Object">
	///     A collection of shims that are loading.
	/// </param>
	/// <returns type="Array" elementType="String">
	///     An array of strings.
	/// </returns>

	return [];
};

function ScriptObject()
{
	"use strict";
	/// <summary>
	///     A script to download.
	/// </summary>
	/// <field name="url" type="String">
	///     The URL of the script.
	/// </field>
	/// <field name="type" type="String">
	///     The type of script. Either 'normal' or 'json'.
	/// </field>
	/// <field name="method">
	///     The string or RegEx to use in String.replace to replace with the name of the callback method.
	/// </field>

	this.url = "";
	this.type = "normal";
	this.method = "";
}

function Options()
{
	/// <summary>
	///     Options for PerfShim.
	/// </summary>
	/// <field name="callbacks" type="Array">
	///     An array of either strings or function objects. If a string the string should be the name of a function that will be in the global namespace once all shims and user scripts have been executed.
	/// </field>
	/// <field name="executeScripts type="Array">
	///     An array of objects that should be executed once all shims have been run. The object should be formed as:
	///     &10;{
	///     &10;    url: "", // The url to be called, does not need to be in the same origin.
	///     &10;    type: "normal" | "json" // The type of script that the URL points to. If 'normal', the script is in the same origin and should be download normally. If 'json' then the code is downloaded using JSONP. What ever is returned will have ToString() called and will be executed as a string once ready.
	///     &10;    method: "" | /regex/ // The regular expression or string to use in String.replace(String, String) on the URL to replace with the name of the callback method. If type is 'normal' may be excluded.
	///     &10;}
	/// </field>
	/// <field name="noExecuteScripts" type="Array">
	///     Same as executeScripts but scripts are only analyzed for shims. Will not be executed after shims have run.
	/// </field>
	/// <field name="analyze" type="Boolean">
	///     If false scripts will not be analyzed for what shims they need. Shims will only be included if in mustShims.
	/// </field>
	/// </field name="mustShims" type="Array" elementType="String">
	///     An array of string, listing the shims that should be loaded whether need by any script or not.
	/// </field>
	/// <field name="neverShims" type="Array" elementType="String">
	///     An array of string, listing shims that should not be loaded even if a script requires it. NOTE: If a shim is in both mustShims and neverShims it will be included.
	/// </field>
	/// <field name="attachScripts" type="Boolean">
	///     If true then scripts listed in either executeScripts or noExecuteScripts are added to the page via script tags instead of using the global eval.
	/// </field>

	this.callbacks = [];
	this.executeScripts = [];
	this.noExecuteScripts = [];
	this.analyze = true;
	this.mustShims = [];
	this.neverShims = [];
	this.attachScripts = false;
}