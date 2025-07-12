
import React, { useState, useEffect } from 'react';
import { House, ViewState } from './types';
import Dashboard from './components/Dashboard';
import HouseDetails from './components/HouseDetails';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { supabase } from './services/supabaseClient';

function App() {
  const [houses, setHouses] = useState<House[]>([]);
  const [view, setView] = useState<ViewState>({ page: 'dashboard' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
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
        }

      } catch (err: any) {
        console.error("Error fetching houses:", err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []); // Changed dependency to empty array to run only once on mount

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
            <p>ไม่พบข้อมูลบ้านที่เลือก</p>
            <button onClick={() => setView({ page: 'dashboard' })} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              กลับไปหน้าหลัก
            </button>
          </div>
        );
      case 'dashboard':
      default:
        return <Dashboard houses={houses} setHouses={setHouses} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
