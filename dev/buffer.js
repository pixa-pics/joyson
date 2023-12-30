import compressEngine from "./compress";

/**
 * ArrayBufferIDManager is responsible for managing ArrayBuffers with unique identifiers.
 * It uses a WeakMap to associate ArrayBuffers with identifiers, allowing efficient garbage collection.
 */
class ArrayBufferIDManager {
    constructor(useCompress) {
        "use strict";
        // WeakMap to hold ArrayBuffer references with their IDs
        this._buffers = new WeakMap();
        // Regular object to store the reverse mapping from ID to ArrayBuffer
        this._store = {};
        // Counter for generating new IDs
        this._nextId = 0;
        this._compress = useCompress ? compressEngine.compress.bind(compressEngine): function (d){return d;};
        this._decompress = useCompress ? compressEngine.decompress.bind(compressEngine): function (d){return d;};
    }

    /**
     * Generates a unique ID for an ArrayBuffer.
     * @returns {number} The generated unique ID.
     */
    _generateId() {
        "use strict";
        var id = this._nextId;
        this._nextId++;
        return id;
    }

    /**
     * Clears all stored ArrayBuffers and resets the ID counter.
     */
    clear() {
        "use strict";
        this._buffers = new WeakMap();
        this._store = {};
        this._nextId = 0;
    }

    /**
     * Inserts an ArrayBuffer into the manager, optionally with a specified ID.
     * @param {ArrayBuffer} arrayBuffer The ArrayBuffer to insert.
     * @param {number} [id] Optional ID for the ArrayBuffer.
     * @returns {number} The ID associated with the ArrayBuffer.
     */
    insert(arrayBuffer, id) {
        "use strict";
        if (typeof id === "undefined") {
            if (this._buffers.has(arrayBuffer)) {
                // Find the existing key for the ArrayBuffer if it's already present
                return this._buffers.get(arrayBuffer)
            } else {
                id = this._generateId();
            }
        } else {
            // Ensure the manually specified ID is unique
            if (this._store.hasOwnProperty(id)) {
                throw new Error(`ID ${id} is already in use.`);
            }
        }

        id = parseInt(id);
        this._buffers.set(arrayBuffer, id);
        this._store[id] = arrayBuffer;
        return id;
    }

    /**
     * Retrieves an ArrayBuffer by its ID.
     * @param {number} id The ID of the ArrayBuffer to retrieve.
     * @returns {ArrayBuffer} The retrieved ArrayBuffer.
     */
    retrieve(id) {
        "use strict";
        return this._store[parseInt(id)];
    }

    /**
     * Retrieves all stored ArrayBuffers.
     * @returns {Object} An object containing all stored ArrayBuffers.
     */
    retrieveAll() {
        "use strict";
        var store = {};

        var entries = Object.entries(this._store);
        for (let i = 0; i < entries.length; i++) {
            var [key, value] = entries[i];

            value = this._compress(new Uint8Array(value)).buffer;
            store[parseInt(key)] = value;
        }

        return store;
    }

    /**
     * Inserts multiple ArrayBuffers into the manager.
     * @param {Object} store An object containing ArrayBuffers to insert.
     */
    insertAll(store) {
        "use strict";
        var entries = Object.entries(store);
        for (let i = 0; i < entries.length; i++) {
            var [key, value] = entries[i];

            value = this._decompress(new Uint8Array(value)).buffer;

            this.insert(value, parseInt(key));
        }
    }
}

export default ArrayBufferIDManager;