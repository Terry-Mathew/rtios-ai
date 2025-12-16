/**
 * App.tsx - Application Composition Root
 * 
 * This file wires domains together and coordinates high-level navigation.
 * It MUST NOT accumulate new domain logic.
 * 
 * Allowed: Navigation, dependency wiring, callbacks, explicit snapshot triggers
 * Forbidden: Persistence details, business rules, AI prompts, feature state machines
 * 
 * See: docs/architecture/composition-root.md
 * 
 * Domain architecture implemented:
 * - CareerContext: domains/career/ (resume + profile management)
 * - JobApplications: domains/jobs/ (job CRUD + snapshot/hydration)
 * - GeneratedIntelligence: domains/intelligence/ (AI generation capabilities)
 * - Workspace: domains/workspace/types.ts (derived UI state types)
 */

import React, { useState, useCallback } from 'react';
import InputForm from './components/InputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import ResumeAnalysisDisplay from './components/ResumeAnalysisDisplay';
import CompanyResearchDisplay from './components/CompanyResearchDisplay';
import LinkedInMessageGenerator from './components/LinkedInMessageGenerator';
import InterviewPrepDisplay from './components/InterviewPrepDisplay';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import PricingPage from './components/PricingPage';
import LegalPages from './components/LegalPages';
import ContextSwitcher from './components/ContextSwitcher';
import Dashboard from './components/Dashboard';
import { JobInfo, AppState, AppStatus, ToneType, LinkedInState, SavedResume, View } from './types';
import { fileToBase64 } from './utils/fileUtils';
import * as GeminiService from './domains/intelligence/services/gemini';
import * as AIOrchestrator from './domains/intelligence/services/orchestrator';
import { FileText, MessageSquare, Brain, Hexagon, Layout, LayoutGrid } from 'lucide-react';

// Domain Hooks
import { useCareerContext } from './domains/career/hooks/useCareerContext';
import { useJobApplications } from './domains/jobs/hooks/useJobApplications';

// Domain Controllers
import { createSnapshot, hydrateFromJob, clearWorkspace } from './domains/jobs/controllers/JobSnapshotController';

const App: React.FC = () => {
  // --- Navigation State ---
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  // --- Domain Hooks (with built-in persistence) ---
  const {
    resumes,
    activeResumeId,
    userProfile,
    currentResume,
    addResume: addResumeToContext,
    selectResume: handleSelectResume,
    deleteResume: handleDeleteResume,
    updateProfile: setUserProfile,
    setResumes,
    setActiveResumeId
  } = useCareerContext();

  const {
    jobs,
    activeJobId,
    addJob: addJobToApplications,
    deleteJob: handleDeleteJob,
    updateJobOutputs,
    setJobs,
    setActiveJobId
  } = useJobApplications();

  // Derived Active Data
  const currentJob = jobs.find(j => j.id === activeJobId) || { title: '', company: '', description: '', companyUrl: '' };

  // --- Workspace State (transient, execution-only) ---
  const [appState, setAppState] = useState<AppState>({
    status: AppStatus.IDLE,
    error: undefined,
    library: { resumes: [], jobs: [] },
    activeJobId: null,
    resumeText: '',
    research: null,
    analysis: null,
    coverLetter: {
      content: '',
      isGenerating: false,
      tone: ToneType.PROFESSIONAL
    },
    linkedIn: {
      input: {
        connectionStatus: 'new',
        recruiterName: '',
        recruiterTitle: '',
        connectionContext: '',
        messageIntent: '',
        recentActivity: '',
        mutualConnection: '',
        customAddition: '',
        tone: 'Warm Professional'
      },
      generatedMessage: '',
      isGenerating: false
    },
    interviewPrep: {
      questions: [],
      isGenerating: false
    }
  });

  // Main Module State (Center Panel)
  const [activeModule, setActiveModule] = useState<'coverLetter' | 'linkedin' | 'interview'>('coverLetter');
  
  // Sidebar State (Right Panel)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'input' | 'analysis' | 'research'>('input');


  // --- Helper: Sync Current AppState to Active Job History ---
  const snapshotCurrentStateToJob = useCallback((jobIdToUpdate: string | null) => {
      if (!jobIdToUpdate) return;
      
      // Use controller to create snapshot
      const snapshot = createSnapshot(appState);
      updateJobOutputs(jobIdToUpdate, snapshot);
  }, [appState, updateJobOutputs]);


  // --- Navigation Handlers ---
  const handleStartFlow = () => {
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setCurrentView('pricing');
  };

  const handlePlanSelection = (plan: string) => {
    setCurrentView('app');
  };

  const handleNavigate = (view: View) => {
      // Snapshot before navigating away if we have an active job
      if (activeJobId && currentView === 'app') {
          snapshotCurrentStateToJob(activeJobId);
      }
      setCurrentView(view);
      window.scrollTo(0,0);
  };

  // --- Library Handlers ---

  const handleAddResume = async (file: File) => {
      setAppState(prev => ({ ...prev, status: AppStatus.PARSING_RESUME }));
      try {
          const base64 = await fileToBase64(file);
          const text = await GeminiService.extractResumeText(base64);
          
          const newResume: SavedResume = {
              id: crypto.randomUUID(),
              fileName: file.name,
              file: file,
              textParams: text,
              uploadDate: new Date()
          };

          // Use hook method (handles single resume enforcement + persistence)
          addResumeToContext(newResume);
          setAppState(prev => ({ ...prev, status: AppStatus.IDLE, resumeText: text }));
      } catch (e) {
          handleError("Failed to upload and parse resume.");
      }
  };

  // handleSelectResume and handleDeleteResume are now provided by useCareerContext

  const handleAddJob = (job: JobInfo) => {
      // If we are currently on another job, snapshot it first
      if (activeJobId) snapshotCurrentStateToJob(activeJobId);
      
      // Use hook method (handles ID generation + persistence)
      addJobToApplications(job);
      
      // Reset AppState for new job (using controller)
      const clearedState = clearWorkspace(appState.linkedIn.input);
      setAppState(prev => ({
        ...prev,
        ...clearedState,
        status: AppStatus.IDLE
      }));
  };

  const handleSelectStrategy = (jobId: string) => {
      // 1. Save current workspace state to the OLD job (using controller)
      if (activeJobId) {
         const snapshot = createSnapshot(appState);
         updateJobOutputs(activeJobId, snapshot);
      }

      // 2. Hydrate workspace from the NEW job (using controller)
      const targetJob = jobs.find(j => j.id === jobId);
      const hydratedState = hydrateFromJob(targetJob, appState.linkedIn.input);
      setAppState(prev => ({
          ...prev,
          ...hydratedState,
          status: AppStatus.IDLE
      }));

      // Ensure we are using the current resume (legacy support for linkedResumeId)
      if (resumes.length > 0) {
          handleSelectResume(resumes[0].id);
      }

      setActiveJobId(jobId);
      if (currentView === 'dashboard') setCurrentView('app');
  };

  const handleAddNewStrategy = () => {
      setActiveSidebarTab('input');
      // Snapshot before clearing
      if (activeJobId) snapshotCurrentStateToJob(activeJobId);
      setActiveJobId(null);
      
      // Clear workspace (using controller)
      const clearedState = clearWorkspace(appState.linkedIn.input);
      setAppState(prev => ({
        ...prev,
        ...clearedState,
        status: AppStatus.IDLE
      }));
      
      setCurrentView('app');
  };

  // handleDeleteResume is provided by useCareerContext
  // handleDeleteJob is provided by useJobApplications
  // We wrap handleDeleteJob to also clear workspace state when deleting active job
  const handleDeleteJobWithWorkspaceClear = (id: string) => {
      const wasActive = activeJobId === id;
      handleDeleteJob(id);
      if (wasActive) {
          // Clear workspace (using controller)
          const clearedState = clearWorkspace(appState.linkedIn.input);
          setAppState(prev => ({
            ...prev,
            ...clearedState
          }));
      }
  };

  // --- Handlers ---
  
  const handleError = (message: string) => {
    setAppState(prev => ({ ...prev, status: AppStatus.ERROR, error: message }));
  };

  const handleGenerate = async () => {
    if (!currentResume || !currentJob.title) return;

    setAppState(prev => ({ ...prev, resumeText: currentResume.textParams, status: AppStatus.RESEARCHING, error: undefined }));

    try {
      // 1. Parallel: Research & Analysis
      const researchPromise = GeminiService.researchCompany(currentJob.company, currentJob.companyUrl);
      const analysisPromise = GeminiService.analyzeResume(currentResume.textParams, currentJob, { portfolio: userProfile.portfolioUrl, linkedin: userProfile.linkedinUrl });
      
      const [researchResult, analysisResult] = await Promise.all([researchPromise, analysisPromise]);

      setAppState(prev => ({ 
        ...prev, 
        research: researchResult, 
        analysis: analysisResult,
        status: AppStatus.GENERATING 
      }));

      // 2. Generate Cover Letter (Default Action)
      const coverLetterText = await GeminiService.generateCoverLetter(
        currentResume.textParams,
        currentJob,
        researchResult,
        ToneType.PROFESSIONAL,
        { portfolio: userProfile.portfolioUrl, linkedin: userProfile.linkedinUrl }
      );

      const newCoverLetterState = {
          content: coverLetterText,
          tone: ToneType.PROFESSIONAL,
          isGenerating: false
      };

      setAppState(prev => ({
        ...prev,
        status: AppStatus.COMPLETED,
        coverLetter: newCoverLetterState
      }));

      // Save Results to Job History Immediately
      if (activeJobId) {
          setJobs(prev => prev.map(j => j.id === activeJobId ? {
              ...j,
              outputs: {
                  ...j.outputs,
                  research: researchResult,
                  analysis: analysisResult,
                  coverLetter: newCoverLetterState
              }
          } : j));
      }

      // Switch Sidebar to Analysis on completion
      setActiveSidebarTab('analysis');

    } catch (e: any) {
      handleError(e.message || "An unexpected error occurred.");
    }
  };

  const handleRegenerateCoverLetter = async (tone: ToneType) => {
    if (!currentResume || !appState.research) return;

    setAppState(prev => ({
      ...prev,
      coverLetter: { ...prev.coverLetter, isGenerating: true, tone }
    }));

    try {
      // Use orchestrator for cover letter regeneration
      const newContent = await AIOrchestrator.regenerateCoverLetter(
        currentResume.textParams,
        currentJob,
        appState.research,
        tone,
        userProfile
      );

      const updatedCoverLetter = { content: newContent, isGenerating: false, tone };

      setAppState(prev => ({
        ...prev,
        coverLetter: updatedCoverLetter
      }));

      // Update History
      if (activeJobId) {
          setJobs(prev => prev.map(j => j.id === activeJobId ? {
              ...j,
              outputs: { ...j.outputs, coverLetter: updatedCoverLetter }
          } : j));
      }

    } catch (e) {
      console.error(e);
      setAppState(prev => ({
        ...prev,
        coverLetter: { ...prev.coverLetter, isGenerating: false }
      }));
    }
  };

  const updateCoverLetterContent = useCallback((text: string) => {
    setAppState(prev => ({
        ...prev,
        coverLetter: { ...prev.coverLetter, content: text }
    }));
  }, []);

  // LinkedIn Handler
  const handleGenerateLinkedIn = async () => {
    if (!currentResume) return;

    setAppState(prev => ({
      ...prev,
      linkedIn: { ...prev.linkedIn, isGenerating: true }
    }));

    try {
      // Use orchestrator for LinkedIn message generation
      const message = await AIOrchestrator.generateLinkedIn(
        currentResume.textParams,
        currentJob,
        appState.linkedIn.input,
        appState.research?.summary || "No research available"
      );
      
      const updatedLinkedIn = { ...appState.linkedIn, generatedMessage: message, isGenerating: false };

      setAppState(prev => ({
        ...prev,
        linkedIn: updatedLinkedIn
      }));

      // Update History
      if (activeJobId) {
          setJobs(prev => prev.map(j => j.id === activeJobId ? {
              ...j,
              outputs: { ...j.outputs, linkedIn: updatedLinkedIn }
          } : j));
      }

    } catch (e) {
      console.error(e);
      setAppState(prev => ({
        ...prev,
        linkedIn: { ...prev.linkedIn, isGenerating: false }
      }));
    }
  };

  const setLinkedInState = useCallback((updater: React.SetStateAction<LinkedInState>) => {
      setAppState((currentAppState) => {
          let newLinkedInState: LinkedInState;
          if (typeof updater === 'function') {
              const updaterFn = updater as (prevState: LinkedInState) => LinkedInState;
              newLinkedInState = updaterFn(currentAppState.linkedIn);
          } else {
              newLinkedInState = updater;
          }
          return { ...currentAppState, linkedIn: newLinkedInState };
      });
  }, []);

  // Interview Prep Handler
  const handleGenerateInterviewQuestions = async () => {
    if (!currentResume) return;

    setAppState(prev => ({
      ...prev,
      interviewPrep: { ...prev.interviewPrep, isGenerating: true }
    }));

    try {
      const existingQuestions = appState.interviewPrep.questions.map(q => q.question);
      // Use orchestrator for interview question generation
      const newQuestions = await AIOrchestrator.generateInterview(
        currentResume.textParams,
        currentJob,
        existingQuestions
      );

      const updatedInterviewPrep = { 
          questions: [...appState.interviewPrep.questions, ...newQuestions], 
          isGenerating: false 
      };

      setAppState(prev => ({
        ...prev,
        interviewPrep: updatedInterviewPrep
      }));

      // Update History
      if (activeJobId) {
          setJobs(prev => prev.map(j => j.id === activeJobId ? {
              ...j,
              outputs: { ...j.outputs, interviewPrep: updatedInterviewPrep }
          } : j));
      }

    } catch (e) {
      console.error(e);
      setAppState(prev => ({
        ...prev,
        interviewPrep: { ...prev.interviewPrep, isGenerating: false }
      }));
    }
  };


  // --- View Rendering Logic ---

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onStart={handleStartFlow} onNavigate={handleNavigate} />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (currentView === 'pricing') {
    return <PricingPage onSelectPlan={handlePlanSelection} onNavigate={handleNavigate} />;
  }

  if (['terms', 'privacy', 'cookie', 'about'].includes(currentView)) {
    return <LegalPages view={currentView} onNavigate={handleNavigate} />;
  }

  // --- Main App View ---
  return (
    <div className="flex h-screen bg-surface-base text-text-primary overflow-hidden">
      
      {/* 1. Left Navigation Sidebar (Vertical) */}
      <nav className="w-20 bg-surface-base border-r border-white/5 flex flex-col items-center py-6 shrink-0 z-20">
        <div className="mb-8 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,127,0.2)]">
                <Hexagon className="w-6 h-6 text-surface-base fill-surface-base" />
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full px-2">
            <button 
                onClick={() => {
                  if (activeJobId) snapshotCurrentStateToJob(activeJobId);
                  setCurrentView('dashboard');
                }}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-white/5 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
            >
                <LayoutGrid className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
                <span className="text-[9px] font-interstate uppercase font-bold text-center">Dashboard</span>
            </button>

            <div className="h-px w-full bg-white/10 my-2"></div>

            <button 
                onClick={() => {
                  if (currentView !== 'app') setCurrentView('app');
                  setActiveModule('coverLetter');
                }}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'coverLetter' && currentView === 'app' ? 'bg-white/5 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
            >
                <FileText className={`w-5 h-5 ${activeModule === 'coverLetter' && currentView === 'app' ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
                <span className="text-[9px] font-interstate uppercase font-bold">Cover</span>
            </button>
            
            <button 
                onClick={() => {
                  if (currentView !== 'app') setCurrentView('app');
                  setActiveModule('linkedin');
                }}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'linkedin' && currentView === 'app' ? 'bg-white/5 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
            >
                <MessageSquare className={`w-5 h-5 ${activeModule === 'linkedin' && currentView === 'app' ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
                <span className="text-[9px] font-interstate uppercase font-bold">Social</span>
            </button>

            <button 
                onClick={() => {
                  if (currentView !== 'app') setCurrentView('app');
                  setActiveModule('interview');
                }}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${activeModule === 'interview' && currentView === 'app' ? 'bg-white/5 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
            >
                <Brain className={`w-5 h-5 ${activeModule === 'interview' && currentView === 'app' ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
                <span className="text-[9px] font-interstate uppercase font-bold">Prep</span>
            </button>
        </div>
      </nav>

      {/* 2. Main Content Area (Flexible) */}
      <main className="flex-1 flex flex-col bg-surface-base relative border-r border-white/5 min-w-0 overflow-hidden">
        
        {/* Global Context Switcher (Only in App View) */}
        {currentView === 'app' && (
           <ContextSwitcher 
              jobs={jobs}
              activeJobId={activeJobId}
              resumes={resumes}
              activeResumeId={activeResumeId}
              onSelectStrategy={handleSelectStrategy}
              onAddNew={handleAddNewStrategy}
           />
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
           <Dashboard 
              jobs={jobs}
              resumes={resumes}
              userProfile={userProfile}
              activeJobId={activeJobId}
              activeResumeId={activeResumeId}
              onSelectStrategy={handleSelectStrategy}
              onDeleteJob={handleDeleteJobWithWorkspaceClear}
              onDeleteResume={handleDeleteResume}
              onAddResume={handleAddResume}
              onUpdateProfile={setUserProfile}
              onNavigateToApp={() => setCurrentView('app')}
           />
        )}

        {/* Loading Overlay */}
        {(appState.status === AppStatus.PARSING_RESUME || appState.status === AppStatus.RESEARCHING || appState.status === AppStatus.ANALYZING || appState.status === AppStatus.GENERATING) && (
            <div className="absolute inset-0 bg-surface-base/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                         <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                         <div className="absolute inset-2 border-r-2 border-white/20 rounded-full animate-spin [animation-direction:reverse]"></div>
                    </div>
                    <div className="font-interstate text-xs font-bold text-accent uppercase tracking-[0.2em] animate-pulse">
                        {appState.status === AppStatus.PARSING_RESUME && "Ingesting Profile Data..."}
                        {appState.status === AppStatus.RESEARCHING && "Running Market Intelligence..."}
                        {appState.status === AppStatus.ANALYZING && "Calculating Fit Score..."}
                        {appState.status === AppStatus.GENERATING && "Synthesizing Draft..."}
                    </div>
                </div>
            </div>
        )}

        {/* Empty State */}
        {currentView === 'app' && appState.status === AppStatus.IDLE && activeModule !== 'linkedin' && !activeJobId && !activeResumeId && (
             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none mt-20">
                 <Layout className="w-24 h-24 text-text-secondary mb-4" />
                 <h1 className="font-tiempos text-3xl text-text-primary">Rtios AI</h1>
                 <p className="font-interstate text-sm text-text-secondary mt-2">Executive Intelligence Suite</p>
             </div>
        )}

        {/* Module Render */}
        {currentView === 'app' && (
          <>
            <div className={`h-full flex flex-col ${activeModule === 'coverLetter' ? 'block' : 'hidden'}`}>
                <CoverLetterDisplay 
                    state={appState.coverLetter} 
                    onUpdateContent={updateCoverLetterContent}
                    onRegenerate={handleRegenerateCoverLetter}
                />
            </div>
            <div className={`h-full flex flex-col ${activeModule === 'linkedin' ? 'block' : 'hidden'}`}>
                <LinkedInMessageGenerator 
                    jobInfo={currentJob}
                    linkedInState={appState.linkedIn}
                    setLinkedInState={setLinkedInState}
                    onGenerate={handleGenerateLinkedIn}
                    canGenerate={!!currentResume}
                />
            </div>
            <div className={`h-full flex flex-col ${activeModule === 'interview' ? 'block' : 'hidden'}`}>
                <InterviewPrepDisplay 
                    state={appState.interviewPrep}
                    jobInfo={currentJob}
                    onGenerateMore={handleGenerateInterviewQuestions}
                    canGenerate={!!currentResume}
                />
            </div>
          </>
        )}

      </main>

      {/* 3. Right Sidebar (Context & Intelligence) */}
      {currentView === 'app' && (
        <aside className="w-[400px] xl:w-[35%] max-w-[600px] bg-surface-elevated border-l border-white/5 flex flex-col shrink-0 transition-all duration-300">
            
            {/* Sidebar Tabs */}
            <div className="flex items-center border-b border-white/5">
                <button
                    onClick={() => setActiveSidebarTab('input')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
                        ${activeSidebarTab === 'input' 
                            ? 'text-text-primary border-b border-accent bg-white/5' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Workspace
                </button>
                <button
                    onClick={() => setActiveSidebarTab('analysis')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
                        ${activeSidebarTab === 'analysis' 
                            ? 'text-text-primary border-b border-accent bg-white/5' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Analysis
                </button>
                <button
                    onClick={() => setActiveSidebarTab('research')}
                    className={`flex-1 py-4 text-xs font-interstate font-bold uppercase tracking-widest transition-colors
                        ${activeSidebarTab === 'research' 
                            ? 'text-text-primary border-b border-accent bg-white/5' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    Intel
                </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className={`h-full ${activeSidebarTab === 'input' ? 'block' : 'hidden'}`}>
                    <InputForm 
                        resumes={resumes}
                        activeResumeId={activeResumeId}
                        onAddResume={handleAddResume}
                        onSelectResume={handleSelectResume}
                        onDeleteResume={handleDeleteResume}
                        userProfile={userProfile}
                        onUpdateProfile={setUserProfile}
                        jobs={jobs}
                        activeJobId={activeJobId}
                        onAddJob={handleAddJob}
                        onSelectJob={handleSelectStrategy}
                        onDeleteJob={handleDeleteJobWithWorkspaceClear}
                        onGenerate={handleGenerate}
                        appStatus={appState.status}
                    />
                </div>
                <div className={`h-full ${activeSidebarTab === 'analysis' ? 'block' : 'hidden'}`}>
                    <ResumeAnalysisDisplay analysis={appState.analysis} />
                </div>
                <div className={`h-full ${activeSidebarTab === 'research' ? 'block' : 'hidden'}`}>
                    <CompanyResearchDisplay research={appState.research} />
                </div>
            </div>

        </aside>
      )}
    </div>
  );
};

export default App;
