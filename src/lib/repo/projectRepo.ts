import { MODEL_DIRS } from '../fs/paths';
import type { FsBackend } from '../fs/types';
import type { FileBacked, Project } from '../models/types';
import {
  asString,
  asStringArray,
  collectPassthrough,
  create,
  loadAll,
  remove,
  update,
  writeAt,
  type Codec,
} from './base';

const DIR = MODEL_DIRS.project;

const codec: Codec<Project> = {
  ownedKeys: ['title', 'goals'],
  titleOf: (p) => p.title,
  fromJson(raw) {
    const title = asString(raw.title);
    if (!title) return null;
    return {
      title,
      goals: asStringArray(raw.goals),
      __passthrough: collectPassthrough(raw, this.ownedKeys),
    };
  },
  toJson: (p) => ({ title: p.title, goals: p.goals }),
};

export const projectRepo = {
  loadAll: (fs: FsBackend) => loadAll(fs, DIR, codec),
  create: (fs: FsBackend, data: Project) => create(fs, DIR, codec, data),
  update: (fs: FsBackend, model: FileBacked<Project>) => update(fs, codec, model),
  remove: (fs: FsBackend, model: FileBacked<Project>) => remove(fs, model.__file),
  restore: (fs: FsBackend, relPath: string, data: Project) => writeAt(fs, codec, relPath, data),
};
