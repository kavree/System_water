
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md no-print">
            <div className="container mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 water-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                            {/* Water drop shape */}
                            <path d="M50 10 
                                     C50 10, 20 40, 20 60 
                                     C20 77, 33 90, 50 90 
                                     C67 90, 80 77, 80 60 
                                     C80 40, 50 10, 50 10 Z" 
                                  className="fill-blue-500"/>
                            
                            {/* Inner highlight */}
                            <ellipse cx="45" cy="55" rx="8" ry="12" 
                                     className="fill-blue-400" 
                                     opacity="0.7"/>
                            
                            {/* Small bubble with animation */}
                            <circle cx="42" cy="45" r="3" 
                                    className="fill-blue-300 water-bubble" 
                                    opacity="0.8"/>
                            
                            {/* Tiny bubble with animation */}
                            <circle cx="58" cy="52" r="2" 
                                    className="fill-blue-100 water-bubble" 
                                    opacity="0.9"
                                    style={{animationDelay: '1s'}}/>
                            
                            {/* Wave pattern at bottom */}
                            <path d="M25 75 Q35 70, 45 75 T65 75 T85 75" 
                                  className="stroke-blue-800" 
                                  strokeWidth="2" 
                                  fill="none" 
                                  opacity="0.6"/>
                        </svg>
                    </div>
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800">ระบบจัดการค่าน้ำประปาหมู่บ้าน</h1>
                </div>
            </div>
        </header>
    );
}
