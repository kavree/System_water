
import React, { useRef, useState } from 'react';
import { House, MeterReading } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceProps {
  house: House;
  reading: MeterReading;
  onClose?: () => void;
  showPrintControls?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ house, reading, onClose, showPrintControls = false }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `ใบแจ้งค่าน้ำ_บ้านเลขที่_${house.house_number}_${reading.month}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (!invoiceRef.current) return;

    try {
      if (navigator.share) {
        // Use Web Share API if available (mobile)
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `ใบแจ้งค่าน้ำ_${house.house_number}.png`, {
              type: 'image/png'
            });

            await navigator.share({
              title: `ใบแจ้งค่าน้ำประปา - บ้านเลขที่ ${house.house_number}`,
              text: `ใบแจ้งค่าน้ำประจำเดือน ${reading.month}`,
              files: [file]
            });
          }
        }, 'image/png');
      } else {
        // Fallback: copy link or show share options
        alert('การแชร์ไม่รองรับในเบราว์เซอร์นี้ กรุณาใช้ปุ่มดาวน์โหลด PDF');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('เกิดข้อผิดพลาดในการแชร์');
    }
  };
  return (
    <>
      {showPrintControls && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            {/* Mobile-friendly header with controls */}
            <div className="sticky top-0 bg-white border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">ใบแจ้งค่าน้ำประปา</h3>
                <p className="text-sm text-gray-600">บ้านเลขที่ {house.house_number} - {reading.month}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <i className="fas fa-print"></i>
                  <span>พิมพ์</span>
                </button>
                
                {/* Download PDF button */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isGeneratingPDF ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download"></i>
                      <span>ดาวน์โหลด PDF</span>
                    </>
                  )}
                </button>
                
                {/* Share button (mobile) */}
                {navigator && 'share' in navigator && (
                  <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fas fa-share-alt"></i>
                    <span>แชร์</span>
                  </button>
                )}
                
                {/* Close button */}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fas fa-times"></i>
                    <span>ปิด</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Invoice content */}
            <div className="p-4">
              <div ref={invoiceRef} className="bg-white">
                <InvoiceContent house={house} reading={reading} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!showPrintControls && (
        <div id="print-section" className="print-only">
          <div ref={invoiceRef}>
            <InvoiceContent house={house} reading={reading} />
          </div>
        </div>
      )}
    </>
  );
};

// Separate component for the actual invoice content
const InvoiceContent: React.FC<{ house: House; reading: MeterReading }> = ({ house, reading }) => {
  return (
    <div className="p-4 md:p-8 border-2 border-gray-800 m-2 md:m-8 font-sans text-sm md:text-base bg-white">
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
                            <span>ค่าน้ำประปา ({reading.units_used} หน่วย x {reading.rate_per_unit || 5} บาท)</span>
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
    );
};

export default Invoice;