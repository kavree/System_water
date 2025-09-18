
import React, { useState, useEffect } from 'react';
import { House, ViewState } from './types';
import Dashboard from './components/Dashboard';
import HouseDetails from './components/HouseDetails';
import PWAStatus from './components/PWAStatus';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { supabase } from './services/supabaseClient';
import { pwaService } from './services/pwaService';

function App() {
  const [houses, setHouses] = useState<House[]>([]);
  const [view, setView] = useState<ViewState>({ page: 'dashboard' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Initialize PWA service
  useEffect(() => {
    const initializePWA = async () => {
      try {
        await pwaService.init();
        await pwaService.requestPersistentStorage();
        setIsInitialized(true);
      } catch (error) {
        console.error('PWA initialization failed:', error);
        setIsInitialized(true); // Continue without PWA features
      }
    };

    initializePWA();
  }, []);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        // Fetch houses and their related readings, ordered for consistency
        const { data, error } = await supabase
          .from('houses')
          .select('*, readings:meter_readings(*)')
          .order('created_at', { ascending: true })
          .order('date_recorded', { foreignTable: 'meter_readings', ascending: false });

        if (error) {
          // Check for a specific error related to configuration
          if (error.message.includes('Missing or invalid URL') || error.message.includes('failed to fetch')) {
             setError('ไม่สามารถเชื่อมต่อฐานข้อมูล Supabase ได้ กรุณาตรวจสอบการตั้งค่าใน services/supabaseClient.ts และการเชื่อมต่ออินเทอร์เน็ต');
          } else {
            throw error;
          }
        } else {
           setHouses(data || []);
           setError(null);
        }

      } catch (err: any) {
        console.error("Error fetching houses:", err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [refreshKey]); // Added refreshKey dependency

  const selectedHouse = view.page === 'details' ? houses.find(h => h.id === view.houseId) : undefined;

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-10 flex items-center justify-center gap-3 text-lg"><i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i><span>กำลังโหลดข้อมูล...</span></div>;
    }
    if (error) {
       return <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg shadow-md max-w-2xl mx-auto"><i className="fas fa-exclamation-triangle mr-3"></i>{error}</div>;
    }
    
    switch (view.page) {
      case 'details':
        return selectedHouse ? (
          <HouseDetails
            house={selectedHouse}
            setHouses={setHouses}
            onBack={() => setView({ page: 'dashboard' })}
          />
        ) : (
          <div className="text-center p-10">
            <div className="mb-6">
              <i className="fas fa-home text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">ไม่พบข้อมูลบ้านที่เลือก</p>
            </div>
            <button 
              onClick={() => setView({ page: 'dashboard' })} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 mx-auto group"
            >
              <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-2 transition-colors duration-200">
                <i className="fas fa-home text-lg"></i>
              </div>
              <span>กลับไปหน้าหลัก</span>
            </button>
          </div>
        );
      case 'dashboard':
      default:
        return <Dashboard houses={houses} setHouses={setHouses} setView={setView} onDataRefresh={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <Footer />
      {isInitialized && <PWAStatus />}
    </div>
  );
}

export default App;
