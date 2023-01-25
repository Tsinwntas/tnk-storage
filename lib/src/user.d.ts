import { StorageEntity } from "./data-factory";
export declare class User extends StorageEntity<User> {
    name?: string;
    deviceKeys?: string[];
    coreData?: boolean;
    theme?: string;
    otherPreferences?: string;
    devices?: any[];
    constructor(user?: User);
    getCleanModel(user?: User): User;
    getTableNameForClass(): string;
}
