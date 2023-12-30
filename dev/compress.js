
// Class for encoding and decoding data using Delta Encoding
class DeltaDataEncoder {
    constructor(arrayType) {
        this.arrayType = arrayType;
        this.bitMask = this.calculateBitMask();
    }

    // Calculate the bitmask for masking operations based on the array type
    calculateBitMask() {
        const maskMap = {
            Uint8Array: 0xFF,
            Uint16Array: 0xFFFF,
            Uint32Array: 0xFFFFFFFF
        };

        if (!(this.arrayType.name in maskMap)) {
            throw new Error(`Unsupported array type: ${this.arrayType.name}`);
        }

        return maskMap[this.arrayType.name];
    }

    // Encode the provided data using delta encoding
    performDeltaEncoding(dataArray) {
        this.validateInputType(dataArray, 'performDeltaEncoding');

        var encodedArray = new this.arrayType(dataArray.length);
        var length = dataArray.length|0;
        var index = 0;
        var delta = 0;

        encodedArray[0] = dataArray[0] | 0;

        for (index = 1; (index | 0) < (length | 0); index = (index + 1) | 0) {
            delta = (dataArray[index] - dataArray[index - 1]) & this.bitMask;
            encodedArray[index] = delta | 0;
        }

        return encodedArray;
    }

    // Decode the provided data using delta decoding
    performDeltaDecoding(encodedArray) {
        this.validateInputType(encodedArray, 'performDeltaDecoding');

        var decodedArray = new this.arrayType(encodedArray.length);
        var length = encodedArray.length|0;
        var index = 0;
        var sum = 0;

        decodedArray[0] = encodedArray[0] | 0;

        for (index = 1; (index | 0) < (length | 0); index = (index + 1) | 0) {
            sum = (decodedArray[index - 1] + encodedArray[index]) & this.bitMask;
            decodedArray[index] = sum | 0;
        }

        return decodedArray;
    }

    // Validate if the provided data type matches the specified array type
    validateInputType(dataArray, methodName) {
        if (!(dataArray instanceof this.arrayType)) {
            throw new Error(`Input data type does not match for method ${methodName}. Expected: ${this.arrayType.name}`);
        }
    }
}

// Class for managing individual bits in a byte array
class BitArrayManager {
    constructor(size) {
        this.bitArray = new Uint8Array((size + 7) >> 3);
    }

    // Write a bit at the specified index
    setBit(index, value) {
        index = index | 0;
        value = value | 0;
        var byteIndex = 0;
        var bitPosition = 0;
        var mask = 0;

        byteIndex = (index / 8) | 0;
        bitPosition = index % 8;
        mask = 1 << bitPosition;

        if (value) {
            this.bitArray[byteIndex] = this.bitArray[byteIndex] | mask;
        } else {
            this.bitArray[byteIndex] = this.bitArray[byteIndex] & (~mask);
        }
    }

    // Read a bit at the specified index
    getBit(index) {
        index = index | 0;
        var byteIndex = 0;
        var bitPosition = 0;

        byteIndex = (index / 8) | 0;
        bitPosition = index % 8;
        return (this.bitArray[byteIndex] & (1 << bitPosition)) ? 1 : 0;
    }
}

// Class for compressing and decompressing Typed Arrays
class TypedArrayCompressor {
    constructor() {
        this.deltaEncoder8Bit = new DeltaDataEncoder(Uint8Array);
        this.deltaEncoder16Bit = new DeltaDataEncoder(Uint16Array);
        this.deltaEncoder32Bit = new DeltaDataEncoder(Uint32Array);
    }

    // Helper methods to get the appropriate DeltaDataEncoder based on the array type
    getDeltaEncoder(typeName) {
        switch (typeName) {
            // Mapping of TypedArray constructors to their respective DeltaDataEncoder
            case 'Uint8Array':
            case 'Int8Array':
            case 'Uint8ClampedArray':
                return this.deltaEncoder8Bit;
            case 'Uint16Array':
            case 'Int16Array':
                return this.deltaEncoder16Bit;
            case 'Uint32Array':
            case 'Int32Array':
            case 'Float32Array':
            case 'Float64Array':
                return this.deltaEncoder32Bit;
            default:
                throw new Error("Unknown TypedArray type.");
        }
    }

    // Compress a given TypedArray
    compress(data) {
        const dataTypeConstructor = data.constructor;
        const dataTypeName = dataTypeConstructor.name;
        const originalLength = data.length;
        const deltaEncoder = this.getDeltaEncoder(dataTypeName);
        let deltaData = deltaEncoder.performDeltaEncoding(new dataTypeConstructor(data.buffer));
        const repeatsTracker = new BitArrayManager(data.length);
        let nonRepeatingValues = [];

        let lastValue = deltaData[0];
        nonRepeatingValues.push(lastValue);

        // Logic to identify and mark repeated values
        for (let i = 1; i < deltaData.length; i++) {
            if (deltaData[i] === lastValue) {
                repeatsTracker.setBit(i, true);
            } else {
                nonRepeatingValues.push(deltaData[i]);
                lastValue = deltaData[i];
            }
        }

        // Logic for packing data into a single array for compression
        const packedData = this.packData(nonRepeatingValues, repeatsTracker, originalLength, dataTypeConstructor.BYTES_PER_ELEMENT);
        return packedData;
    }

    // Helper function to pack data into a Uint8Array
    packData(nonRepeatingValues, repeatsTracker, originalLength, bytesPerElement) {
        const lengthOfNonRepeatingValues = nonRepeatingValues.length * bytesPerElement;
        const trackerData = repeatsTracker.bitArray;
        const trackerDataLength = trackerData.length;
        const packedData = new Uint8Array(9 + lengthOfNonRepeatingValues + trackerDataLength);

        // Logic to assemble the packed data array
        // [0]: Data Type ID, [1-4]: Length of Compressed Data, [5-8]: Original Length, [9+]: Data Values and Tracker Data
        packedData[0] = this.getDataTypeId(nonRepeatingValues);
        packedData.set(this.convertLengthToBytes(lengthOfNonRepeatingValues), 1);
        packedData.set(this.convertLengthToBytes(originalLength), 5);
        packedData.set(nonRepeatingValues, 9);
        packedData.set(trackerData, 9 + lengthOfNonRepeatingValues);

        return packedData;
    }

    // Convert a length value to a byte array
    convertLengthToBytes(length) {
        return [
            length >> 0 & 0xFF,
            length >> 8 & 0xFF,
            length >> 16 & 0xFF,
            length >> 24 & 0xFF
        ];
    }

    // Identify the data type ID based on the non-repeating values
    getDataTypeId(nonRepeatingValues) {
        // This method should return a unique ID for each data type.
        // The following is a simple implementation.
        // Extend or modify based on actual requirements.
        const dataTypeMap = {
            "Uint8Array": 1,
            "Int8Array": 2,
            "Uint8ClampedArray": 3,
            "Uint16Array": 4,
            "Int16Array": 5,
            "Uint32Array": 6,
            "Int32Array": 7,
            "Float32Array": 8,
            "Float64Array": 9
        };

        // Assuming nonRepeatingValues is a typed array
        return dataTypeMap[nonRepeatingValues.constructor.name] || 0;
    }

    // Decompress a given packed data array
    decompress(packedData) {
        // Extracting metadata from the packed data
        const dataTypeId = packedData[0];
        const lengthOfNonRepeatingValues = this.extractLengthFromBytes(packedData, 1);
        const originalLength = this.extractLengthFromBytes(packedData, 5);

        // Extracting non-repeating values and tracker data
        const nonRepeatingValues = new Uint8Array(packedData.subarray(9, 9 + lengthOfNonRepeatingValues));
        const trackerData = new Uint8Array(packedData.subarray(9 + lengthOfNonRepeatingValues));

        // Determine the final data type
        const finalConstructor = this.getArrayConstructorByTypeId(dataTypeId);

        // Convert non-repeating values to the appropriate TypedArray
        let finalNonRepeatingValues = new finalConstructor(nonRepeatingValues.buffer);

        // Initialize repeats tracker
        let repeatsTracker = new BitArrayManager(trackerData.length * 8);
        repeatsTracker.bitArray = trackerData;

        // Reconstruct the original data
        let reconstructedData = new finalConstructor(originalLength);
        let j = 0;
        for (let i = 0; (i|0) < (originalLength|0); i=i+1|0) {
            if (repeatsTracker.getBit(i)) {
                reconstructedData[i] = reconstructedData[i - 1 | 0]; // Repeated value
            } else {
                reconstructedData[i] = finalNonRepeatingValues[j++]; // Non-repeating value
            }
        }

        // Get the appropriate DeltaDataEncoder
        const deltaEncoder = this.getDeltaEncoder(finalConstructor.name);
        return deltaEncoder.performDeltaDecoding(reconstructedData);
    }

    // Convert bytes to a length value
    extractLengthFromBytes(data, startIndex) {
        return data[startIndex] |
            data[startIndex + 1] << 8 |
            data[startIndex + 2] << 16 |
            data[startIndex + 3] << 24;
    }

    // Get the array constructor by type ID
    getArrayConstructorByTypeId(typeId) {
        // Map type IDs back to their respective constructors
        const typeMap = {
            1: Uint8Array,
            2: Int8Array,
            3: Uint8ClampedArray,
            4: Uint16Array,
            5: Int16Array,
            6: Uint32Array,
            7: Int32Array,
            8: Float32Array,
            9: Float64Array
        };

        return typeMap[typeId] || Uint8Array; // Default to Uint8Array if typeId is not found
    }

}

var engine = new TypedArrayCompressor();

export default engine;