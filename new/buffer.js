"use strict";
class ArrayBufferIDManager {
    constructor() {
        this._weakSet = new WeakSet();
        this._idToBufferMap = new Map();
        this._buffertoIdMap = new WeakMap();
        this._nextId = 0;
    }

    _generateId() {
        var id = this._nextId;
        this._nextId++;
        return id;
    }

    clear() {
        this._weakSet = new WeakSet();
        this._idToBufferMap = new Map();
        this._nextId = 0;
    }

    insert(arrayBuffer, id = null) {
        if (id === null) {
            if(this._weakSet.has(arrayBuffer)){
                return this._buffertoIdMap.get(arrayBuffer);
            }else {
                id = this._generateId();
            }
        } else {
            // Ensure the manually specified ID is unique
            if (this._idToBufferMap.has(id)) {
                throw new Error(`ID ${id} is already in use.`);
            }
        }

        this._weakSet.add(arrayBuffer);
        this._buffertoIdMap.set(arrayBuffer, id);
        this._idToBufferMap.set(id, arrayBuffer);
        return id;
    }

    retrieve(id) {
        return this._idToBufferMap.get(id);
    }

    retrieveAll() {
        const allBuffers = {};
        const keys = Array.from(this._idToBufferMap.keys());
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const buff = this._idToBufferMap.get(id);
            allBuffers[id] = buff.slice(0, buff.byteLength);
        }
        return allBuffers;
    }

    insertAll(buffers) {
        const keys = Object.keys(buffers);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            this.insert(buffers[id], parseInt(id));
        }
    }
}

export default ArrayBufferIDManager;