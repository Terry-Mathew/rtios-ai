
import React, { useRef } from 'react';
import { JobInfo, SavedResume, UserProfile } from '../../../types';
import { Trash2, FileText, CheckCircle2, ArrowRight, Upload, Briefcase, Globe, User, RotateCcw } from 'lucide-react';

interface DashboardProps {
    jobs: JobInfo[];
    resumes: SavedResume[];
    userProfile: UserProfile;
    activeJobId: string | null;
    activeResumeId: string | null;
    onSelectStrategy: (jobId: string) => void;
    onDeleteJob: (id: string) => void;
    onDeleteResume: (id: string) => void;
    onAddResume: (file: File) => void;
    onUpdateProfile: (profile: UserProfile) => void;
    onNavigateToApp: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    jobs,
    resumes,
    userProfile,
    activeJobId,
    onSelectStrategy,
    onDeleteJob,
    onDeleteResume,
    onAddResume,
    onUpdateProfile,
    onNavigateToApp
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // We assume there is only one resume or none based on new app logic
    const currentResume = resumes.length > 0 ? resumes[0] : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (currentResume) {
                if (!window.confirm("Replace existing resume? This will update the context for all future applications.")) {
                    return;
                }
            }
            onAddResume(e.target.files[0]);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-surface-base font-sans overflow-hidden">

            {/* Dashboard Header */}
            <div className="p-8 border-b border-white/5 bg-surface-base">
                <h1 className="font-tiempos text-3xl font-bold text-text-primary mb-2">Executive Dashboard</h1>
                <p className="font-interstate text-sm text-text-secondary">Manage your career context and active applications.</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">

                {/* SECTION 1: CAREER CONTEXT (ARTIFACTS) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-tiempos text-xl font-bold text-text-primary flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-accent" />
                                Career Context
                            </h2>
                            <p className="font-interstate text-xs text-text-secondary mt-1">
                                Your source of truth. These artifacts power all generated applications.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Single Resume Slot */}
                        <div className={`p-5 rounded-lg border transition-all relative group flex flex-col h-full
                        ${currentResume
                                ? 'bg-accent/5 border-accent'
                                : 'bg-surface-elevated border-dashed border-white/10 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-surface-base rounded border border-white/5">
                                    <FileText className="w-5 h-5 text-text-secondary" />
                                </div>
                                {currentResume && (
                                    <span className="font-interstate text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                                        Active <CheckCircle2 className="w-3 h-3" />
                                    </span>
                                )}
                            </div>

                            {currentResume ? (
                                <>
                                    <h3 className="font-tiempos text-lg font-bold text-text-primary mb-1 truncate" title={currentResume.fileName}>
                                        {currentResume.fileName}
                                    </h3>
                                    <p className="font-interstate text-[10px] text-text-secondary mb-4">
                                        Uploaded {new Date(currentResume.uploadDate).toLocaleDateString()}
                                    </p>
                                    <div className="mt-auto pt-3 border-t border-white/5 flex gap-3">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[10px] font-interstate font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Replace
                                        </button>
                                        <button
                                            onClick={() => onDeleteResume(currentResume.id)}
                                            className="text-[10px] font-interstate font-bold uppercase tracking-widest text-text-secondary hover:text-alert-gap transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                                    <p className="font-interstate text-xs text-text-secondary mb-4">No resume active.</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-interstate font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <Upload className="w-3 h-3" /> Upload PDF
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Portfolio Link */}
                        <div className="bg-surface-elevated border border-white/5 p-5 rounded-lg group hover:border-white/10 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-surface-base rounded border border-white/5">
                                    <Globe className="w-5 h-5 text-text-secondary" />
                                </div>
                            </div>
                            <h3 className="font-tiempos text-lg font-bold text-text-primary mb-1">Portfolio URL</h3>
                            <input
                                type="url"
                                value={userProfile.portfolioUrl || ''}
                                onChange={(e) => onUpdateProfile({ ...userProfile, portfolioUrl: e.target.value })}
                                placeholder="https://myportfolio.com"
                                className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-text-secondary focus:border-accent focus:text-text-primary focus:outline-none transition-colors font-interstate mb-2"
                            />
                            <p className="font-interstate text-[10px] text-text-secondary mt-auto">
                                External link context for analysis.
                            </p>
                        </div>

                        {/* LinkedIn Link */}
                        <div className="bg-surface-elevated border border-white/5 p-5 rounded-lg group hover:border-white/10 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-surface-base rounded border border-white/5">
                                    <User className="w-5 h-5 text-text-secondary" />
                                </div>
                            </div>
                            <h3 className="font-tiempos text-lg font-bold text-text-primary mb-1">LinkedIn URL</h3>
                            <input
                                type="url"
                                value={userProfile.linkedinUrl || ''}
                                onChange={(e) => onUpdateProfile({ ...userProfile, linkedinUrl: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-text-secondary focus:border-accent focus:text-text-primary focus:outline-none transition-colors font-interstate mb-2"
                            />
                            <p className="font-interstate text-[10px] text-text-secondary mt-auto">
                                Profile context for messages.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* SECTION 2: JOB APPLICATIONS */}
                <section>
                    <div className="mb-6">
                        <h2 className="font-tiempos text-xl font-bold text-text-primary flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 text-accent" />
                            Job Applications
                        </h2>
                        <p className="font-interstate text-xs text-text-secondary mt-1">
                            History of role-specific strategies and generated content.
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 overflow-hidden bg-surface-elevated">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-interstate text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                            <div className="col-span-5 md:col-span-5">Application Name</div>
                            <div className="col-span-4 md:col-span-4">Target Role</div>
                            <div className="col-span-3 md:col-span-3 text-right">Actions</div>
                        </div>

                        {/* Table Rows */}
                        {jobs.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                                <Briefcase className="w-8 h-8 mb-3 text-text-secondary" />
                                <p className="font-interstate text-sm text-text-secondary">No applications started.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => {
                                        if (job.id) {
                                            onSelectStrategy(job.id);
                                            onNavigateToApp();
                                        }
                                    }}
                                    className={`grid grid-cols-12 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors group cursor-pointer
                                    ${activeJobId === job.id ? 'bg-accent/5' : ''}`}
                                >
                                    <div className="col-span-5 md:col-span-5">
                                        <div className={`font-tiempos text-sm font-bold truncate pr-4 ${activeJobId === job.id ? 'text-accent' : 'text-text-primary'}`}>
                                            {job.contextName || 'Untitled Application'}
                                        </div>
                                        <div className="font-interstate text-[10px] text-text-secondary mt-0.5">
                                            Last Updated: {new Date(job.dateAdded || Date.now()).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="col-span-4 md:col-span-4">
                                        <div className="text-sm text-text-primary font-medium truncate pr-2">{job.title}</div>
                                        <div className="text-[10px] text-text-secondary truncate">{job.company}</div>
                                    </div>

                                    <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-3">
                                        {activeJobId === job.id ? (
                                            <span className="text-[10px] font-interstate font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                                                Active <CheckCircle2 className="w-3 h-3" />
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-interstate font-bold uppercase tracking-widest text-text-secondary group-hover:text-text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open <ArrowRight className="w-3 h-3" />
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const id = job.id;
                                                if (!id) return;
                                                onDeleteJob(id);
                                            }}
                                            className="p-2 text-text-secondary hover:text-alert-gap transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                                            title="Delete Application"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
