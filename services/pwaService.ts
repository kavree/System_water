// PWA Service for handling offline functionality and app installation

interface OfflineData {
  id: string;
  type: 'meter_reading' | 'house' | 'water_rate';
  data: any;
  timestamp: number;
  synced: boolean;
}

class PWAService {
  private dbName = 'WaterManagementDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'id' });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  // Save data for offline sync
  async saveOfflineData(type: OfflineData['type'], data: any): Promise<string> {
    if (!this.db) await this.init();
    
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced offline data
  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allData: OfflineData[] = request.result;
        const unsyncedData = allData.filter(item => !item.synced);
        resolve(unsyncedData);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mark data as synced
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Cache data for offline use
  async cacheData(type: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const cachedItem = {
      id: type,
      type,
      data,
      lastUpdated: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put(cachedItem);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(type: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(type);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Check if user is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Register for background sync
  async registerBackgroundSync(tag: string = 'background-sync'): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Type assertion for sync registration which may not be fully supported in all TypeScript versions
        await (registration as any).sync.register(tag);
        console.log('Background sync registered');
      } catch (error) {
        console.log('Background sync registration failed:', error);
      }
    }
  }

  // Show install prompt
  static async showInstallPrompt(): Promise<boolean> {
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      return true; // Will be handled by beforeinstallprompt event
    }
    return false;
  }

  // Check if app is running in standalone mode (installed as PWA)
  static isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  // Request persistent storage
  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const result = await navigator.storage.persist();
        console.log('Persistent storage:', result);
        return result;
      } catch (error) {
        console.log('Persistent storage request failed:', error);
        return false;
      }
    }
    return false;
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch (error) {
        console.log('Storage estimate failed:', error);
        return null;
      }
    }
    return null;
  }
}

export const pwaService = new PWAService();
export default PWAService;