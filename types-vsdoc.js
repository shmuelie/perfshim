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