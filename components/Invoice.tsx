
import React from 'react';
import { House, MeterReading } from '../types';
import { WATER_RATE_PER_UNIT } from '../constants';

interface InvoiceProps {
  house: House;
  reading: MeterReading;
}

const Invoice: React.FC<InvoiceProps> = ({ house, reading }) => {
  return (
    <div id="print-section">
        <div className="p-8 border-2 border-gray-800 m-8 font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold">ใบแจ้งค่าน้ำประปา</h1>
                    <p className="text-lg">หมู่บ้านสุขใจวิลเลจ</p>
                </div>
                <div className="text-right">
                    <p><strong>ประจำเดือน:</strong> {reading.month}</p>
                    <p><strong>วันที่ออกใบแจ้ง:</strong> {new Date(reading.date_recorded).toLocaleDateString('th-TH')}</p>
                </div>
            </header>

            <section className="my-6">
                <h2 className="text-xl font-semibold mb-2">ข้อมูลผู้ใช้น้ำ</h2>
                <p><strong>บ้านเลขที่:</strong> {house.house_number}</p>
                <p><strong>ชื่อ-นามสกุล:</strong> {house.owner_name}</p>
            </section>

            <section className="my-6">
                <h2 className="text-xl font-semibold mb-2">รายละเอียดการใช้น้ำ</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">รายการ</th>
                            <th className="border p-2 text-right">จำนวน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2">เลขมิเตอร์ครั้งก่อน</td>
                            <td className="border p-2 text-right">{reading.previous_reading.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">เลขมิเตอร์ครั้งนี้</td>
                            <td className="border p-2 text-right">{reading.current_reading.toLocaleString()}</td>
                        </tr>
                        <tr className="font-semibold">
                            <td className="border p-2">จำนวนหน่วยที่ใช้</td>
                            <td className="border p-2 text-right">{reading.units_used.toLocaleString()} หน่วย</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="my-6">
                <h2 className="text-xl font-semibold mb-2">สรุปยอดที่ต้องชำระ</h2>
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr>
                            <td className="border p-2">ค่าน้ำประปา ({reading.units_used} หน่วย x {WATER_RATE_PER_UNIT} บาท)</td>
                            <td className="border p-2 text-right">{reading.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</td>
                        </tr>
                        <tr className="bg-gray-200 font-bold text-lg">
                            <td className="border p-2">ยอดรวมที่ต้องชำระ</td>
                            <td className="border p-2 text-right">{reading.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</td>
                        </tr>
                    </tbody>
                </table>
            </section>

             {reading.meter_image && (
                <section className="my-6">
                    <h2 className="text-xl font-semibold mb-2">ภาพถ่ายประกอบ</h2>
                    <img src={reading.meter_image} alt="Meter Reading" className="max-w-xs border p-1" />
                </section>
            )}

            <footer className="mt-8 text-center text-sm text-gray-600">
                <p>กรุณาชำระเงินภายในวันที่ 15 ของเดือนถัดไป</p>
                <p>สอบถามเพิ่มเติม โทร. 02-123-4567</p>
            </footer>
        </div>
    </div>
  );
};

export default Invoice;