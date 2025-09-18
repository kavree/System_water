
import React, { useMemo } from 'react';
import { House } from '../types';

interface HouseCardProps {
  house: House;
  onSelect: () => void;
}

const HouseCard: React.FC<HouseCardProps> = ({ house, onSelect }) => {
  const latestReading = useMemo(() => {
    if (house.readings.length === 0) {
      return null;
    }
    // Readings are pre-sorted from App.tsx fetch, so the first one is the latest
    return house.readings[0];
  }, [house.readings]);

  return (
    <div 
      onClick={onSelect} 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer p-5 flex flex-col justify-between border-l-4 border-blue-500"
    >
      <div>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex items-center justify-center">
                  <i className="fas fa-home"></i>
              </div>
              <div>
                  <p className="font-bold text-lg text-gray-800">{house.house_number}</p>
                  <p className="text-sm text-gray-500">{house.owner_name}</p>
              </div>
            </div>
        </div>
        
        <div className="mt-4 border-t pt-4">
          {latestReading ? (
            <div>
              <p className="text-sm text-gray-500">ค่าน้ำเดือนล่าสุด ({latestReading.month})</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{latestReading.total_amount.toLocaleString()} บาท</p>
              <p className="text-sm text-gray-600 mt-1">จำนวน {latestReading.units_used} หน่วย (หน่วยละ {latestReading.rate_per_unit || 5} บาท)</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">ยังไม่มีข้อมูลค่าน้ำ</p>
            </div>
          )}
        </div>
      </div>
       <div className="mt-4 text-right text-sm text-blue-500 hover:text-blue-700">
        ดูรายละเอียด <i className="fas fa-arrow-right ml-1"></i>
      </div>
    </div>
  );
};

export default HouseCard;