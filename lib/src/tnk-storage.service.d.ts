import { User } from './user';
import { StorageEntity } from './data-factory';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
export declare class TnkStorage {
    private dbService;
    _user: User;
    static DB: TnkStorage;
    constructor(dbService: NgxIndexedDBService);
    getUser(): Promise<User>;
    updateUser(user: User): void;
    isOwner(owner?: string): Promise<boolean>;
    create(entity: StorageEntity<any>): void;
    createBatch(table: string, entities: StorageEntity<any>[]): Observable<any>;
    getByEntity<T>(entity: StorageEntity<any>): Promise<T>;
    getFiltered(table: string, condition: any, returnKeys?: boolean): Promise<any[]>;
    getAll(table: string, returnKeys?: boolean): Promise<StorageEntity<any>[]>;
    get<T>(table: string, databaseKey: string): PromiseLike<T>;
    set(entity: StorageEntity<any>): Promise<any>;
    delete(entity: StorageEntity<any>): void;
    deleteKeys(table: string, keys: string[]): Promise<any>;
    deleteAll(tables: string[]): void;
}
