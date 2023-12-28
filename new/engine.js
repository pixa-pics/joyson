import B64hash from "b64hash";
import ArrayBufferIDManager from "./buffer";

class DataProcessEngine {
    constructor(baseStr, shortBaseStr, encapsulateFunc, hasher, encodeObjectOut, decodeObjectOut, stringifyOut, parseOut) {
        this._hasher = new B64Hash(2);
        this.hashThis = hasher || this._hasher.hash.bind(this._hasher);
        this.base = baseStr || "data:joyson/";
        this.shortBase = shortBaseStr || "d:j/";
        this.encapsulate = encapsulateFunc || function (str){return JSON.stringify(str);};
        this.baseLength = this.base.length;
        this.shortBaseLength = this.shortBase.length;

        this.encodeObjectOut = encodeObjectOut || function (data){ return data; }
        this.decodeObjectOut = decodeObjectOut || function (data){ return data; }
        this.stringifyOut = stringifyOut || JSON.stringify;
        this.parseOut = parseOut || JSON.parse;

        this.errorConstructors = {
            "Error": Error,
            "TypeError": TypeError,
            "SyntaxError": SyntaxError,
            "ReferenceError": ReferenceError,
            "RangeError": RangeError,
            "EvalError": EvalError,
            "URIError": URIError,
            "DOMException": DOMException
        };

        this.arrayBufferIDManager = new ArrayBufferIDManager();
        this.bufferConstructors = {
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

        this._initializeDynamicTypes(["object", "number", "bigint", "map", "set", "date", "string", "error", "regexp", "buffer", "boolean", "static"]);
    }
    _initializeDynamicTypes(types){
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
    clear(){
        this.arrayBufferIDManager.clear();
    }
    getAllArrayBuffer(){
        var data = this.arrayBufferIDManager.retrieveAll();
        this.clear();
        return data;
    }
    setAllArrayBuffer(data){
        this.clear();
        this.arrayBufferIDManager.insertAll(data);
    }
    _isNotNumber(data){
        return isNaN(data);
    }
    _isNotFiniteNumber(data){
        return !isFinite(data);
    }
    _isNotObject(data){
        return data === null;
    }
    _isNotString(data){
        return data.includes("\x00");
    }
    _isError(data) {
        "use strict";
        var name = data.name;
        if(name in this.errorConstructors){
            return true;
        }
        return false;
    }
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
    _mustDecodeOfType(data) {
        if(typeof data == "string"){
            if(data.startsWith(this.base)){
                return 1;
            }else if(data.startsWith(this.shortBase)){
                return 2;
            }
        }
        return 0;
    }
    _decode(dataStr, isShortBase) {
        var typeAndDataParameter = dataStr.slice(isShortBase ? this.shortBaseLength: this.baseLength).split(";");
        var type = typeAndDataParameter[0];
        var dataParameter = typeAndDataParameter[1];
        var typeName = isShortBase ? this.dynamicValuesIdKey[type]: type;

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
    decode(data, optionalIsShortBase = false){
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
    decodeStatic(dataParameter) {
        switch (dataParameter) {
            case "nan":
                return NaN;
            case "null":
                return null;
            case "undefined":
                return undefined;
        }
    }
    decodeSpecialNumber(dataParameter) {
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
    decodeBigNumber(dataParameter) {
        return BigInt(dataParameter);
    }
    decodeSpecialString(dataParameter) {
        return atob(dataParameter);
    }
    decodeBoolean(dataParameter) {
        return dataParameter === "true";
    }
    decodeMap(dataParameter) {
        var dataObjectString = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectString);
        return new Map(dataObject);
    }
    decodeSet(dataParameter) {
        var dataObjectString = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectString);
        return new Set(dataObject);
    }
    decodeDate(dataParameter) {
        return new Date(dataParameter) || new Date(NaN);
    }
    decodeRegexp(dataParameter) {
        var dataParameters = dataParameter.split(":");
        var pattern = atob(dataParameters[0]);
        var flags = atob(dataParameters[1]);
        return new RegExp(pattern, flags);
    }
    decodeError(dataParameter){
        var dataParameters = dataParameter.split(":");
        var name = atob(dataParameters[0]);
        var message = atob(dataParameters[1]);
        var constructor = this.errorConstructors[name];
        return new constructor(message);
    }
    decodeBuffer(dataParameter) {
        var dataParameters = dataParameter.split(":"),
            constructorName = dataParameters[0],
            isBuffer = constructorName === "ArrayBuffer",
            constructor = this.bufferConstructors[constructorName],
            byteOffset = parseInt(dataParameters[1], 16),
            length = parseInt(dataParameters[2], 16),
            bufferId = parseInt(dataParameters[3], 16);
        var buffer = this.arrayBufferIDManager.retrieve(bufferId)

        return isBuffer ? buffer: new constructor(buffer, byteOffset, length);
    }
    decodeSpecialObject(dataParameter){
        var dataObjectStringified = atob(dataParameter);
        var dataObject = this.parseOut(dataObjectStringified)
        return Object(dataObject)
    }
    _encodeFinal(dataName, dataParameter, useShortBase){
        return useShortBase ?
            this.dynamicValues[dataName].shortStr+dataParameter:
            this.encapsulate(this.dynamicValues[dataName].str+dataParameter);
    }
    encode(data, useShortBase) {
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
    encodeStatic(data, useShortBase){
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
    encodeNumber(data, useShortBase) {
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
    encodeBigNumber(data, useShortBase) {
        var dataName = "bigint", dataParameter = data.toString();
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeSpecialString(data, useShortBase) {
        var dataName = "string", dataParameter = btoa(data);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeString(data, useShortBase) {
        return useShortBase ?  ""+data: this.encapsulate(data);
    }
    encodeBoolean(data, useShortBase) {
        var dataName = "boolean", dataParameter = data ? "true" : "false";
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeMap(data, useShortBase) {
        var dataName = "map",
            dataObject = Object.entries(Object.fromEntries(data)),
            dataParameter = this.stringifyOut(dataObject);
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeSet(data, useShortBase) {
        var dataName = "set",
            dataObject = Array.from(data),
            dataParameter = this.stringifyOut(dataObject);
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeDate(data, useShortBase) {
        var dataName = "date",
            dataParameter = data.toISOString();
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeRegexp(data, useShortBase) {
        var dataName = "regexp",
            dataParameters = [btoa(data.source), btoa(data.flags)];
        return this._encodeFinal(dataName, dataParameters.join(":"), useShortBase);
    }
    encodeSpecialObject(data, useShortBase) {
        var dataName = "object", dataParameter;
        dataParameter = this.stringifyOut(data.valueOf());
        dataParameter = btoa(dataParameter);
        return this._encodeFinal(dataName, dataParameter, useShortBase);
    }
    encodeError(data, useShortBase) {
        var dataName = "error", dataParameters;
        dataParameters = [btoa(data.name), btoa(data.message)]
        return this._encodeFinal(dataName, dataParameters.join(":"), useShortBase);
    }
    encodeBuffer(data, useShortBase) {
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
    encodeObject(data, useShortBase) {
        return this.encodeObjectOut(data, useShortBase);
    }
}

export default DataProcessEngine;