"use strict";
class ArrayBufferIDManager {
    constructor() {
        this._buffers = new WeakMap();
        this._store = {};
        this._nextId = 0;
    }

    _generateId() {
        var id = this._nextId;
        this._nextId++;
        return id;
    }

    clear() {
        this._buffers = new WeakMap();
        this._store = {};
        this._nextId = 0;
    }

    insert(arrayBuffer, id = null) {
        if (id === null) {
            if(this._buffers.has(arrayBuffer)){
                for (var key in this._store){
                    if(this._store[key] === arrayBuffer){
                        return key;
                    }
                }
            }else {
                id = this._generateId();
            }
        } else {
            // Ensure the manually specified ID is unique
            if (this._buffers.has(id)) {
                throw new Error(`ID ${id} is already in use.`);
            }
        }

        id = parseInt(id);
        this._buffers.set(arrayBuffer, id);
        this._store[id] = arrayBuffer;
        return id;
    }

    retrieve(id) {
        return this._store[parseInt(id)];
    }

    retrieveAll() {
        return this._store;
    }

    insertAll(store) {
        var entries = Object.entries(store);
        for (let i = 0; i < entries.length; i++) {
            var entry = entries[i], key = entry[0], value = entry[1];
            this.insert(value, parseInt(key));
        }
    }
}

export default ArrayBufferIDManager;