import React, { useState, useEffect } from 'react';
import { pwaService } from '../services/pwaService';

interface PWAStatusProps {
  className?: string;
}

const PWAStatus: React.FC<PWAStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [offlineDataCount, setOfflineDataCount] = useState(0);

  useEffect(() => {
    // Initialize PWA service
    pwaService.init().catch(console.error);

    // Check if running as PWA
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true
    );

    // Online/offline status handlers
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setHasUpdates(true);
      });
    }

    // Check offline data count
    checkOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    try {
      const unsyncedData = await pwaService.getUnsyncedData();
      setOfflineDataCount(unsyncedData.length);
      
      if (unsyncedData.length > 0) {
        // Trigger background sync
        await pwaService.registerBackgroundSync();
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const checkOfflineData = async () => {
    try {
      const unsyncedData = await pwaService.getUnsyncedData();
      setOfflineDataCount(unsyncedData.length);
    } catch (error) {
      console.error('Failed to check offline data:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSync = () => {
    if (isOnline) {
      syncOfflineData();
    }
  };

  if (!isOnline) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-amber-500 text-white p-3 rounded-lg shadow-lg z-50 ${className}`}>
        <div className="flex items-center gap-2">
          <i className="fas fa-wifi-slash"></i>
          <span className="flex-1 text-sm font-medium">ออฟไลน์</span>
          {offlineDataCount > 0 && (
            <span className="bg-amber-600 text-xs px-2 py-1 rounded-full">
              {offlineDataCount} รายการรอซิงค์
            </span>
          )}
        </div>
        <p className="text-xs mt-1 opacity-90">
          ข้อมูลจะถูกบันทึกและซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ตแล้ว
        </p>
      </div>
    );
  }

  if (hasUpdates) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fas fa-sync-alt"></i>
            <span className="text-sm font-medium">มีการอัปเดตใหม่</span>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 rounded transition-colors"
          >
            รีเฟรช
          </button>
        </div>
      </div>
    );
  }

  if (offlineDataCount > 0 && isOnline) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-500 text-white p-3 rounded-lg shadow-lg z-50 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fas fa-cloud-upload-alt"></i>
            <span className="text-sm font-medium">
              กำลังซิงค์ข้อมูล ({offlineDataCount})
            </span>
          </div>
          <button
            onClick={handleSync}
            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded transition-colors"
          >
            ซิงค์
          </button>
        </div>
      </div>
    );
  }

  // Show PWA status indicator in standalone mode
  if (isStandalone) {
    return (
      <div className={`fixed top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs z-40 ${className}`}>
        <i className="fas fa-mobile-alt mr-1"></i>
        PWA
      </div>
    );
  }

  return null;
};

export default PWAStatus;