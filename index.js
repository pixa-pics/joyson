/*
* The MIT License (MIT)
*
* Copyright (c) 2023-2024 Affolter Matias
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

"use strict";
// Import the B64chromium class from the chromium-base64 module
import { B64chromium } from "chromium-base64";



var JoyfulSerial = (function JoyfulSerial() {
    "use strict";
    class JoyfulSerial {

        constructor() {
            // Initialize an empty array to store serialized data and a byte offset.
            this._bodyBuffers = [];
            this._bodyBufferRef = new ArrayBuffer(0);
            this._bodyBufferOffset = 0;
            this._packBufferTemp32 = new Float32Array(4000);
            this._packBufferTemp8 = new Uint8Array(this._packBufferTemp32.buffer);
            this._headerByteLength = 0;
            this._offset = 0;

            // Private properties holding various typed array types and their constructors.
            this._typedArrayTypes = ['int8array', 'uint8array', 'uint8clampedarray', 'int16array', 'uint16array', 'int32array', 'uint32array', 'float32array', 'float64array'];
            this.errorTypes = ['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'DOMException'];
            this._typedArrayConstructor = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array , Uint32Array, Float32Array, Float64Array];
            this._errorConstructor = [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError , URIError, DOMException];
            this._typedArrayConstructorSet = new Set(this._typedArrayConstructor);
            this._typedArrayConstructorMap = new Map();
            this._errorConstructorMap = new Map();
            for(var i = 0; i < 8; i++) {
                this._typedArrayConstructorMap.set(this._typedArrayTypes[i], this._typedArrayConstructor[i])
                this._errorConstructorMap.set(this.errorTypes[i], this._errorConstructor[i])
            }

            this._b64 = new B64chromium();
            this._b64Base64ToBytes = this._b64.base64ToBytes.bind(this._b64);
            this._b64BytesToBase64 = this._b64.bytesToBase64.bind(this._b64);
            this._textDecoder = new TextDecoder();
            this._textDecoderFunction = this._textDecoder.decode.bind(this._textDecoder);
            this._textEncoder = new TextEncoder();
            this._textEncoderFunction = this._textEncoder.encode.bind(this._textEncoder);
            this._textEncoderIntoFunction = this._textEncoder.encodeInto.bind(this._textEncoder);
            this._hashtagCharCode = "#".charCodeAt(0);
            this._startWithJoyson = Uint8Array.from("data:joyson".split("").map(function (c){return c.charCodeAt(0);}))
        }

        _getComparator(){
            "use strict";
            return function (f) {
                "use strict";
                return function (node) {
                    "use strict";
                    return function (a, b) {
                        "use strict";
                        var aobj = {key: a, value: node[a]};
                        var bobj = {key: b, value: node[b]};
                        return f(aobj, bobj);
                    };
                };
            };
        }
        _getTypedConstructorNameLowerCase(value){
            "use strict";
            if(typeof value == "object"){
                return value.constructor.name.toLowerCase();
            }
            return undefined;
        }

        _stringifyOther(data) {
            "use strict";
            switch (typeof data) {
                case "undefined":
                    return [true, '\"data:joyson/undefined;\"'];
                case "number":
                    return this._stringifyNumber(data);
                case "bigint":
                    return [true, "\"data:joyson/bigint;"+ data.toString() +"\""];
                case "string":
                    return data.includes("\x00") ? [true, '\"data:joyson/string;'+btoa(data.toString())+'\"']: [false, '\"'+data.toString()+'\"'];
                case "object":
                    return this._stringifyObject(data);
                case "boolean":
                    return [true, data ? '\"data:joyson/boolean;true\"': '\"data:joyson/boolean;false\"'];
                default:
                    return [false, '\"'+data.toString()+'\"'];
            }
        }

        _isError(value) {
            "use strict";
            return value.constructor.name.includes("Error");
        }
        // Private method to check if a value is an ArrayBuffer.
        _isArrayBuffer(value) {
            "use strict";
            return value instanceof ArrayBuffer;
        }
        // Private method to check if a value is a TypedArray.
        _isTypedArray(value) {
            "use strict";
            if(this._isArrayBuffer(value.buffer)){
                return this._typedArrayConstructorSet.has(value.constructor);
            }
            return false;
        }

        // Private method to serialize a ArrayBuffer into a Base64 string.
        _stringifyArrayBuffer(arrayBuffer) {
            "use strict";
            return '\"data:joyson/arraybuffer;base64,'+this._b64BytesToBase64(new Uint8Array(arrayBuffer))+'\"';
        }
        // Private method to serialize a TypedArray into a Base64 string.
        _stringifyTypedArray(typedArray) {
            "use strict";
            return '\"data:joyson/'+this._getTypedConstructorNameLowerCase(typedArray)+';base64,'+this._b64BytesToBase64(new Uint8Array(typedArray.buffer))+'\"';
        }
        _stringifyError(error) {
            "use strict";
            return '\"data:joyson/error;'+error.name+':'+error.message+'\"';
        }

        // Private method to serialize individual data items, handling different types.
        _stringifyThis(data) {
            "use strict";
            if(typeof data == "object"){
                if(data == null){
                    return this._stringifyOther(data);
                }else if(data !== data.valueOf() && typeof data.toISOString == "undefined") {
                    return [true, "\"data:joyson/object;"+btoa(this._stringifyThis(data.valueOf())[1])+"\""]
                }else if(this._isArrayBuffer(data)){
                    return [true, this._stringifyArrayBuffer(data)];
                }else if(this._isError(data)){
                    return [true, this._stringifyError(data)];
                }else if (this._isTypedArray(data)) {
                    return [true, this._stringifyTypedArray(data)];
                }else {
                    return this._stringifyObject(data)
                }
            }else {
                return this._stringifyOther(data);
            }
        }

        // Private method to serialize an object, iterating over its properties.
        _stringifyObject(obj) {
            "use strict";
            if(obj === null){
                return [true, "\"data:joyson/null;\""];
            }else if(typeof obj.get == "function"){
                return [true, "\"data:joyson/map;"+btoa(this.stringify(Object.entries(Object.fromEntries(obj))))+"\""]
            }else if(typeof obj.delete == "function"){
                return [true, "\"data:joyson/set;"+btoa(this.stringify(Array.from(obj)))+"\""]
            }else  if (typeof obj.toISOString == "function") {
                return [true, "\"data:joyson/date;" + ((obj.getTime() === NaN) ? "NaN\"" : obj.toISOString()) + "\""];
            }else if(typeof obj.exec == "function"){
                return [true, "\"data:joyson/regexp;"+btoa(obj.source)+":"+btoa(obj.flags)+"\""]
            }else if(Array.isArray(obj)){
                var out = '[';
                for (var i = 0; i < obj.length; i++) {
                    if (i) out += ',';
                    out += this._stringifyThis(obj[i])[1] || '\"\"';
                }
                return [false, out + ']'];

            }else {
                var cmp = this._getComparator(), keys = Object.keys(obj).sort(cmp && cmp(obj)), key = '', i = 0, l = keys.length|0, out = '', result, changeKey, newData, parseKey;
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    key = ""+keys[i];
                    result = this._stringifyThis(obj[key]);
                    changeKey = result[0];
                    newData = result[1];
                    if (!newData) { continue; }
                    if ((out.length|0) > 0){ out = out+','; }
                    parseKey = (key.length|0) < 1 || key.includes("\x00") || key.startsWith("##") || key.startsWith("$$") || key.startsWith("#$");
                    switch (((changeKey|0)<<4)+(parseKey|0)|0){
                        case 0x00:
                            out += '"'+key+'":' + newData; break;
                        case 0x10:
                            out += '"##'+key+'":' + newData; break;
                        case 0x01:
                            out += '"$$'+btoa(key)+'":' + newData; break;
                        case 0x11:
                            out += '"#$'+btoa(key)+'":' + newData; break;
                    }
                }

                return [false, '{' + out + '}'];
            }
        }

        _stringifyNumber(data) {
            "use strict";
            if(isNaN(data)){
                return [true, "\"data:joyson/number;NaN\""];
            }else if(data === Infinity){
                return [true, "\"data:joyson/number;Number:Infinity\""];
            }else if(data === -Infinity){
                return [true, "\"data:joyson/number;Number:-Infinity\""];
            }else if(data === -Number.EPSILON) {
                return [true, "\"data:joyson/number;Number:-EPSILON\""];
            }else if(data === Number.EPSILON) {
                return [true, "\"data:joyson/number;Number:EPSILON\""];
            }else if(Number(data).toLocaleString() === "-0") {
                return [true, "\"data:joyson/number;-0\""];
            }else {
                return [false, isFinite(data) ? ''+data: data]
            }
        };

        // Public method to serialize data into a JSON string.
        stringify(data) {
            "use strict";
            return this._stringifyThis(data)[1];
        }

        _dataStartsWithJoyson(data){
            "use strict";
            var i = 0, l = this._startWithJoyson.length;
            if((data.charCodeAt(0)|0) != (this._startWithJoyson[0]|0)){ return false; }
            for(; (i|0) < (l|0); i = i+1|0) {
                if((data.charCodeAt(i)|0) != (this._startWithJoyson[i]|0)) { return false }
            }
            return true;
        }
        // Private method to parse individual data items, handling different types.
        _parseThis(data, probablyDecode) {
            "use strict";
            if (probablyDecode && typeof data == 'string') {
                if(this._dataStartsWithJoyson(data)){
                    if(data.startsWith('data:joyson/arraybuffer')){
                        return [true, this._parseArrayBuffer(data)]
                    }else if(data.startsWith("data:joyson/undefined")){
                        return [true, undefined];
                    }else if(data.startsWith("data:joyson/null")){
                        return [true, null];
                    }else if(data.startsWith("data:joyson/date")){
                        return [true, new Date(data.split('data:joyson/date;')[1])];
                    }else if(data.startsWith("data:joyson/regexp")){
                        var [source, flags] = data.split(';')[1].split(":").map(atob);
                        return [true, new RegExp(source, flags)];
                    }else if(data.startsWith("data:joyson/map")) {
                        return [true, new Map(this.parse(this._textDecoderFunction(this._b64Base64ToBytes(data.split(';')[1]))))];
                    }else if(data.startsWith("data:joyson/set")){
                        return [true, new Set(this.parse(this._textDecoderFunction(this._b64Base64ToBytes(data.split(';')[1]))))];
                    }else if(data.startsWith("data:joyson/string")) {
                        return [true, atob(data.split(';')[1])];
                    }else if(data.startsWith("data:joyson/number")){
                        return [true, this._parseNumber(data.split(';')[1])];
                    }else if(data.startsWith("data:joyson/boolean")){
                        return (data.split(';')[1]==="true") ? [true, true]: [true, false];
                    }else if(data.startsWith("data:joyson/object")){
                        return [true, Object(this._parseThis(atob(data.slice('data:joyson/object;'.length)), true)[1])]
                    }else if(data.startsWith("data:joyson/bigint")){
                        return [true, BigInt(data.split(";")[1])];
                    }else if(data.startsWith("data:joyson/error")){
                        return [true, this._parseError(data.slice('data:joyson/error;'.length))];
                    }else {
                        return [true, this._parseTypedArray(data)];
                    }
                }else {
                    return [false, data];
                }
            } else if (data !== null && typeof data == 'object') {
                return [false, this._parseObject(data)];
            } else {
                return [false, data];
            }
        }

        // Private method to parse an object, iterating over its properties.
        _parseObject(obj) {
            "use strict";
            if(Array.isArray(obj)){
                var decodedArray = [];
                for (var i = 0, l = obj.length; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    decodedArray.push(this._parseThis(obj[i], true)[1]);
                }
                return decodedArray;
            }else {
                var decodedObj = {}, keys = Object.keys(obj), key = "", probablyDecode, keyMustDecode, newData, i = 0, l = keys.length|0;
                for (; (i | 0) < (l | 0); i = (i + 1 | 0) >>> 0) {
                    key = keys[i];
                    probablyDecode = this._keyStartsWithDecode(key);
                    keyMustDecode = this._keyMustDecode(key);
                    newData = this._parseThis(obj[key], probablyDecode)[1];
                    switch (((probablyDecode|0)<<4)+(keyMustDecode|0)|0){
                        case 0x00:
                            decodedObj[key] = newData; break;
                        case 0x10:
                            decodedObj[key.slice(2)] = newData; break;
                        default:
                            decodedObj[atob(key.slice(2))] = newData; break;
                    }
                }
                return decodedObj;
            }
        }


        // Public method to parse a JSON string into the original data format.
        parse(data) {
            "use strict";
            return this._parseThis(JSON.parse(data), true)[1];
        }

        _parseNumber(encodedNumber){
            "use strict";
            if(encodedNumber === "NaN"){
                return NaN;
            }else if(encodedNumber === "Number:-Infinity"){
                return -Infinity;
            }else if(encodedNumber === "Number:Infinity") {
                return Infinity;
            }else if(encodedNumber === "Number:-EPSILON") {
                return -Number.EPSILON;
            }else if(encodedNumber === "Number:EPSILON") {
                return Number.EPSILON;
            }else if(encodedNumber === "-0") {
                return parseInt("-0");
            }else {
                return Number(encodedNumber);
            }
        }
        // Private method to parse a Base64 string into a TypedArray.
        _parseArrayBuffer(encodedString) {
            "use strict";
            var base64 = encodedString.split(';base64,')[1];
            return this._b64Base64ToBytes(base64).buffer || new ArrayBuffer(0);
        }
        // Private method to parse a Base64 string into a TypedArray.
        _parseTypedArray(encodedString) {
            "use strict";
            var [scheme, base64] = encodedString.split(';base64,');
            var typedArrayName = scheme.split('/')[1];
            var buffer = this._b64Base64ToBytes(base64).buffer;
            return new (this._typedArrayConstructorMap.get(typedArrayName))(buffer);
        }
        _parseError(ref) {
            "use strict";
            var [constructorName, nameAndMessage] = ref.split(':');
            var [name, message] = nameAndMessage.split(",")
            return (this._errorConstructorMap.get(constructorName))(name, message);
        }
        // Private method to prepare individual items for packing.
        _packThis(data) {
            "use strict";
            if(typeof data == "object"){
                if(data === null){
                    return this._packOther(data);
                }else if(data.valueOf() !== data && typeof data.toISOString == "undefined") {
                    return [true, "data:joyson/object;"+btoa(this._packThis(data.valueOf())[1])]
                }else if(this._isArrayBuffer(data)){
                    return [true, this._packArrayBuffer(data)];
                }else  if(this._isError(data)){
                    return [true, this._packError(data)];
                }else if (this._isTypedArray(data)) {
                    return [true, this._packTypedArray(data)];
                }else {
                    return this._packObject(data)
                }
            }else {
                return this._packOther(data);
            }
        }

        _getBytePadding(length){
            "use strict";
            return (4 - (length % 4)) % 4 | 0;
        }
        // Private method to pack a ArrayBuffer into a reference string.
        _packArrayBuffer(arrayBuffer) {
            "use strict";
            this._bodyBuffers.push(arrayBuffer);
            this._offset += this._getBytePadding(arrayBuffer.byteLength);
            var str = `data:joyson/arraybuffer;ref,${this._offset}:${arrayBuffer.byteLength}`;
            this._offset += arrayBuffer.byteLength;
            return str;
        }
        // Private method to pack a TypedArray into a reference string.
        _packTypedArray(typedArray) {
            "use strict";
            this._bodyBuffers.push(typedArray.buffer);
            this._offset += this._getBytePadding(typedArray.buffer.byteLength);
            var str = `data:joyson/${this._getTypedConstructorNameLowerCase(typedArray)};ref,${this._offset}:${typedArray.buffer.byteLength}`;
            this._offset += typedArray.buffer.byteLength;
            return str;
        }
        _packError(error) {
            "use strict";
            return `data:joyson/error;${error.name}:${error.message}`;
        }

        // Private method to pack an object, iterating over its properties.
        _packObject(obj) {
            "use strict";
            if(obj === null){
                return [true, "data:joyson/null;"];
            }else if(typeof obj.get == "function"){
                return [true, "data:joyson/map;"+this._b64BytesToBase64(this._textEncoder.encode(this.stringify(Object.entries(Object.fromEntries(obj)))))]
            }else if(typeof obj.delete == "function"){
                return [true, "data:joyson/set;"+this._b64BytesToBase64(this._textEncoder.encode(this.stringify(Array.from(obj))))]
            }else  if (typeof obj.toISOString == "function") {
                return [true, "data:joyson/date;"+(obj.toISOString() === NaN ? "NaN": obj.toISOString())]
            }else if(typeof obj.exec == "function"){
                return [true, "data:joyson/regexp;"+btoa(obj.source)+":"+btoa(obj.flags)]
            }else if(Array.isArray(obj)){
                var encodedArray = [];
                for (var i = 0, l = obj.length; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    encodedArray.push(this._packThis(obj[i])[1]);
                }
                return [false, encodedArray];
            }else {
                var encodedObj = {}, keys = Object.keys(obj), key = "", i = 0, l = keys.length|0, result, changeKey, newData, parseKey;
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    key = keys[i].toString();
                    result = this._packThis(obj[key]);
                    changeKey = result[0];
                    newData = result[1];
                    parseKey = (key.length|0) < 1 || key.includes("\x00") || key.startsWith("##") || key.startsWith("$$") || key.startsWith("#$");
                    switch (((changeKey|0)<<4)+(parseKey|0)|0){
                        case 0x00:
                            encodedObj[key] = newData; break;
                        case 0x10:
                            encodedObj["##"+key] = newData; break;
                        case 0x01:
                            encodedObj["$$"+btoa(key)] = newData; break;
                        case 0x11:
                            encodedObj["#$"+btoa(key)] = newData; break;
                    }
                }
                return [false, encodedObj];
            }
        }

        _packNumber(data) {
            "use strict";
            if(isNaN(data)){
                return [true, "data:joyson/number;NaN"];
            }else if(data === Infinity){
                return [true, "data:joyson/number;Number:Infinity"];
            }else if(data === -Infinity){
                return [true, "data:joyson/number;Number:-Infinity"];
            }else if(data === -Number.EPSILON) {
                return [true, "data:joyson/number;Number:-EPSILON"];
            }else if(data === Number.EPSILON) {
                return [true, "data:joyson/number;Number:EPSILON"];
            }else if(Number(data).toLocaleString() === "-0") {
                return [true, "data:joyson/number;-0"];
            }else {
                return [false, isFinite(data) ? data: 0]
            }
        }

        _packOther(data) {
            "use strict";
            switch (typeof data) {
                case "undefined":
                    return [true, "data:joyson/undefined"];
                case "bigint":
                    return [true, "data:joyson/bigint;"+ data.toString()];
                case "number":
                    return this._packNumber(data);
                case "string":
                    return data.includes("\x00") ? [true, 'data:joyson/string;'+btoa(data.toString())]: [false, data.toString()];
                case "object":
                    return this._packObject(data);
                case "boolean":
                    return [true, data ? 'data:joyson/boolean;true': 'data:joyson/boolean;false'];
                default:
                    return [true, "data:joyson/undefined"];
            }
        }
        // Public method to pack data into a binary format for efficient storage/transmission.
        pack(data) {
            "use strict";
            this._bodyBuffers = [];
            this._offset = 0;
            this._createPackedData(this._packThis(data)[1]);
            return this._combineBuffers();
        }

        // Private method to create packed data with a header and body.
        _createPackedData(header) {
            "use strict";
            var headerString = JSON.stringify(header);
            var estimatedHeaderSize = headerString.length * 2 + 5;
            estimatedHeaderSize += this._getBytePadding(estimatedHeaderSize);
            var estimatedSize = estimatedHeaderSize + this._offset + 4;
            estimatedSize += this._getBytePadding(estimatedSize);

            if(this._packBufferTemp32.byteLength < estimatedSize) {
                this._packBufferTemp32 = new Float32Array(estimatedSize/4|0);
                this._packBufferTemp8 = new Uint8Array(this._packBufferTemp32.buffer);
            }

            var encodeResults = this._textEncoderIntoFunction(headerString, this._packBufferTemp8.subarray(4,  4 +  estimatedHeaderSize));
            if(encodeResults.written > estimatedHeaderSize) { throw new Error("Header in json is too fat!")}
            this._headerByteLength = encodeResults.written;
            this._packBufferTemp8[0] = this._headerByteLength >> 0 & 0xff;
            this._packBufferTemp8[1] = this._headerByteLength >> 8 & 0xff;
            this._packBufferTemp8[2] = this._headerByteLength >> 16 & 0xff;
            this._packBufferTemp8[3] = this._headerByteLength >> 24 & 0xff;
        }

        // Private method to combine header and body buffers into a single Uint8Array.
        _combineBuffers() {
            "use strict";
            var offsetPadding = this._getBytePadding(this._offset);
            var headerPadding = this._getBytePadding(this._headerByteLength);
            var bodyOffset = 4 + this._headerByteLength + headerPadding;
            var totalLength = bodyOffset + this._offset + offsetPadding;
            for (var buf of this._bodyBuffers) {
                var length = buf.byteLength/4|0;
                var byteLength = length * 4;
                var remainingBytes = buf.byteLength - byteLength;
                this._packBufferTemp32.set(new Float32Array(buf, 0, length), bodyOffset/4);
                this._packBufferTemp8.set(new Uint8Array(buf, byteLength, remainingBytes), bodyOffset+byteLength);
                bodyOffset += buf.byteLength + this._getBytePadding(buf.byteLength);
            }
            return this._packBufferTemp8.slice(0, totalLength);
        }

        _unpackNumber(encodedNumber) {
            "use strict";
            if(encodedNumber === "NaN"){
                return NaN;
            }else if(encodedNumber === "Number:-Infinity"){
                return -Infinity;
            }else if(encodedNumber === "Number:Infinity") {
                return Infinity;
            }else if(encodedNumber === "Number:-EPSILON") {
                return -Number.EPSILON;
            }else if(encodedNumber === "Number:EPSILON") {
                return Number.EPSILON;
            }else if(encodedNumber === "-0") {
                return parseInt("-0");
            }else {
                return Number(encodedNumber);
            }
        }
        // Private method to unpack individual items from the packed data.
        _unpackThis(data, probablyDecode) {
            "use strict";
            if (probablyDecode && typeof data == 'string') {
                if(this._dataStartsWithJoyson(data)){
                    if(data.startsWith('data:joyson/arraybuffer')){
                        return [true, this._unpackArrayBuffer(data.split(';ref,')[1])]
                    }else if(data.startsWith("data:joyson/undefined")){
                        return [true, undefined];
                    }else if(data.startsWith("data:joyson/null")){
                        return [true, null];
                    }else if(data.startsWith("data:joyson/date")){
                        return [true, new Date(data.slice('data:joyson/date;'.length))];
                    }else if(data.startsWith("data:joyson/regexp")){
                        var [source, flags] = data.split(';')[1].split(":").map(atob);
                        return [true, new RegExp(source, flags)];
                    }else if(data.startsWith("data:joyson/map")) {
                        return [true, new Map(this.parse(atob(data.split(';')[1])))];
                    }else if(data.startsWith("data:joyson/set")){
                        return [true, new Set(this.parse(atob(data.split(';')[1])))];
                    }else if(data.startsWith("data:joyson/string")){
                        return [true, atob(data.split(';')[1])];
                    }else if(data.startsWith("data:joyson/number")){
                        return [true, this._unpackNumber(data.split(';')[1])];
                    }else if(data.startsWith("data:joyson/boolean")){
                        return (data.split(';')[1]==="true") ? [true, true]: [true, false];
                    }else if(data.startsWith("data:joyson/object")){
                        return [true, Object(this._unpackThis(atob(data.slice('data:joyson/object;'.length)), true)[1])]
                    }else if(data.startsWith("data:joyson/error")){
                        return [true, this._unpackError(data.slice('data:joyson/error;'.length))]
                    }else if(data.startsWith("data:joyson/bigint")){
                        return [true, BigInt(data.split(";")[1])];
                    }else {
                        var [typeInfo, ref] = data.split(';ref,');
                        return [true, this._unpackTypedArray(ref, typeInfo)];
                    }
                }else {
                    return [false, data];
                }
            } else if (data !== null && typeof data == 'object') {
                return [false, this._unpackObject(data)];
            } else {
                return [false, data];
            }
        }

        // Private method to unpack a ArrayBuffer from a reference string.
        _unpackArrayBuffer(ref) {
            "use strict";
            var [byteOffset, byteLength] = ref.split(':').map(Number);
            return this._bodyBufferRef.slice(this._bodyBufferOffset + byteOffset, this._bodyBufferOffset + byteOffset + byteLength);
        }
        _unpackError(ref) {
            "use strict";
            var [constructorName, nameAndMessage] = ref.split(':');
            var [name, message] = nameAndMessage.split(",")
            return (this._errorConstructorMap.get(constructorName))(name, message);
        }
        // Private method to unpack a TypedArray from a reference string.
        _unpackTypedArray(ref, typeInfo) {
            "use strict";
            var [byteOffset, byteLength] = ref.split(':').map(Number);
            var typedArrayName = typeInfo.split('/')[1];
            var buffer = this._bodyBufferRef.slice(this._bodyBufferOffset + byteOffset, this._bodyBufferOffset + byteOffset + byteLength);
            return new (this._typedArrayConstructorMap.get(typedArrayName))(buffer);
        }

        _keyMustDecode(key) {
            "use strict";
            return key.startsWith("#$") || key.startsWith("$$");
        }
        _keyStartsWithDecode(key) {
            "use strict";
            return key.startsWith("#$") || key.startsWith("##");
        }

        // Private method to unpack an object, iterating over its properties.
        _unpackObject(obj) {
            "use strict";
            if(Array.isArray(obj)){
                var decodedArray = [];
                for (var i = 0, l = obj.length; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    decodedArray.push(this._unpackThis(obj[i], true)[1]);
                }
                return decodedArray;
            }else {
                var decodedObj = {}, keys = Object.keys(obj), key = "", probablyDecode, keyMustDecode, newData, i = 0, l = keys.length|0;
                for (; (i | 0) < (l | 0); i = (i + 1 | 0) >>> 0) {
                    key = keys[i].toString();
                    probablyDecode = this._keyStartsWithDecode(key);
                    keyMustDecode = this._keyMustDecode(key);
                    newData = this._unpackThis(obj[key], probablyDecode)[1];
                    switch (((probablyDecode|0)<<4)+(keyMustDecode|0)|0){
                        case 0x00:
                            decodedObj[key] = newData; break;
                        case 0x10:
                            decodedObj[key.slice(2)] = newData; break;
                        default:
                            decodedObj[atob(key.slice(2))] = newData; break;
                    }
                }
                return decodedObj;
            }
        }

        // Public method to unpack data from its binary format back into the original data format.
        unpack(packedData) {
            "use strict";
            var headerByteLength = packedData[0] << 0 | packedData[1] << 8 | packedData[2] << 16 | packedData[3] << 24;
            var headerStart = 4;
            var headerStop = 4 + headerByteLength;
            var header = this._textDecoderFunction(packedData.subarray(headerStart, headerStop));
            var bodyStart = headerStop+this._getBytePadding(headerStop);
            var bodyStop = packedData.length;
            this._bodyBufferRef = packedData.buffer;
            this._bodyBufferOffset = bodyStart;
            return this._unpackThis(JSON.parse(header), true)[1];
        }
    }
    return JoyfulSerial;
})();

var JOYSON = new JoyfulSerial();

export default JOYSON;
