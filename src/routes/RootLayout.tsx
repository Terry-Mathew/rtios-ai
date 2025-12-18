/**
 * RootLayout.tsx - Root layout component with AuthModal
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AuthModal from '../../components/AuthModal';
import { useAppStore } from '../stores/appStore';

const RootLayout: React.FC = () => {
    const navigate = useNavigate();
    const isAuthModalOpen = useAppStore((s) => s.isAuthModalOpen);
    const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);

    const handleAuthSuccess = () => {
        setIsAuthModalOpen(false);
        navigate('/pricing');
    };

    return (
        <>
            <Outlet />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
};

export default RootLayout;
