import { Db, Server, MongoCallback, DbAddUserOptions, ReplSet, Mongos, Collection, Admin, DbCollectionOptions, ReadPreference, CollectionCreateOptions, IndexOptions, CommonOptions, CommandCursor } from 'mongodb';

export class DatabaseService implements Db {

    protected _instance: Db;

    constructor(private db: Promise<Db>)
    {
        this.db.then( db => this._instance = db ).catch(error=> console.log(error))
    }
    
    async ready(){
        await this.db.then( db => this._instance = db ).catch(error=> console.log(error))
    }

    get isReady(){
        return this._instance != null;
    }

    get serverConfig(): Server | ReplSet | Mongos{
        return  this._instance.serverConfig;
    }
    set serverConfig(value: Server | ReplSet | Mongos){
        this._instance.serverConfig = value;
    }
 
    get bufferMaxEntries(): number{
        return  this._instance.bufferMaxEntries;
    }
    set bufferMaxEntries(value: number){
        this._instance.bufferMaxEntries = value;
    }

    get databaseName(): string{
        return  this._instance.databaseName;
    }
    set databaseName(value: string){
        this._instance.databaseName = value;
    }

    get options(): any{
        return  this._instance.options;
    }
    set options(value: any){
        this._instance.options = value;
    }
    get native_parser(): boolean{
        return  this._instance.native_parser;
    }
    set native_parser(value: boolean){
        this._instance.native_parser = value;
    }
    get slaveOk(): boolean{
        return  this._instance.slaveOk;
    }
    set slaveOk(value: boolean){
        this._instance.slaveOk = value;
    }
    get writeConcern(): any{
        return  this._instance.writeConcern;
    }
    set writeConcern(value: any){
        this._instance.writeConcern = value;
    }

    rawListeners(event: string | symbol): Function[] {
       return this._instance.rawListeners(event);
    }

    addUser(username: string, password: string, callback: MongoCallback<any>): void;
    addUser(username: string, password: string, options?: DbAddUserOptions): Promise<any>;
    addUser(username: string, password: string, options: DbAddUserOptions, callback: MongoCallback<any>): void;
    addUser(username: any, password: any, options?: any, callback?: any) {
        return (this._instance.addUser as any).apply(this._instance, arguments)
    }
    admin(): Admin {
        return (this._instance.admin as any).apply(this._instance, arguments)
    }
    collection<TSchema = any>(name: string): Collection<TSchema>;
    collection<TSchema = any>(name: string, callback: MongoCallback<Collection<TSchema>>): Collection<TSchema>;
    collection<TSchema = any>(name: string, options: DbCollectionOptions, callback: MongoCallback<Collection<TSchema>>): Collection<TSchema>;
    collection(name: any, options?: any, callback?: any) {
        return (this._instance.collection as any).apply(this._instance, arguments)
    }
    collections(): Promise<Collection<any>[]>;
    collections(callback: MongoCallback<Collection<any>[]>): void;
    collections(callback?: any) {
        return (this._instance.collections as any).apply(this._instance, arguments)
    }
    command(command: Object, callback: MongoCallback<any>): void;
    command(command: Object, options?: { readPreference: string | ReadPreference; }): Promise<any>;
    command(command: Object, options: { readPreference: string | ReadPreference; }, callback: MongoCallback<any>): void;
    command(command: any, options?: any, callback?: any) {
        return (this._instance.command as any).apply(this._instance, arguments)
    }
    createCollection<TSchema = any>(name: string, callback: MongoCallback<Collection<TSchema>>): void;
    createCollection<TSchema = any>(name: string, options?: CollectionCreateOptions): Promise<Collection<TSchema>>;
    createCollection<TSchema = any>(name: string, options: CollectionCreateOptions, callback: MongoCallback<Collection<TSchema>>): void;
    createCollection(name: any, options?: any, callback?: any) {
        return (this._instance.createCollection as any).apply(this._instance, arguments)
    }
    createIndex(name: string, fieldOrSpec: string | Object, callback: MongoCallback<any>): void;
    createIndex(name: string, fieldOrSpec: string | Object, options?: IndexOptions): Promise<any>;
    createIndex(name: string, fieldOrSpec: string | Object, options: IndexOptions, callback: MongoCallback<any>): void;
    createIndex(name: any, fieldOrSpec: any, options?: any, callback?: any) {
        return (this._instance.createIndex as any).apply(this._instance, arguments)
    }
    dropCollection(name: string): Promise<boolean>;
    dropCollection(name: string, callback: MongoCallback<boolean>): void;
    dropCollection(name: any, callback?: any) {
        return (this._instance.dropCollection as any).apply(this._instance, arguments)
    }
    dropDatabase(): Promise<any>;
    dropDatabase(callback: MongoCallback<any>): void;
    dropDatabase(callback?: any) {
        return (this._instance.dropDatabase as any).apply(this._instance, arguments)
    }
    executeDbAdminCommand(command: Object, callback: MongoCallback<any>): void;
    executeDbAdminCommand(command: Object, options?: { readPreference?: string | ReadPreference; maxTimeMS?: number; }): Promise<any>;
    executeDbAdminCommand(command: Object, options: { readPreference?: string | ReadPreference; maxTimeMS?: number; }, callback: MongoCallback<any>): void;
    executeDbAdminCommand(command: any, options?: any, callback?: any) {
        return (this._instance.executeDbAdminCommand as any).apply(this._instance, arguments)
    }
    indexInformation(name: string, callback: MongoCallback<any>): void;
    indexInformation(name: string, options?: { full?: boolean; readPreference?: string | ReadPreference; }): Promise<any>;
    indexInformation(name: string, options: { full?: boolean; readPreference?: string | ReadPreference; }, callback: MongoCallback<any>): void;
    indexInformation(name: any, options?: any, callback?: any) {
        return (this._instance.indexInformation as any).apply(this._instance, arguments)
    }
    listCollections(filter?: Object, options?: { batchSize?: number; readPreference?: string | ReadPreference; }): CommandCursor {
        return (this._instance.listCollections as any).apply(this._instance, arguments)
    }

    removeUser(username: string, callback: MongoCallback<any>): void;
    removeUser(username: string, options?: CommonOptions): Promise<any>;
    removeUser(username: string, options: CommonOptions, callback: MongoCallback<any>): void;
    removeUser(username: any, options?: any, callback?: any) {
        return (this._instance.removeUser as any).apply(this._instance, arguments)
    }
    renameCollection<TSchema = any>(fromCollection: string, toCollection: string, callback: MongoCallback<Collection<TSchema>>): void;
    renameCollection<TSchema = any>(fromCollection: string, toCollection: string, options?: { dropTarget?: boolean; }): Promise<Collection<TSchema>>;
    renameCollection<TSchema = any>(fromCollection: string, toCollection: string, options: { dropTarget?: boolean; }, callback: MongoCallback<Collection<TSchema>>): void;
    renameCollection(fromCollection: any, toCollection: any, options?: any, callback?: any) {
        return (this._instance.renameCollection as any).apply(this._instance, arguments)
    }
    stats(callback: MongoCallback<any>): void;
    stats(options?: { scale?: number; }): Promise<any>;
    stats(options: { scale?: number; }, callback: MongoCallback<any>): void;
    stats(options?: any, callback?: any) {
        return (this._instance.stats as any).apply(this._instance, arguments)
    }
    profilingInfo(callback: MongoCallback<any>): void;
    profilingInfo(options?: { session?: any; }): Promise<void>;
    profilingInfo(options: { session?: any; }, callback: MongoCallback<void>): void;
    profilingInfo(options?: any, callback?: any) {
        return (this._instance.profilingInfo as any).apply(this._instance, arguments)
    }
    profilingLevel(callback: MongoCallback<any>): void;
    profilingLevel(options?: { session?: any; }): Promise<void>;
    profilingLevel(options: { session?: any; }, callback: MongoCallback<void>): void;
    profilingLevel(level: string, callback: MongoCallback<any>): void;
    profilingLevel(level: string, options?: { session?: any; }): Promise<void>;
    profilingLevel(level: string, options: { session?: any; }, callback: MongoCallback<void>): void;
    profilingLevel(level?: any, options?: any, callback?: any) {
        return (this._instance.profilingLevel as any).apply(this._instance, arguments)
    }
    addListener(event: string | symbol, listener: Function): this {
        return (this._instance.addListener as any).apply(this._instance, arguments)
    }
    on(event: string | symbol, listener: Function): this {
        return (this._instance.on as any).apply(this._instance, arguments)
    }
    once(event: string | symbol, listener: Function): this {
        return (this._instance.once as any).apply(this._instance, arguments)
    }
    prependListener(event: string | symbol, listener: Function): this {
        return (this._instance.prependListener as any).apply(this._instance, arguments)
    }
    prependOnceListener(event: string | symbol, listener: Function): this {
        return (this._instance.prependOnceListener as any).apply(this._instance, arguments)
    }
    removeListener(event: string | symbol, listener: Function): this {
        return (this._instance.removeListener as any).apply(this._instance, arguments)
    }
    removeAllListeners(event?: string | symbol): this {
        return (this._instance.removeAllListeners as any).apply(this._instance, arguments)
    }
    setMaxListeners(n: number): this {
        return (this._instance.setMaxListeners as any).apply(this._instance, arguments)
    }
    getMaxListeners(): number {
        return (this._instance.getMaxListeners as any).apply(this._instance, arguments)
    }
    listeners(event: string | symbol): Function[] {
        return (this._instance.listeners as any).apply(this._instance, arguments)
    }
    emit(event: string | symbol, ...args: any[]): boolean {
        return (this._instance.emit as any).apply(this._instance, arguments)
    }
    eventNames(): (string | symbol)[] {
        return (this._instance.eventNames as any).apply(this._instance, arguments)
    }
    listenerCount(type: string | symbol): number {
        return (this._instance.listenerCount as any).apply(this._instance, arguments)
    }
}







