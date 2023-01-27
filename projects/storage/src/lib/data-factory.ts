import { TnkStorage } from './storage.service';
import getUniqueId from './unique-id'

export class DataFactory<T>{

    private instance: StorageEntity<T>;
    private keys: string[];

    constructor(instance: StorageEntity<T>, keys: string[]) {
        this.instance = instance;
        this.keys = keys;
    }


    
    /**
     * Gets all entities available for the list of keys provided.
     * Uses static instance of the DB, which is a bad practice and I am willing
     * to let anyone help me use the Injector.create however I was always getting the InjectorToken not provided. 
     * I did provide my providers in the modules so that's not it.
     */
    async get(): Promise<T[]> {
        //BAD PRACTICE BUT INJECTING THE SERVICE DOESN'T WANT TO WORK!
        return await TnkStorage['DB'].getFiltered<T>(this.instance, (entity: StorageEntity<any>) => this.keys.includes(entity.databaseKey));
    }
}

/**
 * Base abstract class for anything that goes in the DB. 
 * 
 * If you have children storage entity arrays in your class make sure
 * to also have a childrenKeys array to save the keys, because I don't save
 * the children to avoid duplication.
 * 
 * If you have objects that are of any other type as children then make sure to initialise them in the constructor 
 * otherwise when retrieving them from the DB they will lose their functions. No this is not a problem with my implementation
 * but actually I provide a simple solution for this existing problem.
 */
export abstract class StorageEntity<T> {
    databaseKey: string;
    owner? : string;
    lastSync?: Date;
    isMock? : boolean;
    instance? : boolean;
    dummy?: boolean;

    /**
     * Deep clones the loaded entity.
     * @param toClone The entity that was loaded from the DB or if for some reason you want to copy an object. 
     * Bear in mind, if it is just for copying, it will not create a new db key.
     */
    constructor(toClone? : T) {
        if(toClone)
            this.deepClone(toClone);
        if(!this.databaseKey)
            this.databaseKey = getUniqueId();
    }

    /**
     * Returns a clean model of the object for editing or other usages.
     * It's necessary because we cannot do new T() so it has to be provided by the entity itself.
     * @param entity If provided will deep clone this entity
     */
    abstract getCleanModel(entity? : T) : StorageEntity<T>;

    /**
     * Should return the base class name.
     * Needs to be implemented in every class with the appropriate return.
     */
    abstract getTableNameForClass() : string;

    /**
     * Returns the table name used for this entity. 
     * Takes into consideration if the entity is an instance or mock, which means it would
     * be saved in another table than the rest.
     */
    getTableName() : string {
        return (this.instance ? "instance" : this.isMock ? "mock" : "")+""+this.getTableNameForClass();
    }

    /**
     * Copies another entity if provided and marks this one as an instance.
     * This means it will be saved in a table named "instance"+className. 
     * This table needs to be added in the schema in the app.module.
     * @param toInstantiate The entity that we want to instantiate
     */
    instantiate(toInstantiate? : T) : StorageEntity<T> {
        if(toInstantiate){
            this.deepClone(toInstantiate);
            this.databaseKey = getUniqueId();
        }
        this.instance = true;
        return this;
    }

    /**
     * Copies another entity if provided and marks this one as a mock object.
     * This means it will be saved in a table named "mock"+className. 
     * This table needs to be added in the schema in the app.module.
     * @param toMock The entity that we want to mock
     */
    mock(toMock? : T) : StorageEntity<T> {
        if(toMock){
            this.deepClone(toMock);
            this.databaseKey = getUniqueId();
        }
        this.isMock = true;
        return this;
    }

    /**
     * Is called when being set in the database. 
     * If a property is a storage entity array, it will remove it to save space.
     * That is why you need to have a string array with the keys of children entities.
     * Also for any children storage entities that are not an array, it will perform the saveEntity
     * recurrsively to prepare them for storage.
     * 
     * You shouldn't have to ever call this, but you can extend it if you want something changed.
     */
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

    private isEntitiesSynced(keys: string[], entities?: any[]): boolean {
        if (!entities)
            return false;
        return entities.length == keys.length
    }

    /**
     * When loading from the database, the items lose their functions so we need to call this
     * in order to set them up for usage. 
     * 
     * You shouldn't have to ever call this, but you can extend it if you want something changed. 
     * 
     * If you have inner arrays of objects that are not StorageEntities and are not primal classes then extend
     * this and make sure to Object assign each item with the appropriate class.
     * @param entity The entity to clone.
     */
    deepClone(entity: T): T {
        Object.assign(this, entity);
        const cleanObject = this.getCleanModel();
        Object.keys(this).forEach((key : string) => {
            if(this[key] && !isFunction(cleanObject[key]) && !this[key].length){
                if (cleanObject[key] && isStorageEntity<T>(cleanObject[key]))
                    this[key] = getAsStorageEntity<T>(cleanObject[key]).deepClone(this[key]);
                else if (cleanObject[key] && typeof cleanObject[key] == 'object')
                    this[key] = Object.assign(cleanObject[key], this[key])
            }
        });
        return (this as any);
    }

    /**
     * Loads the children storage entities of the given type.
     * You call this only from the extended entities that you created that have children of type storage entity array.
     * @param dirty The instance that will be used to figure out what type of children we are loading.
     * @param references The array of database keys of the children.
     * @param items The array of children to be filled.
     */
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

/**
 * Whenever you load a list from the database it needs to be passed here to be cleaned up and made ready for usage.
 * I am trying to figure out a way so that you will never have to call this. So far you need to. I am sorry.
 * @param object The type of entities in this list. Necessary for clean up because we cannot do new T()
 * @param keyRange The list that needs cleaning. The changes are not applied to this list but returned.
 */
export function fixList<T>(object: StorageEntity<T>, list: T[]): T[] {
    return list.map(o => {
        return object.getCleanModel().deepClone(o)
    });
}

function cleanUp<K>(references: string[], items: K[] | undefined) {
    if(!items || !items.length)
        return;
    const cleanUp: string[] = [];
    references.forEach(ref => {
        if (items.find((i : any) => (i as unknown as StorageEntity<any>).databaseKey == ref) === undefined)
            cleanUp.push(ref);
    });
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