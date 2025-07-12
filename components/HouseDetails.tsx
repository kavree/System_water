
import React, { useState } from 'react';
import { House, MeterReading } from '../types';
import HouseForm from './HouseForm';
import MeterReadingForm from './MeterReadingForm';
import Invoice from './Invoice';
import { supabase } from '../services/supabaseClient';

interface HouseDetailsProps {
  house: House;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  onBack: () => void;
}

const HouseDetails: React.FC<HouseDetailsProps> = ({ house, setHouses, onBack }) => {
  const [isEditingHouse, setIsEditingHouse] = useState(false);
  const [isAddingReading, setIsAddingReading] = useState(false);
  const [readingToPrint, setReadingToPrint] = useState<MeterReading | null>(null);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string | null }>({ isOpen: false, imageUrl: null });

  const handlePrint = (reading: MeterReading) => {
    setReadingToPrint(reading);
    setTimeout(() => {
      window.print();
      setReadingToPrint(null);
    }, 100);
  };
  
  const handleDeleteHouse = async () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบ้านเลขที่ ${house.house_number}? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      try {
        const { error } = await supabase.from('houses').delete().eq('id', house.id);
        if (error) throw error;
        
        setHouses(prev => prev.filter(h => h.id !== house.id));
        onBack();
      } catch (err) {
        console.error("Failed to delete house:", err);
        alert("เกิดข้อผิดพลาดในการลบบ้าน");
      }
    }
  };

  // Readings are pre-sorted from the main App fetch
  const sortedReadings = house.readings;

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 no-print">
        <i className="fas fa-arrow-left"></i>
        <span>กลับไปหน้าหลัก</span>
      </button>

      {isEditingHouse && (
        <HouseForm
          onClose={() => setIsEditingHouse(false)}
          setHouses={setHouses}
          existingHouse={house}
        />
      )}
      
      {isAddingReading && (
        <MeterReadingForm
          onClose={() => setIsAddingReading(false)}
          house={house}
          setHouses={setHouses}
        />
      )}

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{house.house_number}</h2>
            <p className="text-lg text-gray-600 mt-1">{house.owner_name}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button onClick={() => setIsEditingHouse(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"><i className="fas fa-edit"></i><span>แก้ไข</span></button>
            <button onClick={handleDeleteHouse} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"><i className="fas fa-trash"></i><span>ลบ</span></button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg no-print">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-700">ประวัติค่าน้ำ</h3>
          <button onClick={() => setIsAddingReading(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"><i className="fas fa-plus"></i><span>บันทึกค่าน้ำ</span></button>
        </div>

        <div className="overflow-x-auto">
          {sortedReadings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เดือน</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">เลขมิเตอร์ (ก่อน-ปัจจุบัน)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนหน่วย</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดชำระ (บาท)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReadings.map(reading => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reading.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{reading.previous_reading} - {reading.current_reading}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{reading.units_used}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 text-right">{reading.total_amount.toLocaleString()}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {reading.meter_image ? (
                           <button 
                             onClick={() => setImageModal({ isOpen: true, imageUrl: reading.meter_image })} 
                             className="text-blue-500 hover:underline"
                           >
                             ดูรูป
                           </button>
                        ) : 'ไม่มี'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button onClick={() => handlePrint(reading)} className="text-gray-500 hover:text-blue-600 transition-colors"><i className="fas fa-print"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">ยังไม่มีประวัติการบันทึกค่าน้ำ</p>
            </div>
          )}
        </div>
      </div>
      {readingToPrint && <Invoice house={house} reading={readingToPrint} />}
      
      {/* Image Modal */}
      {imageModal.isOpen && imageModal.imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">ภาพถ่ายมิเตอร์</h3>
              <button 
                onClick={() => setImageModal({ isOpen: false, imageUrl: null })} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img 
                src={imageModal.imageUrl} 
                alt="Meter Reading" 
                className="max-w-full h-auto"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseDetails;