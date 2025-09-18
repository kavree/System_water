import React, { useState, useMemo, useEffect } from 'react';
import { House, MeterReading } from '../types';
import { getCurrentWaterUnitRate } from '../services/waterUnitService';
import { supabase } from '../services/supabaseClient';
import { pwaService } from '../services/pwaService';

interface MeterReadingFormProps {
  onClose: () => void;
  house: House;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  existingReading?: MeterReading;
}

const MeterReadingForm: React.FC<MeterReadingFormProps> = ({ onClose, house, setHouses, existingReading }) => {
  const isEdit = !!existingReading;
  const [currentWaterRate, setCurrentWaterRate] = useState<number>(5);

  const latestReading = useMemo(() => {
    if (house.readings.length === 0) return null;
    // Readings are pre-sorted, first is the latest
    return house.readings[0];
  }, [house.readings]);

  const [monthYear, setMonthYear] = useState(existingReading ? existingReading.month_key : new Date().toISOString().slice(0, 7));
  const [previousReading, setPreviousReading] = useState<number | ''>(existingReading ? existingReading.previous_reading : (latestReading?.current_reading || 0));
  const [currentReading, setCurrentReading] = useState<number | ''>(existingReading ? existingReading.current_reading : '');
  const [meterImage, setMeterImage] = useState<string | null>(existingReading?.meter_image || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Fetch current water rate when component mounts (for new readings)
  useEffect(() => {
    const fetchWaterRate = async () => {
      if (!isEdit) { // Only fetch for new readings
        try {
          const rate = await getCurrentWaterUnitRate();
          setCurrentWaterRate(rate);
        } catch (err) {
          console.error('Failed to fetch current water rate:', err);
          setCurrentWaterRate(5); // fallback to default
        }
      } else {
        // For editing, use the rate from existing reading
        setCurrentWaterRate(existingReading?.rate_per_unit || 5);
      }
    };

    fetchWaterRate();
  }, [isEdit, existingReading]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMeterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (currentReading === '' || previousReading === '') {
      setError('กรุณากรอกเลขมิเตอร์ให้ครบถ้วน');
      setLoading(false);
      return;
    }

    if ((currentReading as number) < (previousReading as number)) {
      setError('เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่าเดือนก่อนหน้า');
      setLoading(false);
      return;
    }

    const [year, month] = monthYear.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('th-TH', { month: 'long', year: 'numeric' });
    const monthKey = `${year}-${month}`;

    const unitsUsed = (currentReading as number) - (previousReading as number);
    // Use the rate stored in existing reading for edits, or current rate for new readings
    const rateToUse = existingReading ? (existingReading.rate_per_unit || 5) : currentWaterRate;
    const totalAmount = unitsUsed * rateToUse;

    try {
      if (existingReading) {
        // Update existing reading
        const updatePayload = {
          month_key: monthKey,
          month: monthName,
          previous_reading: previousReading as number,
          current_reading: currentReading as number,
          units_used: unitsUsed,
          rate_per_unit: existingReading.rate_per_unit || 5, // Keep original rate for existing readings
          total_amount: totalAmount,
          meter_image: meterImage
        };

        if (navigator.onLine) {
          const { data: updatedReading, error: updateError } = await supabase
            .from('meter_readings')
            .update(updatePayload)
            .eq('id', existingReading.id)
            .select()
            .single();

          if (updateError) throw updateError;

          // Update local state for immediate UI feedback
          setHouses(prev =>
            prev.map(h => {
              if (h.id === house.id) {
                const updatedReadings = h.readings
                  .map(r => (r.id === updatedReading.id ? updatedReading : r))
                  .sort((a, b) => new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime());
                return { ...h, readings: updatedReadings };
              }
              return h;
            })
          );
        } else {
          // Save for offline sync
          await pwaService.saveOfflineData('meter_reading', {
            action: 'update',
            id: existingReading.id,
            data: updatePayload
          });
          
          setError('บันทึกข้อมูลออฟไลน์แล้ว จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต');
        }

        onClose();
      } else {
        // Insert new reading
        const newReadingForDb = {
          house_id: house.id,
          month_key: monthKey,
          month: monthName,
          previous_reading: previousReading as number,
          current_reading: currentReading as number,
          units_used: unitsUsed,
          rate_per_unit: currentWaterRate, // Use current rate for new readings
          total_amount: totalAmount,
          date_recorded: new Date().toISOString(),
          meter_image: meterImage
        };

        if (navigator.onLine) {
          const { data: insertedReading, error: insertError } = await supabase
            .from('meter_readings')
            .insert(newReadingForDb)
            .select()
            .single();

          if (insertError) throw insertError;

          // Update local state for immediate UI feedback
          setHouses(prev =>
            prev.map(h => {
              if (h.id === house.id) {
                const updatedReadings = [...h.readings, insertedReading].sort(
                  (a, b) => new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime()
                );
                return { ...h, readings: updatedReadings };
              }
              return h;
            })
          );
        } else {
          // Save for offline sync
          await pwaService.saveOfflineData('meter_reading', {
            action: 'insert',
            data: newReadingForDb
          });
          
          // Create temporary reading for UI
          const tempReading = {
            ...newReadingForDb,
            id: `temp_${Date.now()}`,
            created_at: new Date().toISOString()
          } as MeterReading;
          
          setHouses(prev =>
            prev.map(h => {
              if (h.id === house.id) {
                const updatedReadings = [...h.readings, tempReading].sort(
                  (a, b) => new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime()
                );
                return { ...h, readings: updatedReadings };
              }
              return h;
            })
          );
          
          setError('บันทึกข้อมูลออฟไลน์แล้ว จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต');
        }

        onClose();
      }
    } catch (err: any) {
      console.error("Error saving meter reading:", err);
      if (err.code === '23505') {
        setError(`ข้อมูลของเดือน ${monthName} มีอยู่ในระบบแล้ว`);
      } else {
        setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-2">{isEdit ? 'แก้ไขค่าน้ำ' : 'บันทึกค่าน้ำ'}</h2>
        <p className="text-gray-600 mb-2">บ้านเลขที่ {house.house_number}</p>
        
        {!navigator.onLine && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-700">
              <i className="fas fa-wifi-slash"></i>
              <span className="text-sm font-medium">โหมดออฟไลน์</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              ข้อมูลจะถูกบันทึกและซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ตแล้ว
            </p>
          </div>
        )}
        
        <p className="text-sm text-blue-600 mb-4">
          อัตราค่าน้ำ: {isEdit ? (existingReading.rate_per_unit || 5) : currentWaterRate} บาท/หน่วย
          {isEdit && ' (อัตราเดิม - ไม่สามารถแก้ไขได้)'}
          {!isEdit && ' (อัตราปัจจุบัน)'}
        </p>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">สำหรับเดือน</label>
            <input
              type="month"
              id="month"
              value={monthYear}
              onChange={e => setMonthYear(e.target.value)}
              className="mt-1 block w-full bg-white border border-[#cccccc] text-black text-base p-[10px] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-[#666666]"
               disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="previousReading" className="block text-sm font-medium text-gray-700">เลขมิเตอร์เดือนก่อน</label>
            <input
              type="number"
              id="previousReading"
              value={previousReading}
              onChange={e => setPreviousReading(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full bg-white border border-[#cccccc] text-black text-base p-[10px] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-[#666666]"
              placeholder="กรอกเลขมิเตอร์เดือนก่อน"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="currentReading" className="block text-sm font-medium text-gray-700">เลขมิเตอร์เดือนนี้</label>
            <input
              type="number"
              id="currentReading"
              value={currentReading}
              onChange={e => setCurrentReading(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full bg-white border border-[#cccccc] text-black text-base p-[10px] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-[#666666]"
              placeholder="กรอกเลขมิเตอร์ล่าสุด"
              min={previousReading || 0}
               disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="meterImage" className="block text-sm font-medium text-gray-700">
                รูปถ่ายเลขมิเตอร์ (ถ้ามี)
            </label>
            <input
                type="file"
                id="meterImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-sm md:text-base text-gray-700 file:bg-[#4da6ff] file:text-white file:text-sm md:file:text-base file:font-semibold file:px-3 md:file:px-[20px] file:py-2 md:file:py-[10px] file:rounded-lg file:border-0 file:mr-2 md:file:mr-4 hover:file:bg-blue-600 cursor-pointer disabled:opacity-50"
                 disabled={loading}
            />
            {meterImage && <img src={meterImage} alt="Meter Preview" className="mt-4 rounded-md max-h-32 md:max-h-40 w-full object-cover" />}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-sm md:text-base px-4 md:px-[20px] py-2 md:py-[10px] rounded-lg bg-[#dddddd] text-black hover:bg-gray-400 disabled:opacity-50 order-2 sm:order-1" disabled={loading}>
              ยกเลิก
            </button>
            <button type="submit" className="text-sm md:text-base px-4 md:px-[20px] py-2 md:py-[10px] rounded-lg bg-[#28a745] text-white hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2" disabled={loading}>
               {loading && <i className="fas fa-spinner fa-spin"></i>}
              {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeterReadingForm;