import { B64chromium } from "chromium-base64";
import DataProcessEngine from "./engine";

var JoyfulSerial = (function JoyfulSerial() {

    class JoyfulSerial {

        constructor() {
            // Initialize an empty array to store serialized data and a byte offset.
            this._packBufferTemp8 = new Uint8Array(15000);
            this._headerByteLength = 0;
            this._offset = 0;

            // Private properties holding various typed array types and their constructors.
            this._b64 = new B64chromium();
            this._b64Base64ToBytes = this._b64.base64ToBytes.bind(this._b64);
            this._b64BytesToBase64 = this._b64.bytesToBase64.bind(this._b64);
            this._textDecoder = new TextDecoder();
            this._textDecoderFunction = this._textDecoder.decode.bind(this._textDecoder);
            this._textEncoder = new TextEncoder();
            this._textEncoderFunction = this._textEncoder.encode.bind(this._textEncoder);
            this._textEncoderIntoFunction = this._textEncoder.encodeInto.bind(this._textEncoder);

            this.encodeOtherBound = this.encodeOther.bind(this);
            this.decodeOtherBound = this.decodeOther.bind(this);
            this.stringifyBound = this.stringify.bind(this);
            this.parseBound = this.parse.bind(this);

            this.engine = new DataProcessEngine(
                undefined,
                undefined,
                undefined,
                undefined,
                this.encodeOtherBound,
                this.decodeOtherBound,
                this.stringifyBound,
                this.parseBound

            );
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

        // Private method to serialize an object, iterating over its properties.
        _stringifyObject(data) {
            "use strict";
            if(Array.isArray(data)){
                var str = "[", i = 0, c = 0, l = data.length, keys = Object.keys(data), l2 = keys.length, key;
                //if(l2 === 0){return "\"data:joyson/array;"+l+"\"";}
                var pieces = new Array(l);
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    pieces[i] = this.engine.encode(data[i], false);
                    c++;
                }
                str += pieces.join(",");
                /*for (i = 0; (i|0) < (l2|0); i = (i+1|0)>>>0) {
                    key = keys[i];
                    if(parseInt(key) > 0 && parseInt(key) < l){

                    }else {
                        if(c > 0){ str += ","; }
                        str += '"'+key+'":' + this.engine.encode(data[key], false);
                        c++
                    }
                }*/
                return str+"]";

            }else {
                var cmp = this._getComparator(), keys = Object.keys(data).sort(cmp && cmp(data)), key = '', i = 0, l = keys.length|0, out = '', newData, parseKey;
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    key = keys[i]+"";
                    newData = this.engine.encode(data[key], false);
                    if (!newData) { continue; }
                    if ((out.length|0) > 0){ out = out+','; }
                    parseKey = (key.length === 0) || key.includes("\x00") || key.startsWith("$");
                    switch (parseKey|0){
                        case 0x0:
                            out += this.engine.encode(key, false)+':' + newData; break;
                        case 0x1:
                            out += '"$'+btoa("$"+key)+'":' + newData; break;
                    }
                }

                return '{' + out + '}';
            }
        }

        encodeOther(data, isShortBase){
            if(isShortBase){
                return this._packObject(data)
            }else {
                return this._stringifyObject(data)
            }
        }

        decodeOther(dataStr, isShortBase){
            if(isShortBase){
                return this._unpackObject(dataStr)
            }else {
                return this._parseObject(dataStr)
            }
        }

        // Public method to serialize data into a JSON string.
        stringify(data) {
            "use strict";
            var stringified = {
                header: "",
                buffers: {}
            };
            var header = this.engine.encode(data, false);
            var buffers = this.engine.getAllArrayBuffer();

            stringified.header = header;
            stringified.buffers = {};

            var keys = Object.keys(buffers), key, buffer, uint8a;
            for(var i = 0; i < keys.length;i++) {
                key = keys[i];
                buffer = buffers[key];
                uint8a = new Uint8Array(buffer);
                stringified.buffers[key] = this._b64BytesToBase64(uint8a)
            }

            return JSON.stringify(stringified);
        }

        // Private method to parse an object, iterating over its properties.
        _parseObject(obj) {
            "use strict";
            if(Array.isArray(obj)){
                var decodedArray = [];
                for (var i = 0, l = obj.length; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    decodedArray.push(this.engine.decode(obj[i]));
                }
                return decodedArray;
            }else {
                var decodedObj = {}, keys = Object.keys(obj), key = "", keyMustDecode, newData, i = 0, l = keys.length|0;
                for (; (i | 0) < (l | 0); i = (i + 1 | 0) >>> 0) {
                    key = ""+keys[i];
                    keyMustDecode = this._keyMustDecode(key);
                    newData = this.engine.decode(obj[key]);
                    switch (keyMustDecode|0){
                        case 0x00:
                            decodedObj[key] = newData; break;
                        case 0x1:
                            decodedObj[atob(key.slice(1)).slice(1)] = newData; break;
                    }
                }
                return decodedObj;
            }
        }

        // Public method to parse a JSON string into the original data format.
        parse(data) {
            "use strict";
            var parsed = JSON.parse(data), buffers = {};
            var keys = Object.keys(parsed.buffers), key, base64;
            for(var i = 0; i < keys.length;i++) {
                key = keys[i];
                base64 = parsed.buffers[key];
                buffers[key] = this._b64Base64ToBytes(base64).buffer;
            }
            this.engine.setAllArrayBuffer(buffers);
            return this.engine.decode(JSON.parse(parsed.header));
        }

        // Private method to pack an object, iterating over its properties.
        _packObject(obj) {
            "use strict";
            if(Array.isArray(obj)){
                var encodedArray = [], i = 0,  l = obj.length;
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    encodedArray.push(this.engine.encode(obj[i], true));
                }
                return encodedArray;
            }else {
                var encodedObj = {}, keys = Object.keys(obj), key = "", i = 0, l = keys.length|0, newData, parseKey;
                for (; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    key = keys[i]+"";
                    newData = this.engine.encode(obj[key], true);
                    if (!newData) { continue; }
                    parseKey = (key === "") || key.includes("\x00") || key.startsWith("$");
                    switch (parseKey|0){
                        case 0x0:
                            encodedObj[this.engine.encode(key, true)] = newData; break;
                        case 0x1:
                            encodedObj["$"+btoa("$"+key)] = newData; break;
                    }
                }
                return encodedObj;
            }
        }

        // Public method to pack data into a binary format for efficient storage/transmission.
        pack(data) {
            "use strict";
            var headerString = JSON.stringify(this.engine.encode(data, true));
            var buffers = Object.entries(this.engine.getAllArrayBuffer());
            var bufferByteLength = 0;
            for(var i = 0; i < buffers.length; i++){
                bufferByteLength += buffers[i][1].byteLength;
            }

            var estimatedHeaderSize = headerString.length * 2 + 5;
            var estimatedSize = estimatedHeaderSize + bufferByteLength + 4;

            if(this._packBufferTemp8.length < estimatedSize) {
                this._packBufferTemp8 = new Uint8Array(estimatedSize);
            }

            var encodeResults = this._textEncoderIntoFunction(headerString, this._packBufferTemp8.subarray(4,  4 +  estimatedHeaderSize));
            if(encodeResults.written > estimatedHeaderSize) { throw new Error("Header in json is too fat!")}
            var headerByteLength = encodeResults.written;
            this._packBufferTemp8[0] = headerByteLength >> 0 & 0xff;
            this._packBufferTemp8[1] = headerByteLength >> 8 & 0xff;
            this._packBufferTemp8[2] = headerByteLength >> 16 & 0xff;
            this._packBufferTemp8[3] = headerByteLength >> 24 & 0xff;

            // Combine header and body buffers into a single Uint8Array.
            var bodyOffset = headerByteLength;
            bufferByteLength = 4;

            // Write how many buffer there are
            this._packBufferTemp8[bodyOffset+bufferByteLength] = buffers.length >> 0 & 0xff;
            this._packBufferTemp8[bodyOffset+bufferByteLength+1] = buffers.length >> 8 & 0xff;
            this._packBufferTemp8[bodyOffset+bufferByteLength+2] = buffers.length >> 16 & 0xff;
            this._packBufferTemp8[bodyOffset+bufferByteLength+3] = buffers.length >> 24 & 0xff;
            bufferByteLength += 4;

            for(var i = 0; i < buffers.length; i++){
                this._packBufferTemp8[bodyOffset+bufferByteLength] = headerByteLength >> 0 & 0xff;
                this._packBufferTemp8[bodyOffset+bufferByteLength+1] = headerByteLength >> 8 & 0xff;
                this._packBufferTemp8[bodyOffset+bufferByteLength+2] = headerByteLength >> 16 & 0xff;
                this._packBufferTemp8[bodyOffset+bufferByteLength+3] = headerByteLength >> 24 & 0xff;
                bufferByteLength += 4;
                this._packBufferTemp8.set(new Uint8Array(buffers[i][1]), bodyOffset+bufferByteLength);
                bufferByteLength += buffers[i][1].byteLength;
            }

            return this._packBufferTemp8.slice(0, bodyOffset+bufferByteLength);
        }

        // Private method to create packed data with a header and body.
        _createPackedData(headerString) {
            "use strict";

        }

        _keyMustDecode(key) {
            "use strict";
            return key.startsWith("$");
        }
        // Private method to unpack an object, iterating over its properties.
        _unpackObject(obj) {
            "use strict";
            if(Array.isArray(obj)){
                var decodedArray = [];
                for (var i = 0, l = obj.length; (i|0) < (l|0); i = (i+1|0)>>>0) {
                    decodedArray.push(this.engine.decode(obj[i], true));
                }
                return decodedArray;
            }else {
                var decodedObj = {}, keys = Object.keys(obj), key = "", keyMustDecode, newData, i = 0, l = keys.length|0;
                for (; (i | 0) < (l | 0); i = (i + 1 | 0) >>> 0) {
                    key = ""+keys[i];
                    keyMustDecode = this._keyMustDecode(key);
                    newData = this.engine.decode(obj[key], true);
                    switch (keyMustDecode|0){
                        case 0x00:
                            decodedObj[key] = newData; break;
                        case 0x1:
                            decodedObj[atob(key.slice(1)).slice(1)] = newData; break;
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
            var header = JSON.parse(this._textDecoderFunction(packedData.subarray(headerStart, headerStop)));

            var bodyStart = headerStop+4;
            var bufferCount = packedData[headerStop] << 0 | packedData[headerStop+1] << 8 | packedData[headerStop+2] << 16 | packedData[headerStop+3] << 24;
            var buffers = {};
            var currentOffset = bodyStart;
            for(var i = 0; i < bufferCount; i++){
                var length =  packedData[currentOffset] << 0 | packedData[currentOffset+1] << 8 | packedData[currentOffset+2] << 16 | packedData[currentOffset+3] << 24;
                currentOffset += 4;
                buffers[i] = packedData.slice(currentOffset, currentOffset+length).buffer
                currentOffset += length;
            }

            this.engine.setAllArrayBuffer(buffers);
            return this.engine.decode(header, true);
        }
    }
    return JoyfulSerial;
})();

var JOYSON = new JoyfulSerial();
