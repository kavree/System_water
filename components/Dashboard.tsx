import React, { useState, useMemo, useEffect } from 'react';
import { House, ViewState } from '../types';
import HouseCard from './HouseCard';
import HouseForm from './HouseForm';
import WaterUnitForm from './WaterUnitForm';
import Notification from './Notification';
import { generateSampleData } from '../services/geminiService';
import { getCurrentWaterUnitRate } from '../services/waterUnitService';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  houses: House[];
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
  onDataRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ houses, setHouses, setView, onDataRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingHouse, setIsAddingHouse] = useState(false);
  const [isEditingWaterUnit, setIsEditingWaterUnit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWaterRate, setCurrentWaterRate] = useState<number>(5);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch current water rate when component mounts
  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        const rate = await getCurrentWaterUnitRate();
        setCurrentWaterRate(rate);
      } catch (err) {
        console.error('Failed to fetch current water rate:', err);
      }
    };

    fetchCurrentRate();
  }, []);

  const handleRateUpdated = async () => {
    try {
      // Refresh the current rate
      const newRate = await getCurrentWaterUnitRate();
      setCurrentWaterRate(newRate);
      
      // Show success notification
      setNotification({
        message: `อัปเดตอัตราค่าน้ำเป็น ${newRate} บาท/หน่วย เรียบร้อยแล้ว`,
        type: 'success'
      });
      
      // Trigger data refresh from parent component
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (err) {
      console.error('Failed to refresh data after rate update:', err);
      setNotification({
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
        type: 'error'
      });
    }
  };

  const filteredHouses = useMemo(() => {
    if (!searchQuery) return houses;
    return houses.filter(house =>
      house.house_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [houses, searchQuery]);
  
  const handleGenerateSampleData = async () => {
    setIsGenerating(true);
    try {
      const sampleHouses = await generateSampleData();
      
      // Insert new data into Supabase
      for (const sample of sampleHouses) {
        const { readings, ...houseDetails } = sample;
        // Insert house
        const { data: newHouse, error: houseError } = await supabase
          .from('houses')
          .insert({
            house_number: houseDetails.house_number,
            owner_name: houseDetails.owner_name
          })
          .select()
          .single();

        if (houseError) throw houseError;

        // Insert readings for the new house
        if (readings && readings.length > 0) {
            const readingsToInsert = readings.map(r => {
                const { id, house_id, ...readingData } = r; // Safely remove id/house_id from sample
                return {
                    ...readingData,
                    house_id: newHouse.id,
                };
            });
            const { error: readingError } = await supabase
                .from('meter_readings')
                .insert(readingsToInsert);
            
            if (readingError) throw readingError;
        }
      }
      
      // Refetch all data to update the UI with the newly added samples
      const { data: updatedHouses, error: fetchError } = await supabase
        .from('houses')
        .select('*, readings:meter_readings(*)')
        .order('created_at', { ascending: true })
        .order('date_recorded', { foreignTable: 'meter_readings', ascending: false });

      if (fetchError) throw fetchError;
      
      setHouses(updatedHouses || []);
      
    } catch(error) {
        console.error("Failed to generate and save sample data:", error);
        alert("ไม่สามารถสร้างข้อมูลตัวอย่างได้ กรุณาตรวจสอบ Console Log");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-700">ภาพรวมทั้งหมด</h2>
          <p className="text-sm text-blue-600 mt-1">อัตราค่าน้ำปัจจุบัน: {currentWaterRate} บาท/หน่วย</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
           <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="ค้นหาบ้านเลขที่/เจ้าของ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button
            onClick={() => setIsEditingWaterUnit(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-edit"></i>
            <span>แก้ไขหน่วยน้ำ</span>
          </button>
          <button
            onClick={() => setIsAddingHouse(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>เพิ่มบ้าน</span>
          </button>
        </div>
      </div>
      
      {isAddingHouse && (
        <HouseForm
          onClose={() => setIsAddingHouse(false)}
          setHouses={setHouses}
        />
      )}

      {isEditingWaterUnit && (
        <WaterUnitForm
          onClose={() => setIsEditingWaterUnit(false)}
          onRateUpdated={handleRateUpdated}
        />
      )}

      {filteredHouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHouses.map(house => (
            <HouseCard key={house.id} house={house} onSelect={() => setView({ page: 'details', houseId: house.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
          <i className="fas fa-home text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700">ยังไม่มีข้อมูลบ้าน</h3>
          <p className="text-gray-500 mt-2 mb-6">เริ่มต้นโดยการเพิ่มบ้านหลังแรก หรือสร้างข้อมูลตัวอย่างเพื่อทดสอบระบบ</p>
          <button
            onClick={handleGenerateSampleData}
            disabled={isGenerating}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 flex items-center justify-center gap-2 mx-auto"
          >
            {isGenerating ? <><i className="fas fa-spinner fa-spin"></i><span>กำลังสร้าง...</span></> : <><i className="fas fa-magic"></i><span>สร้างข้อมูลตัวอย่าง</span></>}
          </button>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
