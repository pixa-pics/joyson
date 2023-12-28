"use strict";
import B64Hash from "b64hash";
import ArrayBufferIDManager from "./buffer";

/**
 * DataProcessEngine class for handling various data types and encode or decode them.
 * This class provides mechanisms to convert different data types to a specific format and revert them back to their original form.
 */
class DataProcessEngine {
    constructor(baseStr, shortBaseStr, encapsulateFunc, hasher, encodeObjectOut, decodeObjectOut, stringifyOut, parseOut) {
        // Initializations with fallbacks
        this._hasher = new B64Hash(1);

        // Method for hashing data
        this.hashThis = hasher || this._hasher.hash.bind(this._hasher);

        // Base and shortBase strings for encoding
        this.base = baseStr || "data:joyson/";
        this.shortBase = shortBaseStr || "d:j/";
        this.baseLength = this.base.length;
        this.shortBaseLength = this.shortBase.length;

        // Function for encapsulating data
        this.encapsulate = encapsulateFunc || function (str) { return JSON.stringify(str); };

        // Methods for encoding and decoding object data
        this.encodeObjectOut = encodeObjectOut || function (data) { return data; }
        this.decodeObjectOut = decodeObjectOut || function (data) { return data; }

        // Methods for stringifying and parsing data
        this.stringifyOut = stringifyOut || JSON.stringify;
        this.parseOut = parseOut || JSON.parse;

        // Error constructors map
        this._initializeErrorConstructors();

        // ArrayBufferIDManager instance for managing array buffers
        this.arrayBufferIDManager = new ArrayBufferIDManager();

        // Buffer constructors map
        this._initializeBufferConstructors();

        // Initialize dynamic types
        this._initializeDynamicTypes(["object", "number", "bigint", "map", "set", "date", "string", "error", "regexp", "buffer", "boolean", "static"]);
    }

    // Initializes dynamic types for data processing
    _initializeDynamicTypes(types){
        "use strict";
        this.dynamicValues = {};
        this.dynamicValuesIdKey = {};
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            this.dynamicValues[type] = {};
            this.dynamicValues[type].name = type;
            this.dynamicValues[type].str = this.base + this.dynamicValues[type].name + ";";
            this.dynamicValues[type].id = this.hashThis(this.dynamicValues[type].name);
            this.dynamicValues[type].shortStr = this.shortBase + this.dynamicValues[type].id + ";";
            this.dynamicValues[type].strCode = new Uint8Array(this.dynamicValues[type].str.split("").map(function (char){return char.charCodeAt(0);}));
            this.dynamicValues[type].shortStrCode = new Uint8Array(this.dynamicValues[type].shortStr.split("").map(function (char){return char.charCodeAt(0);}));
            this.dynamicValues[type].strLen = this.dynamicValues[type].str.length;
            this.dynamicValues[type].shortStrLen = this.dynamicValues[type].shortStr.length;
            this.dynamicValuesIdKey[this.dynamicValues[type].id] = this.dynamicValues[type].name;
        }
    }

    // Initializes error constructors map
    _initializeErrorConstructors() {
        this.errorConstructors = {
            // Standard JavaScript error constructors
            "Error": Error,
            "TypeError": TypeError,
            "SyntaxError": SyntaxError,
            "ReferenceError": ReferenceError,
            "RangeError": RangeError,
            "EvalError": EvalError,
            "URIError": URIError,
            "DOMException": DOMException
        };
    }

    // Initializes buffer constructors map
    _initializeBufferConstructors() {
        this.bufferConstructors = {
            // ArrayBuffer and typed arrays constructors
            "ArrayBuffer": ArrayBuffer,
            "Uint8Array": Uint8Array,
            "Uint8ClampedArray": Uint8ClampedArray,
            "Int8Array": Int8Array,
            "Uint16Array": Uint16Array,
            "Int16Array": Int16Array,
            "Uint32Array": Uint32Array,
            "Int32Array": Int32Array,
            "Float32Array": Float32Array,
            "Float64Array": Float64Array
        };
    }
    // Clears the ArrayBufferIDManager
    clear(){
        "use strict";
        this.arrayBufferIDManager.clear();
    }
    // Retrieves all array buffers
    getAllArrayBuffer(){
        "use strict";
        var arrayBuffer = this.arrayBufferIDManager.retrieveAll();
        this.clear();
        return arrayBuffer;
    }
    // Sets all array buffers with provided data
    setAllArrayBuffer(data){
        "use strict";
        this.clear();
        this.arrayBufferIDManager.insertAll(data);
    }
    // Private helper to check if data is not a number
    _isNotNumber(data){
        "use strict";
        return isNaN(data);
    }
    // Private helper to check if data is not a finite number
    _isNotFiniteNumber(data){
        "use strict";
        return !isFinite(data);
    }
    // Private helper to check if data is not an object
    _isNotObject(data){
        "use strict";
        return data === null;
    }
    // Private helper to check if data is not a COMMON STRING
    _isNotString(data){
        "use strict";
        return data.includes("\x00");
    }
    // Private helper to check if data is an error object
    _isError(data) {
        "use strict";
        if(typeof data.name != "undefined"){
            if(data.name in this.errorConstructors){
                return true;
            }
        }
        return false;
    }
    // Private helper to check if data is a buffer
    _isBuffer(data) {
        "use strict";
        if(data instanceof ArrayBuffer || typeof data.buffer == "object"){
            var constructor = data.constructor || {};
            var name = constructor.name;
            if(name in this.bufferConstructors){
                return true;
            }
        }
        return false;
    }
    // Private helper to determine if the data type must be decoded
    // with the short prefix or the full one.
    _mustDecodeOfType(data) {
        "use strict";
        if(typeof data == "string"){
            if(data.startsWith(this.base)){
                return 1;
            }else if(data.startsWith(this.shortBase)){
                return 2;
            }
        }
        return 0;
    }
    // Translate the short type of data to the usual type name
    _dataTypeNameFromKey(key) {
        return this.dynamicValuesIdKey[key];
    }
    // Private helper to decode data based on type
    _decode(dataStr, isShortBase) {
        "use strict";
        var typeAndDataParameter = dataStr.slice(isShortBase ? this.shortBaseLength: this.baseLength).split(";");
        var type = typeAndDataParameter[0];
        var dataParameter = typeAndDataParameter[1];
        var typeName = isShortBase ? this._dataTypeNameFromKey(type): type;

        switch (typeName) {
            case "static":
                return this.decodeStatic(dataParameter);
            case "number":
                return this.decodeSpecialNumber(dataParameter);
            case "bigint":
                return this.decodeBigNumber(dataParameter);
            case "string":
                return this.decodeSpecialString(dataParameter);
            case "boolean":
                return this.decodeBoolean(dataParameter);
            case "map":
                return this.decodeMap(dataParameter);
            case "set":
                return this.decodeSet(dataParameter);
            case "date":
                return this.decodeDate(dataParameter);
            case "regexp":
                return this.decodeRegexp(dataParameter);
            case "error":
                return this.decodeError(dataParameter);
            case "buffer":
                return this.decodeBuffer(dataParameter);
            case "object":
                return this.decodeSpecialObject(dataParameter);
            default:
                return this.decodeObjectOut(dataStr, isShortBase)
        }
    }
    // Decodes the provided data
    decode(data, optionalIsShortBase){
        "use strict";
        var decodeMode = this._mustDecodeOfType(data);
        switch (decodeMode){
            case 0: // No decoding
                return (typeof data == "object") ? this.decodeObjectOut(data, optionalIsShortBase): data;
            case 1: // Decode knowing the base identification string is long
                return this._decode(data, false);
            case 2: // Decode knowing the base identification string is short
                return this._decode(data, true);
        }
    }
    // Decodes special data types being static (without parameters)
    decodeStatic(dataParameter) {
        "use strict";
        switch (dataParameter) {
            case "nan":
                return NaN;
            case "null":
                return null;
            case "undefined":
                return undefined;
        }
    }
    // Decodes special numbers
    decodeSpecialNumber(dataParameter) {
        "use strict";
        switch (dataParameter) {
            case "nan":
                return NaN;
            case "infinity":
                return Infinity;
            case "-infinity":
                return - Infinity;
            case "epsilon":
                return Number.EPSILON;
            case "-epsilon":
                return - Number.EPSILON;
            case "-0":
                return parseInt("-0");
            default:
                return Number(dataParameter)
        }
    }
    // Decode BigInt
    decodeBigNumber(dataParameter) {
        "use strict";
        return BigInt(dataParameter);
    }
    // Decode special strings
    decodeSpecialString(dataParameter) {
        "use strict";
        return atob(dataParameter);
    }
    // Decode boolean values
    decodeBoolean(dataParameter) {
        "use strict";
        return dataParameter === "true";
    }
    // Decode Map objects
    decodeMap(dataParameter) {
        "use strict";
        var dataObjectString = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectString);
        return new Map(dataObject);
    }
    // Decode Set objects
    decodeSet(dataParameter) {
        "use strict";
        var dataObjectString = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectString);
        return new Set(dataObject);
    }
    // Decode Date objects
    decodeDate(dataParameter) {
        "use strict";
        return new Date(dataParameter) || new Date(NaN);
    }
    // Decode RegExp objects
    decodeRegexp(dataParameter) {
        "use strict";
        var dataParameters = dataParameter.split(":");
        var pattern = atob(dataParameters[0]);
        var flags = atob(dataParameters[1]);
        return new RegExp(pattern, flags);
    }
    // Decode Error objects
    decodeError(dataParameter){
        "use strict";
        var dataParameters = dataParameter.split(":");
        var name = atob(dataParameters[0]);
        var message = atob(dataParameters[1]);
        var constructor = this.errorConstructors[name];
        return new constructor(message);
    }
    // Decode buffer data
    decodeBuffer(dataParameter) {
        "use strict";
        var dataParameters = dataParameter.split(":"),
            constructorName = dataParameters[0],
            isBuffer = constructorName === "ArrayBuffer",
            constructor = this.bufferConstructors[constructorName],
            byteOffset = parseInt(dataParameters[1], 16),
            length = parseInt(dataParameters[2], 16),
            bufferId = parseInt(dataParameters[3], 16);
        var buffer = this.arrayBufferIDManager.retrieve(bufferId)
        return isBuffer ? buffer : new constructor(buffer, byteOffset, length);
    }
    // Decode special objects
    decodeSpecialObject(dataParameter){
        "use strict";
        var dataObjectStringified = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectStringified)
        return Object(dataObject)
    }
    // Encode data with the final format
    _encodeFinal(dataName, dataParameter, useShortBase){
        "use strict";
        return useShortBase ?
            this.dynamicValues[dataName].shortStr+dataParameter:
            this.encapsulate(this.dynamicValues[dataName].str+dataParameter);
    }
    // Act like a router, it encodes data of various types
    encode(data, useShortBase) {
        "use strict";
        switch (typeof data) {
            case "undefined":
                return this.encodeStatic(data, useShortBase)
            case "number":
                if(this._isNotNumber(data)){
                    return this.encodeStatic(data, useShortBase);
                }else {
                    return this.encodeNumber(data, useShortBase);
                }
            case "bigint":
                return this.encodeBigNumber(data, useShortBase);
            case "string":
                if(this._isNotString(data)){
                    return this.encodeSpecialString(data, useShortBase);
                }else {
                    return this.encodeString(data, useShortBase)
                }
            case "boolean":
                return this.encodeBoolean(data, useShortBase);
            case "object":
                if(this._isNotObject(data)){
                    return this.encodeStatic(data, useShortBase);
                }else if(typeof data.get == "function"){
                    return this.encodeMap(data, useShortBase);
                }else if(typeof data.delete == "function"){
                    return this.encodeSet(data, useShortBase);
                }else  if (typeof data.toISOString == "function") {
                    return this.encodeDate(data, useShortBase);
                }else if(typeof data.exec == "function"){
                    return this.encodeRegexp(data, useShortBase);
                }else if(data !== data.valueOf()){
                    return this.encodeSpecialObject(data, useShortBase);
                }else if(this._isError(data)){
                    return this.encodeError(data, useShortBase);
                }else if(this._isBuffer(data)){
                    return this.encodeBuffer(data, useShortBase);
                }else {
                    return this.encodeObject(data, useShortBase);
                }
        }
    }
    // Encode static data types (data without parameters)
    encodeStatic(data, useShortBase){
        "use strict";
        var dataName = "static", dataParameter;
        switch (typeof data){
            case "number":
                dataParameter = "nan";
                break;
            case "object":
                dataParameter = "null";
                break;
            case "undefined":
                dataParameter = "undefined";
                break;
        }
        return this._encodeFinal(dataName, dataParameter, useShortBase)
    }
    // Encode special numbers
    encodeNumber(data, useShortBase) {
        "use strict";
        var dataName = "number", dataParameter;
        switch (data) {
            case NaN:
                dataParameter = "nan";
                break;
            case Infinity:
                dataParameter = "infinity";
                break;
            case - Infinity:
                dataParameter = "-infinity";
                break;
            case Number.EPSILON:
                dataParameter = "epsilon";
                break;
            case - Number.EPSILON:
                dataParameter = "-epsilon";
                break;
            default:
                if (Number(data).toLocaleString() === "-0") {
                    dataParameter = "-0";
                    break;
                } else if(this._isNotFiniteNumber(data)) {
                    dataParameter = data;
                    break;
                }else {
                    return useShortBase ? data: ""+data;
                }
        }

        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode BigInt
    encodeBigNumber(data, useShortBase) {
        "use strict";
        var dataName = "bigint", dataParameter = data.toString();
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode special strings
    encodeSpecialString(data, useShortBase) {
        "use strict";
        var dataName = "string", dataParameter = btoa(data);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode regular strings
    encodeString(data, useShortBase) {
        "use strict";
        return useShortBase ?  ""+data: this.encapsulate(data);
    }
    // Encode boolean values
    encodeBoolean(data, useShortBase) {
        "use strict";
        var dataName = "boolean", dataParameter = data ? "true" : "false";
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode Map objects
    encodeMap(data, useShortBase) {
        "use strict";
        var dataName = "map",
            dataObject = Object.entries(Object.fromEntries(data)),
            dataParameter = this.stringifyOut(dataObject);
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode Set objects
    encodeSet(data, useShortBase) {
        "use strict";
        var dataName = "set",
            dataObject = Array.from(data),
            dataParameter = this.stringifyOut(dataObject);
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode Date objects
    encodeDate(data, useShortBase) {
        "use strict";
        var dataName = "date",
            dataParameter = data.toISOString();
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode RegExp objects
    encodeRegexp(data, useShortBase) {
        "use strict";
        var dataName = "regexp",
            dataParameters = [btoa(data.source), btoa(data.flags)];
        return this._encodeFinal(dataName, dataParameters.join(":"), useShortBase);
    }
    // Encode Object Literal
    encodeSpecialObject(data, useShortBase) {
        "use strict";
        var dataName = "object", dataParameter;
        dataParameter = this.stringifyOut(data.valueOf());
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    // Encode Error objects
    encodeError(data, useShortBase) {
        "use strict";
        var dataName = "error", dataParameters;
        dataParameters = [btoa(data.name), btoa(data.message)]
        return this._encodeFinal(dataName, dataParameters.join(":"), useShortBase);
    }
    // Encode buffer data
    encodeBuffer(data, useShortBase) {
        "use strict";
        var isBuffer = typeof data.buffer == "undefined";
        var dataName = "buffer",
            constructorName = isBuffer ? "ArrayBuffer": data.constructor.name,
            byteOffset = data.byteOffset,
            length = isBuffer ? data.byteLength: data.length,
            buffer = isBuffer ? data: data.buffer;

        var bufferId = this.arrayBufferIDManager.insert(buffer)
        var dataParameters = [constructorName, parseInt(byteOffset).toString(16), parseInt(length).toString(16), parseInt(bufferId).toString(16)];
        return this._encodeFinal(dataName, dataParameters.join(":"), useShortBase);
    }
    // Encode generic objects
    encodeObject(data, useShortBase) {
        "use strict";
        return this.encodeObjectOut(data, useShortBase);
    }
}
export default DataProcessEngine;