import { logger } from "@/shared/utils/logger";

type PersistSettingOptions<T> = {
  /** Value currently shown in the store. */
  previous: T;
  /** Value the user just chose. */
  next: T;
  /** Applies a value to the store (used optimistically and for rollback). */
  apply: (value: T) => void;
  /** Writes the value to SQLite. */
  persist: (value: T) => Promise<void>;
};

/**
 * Applies a setting optimistically, awaits the SQLite write, and restores the
 * previous value if the write fails.
 *
 * Returns `false` on failure so the caller can show a message. Settings are
 * local writes, so the awaited window is normally only a few milliseconds.
 */
export async function persistSetting<T>({
  previous,
  next,
  apply,
  persist,
}: PersistSettingOptions<T>): Promise<boolean> {
  apply(next);
  try {
    await persist(next);
    return true;
  } catch (error) {
    logger.error("Failed to persist setting", error);
    apply(previous);
    return false;
  }
}
