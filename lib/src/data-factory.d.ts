export declare class DataFactory<T> {
    instance: StorageEntity<T>;
    keys: string[];
    constructor(instance: StorageEntity<T>, keys: string[]);
    get(): Promise<T[]>;
}
export declare abstract class StorageEntity<T> {
    databaseKey: string;
    owner?: string;
    lastSync?: Date;
    isMock?: boolean;
    instance?: boolean;
    dummy?: boolean;
    constructor(toClone?: T);
    abstract getCleanModel(entity?: T): StorageEntity<T>;
    abstract getTableNameForClass(): string;
    getTableName(): string;
    instantiate(toInstantiate?: T): StorageEntity<T>;
    mock(toMock?: T): StorageEntity<T>;
    saveEntity(): StorageEntity<T>;
    private isStorageEntityArray;
    isEntitiesSynced(keys: string[], entities?: StorageEntity<any>[]): boolean;
    deepClone(entity: T): T;
    getItems<K>(dirty: StorageEntity<K>, references: string[], items?: K[]): Promise<K[]>;
}
export declare class EmptyEntity extends StorageEntity<EmptyEntity> {
    getTableNameForClass(): string;
    getCleanModel(): EmptyEntity;
    deepClone(o: EmptyEntity): EmptyEntity;
    saveEntity(): EmptyEntity;
}
export declare function fixList<T>(object: StorageEntity<T>, list: T[]): T[];
