import { MODEL_DIRS } from '../fs/paths';
import type { FsBackend } from '../fs/types';
import type { FileBacked, Goal } from '../models/types';
import {
  asBool,
  asString,
  collectPassthrough,
  create,
  loadAll,
  remove,
  update,
  writeAt,
  type Codec,
} from './base';

const DIR = MODEL_DIRS.goal;

const codec: Codec<Goal> = {
  ownedKeys: ['title', 'created', 'fulfilled'],
  titleOf: (g) => g.title,
  fromJson(raw) {
    const title = asString(raw.title);
    if (!title) return null;
    return {
      title,
      created: asString(raw.created) || new Date().toISOString(),
      fulfilled: asBool(raw.fulfilled),
      __passthrough: collectPassthrough(raw, this.ownedKeys),
    };
  },
  toJson: (g) => ({ title: g.title, created: g.created, fulfilled: g.fulfilled }),
};

export const goalRepo = {
  loadAll: (fs: FsBackend) => loadAll(fs, DIR, codec),
  create: (fs: FsBackend, data: Goal) => create(fs, DIR, codec, data),
  update: (fs: FsBackend, model: FileBacked<Goal>) => update(fs, codec, model),
  remove: (fs: FsBackend, model: FileBacked<Goal>) => remove(fs, model.__file),
  restore: (fs: FsBackend, relPath: string, data: Goal) => writeAt(fs, codec, relPath, data),
};
