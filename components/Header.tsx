
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md no-print">
            <div className="container mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <i className="fas fa-faucet-drip text-2xl md:text-3xl text-blue-600"></i>
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800">ระบบจัดการค่าน้ำประปาหมู่บ้าน</h1>
                </div>
            </div>
        </header>
    );
}
