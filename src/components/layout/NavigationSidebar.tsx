import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, LayoutGrid, FileText, MessageSquare, Brain } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { View } from '../../../types';

interface NavigationSidebarProps {
    onLogoClick: () => void;
    onSnapshotBeforeDashboard?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
    onLogoClick,
    onSnapshotBeforeDashboard
}) => {
    const navigate = useNavigate();

    // Get navigation state from store
    const currentView = useAppStore((s) => s.currentView);
    const activeModule = useAppStore((s) => s.activeModule);
    const setActiveModule = useAppStore((s) => s.setActiveModule);

    // Handler for dashboard navigation
    const handleDashboardClick = () => {
        if (onSnapshotBeforeDashboard) {
            onSnapshotBeforeDashboard();
        }
        navigate('/dashboard');
    };

    // Handler for module navigation
    const handleModuleClick = (module: 'coverLetter' | 'linkedin' | 'interview') => {
        setActiveModule(module);
        navigate('/app');
    };

    return (
        <nav className="w-20 bg-surface-base border-r border-white/5 flex flex-col items-center py-6 shrink-0 z-20">
            {/* Logo */}
            <div className="mb-8 cursor-pointer" onClick={onLogoClick}>
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,127,0.2)]">
                    <Hexagon className="w-6 h-6 text-surface-base fill-surface-base" />
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col gap-6 w-full px-2">
                {/* Dashboard Button */}
                <button
                    onClick={handleDashboardClick}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${currentView === 'dashboard'
                        ? 'bg-white/5 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                >
                    <LayoutGrid className={`w-5 h-5 ${currentView === 'dashboard'
                        ? 'text-accent'
                        : 'text-text-secondary group-hover:text-text-primary'
                        }`} />
                    <span className="text-[9px] font-interstate uppercase font-bold text-center">Dashboard</span>
                </button>

                {/* Divider */}
                <div className="h-px w-full bg-white/10 my-2"></div>

                {/* Cover Letter Button */}
                <button
                    onClick={() => handleModuleClick('coverLetter')}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'coverLetter' && currentView === 'app'
                        ? 'bg-white/5 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                >
                    <FileText className={`w-5 h-5 ${activeModule === 'coverLetter' && currentView === 'app'
                        ? 'text-accent'
                        : 'text-text-secondary group-hover:text-text-primary'
                        }`} />
                    <span className="text-[9px] font-interstate uppercase font-bold">Cover</span>
                </button>

                {/* LinkedIn Button */}
                <button
                    onClick={() => handleModuleClick('linkedin')}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'linkedin' && currentView === 'app'
                        ? 'bg-white/5 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                >
                    <MessageSquare className={`w-5 h-5 ${activeModule === 'linkedin' && currentView === 'app'
                        ? 'text-accent'
                        : 'text-text-secondary group-hover:text-text-primary'
                        }`} />
                    <span className="text-[9px] font-interstate uppercase font-bold">Social</span>
                </button>

                {/* Interview Prep Button */}
                <button
                    onClick={() => handleModuleClick('interview')}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'interview' && currentView === 'app'
                        ? 'bg-white/5 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                >
                    <Brain className={`w-5 h-5 ${activeModule === 'interview' && currentView === 'app'
                        ? 'text-accent'
                        : 'text-text-secondary group-hover:text-text-primary'
                        }`} />
                    <span className="text-[9px] font-interstate uppercase font-bold">Prep</span>
                </button>
            </div>
        </nav>
    );
};
