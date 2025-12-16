/**
 * useJobApplications Hook
 * 
 * Manages JobApplications domain state:
 * - Job library
 * - Active job selection
 * - Persistence (load/save to localStorage)
 * 
 * Responsibilities replaced from App.tsx:
 * 1. jobs state
 * 2. activeJobId state
 * 3. handleAddJob (basic - without snapshot coordination)
 * 4. handleDeleteJob
 * 5. Load from storage on mount
 * 6. Save to storage on change
 * 
 * Note: Snapshot/hydration coordination remains in App.tsx until Phase 3.
 * This hook provides basic CRUD operations for jobs.
 */

import { useState, useCallback, useEffect } from 'react';
import type { JobInfo, JobOutputs } from '../types';
import { loadJobsData, saveJobsData } from '../services/jobStorage';

export interface UseJobApplicationsReturn {
  // State
  jobs: JobInfo[];
  activeJobId: string | null;
  currentJob: JobInfo | undefined;
  
  // Actions
  addJob: (job: JobInfo) => string; // Returns new job ID
  selectJob: (id: string) => void;
  deleteJob: (id: string) => void;
  updateJobOutputs: (jobId: string, outputs: JobOutputs) => void;
  
  // For backward compatibility during migration
  setJobs: React.Dispatch<React.SetStateAction<JobInfo[]>>;
  setActiveJobId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useJobApplications(): UseJobApplicationsReturn {
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Derived: Current job
  const currentJob = jobs.find(j => j.id === activeJobId);

  // --- Persistence Effects ---

  // Load on mount
  useEffect(() => {
    const loaded = loadJobsData();
    if (loaded.length > 0) {
      setJobs(loaded);
    }
  }, []);

  // Save on change
  useEffect(() => {
    saveJobsData(jobs);
  }, [jobs]);

  // --- Actions ---

  /**
   * Add a new job and make it active
   * Returns the new job's ID
   */
  const addJob = useCallback((job: JobInfo): string => {
    const newJobId = crypto.randomUUID();
    const newJob: JobInfo = { 
      ...job, 
      id: newJobId, 
      dateAdded: new Date(), 
      outputs: {} 
    };
    
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(newJobId);
    
    return newJobId;
  }, []);

  /**
   * Select a job as active (basic selection only)
   * Note: Snapshot/hydration coordination should be done by caller
   */
  const selectJob = useCallback((id: string) => {
    setActiveJobId(id);
  }, []);

  /**
   * Delete a job
   */
  const deleteJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (activeJobId === id) {
      setActiveJobId(null);
    }
  }, [activeJobId]);

  /**
   * Update a job's outputs (for snapshot functionality)
   */
  const updateJobOutputs = useCallback((jobId: string, outputs: JobOutputs) => {
    setJobs(prevJobs => prevJobs.map(j => 
      j.id === jobId ? { ...j, outputs } : j
    ));
  }, []);

  return {
    // State
    jobs,
    activeJobId,
    currentJob,
    
    // Actions
    addJob,
    selectJob,
    deleteJob,
    updateJobOutputs,
    
    // For backward compatibility
    setJobs,
    setActiveJobId
  };
}

