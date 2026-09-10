import { MODEL_DIRS } from '../fs/paths';
import type { FsBackend } from '../fs/types';
import type { Block } from '../models/types';
import {
  asBool,
  asString,
  collectPassthrough,
  create,
  loadAll,
  type Codec,
} from './base';

const DIR = MODEL_DIRS.block;

const codec: Codec<Block> = {
  ownedKeys: ['started', 'goal', 'project', 'isClean'],
  titleOf: (b) => `${b.started.slice(0, 16)} ${b.goal}`,
  fromJson(raw) {
    const started = asString(raw.started);
    if (!started) return null;
    return {
      started,
      goal: asString(raw.goal),
      project: asString(raw.project),
      isClean: asBool(raw.isClean),
      __passthrough: collectPassthrough(raw, this.ownedKeys),
    };
  },
  toJson: (b) => ({
    started: b.started,
    goal: b.goal,
    project: b.project,
    isClean: b.isClean,
  }),
};

export const blockRepo = {
  loadAll: (fs: FsBackend) => loadAll(fs, DIR, codec),
  /** Blocks are only ever appended, never edited after evaluation. */
  append: (fs: FsBackend, data: Block) => create(fs, DIR, codec, data),
};
