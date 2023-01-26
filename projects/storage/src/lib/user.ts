import { StorageEntity } from "./data-factory";

export class User extends StorageEntity<User> {
    
    name? : string;
    deviceKeys? : string[];
    coreData? : boolean;
    theme? : string;
    otherPreferences? : string;

    devices? : any[];
    
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