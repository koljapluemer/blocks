import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { ToastProvider } from '@/components/ui/toast';

import { fs } from '../fs';
import { kvLoad } from '../fs/kv';
import type { Block, FileBacked, Goal, Project } from '../models/types';
import { blockRepo } from '../repo/blockRepo';
import { goalRepo } from '../repo/goalRepo';
import { projectRepo } from '../repo/projectRepo';
import { TimerProvider } from '../timer/TimerProvider';
import { InteractionProvider } from './InteractionContext';

// --- Folder context -----------------------------------------------------------

type FolderValue = {
  folderUri: string | null;
  isConfigured: boolean;
  /** Opens the system picker; returns true if a folder was chosen. */
  pickFolder: () => Promise<boolean>;
};

const FolderContext = createContext<FolderValue | null>(null);

export function useFolder(): FolderValue {
  const v = useContext(FolderContext);
  if (!v) throw new Error('useFolder must be used within StoreProvider');
  return v;
}

// --- Data context -----------------------------------------------------------

type DataValue = {
  projects: FileBacked<Project>[];
  goals: FileBacked<Goal>[];
  blocks: FileBacked<Block>[];
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  createProject: (title: string) => Promise<void>;
  updateProject: (model: FileBacked<Project>) => Promise<void>;
  removeProject: (model: FileBacked<Project>) => Promise<void>;
  restoreProject: (relPath: string, data: Project) => Promise<void>;

  createGoal: (title: string, projectFile: string) => Promise<void>;
  updateGoal: (model: FileBacked<Goal>) => Promise<void>;
  /** Rename a goal and keep its project's membership list in sync. */
  renameGoal: (model: FileBacked<Goal>, newTitle: string) => Promise<void>;
  removeGoal: (model: FileBacked<Goal>) => Promise<void>;
  restoreGoal: (relPath: string, data: Goal) => Promise<void>;

  appendBlock: (data: Block) => Promise<void>;
};

const DataContext = createContext<DataValue | null>(null);

export function useData(): DataValue {
  const v = useContext(DataContext);
  if (!v) throw new Error('useData must be used within StoreProvider');
  return v;
}

// --- Provider -------------------------------------------------------------------

export function StoreProvider({ children }: { children: ReactNode }) {
  const [folderUri, setFolderUri] = useState<string | null>(() => {
    kvLoad();
    return fs.getRoot();
  });

  const [projects, setProjects] = useState<FileBacked<Project>[]>([]);
  const [goals, setGoals] = useState<FileBacked<Goal>[]>([]);
  const [blocks, setBlocks] = useState<FileBacked<Block>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const inFlight = useRef(false);
  const pending = useRef(false);

  const reload = useCallback(async () => {
    if (!fs.isConfigured()) {
      setProjects([]);
      setGoals([]);
      setBlocks([]);
      return;
    }
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    setLoading(true);
    try {
      const [p, g, b] = await Promise.all([
        projectRepo.loadAll(fs),
        goalRepo.loadAll(fs),
        blockRepo.loadAll(fs),
      ]);
      setProjects(p);
      setGoals(g);
      setBlocks(b);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      inFlight.current = false;
      if (pending.current) {
        pending.current = false;
        void reload();
      }
    }
  }, []);

  // Initial load + re-scan whenever the app returns to the foreground
  // (Syncthing may have rewritten files while we were backgrounded).
  useEffect(() => {
    void reload();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void reload(), 300);
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [reload]);

  const pickFolder = useCallback(async () => {
    const uri = await fs.requestFolder();
    if (!uri) return false;
    await fs.setRoot(uri);
    setFolderUri(uri);
    await reload();
    return true;
  }, [reload]);

  const folderValue = useMemo<FolderValue>(
    () => ({ folderUri, isConfigured: !!folderUri, pickFolder }),
    [folderUri, pickFolder],
  );

  // Goal membership lives on the project; a goal file itself has no project ref.
  const projectFor = useCallback(
    (goalTitle: string) => projects.find((p) => p.goals.includes(goalTitle)) ?? null,
    [projects],
  );

  const dataValue = useMemo<DataValue>(
    () => ({
      projects,
      goals,
      blocks,
      loading,
      loadError,
      reload,

      createProject: async (title) => {
        await projectRepo.create(fs, { title, goals: [] });
        await reload();
      },
      updateProject: async (model) => {
        await projectRepo.update(fs, model);
        await reload();
      },
      removeProject: async (model) => {
        await projectRepo.remove(fs, model);
        await reload();
      },
      restoreProject: async (relPath, data) => {
        await projectRepo.restore(fs, relPath, data);
        await reload();
      },

      createGoal: async (title, projectFile) => {
        const project = projects.find((p) => p.__file === projectFile);
        await goalRepo.create(fs, { title, created: new Date().toISOString(), fulfilled: false });
        if (project && !project.goals.includes(title)) {
          await projectRepo.update(fs, { ...project, goals: [...project.goals, title] });
        }
        await reload();
      },
      updateGoal: async (model) => {
        await goalRepo.update(fs, model);
        await reload();
      },
      renameGoal: async (model, newTitle) => {
        const owner = projectFor(model.title);
        await goalRepo.update(fs, { ...model, title: newTitle });
        if (owner) {
          await projectRepo.update(fs, {
            ...owner,
            goals: owner.goals.map((t) => (t === model.title ? newTitle : t)),
          });
        }
        await reload();
      },
      removeGoal: async (model) => {
        const owner = projectFor(model.title);
        if (owner) {
          await projectRepo.update(fs, {
            ...owner,
            goals: owner.goals.filter((t) => t !== model.title),
          });
        }
        await goalRepo.remove(fs, model);
        await reload();
      },
      restoreGoal: async (relPath, data) => {
        await goalRepo.restore(fs, relPath, data);
        await reload();
      },

      appendBlock: async (data) => {
        await blockRepo.append(fs, data);
        await reload();
      },
    }),
    [projects, goals, blocks, loading, loadError, reload, projectFor],
  );

  return (
    <FolderContext.Provider value={folderValue}>
      <DataContext.Provider value={dataValue}>
        <InteractionProvider>
          <ToastProvider>
            <TimerProvider>{children}</TimerProvider>
          </ToastProvider>
        </InteractionProvider>
      </DataContext.Provider>
    </FolderContext.Provider>
  );
}
