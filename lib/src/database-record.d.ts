import { StorageEntity } from './data-factory';
export declare class DatabaseRecord {
    databasekey: string;
    entity: StorageEntity<any>;
    constructor(entity: StorageEntity<any>);
}
export declare function toDB(entity: StorageEntity<any>): DatabaseRecord;
