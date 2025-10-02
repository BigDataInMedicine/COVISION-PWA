export class Database {
  private static instance: Database;
  private db: IDBDatabase | null = null;

  // Name of the IndexedDB database
  private readonly DB_NAME = "CovisionDB";

  // Current schema version - increase this when structure changes
  private readonly VERSION = 3;

  // Definition of all object stores (tables)
  private readonly TABLES: { [key: string]: { keyPath: string; autoIncrement: boolean } } = {
    tests: { keyPath: "id", autoIncrement: true },
    symptoms: { keyPath: "id", autoIncrement: true },
  };

  // Private constructor -> ensures singleton pattern
  private constructor() {}

  /**
   * Returns the singleton instance of the Database
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Opens the IndexedDB connection (if not already open).
   * Also runs `onupgradeneeded` if version has changed.
   */
  private async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      // Called when DB structure changes (new version, new stores)
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        for (const [table, options] of Object.entries(this.TABLES)) {
          if (!db.objectStoreNames.contains(table)) {
            db.createObjectStore(table, { keyPath: options.keyPath, autoIncrement: options.autoIncrement });
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns all records from a given table
   */
  public async getAll<T = any>(table: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readonly");
      const store = tx.objectStore(table);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns a single record by id
   */
  public async getById<T = any>(table: string, id: number | string): Promise<T | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readonly");
      const store = tx.objectStore(table);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Adds a new record into the given table
   */
  public async add<T = any>(table: string, data: T): Promise<IDBValidKey> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readwrite");
      const store = tx.objectStore(table);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Updates an existing record in the given table
   */
  public async update<T = any>(table: string, data: T): Promise<IDBValidKey> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readwrite");
      const store = tx.objectStore(table);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Deletes a record by id
   */
  public async delete(table: string, id: number | string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readwrite");
      const store = tx.objectStore(table);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clears all records from a table
   */
  public async clear(table: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readwrite");
      const store = tx.objectStore(table);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns the number of records in a table
   */
  public async count(table: string): Promise<number> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(table, "readonly");
      const store = tx.objectStore(table);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
