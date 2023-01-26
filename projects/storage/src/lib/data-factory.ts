import { TnkStorage } from './storage.service';
import getUniqueId from './unique-id'

export class DataFactory<T>{

    instance: StorageEntity<T>;
    keys: string[];

    constructor(instance: StorageEntity<T>, keys: string[]) {
        this.instance = instance;
        this.keys = keys;
    }

    async get(): Promise<T[]> {
        //BAD PRACTICE BUT INJECTING THE SERVICE DOESN'T WANT TO WORK!
        const unfinishedData = await TnkStorage['DB'].getFiltered(this.instance.getTableName(), (entity: StorageEntity<any>) => this.keys.includes(entity.databaseKey));
        return fixList<T>(this.instance, unfinishedData);
    }
}

export abstract class StorageEntity<T> {
    databaseKey: string;
    owner? : string;
    lastSync?: Date;
    isMock? : boolean;
    instance? : boolean;
    dummy?: boolean;

    constructor(toClone? : T) {
        if(toClone)
            this.deepClone(toClone);
        if(!this.databaseKey)
            this.databaseKey = getUniqueId();
    }

    abstract getCleanModel(entity? : T) : StorageEntity<T>;

    abstract getTableNameForClass() : string;

    getTableName() : string {
        return (this.instance ? "instance" : this.isMock ? "mock" : "")+""+this.getTableNameForClass();
    }

    instantiate(toInstantiate? : T) : StorageEntity<T> {
        if(toInstantiate){
            this.deepClone(toInstantiate);
            this.databaseKey = getUniqueId();
        }
        this.instance = true;
        return this;
    }

    mock(toMock? : T) : StorageEntity<T> {
        if(toMock){
            this.deepClone(toMock);
            this.databaseKey = getUniqueId();
        }
        this.isMock = true;
        return this;
    }

    saveEntity(): StorageEntity<T> {
        Object.keys(this).forEach((key : string) => {
            if ((this as any)[key] && isStorageEntity<T>((this as any)[key]))
                getAsStorageEntity<T>((this as any)[key]).saveEntity();
            else if (this.isStorageEntityArray(key) || isFunction((this as any)[key]))
                (this as any)[key] = undefined;
        });
        return this;
    }

    private isStorageEntityArray(key: string): boolean {
        return Array.isArray((this as any)[key]) && (this as any)[key].length > 0 && isStorageEntity<any>((this as any)[key][0]);
    }

    isEntitiesSynced(keys: string[], entities?: any[]): boolean {
        if (!entities)
            return false;
        return entities.length == keys.length
    }

    deepClone(entity: T): T {
        return Object.assign(this, entity);
    }

    async getItems<K>(dirty : StorageEntity<K>, references : string[], items? : K[]) : Promise<K[]>{
        if(!references || references.length == 0)
            return [];
        if(!this.isEntitiesSynced(references, items)) {
            items = await (new DataFactory<K>(dirty, references).get());
            cleanUp<K>(references, items);
        }
        return items!;
    }
}

export class EmptyEntity extends StorageEntity<EmptyEntity> {
    getTableNameForClass(): string {
        throw new Error('Method not implemented.');
    }
    getCleanModel(): EmptyEntity {
        throw new Error('Method not implemented.');
    }
    deepClone(o: EmptyEntity): EmptyEntity {
        throw new Error('Method not implemented.');
    }
    saveEntity(): EmptyEntity {
        throw new Error('Method not implemented.');
    }
}

export function fixList<T>(object: StorageEntity<T>, list: T[]): T[] {
    return list.map(o => {
        return object.getCleanModel().deepClone(o)
    });
}

function cleanUp<K>(references: string[], items: K[] | undefined) {
    const cleanUp: string[] = [];
    // references.forEach(ref => {
    //     if (items?.find((i : any) => (i as StorageEntity<any>).databaseKey == ref) === undefined)
    //         cleanUp.push(ref);
    // });
    cleanUp.forEach(ref => references.splice(references.findIndex(r => r == ref), 1));
}

function getAsStorageEntity<T>(object: T): StorageEntity<T> {
    return object as unknown as StorageEntity<T>;
}

function isStorageEntity<T>(object: T): boolean {
    return (object as unknown as StorageEntity<T>).saveEntity !== undefined;
} 

function isFunction(value: any): boolean {
    return typeof value == "function";
}