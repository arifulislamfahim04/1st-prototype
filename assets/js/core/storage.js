/**
 * core/storage.js
 * Thin wrapper around localStorage. Private browsing modes, disabled
 * storage, or quota errors can all make localStorage throw on access —
 * every call here is guarded so a storage failure degrades silently
 * instead of breaking the module that uses it (e.g. theme just falls
 * back to the OS preference each visit instead of persisting).
 */

export function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — fail silently, nothing to recover here */
  }
}
