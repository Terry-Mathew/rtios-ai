/**
 * RootLayout.tsx - Root layout component with AuthModal
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import AuthModal from '../components/ui/AuthModal';
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
        <div className="flex h-screen bg-surface-base text-text-primary font-sans overflow-hidden selection:bg-accent/30">

            <main className="flex-1 overflow-auto relative flex flex-col">
                <Outlet />
            </main>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default RootLayout;
