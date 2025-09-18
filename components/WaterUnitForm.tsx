import React, { useState, useEffect } from 'react';
import { getCurrentWaterUnitRate, updateWaterUnitRate, getWaterUnitRateHistory } from '../services/waterUnitService';
import { WaterUnitRate } from '../types';

interface WaterUnitFormProps {
  onClose: () => void;
  onRateUpdated?: () => void;
}

const WaterUnitForm: React.FC<WaterUnitFormProps> = ({ onClose, onRateUpdated }) => {
  const [currentRate, setCurrentRate] = useState<number>(5);
  const [newRate, setNewRate] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [rateHistory, setRateHistory] = useState<WaterUnitRate[]>([]);

  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        const rate = await getCurrentWaterUnitRate();
        setCurrentRate(rate);
        setNewRate(rate);
      } catch (err) {
        console.error('Failed to fetch current rate:', err);
      }
    };

    fetchCurrentRate();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await getWaterUnitRateHistory();
      setRateHistory(history);
    } catch (err) {
      console.error('Failed to fetch rate history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newRate === '' || newRate <= 0) {
      setError('กรุณากรอกอัตราค่าน้ำที่ถูกต้อง (มากกว่า 0)');
      setLoading(false);
      return;
    }

    if (newRate === currentRate) {
      setError('อัตราค่าน้ำใหม่ต้องแตกต่างจากอัตราปัจจุบัน');
      setLoading(false);
      return;
    }

    try {
      await updateWaterUnitRate(newRate as number);
      
      setSuccess(`อัปเดตอัตราค่าน้ำเป็น ${newRate} บาท/หน่วย เรียบร้อยแล้ว`);
      
      if (onRateUpdated) {
        onRateUpdated();
      }
      
      // Close after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update water unit rate:', err);
      setError('เกิดข้อผิดพลาดในการอัปเดตอัตราค่าน้ำ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    if (!showHistory) {
      await fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">แก้ไขหน่วยน้ำ</h2>
        <p className="text-gray-600 mb-4">อัตราค่าน้ำปัจจุบัน: <span className="font-semibold text-blue-600">{currentRate} บาท/หน่วย</span></p>

        {success && (
          <div className="text-green-500 mb-4 bg-green-100 p-3 rounded-md text-sm">
            <i className="fas fa-check-circle mr-2"></i>
            {success}
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>คำเตือน:</strong> การเปลี่ยนแปลงอัตราค่าน้ำจะมีผลกับข้อมูลที่บันทึกใหม่เท่านั้น 
                ข้อมูลเก่าจะยังคงใช้อัตราเดิม
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newRate" className="block text-sm font-medium text-gray-700 mb-2">
              อัตราค่าน้ำใหม่ (บาท/หน่วย)
            </label>
            <input
              type="number"
              id="newRate"
              value={newRate}
              onChange={e => setNewRate(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-gray-300 text-black text-base p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกอัตราค่าน้ำใหม่"
              min="0.01"
              step="0.01"
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleShowHistory}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              disabled={loading}
            >
              <i className={`fas fa-chevron-${showHistory ? 'up' : 'down'}`}></i>
              {showHistory ? 'ซ่อน' : 'แสดง'}ประวัติการเปลี่ยนแปลงอัตรา
            </button>

            {showHistory && (
              <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">ประวัติอัตราค่าน้ำ</h4>
                {rateHistory.length > 0 ? (
                  <div className="space-y-2">
                    {rateHistory.map((rate, index) => (
                      <div key={rate.id} className={`text-xs p-2 rounded ${rate.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{rate.rate_per_unit} บาท/หน่วย</span>
                          <span className={`px-2 py-1 rounded text-xs ${rate.is_active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                            {rate.is_active ? 'ปัจจุบัน' : 'เก่า'}
                          </span>
                        </div>
                        <div className="text-gray-600 mt-1">
                          มีผลตั้งแต่: {new Date(rate.effective_from).toLocaleString('th-TH')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">ไม่มีประวัติการเปลี่ยนแปลง</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-sm md:text-base px-4 md:px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 order-2 sm:order-1" 
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="text-sm md:text-base px-4 md:px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2" 
              disabled={loading}
            >
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              อัปเดตอัตรา
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WaterUnitForm;