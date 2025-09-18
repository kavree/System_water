const CACHE_NAME = 'water-management-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/src/assets/logo-water.svg',
  '/src/assets/favicon-16x16.svg',
  '/src/assets/favicon-32x32.svg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // If network fails and no cache, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Handle offline data sync here
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Sync each item
      for (const item of offlineData) {
        try {
          await syncDataItem(item);
          // Remove from offline storage after successful sync
          await removeOfflineData(item.id);
        } catch (error) {
          console.log('Failed to sync item:', item.id, error);
        }
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Placeholder functions for offline data management
async function getOfflineData() {
  // Implementation for getting offline data from IndexedDB
  return [];
}

async function syncDataItem(item) {
  // Implementation for syncing individual data items
  console.log('Syncing item:', item);
}

async function removeOfflineData(itemId) {
  // Implementation for removing synced data from offline storage
  console.log('Removing offline data:', itemId);
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'มีการอัปเดตข้อมูลใหม่',
    icon: '/src/assets/logo-water.svg',
    badge: '/src/assets/favicon-32x32.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'ดูรายละเอียด',
        icon: '/src/assets/logo-water.svg'
      },
      {
        action: 'close',
        title: 'ปิด'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ระบบจัดการค่าน้ำประปา', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});