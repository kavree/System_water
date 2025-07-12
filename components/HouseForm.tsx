
import React, { useState } from 'react';
import { House } from '../types';
import { supabase } from '../services/supabaseClient';

interface HouseFormProps {
  onClose: () => void;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  existingHouse?: House;
}

const HouseForm: React.FC<HouseFormProps> = ({ onClose, setHouses, existingHouse }) => {
  const [houseNumber, setHouseNumber] = useState(existingHouse?.house_number || '');
  const [ownerName, setOwnerName] = useState(existingHouse?.owner_name || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber.trim() || !ownerName.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (existingHouse) {
        // Edit existing house
        const { data, error: updateError } = await supabase
          .from('houses')
          .update({ house_number: houseNumber, owner_name: ownerName })
          .eq('id', existingHouse.id)
          .select()
          .single();

        if (updateError) throw updateError;
        
        setHouses(prev => prev.map(h => 
          h.id === existingHouse.id ? { ...h, house_number: data.house_number, owner_name: data.owner_name } : h
        ));

      } else {
        // Add new house
        const { data, error: insertError } = await supabase
            .from('houses')
            .insert({ house_number: houseNumber, owner_name: ownerName })
            .select()
            .single();

        if (insertError) throw insertError;

        const newHouseWithReadings: House = { ...data, readings: [] };
        setHouses(prev => [...prev, newHouseWithReadings]);
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving house:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-6">{existingHouse ? 'แก้ไขข้อมูลบ้าน' : 'เพิ่มบ้านใหม่'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">บ้านเลขที่</label>
            <input
              type="text"
              id="houseNumber"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น 123/45"
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">ชื่อเจ้าของบ้าน</label>
            <input
              type="text"
              id="ownerName"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น สมชาย ใจดี"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={loading}>
              ยกเลิก
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2" disabled={loading}>
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              {existingHouse ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มบ้าน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseForm;