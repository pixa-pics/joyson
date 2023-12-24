# joyson

`joyson` is a JavaScript module designed for efficient encoding and decoding of JSON objects, particularly adept at handling TypedArrays. Unlike standard JSON methods, `joyson` provides additional `pack` and `unpack` methods for more memory-efficient handling of large data structures, including support for binary data serialization.

## Key Differences

- **Standard JSON Methods**: `stringify` and `parse` convert objects to/from JSON strings.
- **Extended Binary Methods**: `pack` and `unpack` handle serialization/deserialization of data into/from a compact binary format, beneficial for performance-intensive applications.

## Features

- **TypedArray Support**: Seamless encoding and decoding of TypedArrays within JSON objects.
- **Memory Efficiency**: Optimized for minimal memory footprint during processing.
- **Binary Serialization**: The `pack` method allows for compact binary serialization of data, while `unpack` restores it, ensuring efficient data handling.

## Installation

Install `joyson` using npm:

```bash
npm install joyson
```

## Usage

Import `JOYSON` from `joyson`:

```javascript
import JOYSON from 'joyson';
```

> Using /dist/browser.min.js` enable you to directly use JOYSON like JSON

### Encoding/Decoding an Object

```javascript
const yourObject = {test: "hello", data: [1, 23, 5, 6, {arr: Int16Array.of(-6, 777, 12), arr2: new Uint8Array(9)}]};
const encodedData = JOYSON.stringify(yourObject); // `{"test":"hello","data":[1,23,5,6,{"#I2Fycg==":"data:joyson/int16array;base64,+v8JAwwA","#I2FycjI=":"data:joyson/uint8array;base64,AAAAAAAAAAAA"}]}`
const decodedData = JOYSON.parse(encodedData);

console.log(yourObject, encodedData, decodedData);
```

### Packing/Unpacking Data

```javascript
const yourObject = {test: "hello", data: [1, 23, 5, 6, {arr: Int16Array.of(-6, 777, 12), arr2: new Uint8Array(9)}]};
const packedData = JOYSON.pack(yourObject); // Uint8Array of 151 Bytes
const unpackedData = JOYSON.unpack(packedData);

console.log(packedData, unpackedData);
```

## Capabilities

### Nullish
| Feature     | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------|---------|--------|----------|--------|-------|------|------------------|
| null        | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| undefined   | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ❌               |
| **Score**   | 2/2     | 2/2    | 2/2      | 2/2    | 2/2   | 2/2  | 1/2              |

### Strings
| Feature              | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|----------------------|---------|--------|----------|--------|-------|------|------------------|
| ""                   | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| "primitive string"   | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| "sample string"      | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| "null(\\x00)"        | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| "\\x00\\x00null\\x00\\x00" | ✅ | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| **Score**            | 5/5     | 5/5    | 5/5      | 5/5    | 5/5   | 5/5  | 5/5              |

### Numbers
| Feature             | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|---------------------|---------|--------|----------|--------|-------|------|------------------|
| 0                   | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| 1                   | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| 2000                | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| NaN                 | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ❌               |
| EPSILON             | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -EPSILON            | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| MAX_SAFE_INTEGER    | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| MIN_SAFE_INTEGER    | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| MIN_VALUE           | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -Infinity           | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ❌               |
| Infinity            | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ❌               |
| -0xffffffff         | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -0x80000000         | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -0x7fffffff         | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -2000               | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -111.456            | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -1                  | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| -0                  | ✅      | ✅     | ❌       | ❌     | ❌    | ✅   | ❌               |
| 111.456             | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| 0x7fffffff          | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| 0x80000000          | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| 0xffffffff          | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| **Score**           | 21/21   | 21/21  | 20/21    | 20/21  | 20/21 | 21/21| 18/21            |

### BigInt
| Feature                   | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|---------------------------|---------|--------|----------|--------|-------|------|------------------|
| -111111111111111111111111111n | ✅   | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| -12345678901234567890n     | ✅   | ✅     | ✅       | ✅     | ❌    | ❌   | ❌               |
| -9223372036n               | ✅   | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| -1n                        | ✅   | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| 0n                         | ✅   | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| 1n                         | ✅   | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| 9223372036n                | ✅   | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| 9223372036854775807n       | ✅   | ✅     | ✅       | ✅     | ✅    | ❌   | ❌               |
| 18446744073709551615n      | ✅   | ✅     | ✅       | ✅     | ✅    | ❌   | ❌               |
| 111111111111111111111111111n | ✅   | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| **Score**                  | 10/10 | 10/10  | 6/10     | 4/10   | 6/10  | 0/10 | 0/10            |

### Objects
| Feature                   | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|---------------------------|---------|--------|----------|--------|-------|------|------------------|
| property order matter     | ✅   | ✅     | ✅       | ❌     | ✅    | ✅   | ✅               |
| {a: 'b'}                  | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {a: 1}                    | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {'': null}                | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {'': ''}                  | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {'': undefined}           | ✅   | ✅     | ✅       | ✅     | ✅    | ❌   | ❌               |
| {'': 0}                   | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {' ': 0}                  | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {'': false}               | ✅   | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| {'\\x00': '\\x00'}        | ✅   | ✅     | ✅       | ✅     | ✅    | ❌   | ✅               |
| **Score**                 | 10/10 | 10/10  | 10/10    | 9/10   | 10/10 | 9/10 | 9/10            |

### Object Literals
| Feature         | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-----------------|---------|--------|----------|--------|-------|------|------------------|
| Object(true)    | ✅      | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| Object(false)   | ✅      | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| Object(2n)      | ✅      | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| Object(-2n)     | ✅      | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| Object(NaN)     | ✅      | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| Object("string") | ✅     | ✅     | ❌       | ❌     | ❌    | ❌   | ❌               |
| **Score**       | 6/6     | 6/6    | 0/6      | 0/6    | 0/6   | 0/6  | 0/6              |

### Arrays
| Feature                       | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------------------------|---------|--------|----------|--------|-------|------|------------------|
| Array property order matter   | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ✅               |
| []                            | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| [1, 2, 3]                     | ✅      | ✅     | ✅       | ✅     | ✅    | ✅   | ✅               |
| **Score**                     | 3/3     | 3/3    | 3/3      | 2/3    | 3/3   | 3/3  | 3/3              |

### TypedArrays
| Feature                                         | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------------------------------------------|---------|--------|----------|--------|-------|------|------------------|
| Uint8Array([])                                  | ✅      | ✅     | ❌       | ✅     | ✅    | ❌   | ✅               |
| Uint8Array([0, 1, 254, 255])                    | ✅      | ✅     | ❌       | ✅     | ✅    | ❌   | ✅               |
| Uint16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF])   | ✅      | ✅     | ✅       | ❌     | ✅    | ❌   | ✅               |
| Uint32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅           |
| Int8Array([0, 1, 254, 255])                     | ✅      | ✅     | ❌       | ❌     | ✅    | ❌   | ✅               |
| Int16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF])    | ✅      | ✅     | ❌       | ❌     | ✅    | ❌   | ✅               |
| Int32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅           |
| Uint8ClampedArray([0, 1, 254, 255])             | ✅      | ✅     | ❌       | ❌     | ✅    | ❌   | ✅               |
| Float32Array([-Infinity, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, Infinity, NaN]) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅      |
| **Score**                                       | 9/9     | 9/9    | 6/9      | 4/9    | 9/9   | 0/9  | 9/9              |

### ArrayBuffers
| Feature                             | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------------------------------|---------|--------|----------|--------|-------|------|------------------|
| new ArrayBuffer(0)                  | ✅       | ✅      | ❌        | ❌      | ❌     | ❌    | ❌                |
| new Uint8Array([0, 1, 254, 255]).buffer | ✅       | ✅      | ❌        | ❌      | ❌     | ❌    | ❌                |
| **Score**                           | 2/2     | 2/2    | 0/2      | 0/2    | 0/2   | 0/2  | 0/2              |

### Dates
| Feature                 | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------------------|---------|--------|----------|--------|-------|------|------------------|
| new Date(-1666709071331) | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(-1e12)          | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(-1e9)           | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(-1e6)           | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(-1e3)           | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(0)              | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1e3)            | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1e6)            | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1e9)            | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1e12)           | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1e13)           | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| new Date(1666709071331)  | ✅     | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| **Score**                | 12/12  | 12/12  | 12/12    | 0/12   | 12/12 | 12/12| 0/12             |

## Maps
| Feature             | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|---------------------|---------|--------|----------|--------|-------|------|------------------|
| new Map()           | ✅      | ✅      | ✅       | ✅      | ❌     | ❌   | ❌               |
| new Map([["a", "b"]]) | ✅    | ✅      | ✅       | ✅      | ❌     | ❌   | ❌               |
| new Map([["a", "b"], ["c", "d"]]) | ✅ | ✅     | ✅  | ✅      | ❌     | ❌   | ❌               |
| new Map([[{}, "b"], [1, "d"]]) | ✅   | ✅      | ✅       | ✅      | ❌     | ❌   | ❌               |
| **Score**           | 4/4     | 4/4    | 4/4      | 4/4    | 0/4   | 0/4  | 0/4              |

### Sets
| Feature                 | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|-------------------------|---------|--------|----------|--------|-------|------|------------------|
| new Set()               | ✅      | ✅      | ✅       | ❌     | ✅    | ❌   | ❌               |
| new Set(["a", "b"])     | ✅      | ✅      | ✅       | ❌     | ✅    | ❌   | ❌               |
| new Set(["a", "b", "c", "d"]) | ✅ | ✅      | ✅  | ❌     | ✅    | ❌   | ❌               |
| new Set([{}, 1])        | ✅      | ✅      | ✅       | ❌     | ✅    | ❌   | ❌               |
| **Score**               | 4/4     | 4/4    | 4/4      | 0/4    | 4/4   | 0/4  | 0/4              |

### Errors
| Feature                          | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|----------------------------------|---------|--------|----------|--------|-------|------|------------------|
| new Error('Error')               | ✅      | ✅     | ✅        | ✅      | ❌     | ❌   | ✅               |
| new EvalError('EvalError')       | ✅      | ✅     | ❌        | ❌      | ❌     | ❌   | ❌               |
| new RangeError('RangeError')     | ✅      | ✅     | ❌        | ❌      | ❌     | ❌   | ❌               |
| new ReferenceError('ReferenceError') | ✅  | ✅     | ✅        | ❌      | ❌     | ❌   | ❌               |
| new SyntaxError('SyntaxError')   | ✅      | ✅     | ❌        | ❌      | ❌     | ❌   | ❌               |
| new TypeError('TypeError')       | ✅      | ✅     | ✅        | ❌      | ❌     | ❌   | ❌               |
| new URIError('URIError')         | ✅      | ✅     | ❌        | ❌      | ❌     | ❌   | ❌               |
| **Score**                        | 7/7     | 7/7    | 3/7      | 1/7    | 0/7   | 0/7  | 1/7              |

### Regular Expressions
| Feature              | core-js | joyson | msgpackr | cbor-x | cborg | bson | structured-clone |
|----------------------|---------|--------|----------|--------|-------|------|------------------|
| new RegExp()         | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/                | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/g               | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/i               | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/gi              | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/m               | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/mg              | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/mi              | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/mgi             | ✅      | ✅     | ✅       | ❌     | ✅    | ✅   | ❌               |
| /abc/gimsuy          | ✅      | ✅     | ✅       | ❌     | ✅    | ❌   | ❌               |
| **Score**            | 10/10   | 10/10  | 10/10    | 0/10   | 10/10 | 9/10 | 0/10            |

## Efficiency

| Feature             | core-js | joyson (pack/unpack) | msgpackr      | cbor-x        | cborg         | bson           | structured-clone |
|---------------------| --- |----------------------|---------------|---------------|---------------|----------------|------------------|
| Average time (ms)   | 0.1391 | 0.7914               | 1.1096        | 1.5174        | 1.6761        | 9.4376         | 5.3649           |
| Longest time (ms)   | 4.4 | 1.9                  | 35.8          | 44.5          | 49.4          | 1128.9         | 10.7             |
| Shortest  time (ms) | 0 | 0.6                  | 0.5           | 0.8           | 1             | 4.6            | 4.7              |
| Total  time (ms)    | 139.1 | 791.4 (100%)         | 1109.6 (140%) | 1517.4 (191%) | 1676.1 (211%) | 9437.6 (1193%) | 5364.9 (678%)    |
| Used size (bytes)   | N/A | 41684                | 33983         | 29105         | 37715         | 43431          | 43276            |

# 📝 JoyfulSerial Class Documentation

## Overview 🌐
`JoyfulSerial` is an advanced JavaScript class designed for efficient serialization and deserialization of various data types, including complex objects, arrays, and primitive data types. It features a robust handling of data types and offers a streamlined approach for converting data to and from binary formats.

## Class Structure 🏗️

### Constructor 🛠️
- `constructor()`: Initializes the class with a set of private properties for data storage and type handling.

### Properties 🔍
- `_bodyBuffers`, `_bodyBufferRef`, `_bodyBufferOffset`: Arrays and buffer references for serialized data. (Private)
- `_packBufferTemp32`, `_packBufferTemp8`: Temporary buffers for packing data. (Private)
- `_headerByteLength`, `_offset`: Variables for managing data offsets and header lengths. (Private)
- `_typedArrayTypes`, `errorTypes`: Arrays holding various typed array types and error types. (Private)
- `_typedArrayConstructor`, `_errorConstructor`: Arrays of constructors for typed arrays and error types. (Private)
- `_typedArrayConstructorSet`, `_typedArrayConstructorMap`, `_errorConstructorMap`: Sets and maps for constructor lookup. (Private)
- `_b64`, `_b64Base64ToBytes`, `_b64BytesToBase64`: B64chromium instance and methods for Base64 operations. (Private)
- `_textDecoder`, `_textDecoderFunction`: TextDecoder instance and its method. (Private)
- `_textEncoder`, `_textEncoderFunction`, `_textEncoderIntoFunction`: TextEncoder instance and its methods. (Private)
- `_hashtagCharCode`, `_startWithJoyson`: Character code for hashtag and a byte array representing "data:joyson". (Private)

### Methods 🛠️

#### Serialization Methods (Private) 🔐
- `_getComparator()`, `_getTypedConstructorNameLowerCase(value)`: Methods for object comparison and type identification. (Private)
- `_isError(value)`, `_isArrayBuffer(value)`, `_isTypedArray(value)`: Type checking methods for errors, ArrayBuffers, and TypedArrays. (Private)
- `_stringifyArrayBuffer(typedArray)`, `_stringifyTypedArray(typedArray)`, `_stringifyError(error)`: Methods for serializing various data types into strings. (Private)
- `_stringifyThis(data)`: Method for serializing individual data items. (Private)
- `_stringifyObject(obj)`, `_stringifyNumber(data)`, `_stringifyOther(data)`: Methods for serializing objects, numbers, and other data types. (Private)

#### Serialization Method (Public) 🔓
- `stringify(data)`: Serializes data into a JSON string. (Public)

#### Deserialization Methods (Private) 🔐
- `_parseThis(data, probablyDecode)`, `_parseObject(obj)`: Methods for parsing individual data items and objects. (Private)
- `_parseNumber(encodedNumber)`, `_parseArrayBuffer(encodedString)`, `_parseTypedArray(encodedString)`, `_parseError(ref)`: Methods for parsing numbers, ArrayBuffers, TypedArrays, and errors. (Private)

#### Deserialization Method (Public) 🔓
- `parse(data)`: Parses a JSON string into the original data format. (Public)

#### Packing Methods (Private) 🔐
- `_getBytePadding(length)`, `_packArrayBuffer(arrayBuffer)`, `_packTypedArray(typedArray)`, `_packError(error)`: Methods for packing ArrayBuffers, TypedArrays, and errors. (Private)
- `_packObject(obj)`, `_packNumber(data)`, `_packOther(data)`: Methods for packing objects, numbers, and other data types. (Private)

#### Packing Method (Public) 🔓
- `pack(data)`: Packs data into a binary format. (Public)

#### Unpacking Methods (Private) 🔐
- `_unpackThis(data, probablyDecode)`, `_unpackObject(obj)`: Methods for unpacking individual data items and objects. (Private)
- `_unpackNumber(encodedNumber)`, `_unpackArrayBuffer(ref)`, `_unpackError(ref)`, `_unpackTypedArray(ref, typeInfo)`: Methods for unpacking numbers, ArrayBuffers, errors, and TypedArrays. (Private)

#### Unpacking Method (Public) 🔓
- `unpack(packedData)`: Unpacks data from its binary format back into the original data format. (Public)

### Method Relationship Map 🗺️
- Serializing and Deserializing: The class provides a comprehensive approach to handle various data types, offering methods for serializing and deserializing individual items, objects, and primitives.
- Packing and Unpacking: It includes mechanisms to pack data into a binary format and subsequently unpack it, maintaining the integrity and structure of the original data.


## Additional Notes 📝
- Enhanced efficiency in data packing and unpacking, including alignment and padding considerations. In V0.8.0+ `.Stringify()` is now stable (sorting objects) and `.stringify() or .parse()` have performance roughly equals to 80% the native `JSON` object. 
## 🔗 References
- Base64 Encoding/Decoding: [B64chromium Documentation](https://www.npmjs.com/package/chromium-base64)
- Typed Arrays: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)

---