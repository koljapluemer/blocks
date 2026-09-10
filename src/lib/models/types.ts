/** Unknown top-level keys from the on-disk file, round-tripped verbatim on write. */
export type Passthrough = Record<string, unknown>;

export type Project = {
  title: string;
  /** Goal titles nested under this project. Authoritative membership list. */
  goals: string[];
  __passthrough?: Passthrough;
};

export type Goal = {
  /** Globally unique — used for reverse lookup from blocks and projects. */
  title: string;
  /** ISO timestamp, set once on creation. */
  created: string;
  fulfilled: boolean;
  __passthrough?: Passthrough;
};

export type Block = {
  /** ISO timestamp of when the block started. */
  started: string;
  /** Goal title string (not a filename). May not match any persisted goal. */
  goal: string;
  /** Project title string at the time the block ran (may be ''). */
  project: string;
  isClean: boolean;
  __passthrough?: Passthrough;
};

/** In-memory only: the source model plus its relPath in the data folder. Stripped on write. */
export type FileBacked<T> = T & { __file: string };
