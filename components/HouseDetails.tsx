
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
  const [readingToEdit, setReadingToEdit] = useState<MeterReading | null>(null);

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

  const handleDeleteReading = async (reading: MeterReading) => {
    if (window.confirm(`ต้องการลบประวัติค่าน้ำเดือน ${reading.month} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      try {
        const { error } = await supabase
          .from('meter_readings')
          .delete()
          .eq('id', reading.id);
        if (error) throw error;

        // Update local state
        setHouses(prev =>
          prev.map(h => {
            if (h.id === house.id) {
              return { ...h, readings: h.readings.filter(r => r.id !== reading.id) };
            }
            return h;
          })
        );
      } catch (err) {
        console.error('Failed to delete reading:', err);
        alert('เกิดข้อผิดพลาดในการลบรายการค่าน้ำ');
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
          onClose={() => { setIsAddingReading(false); setReadingToEdit(null); }}
          house={house}
          setHouses={setHouses}
          existingReading={readingToEdit ?? undefined}
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

      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700">ประวัติค่าน้ำ</h3>
          <button onClick={() => { setReadingToEdit(null); setIsAddingReading(true); }} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"><i className="fas fa-plus"></i><span>บันทึกค่าน้ำ</span></button>
        </div>

        {sortedReadings.length > 0 ? (
          <div className="space-y-4">
            {sortedReadings.map(reading => (
              <div key={reading.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Header with month and actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">{reading.month}</h4>
                    <p className="text-sm text-gray-500">ยอดชำระ: <span className="font-semibold text-blue-600">{reading.total_amount.toLocaleString()} บาท</span></p>
                  </div>
                  <div className="flex gap-2">
                    {reading.meter_image && (
                      <button
                        onClick={() => setImageModal({ isOpen: true, imageUrl: reading.meter_image })}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="ดูรูป"
                      >
                        <i className="fas fa-image"></i>
                      </button>
                    )}
                    <button
                      onClick={() => { setReadingToEdit(reading); setIsAddingReading(true); }}
                      className="text-yellow-600 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-50 transition-colors"
                      title="แก้ไข"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteReading(reading)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="ลบ"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button
                      onClick={() => handlePrint(reading)}
                      className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
                      title="พิมพ์"
                    >
                      <i className="fas fa-print"></i>
                    </button>
                  </div>
                </div>

                {/* Meter readings grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">เลขมิเตอร์</p>
                    <div className="space-y-1">
                      <p><span className="text-gray-500">ก่อน:</span> <span className="font-medium">{reading.previous_reading}</span></p>
                      <p><span className="text-gray-500">ปัจจุบัน:</span> <span className="font-medium">{reading.current_reading}</span></p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">จำนวนหน่วย</p>
                    <p className="text-lg font-semibold text-green-600">{reading.units_used} หน่วย</p>
                  </div>
                </div>

                {/* Image indicator for mobile */}
                {reading.meter_image && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-image"></i>
                      มีรูปภาพมิเตอร์
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <i className="fas fa-water text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">ยังไม่มีประวัติการบันทึกค่าน้ำ</p>
          </div>
        )}
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