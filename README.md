# JOYSON

![JOYSON LOGO](https://raw.githubusercontent.com/pixa-pics/joyson/main/logo.png)

`joyson` is a JavaScript module designed for efficient encoding and decoding of JSON objects, particularly adept at handling TypedArrays. Unlike standard JSON methods, `joyson` provides additional `pack` and `unpack` methods for more memory-efficient handling of large data structures, including support for binary data serialization.

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## Key Differences

- **Standard JSON Methods**: `stringify` and `parse` convert objects to/from JSON strings.
- **Extended Binary Methods**: `pack` and `unpack` handle serialization/deserialization of data into/from a compact binary format, beneficial for performance-intensive applications.

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## Features

- **TypedArray Support**: Seamless encoding and decoding of TypedArrays within JSON objects.
- **Memory Efficiency**: Optimized for minimal memory footprint during processing.
- **Binary Serialization**: The `pack` method allows for compact binary serialization of data, while `unpack` restores it, ensuring efficient data handling.

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## Installation

Install `joyson` using npm:

```bash
npm install joyson
```

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## Usage

Import `JOYSON` from `joyson`:

```javascript
import JOYSON from 'joyson';
```

> Using /dist/browser.min.js` enable you to directly use JOYSON like JSON

### Encoding/Decoding an Object

```javascript
const object = {test: "hello", data: [1, 23, 5, 6, {"##": undefined, "##test": /regex/i, date: new Date(), table: [-0, 111111111n, -666.777, new Set([1, 2, "blue", {}]), new Map()], arr: Int16Array.of(-6, 777, 12), arr2: new Uint8Array(9)}, "hello here is asaitama I love JS"]};
const encoded = JOYSON.stringify(object); // `{"test":"hello","data":[1,23,5,6,{"#$IyM=":"data:joyson/undefined;","#$IyN0ZXN0":"data:joyson/regexp;cmVnZXg=:aQ==","##date":"data:joyson/date;2023-12-25T00:33:37.935Z","table":["data:joyson/number;-0","data:joyson/bigint;111111111",-666.777,"data:joyson/set;WzEsMiwiYmx1ZSIse31d","data:joyson/map;W10="],"##arr":"data:joyson/int16array;base64,+v8JAwwA","##arr2":"data:joyson/uint8array;base64,AAAAAAAAAAAA"},"hello here is asaitama I love JS"]}`
const decoded = JOYSON.parse(encoded);

console.log(object, encoded, decoded);
```

### Packing/Unpacking Data

```javascript
const yourObject = {test: "hello", data: [1, 23, 5, 6, {arr: Int16Array.of(-6, 777, 12), arr2: new Uint8Array(9)}]};
const packedData = JOYSON.pack(yourObject); // Uint8Array of 151 Bytes
const unpackedData = JOYSON.unpack(packedData);

console.log(packedData, unpackedData);
```


![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

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


### Detailed Analysis with Ratings

#### BSON
- **Loading Speed**: Very slow, longest time 800ms.
- **Rating**:
    - Encoding: 2.0/10
    - Decoding: 2.5/10
    - Longest: 1.0/10
    - Average: 3.0/10
    - Shortest: 4.0/10
    - Total: 2.5/10

#### Joyson
- **Performance**: Exceptionally fast, longest time 3-4ms.
- **Rating**:
    - Encoding: 9.5/10
    - Decoding: 9.5/10
    - Longest: 9.5/10
    - Average: 9.7/10
    - Shortest: 9.8/10
    - Total: 9.6/10

#### Message Packer
- **Initial Encoding Speed**: Initially slow but improves.
- **Balanced Performance**: Post-initial usage shows good balance.
- **Rating**:
    - Encoding: 8.0/10 (initially lower, improves over time)
    - Decoding: 8.5/10
    - Longest: 8.0/10
    - Average: 8.5/10
    - Shortest: 9.0/10
    - Total: 8.5/10

### Conclusions
- **BSON**: Best for specific ecosystems like MongoDB, but slow.
- **Joyson**: Top choice for high-speed, efficient data processing.
- **Message Packer**: Excellent for long-running applications with a balance between encoding and decoding post-initial usage.

| Feature             | core-js | joyson (pack/unpack) | msgpackr      | cbor-x        | cborg         | bson           | structured-clone |
|---------------------|---------|----------------------|---------------|---------------|---------------|----------------|------------------|
| Average time (ms)   | 0.1391  | 0.7914               | 1.1096        | 1.5174        | 1.6761        | 9.4376         | 5.3649           |
| Longest time (ms)   | 4.4     | 1.9                  | 35.8          | 44.5          | 49.4          | 1128.9         | 10.7             |
| Shortest time (ms)  | 0       | 0.6                  | 0.5           | 0.8           | 1             | 4.6            | 4.7              |
| Total time (ms)     | 139.1   | 791.4 (100%)         | 1109.6 (140%) | 1517.4 (191%) | 1676.1 (211%) | 9437.6 (1193%) | 5364.9 (678%)    |
| Used size (bytes)   | N/A     | 41684                | 33983         | 29105         | 37715         | 43431          | 43276            |

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## JoyfulSerial Class Documentation

## Overview
`JoyfulSerial` is a comprehensive class for serializing and deserializing complex data types. It supports various data types including `ArrayBuffer`, `TypedArray`, and complex objects. The class is designed for efficient data handling with methods for packing and unpacking data, as well as converting data to and from JSON format.

### Constructor
- `constructor()`: Initializes the class with necessary properties and setup for data handling.

### Properties
- `_bodyBuffers`: An array to store serialized data. \(Private\)
- `_bodyBufferRef`: An ArrayBuffer for reference during unpacking. \(Private\)
- `_bodyBufferOffset`, `_packBufferTemp32`, `_packBufferTemp8`, `_headerByteLength`, `_offset`: Various buffers and counters for data processing. \(Private\)
- `_typedArrayTypes`, `_typedArrayConstructor`, `_typedArrayConstructorSet`, `_typedArrayConstructorMap`: Collections for handling different typed arrays. \(Private\)
- `errorTypes`, `_errorConstructor`, `_errorConstructorMap`: Collections for handling different error types. \(Private\)
- `_b64`, `_b64Base64ToBytes`, `_b64BytesToBase64`: Base64 encoding and decoding utilities. \(Private\)
- `_textDecoder`, `_textDecoderFunction`, `_textEncoder`, `_textEncoderFunction`, `_textEncoderIntoFunction`: Text encoding and decoding utilities. \(Private\)
- `_hashtagCharCode`, `_startWithJoyson`: Utilities for string processing. \(Private\)

### Private Methods
- `_getComparator()`, `_getTypedConstructorNameLowerCase(value)`, `_stringifyOther(data)`, `_isError(value)`, `_isArrayBuffer(value)`, `_isTypedArray(value)`, `_stringifyArrayBuffer(arrayBuffer)`, `_stringifyTypedArray(typedArray)`, `_stringifyError(error)`, `_stringifyThis(data)`, `_stringifyObject(obj)`, `_stringifyNumber(data)`, `_dataStartsWithJoyson(data)`, `_parseThis(data, probablyDecode)`, `_parseObject(obj)`, `_parseNumber(encodedNumber)`, `_parseArrayBuffer(encodedString)`, `_parseTypedArray(encodedString)`, `_parseError(ref)`, `_packThis(data)`, `_getBytePadding(length)`, `_packArrayBuffer(arrayBuffer)`, `_packTypedArray(typedArray)`, `_packError(error)`, `_packObject(obj)`, `_packNumber(data)`, `_packOther(data)`, `_createPackedData(header)`, `_combineBuffers()`, `_unpackNumber(encodedNumber)`, `_unpackThis(data, probablyDecode)`, `_unpackArrayBuffer(ref)`, `_unpackError(ref)`, `_unpackTypedArray(ref, typeInfo)`, `_keyMustDecode(key)`, `_keyStartsWithDecode(key)`, `_unpackObject(obj)`: Various utility methods for processing and handling data. \(Private\)

### Public Methods
- `stringify(data)`: Converts data into a JSON string. \(Public\)
- `pack(data)`: Packs data into a binary format. \(Public\)
- `unpack(packedData)`: Unpacks data from its binary format back into the original format. \(Public\)
- `parse(data)`: Parses a JSON string into the original data format. \(Public\)

### Method Relationship Map
- `stringify` ➡ `_stringifyThis` ➡ Various `_stringify*` methods.
- `parse` ➡ `_parseThis` ➡ Various `_parse*` methods.
- `pack` ➡ `_packThis` ➡ Various `_pack*` methods and `_createPackedData`.
- `unpack` ➡ `_unpackThis` ➡ Various `_unpack*` methods.

### Packing/Unpacking and Stringify/Parse Explanation
- **Packing/Unpacking**: Data is packed into a binary format for efficient storage and transmission. The `pack` method prepares data for packing, and `unpack` restores it to the original format.
- **Stringify/Parse**: The `stringify` method converts data into a JSON string, handling various data types and complex objects. The `parse` method reverses this process, converting the JSON string back to the original data format.

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## Additional Notes
- The class employs complex data handling strategies, including Base64 encoding/decoding and efficient memory management for large data sets.
- It supports a wide range of data types and complex structures, ensuring versatility in serialization and deserialization.
- The class is designed with a focus on performance and accuracy in data representation.

![SECTION](https://raw.githubusercontent.com/pixa-pics/joyson/main/section.png)

## 🔗 References
- Base64 Encoding/Decoding: [B64chromium Documentation](https://www.npmjs.com/package/chromium-base64)
- Typed Arrays: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)

---