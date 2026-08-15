import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardState {
  currentStep: number;
  workspaceName: string;
  workspacePath: string;
  agents: Record<string, boolean>; // e.g., { antigravity: true, claude: true, cursor: true, codex: true }
  importOption: 'auto' | 'fresh';
  completed: boolean;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setWorkspace: (name: string, path: string) => void;
  toggleAgent: (agentId: string) => void;
  setImportOption: (option: 'auto' | 'fresh') => void;
  completeWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      workspaceName: 'Default Workspace',
      workspacePath: '~/.kobeanai/workspace',
      agents: {
        antigravity: true,
        claude: true,
        cursor: true,
        codex: true
      },
      importOption: 'auto',
      completed: true,
      
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 7) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      setStep: (step) => set({ currentStep: step }),
      setWorkspace: (name, path) => set({ workspaceName: name, workspacePath: path }),
      toggleAgent: (agentId) => set((state) => ({
        agents: { 
          ...state.agents, 
          [agentId]: state.agents[agentId] !== undefined ? !state.agents[agentId] : false 
        }
      })),
      setImportOption: (importOption) => set({ importOption }),
      completeWizard: () => set({ completed: true }),
    }),
    {
      name: 'kobeanai-wizard-storage',
    }
  )
);
