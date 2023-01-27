import { StorageEntity } from "./data-factory";

export class User extends StorageEntity<User> {
    
    name? : string;
    deviceKeys? : string[];
    coreData? : boolean;
    theme? : string;
    otherPreferences? : string;

    devices? : any[];
    
    /**
     * Object used for user preferences.
     *
     * In the future I will implement a way to sync between devices.
     * No, I don't think I will ever implement cloud storage or login for user because that requires money.
     * 
     * @param user User retrieved from DB to clone
     */
    constructor(user? : User){
        super(user);
        if(!user || !user.name)
            this.name = "USER_"+this.databaseKey;

    }
    
    getCleanModel(user? : User): User {
        return new User(user);
    }

    getTableNameForClass(): string {
        return "user";
    }
}