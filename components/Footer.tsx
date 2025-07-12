
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="text-center py-4 text-gray-500 text-sm bg-gray-100 no-print">
            <p>&copy; {new Date().getFullYear()} Village Water Management. All rights reserved.</p>
        </footer>
    );
}
