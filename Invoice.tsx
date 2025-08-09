
import React from 'react';
import { House, MeterReading } from '../types';
import { WATER_RATE_PER_UNIT } from '../constants';

interface InvoiceProps {
  house: House;
  reading: MeterReading;
}

const Invoice: React.FC<InvoiceProps> = ({ house, reading }) => {
  return (
    <div id="print-section" className="print-only">
        <div className="p-4 md:p-8 border-2 border-gray-800 m-2 md:m-8 font-sans text-sm md:text-base">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b-2 border-gray-800 gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">ใบแจ้งค่าน้ำประปา</h1>
                    <p className="text-base md:text-lg">หมู่บ้านสุขใจวิลเลจ</p>
                </div>
                <div className="text-right">
                    <p><strong>ประจำเดือน:</strong> {reading.month}</p>
                    <p><strong>วันที่ออกใบแจ้ง:</strong> {new Date(reading.date_recorded).toLocaleDateString('th-TH')}</p>
                </div>
            </header>

            <section className="my-4 md:my-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">ข้อมูลผู้ใช้น้ำ</h2>
                <div className="space-y-1">
                    <p><strong>บ้านเลขที่:</strong> {house.house_number}</p>
                    <p><strong>ชื่อ-นามสกุล:</strong> {house.owner_name}</p>
                </div>
            </section>

            <section className="my-4 md:my-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">รายละเอียดการใช้น้ำ</h2>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 font-semibold border-b">รายการ</div>
                    <div className="divide-y divide-gray-200">
                        <div className="flex justify-between p-2">
                            <span>เลขมิเตอร์ครั้งก่อน</span>
                            <span className="font-medium">{reading.previous_reading.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2">
                            <span>เลขมิเตอร์ครั้งนี้</span>
                            <span className="font-medium">{reading.current_reading.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 font-semibold">
                            <span>จำนวนหน่วยที่ใช้</span>
                            <span>{reading.units_used.toLocaleString()} หน่วย</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="my-4 md:my-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">สรุปยอดที่ต้องชำระ</h2>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        <div className="flex justify-between p-2">
                            <span>ค่าน้ำประปา ({reading.units_used} หน่วย x {WATER_RATE_PER_UNIT} บาท)</span>
                            <span className="font-medium">{reading.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-200 font-bold text-base md:text-lg">
                            <span>ยอดรวมที่ต้องชำระ</span>
                            <span>{reading.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</span>
                        </div>
                    </div>
                </div>
            </section>

             {reading.meter_image && (
                <section className="my-4 md:my-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-2">ภาพถ่ายประกอบ</h2>
                    <div className="text-center">
                        <img src={reading.meter_image} alt="Meter Reading" className="max-w-full md:max-w-xs border p-1 rounded" />
                    </div>
                </section>
            )}

            <footer className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600 space-y-1">
                <p>กรุณาชำระเงินภายในวันที่ 15 ของเดือนถัดไป</p>
                <p>สอบถามเพิ่มเติม โทร. 02-123-4567</p>
            </footer>
        </div>
    </div>
  );
};

export default Invoice;