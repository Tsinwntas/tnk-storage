import { TnkStorage } from './tnk-storage.service';
import getUniqueId from './unique-id';
export class DataFactory {
    constructor(instance, keys) {
        this.instance = instance;
        this.keys = keys;
    }
    async get() {
        //BAD PRACTICE BUT INJECTING THE SERVICE DOESN'T WANT TO WORK!
        const unfinishedData = await TnkStorage.DB.getFiltered(this.instance.getTableName(), (entity) => this.keys.includes(entity.databaseKey));
        return fixList(this.instance, unfinishedData);
    }
}
export class StorageEntity {
    constructor(toClone) {
        if (toClone)
            this.deepClone(toClone);
        if (!this.databaseKey)
            this.databaseKey = getUniqueId();
    }
    getTableName() {
        return (this.instance ? "instance" : this.isMock ? "mock" : "") + "" + this.getTableNameForClass();
    }
    instantiate(toInstantiate) {
        if (toInstantiate) {
            this.deepClone(toInstantiate);
            this.databaseKey = getUniqueId();
        }
        this.instance = true;
        return this;
    }
    mock(toMock) {
        if (toMock) {
            this.deepClone(toMock);
            this.databaseKey = getUniqueId();
        }
        this.isMock = true;
        return this;
    }
    saveEntity() {
        Object.keys(this).forEach((key) => {
            if (this[key] && isStorageEntity(this[key]))
                getAsStorageEntity(this[key]).saveEntity();
            else if (this.isStorageEntityArray(key) || isFunction(this[key]))
                this[key] = undefined;
        });
        return this;
    }
    isStorageEntityArray(key) {
        return Array.isArray(this[key]) && this[key].length > 0 && isStorageEntity(this[key][0]);
    }
    isEntitiesSynced(keys, entities) {
        if (!entities)
            return false;
        return entities.length == keys.length;
    }
    deepClone(entity) {
        return Object.assign(this, entity);
    }
    async getItems(dirty, references, items) {
        if (!references || references.length == 0)
            return [];
        if (!this.isEntitiesSynced(references, items)) {
            items = await (new DataFactory(dirty, references).get());
            cleanUp(references, items);
        }
        return items;
    }
}
export class EmptyEntity extends StorageEntity {
    getTableNameForClass() {
        throw new Error('Method not implemented.');
    }
    getCleanModel() {
        throw new Error('Method not implemented.');
    }
    deepClone(o) {
        throw new Error('Method not implemented.');
    }
    saveEntity() {
        throw new Error('Method not implemented.');
    }
}
export function fixList(object, list) {
    return list.map(o => {
        return object.getCleanModel().deepClone(o);
    });
}
function cleanUp(references, items) {
    const cleanUp = [];
    references.forEach(ref => {
        if (!(items === null || items === void 0 ? void 0 : items.find(i => i.databaseKey == ref)))
            cleanUp.push(ref);
    });
    cleanUp.forEach(ref => references.splice(references.findIndex(r => r == ref), 1));
}
function getAsStorageEntity(object) {
    return object;
}
function isStorageEntity(object) {
    return object.saveEntity !== undefined;
}
function isFunction(value) {
    return typeof value == "function";
}
//# sourceMappingURL=data-factory.js.map