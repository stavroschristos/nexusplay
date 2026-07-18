import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

let cache = null;
let loadingPromise = null;

async function loadFlags() {
  if (cache) return cache;
  if (!loadingPromise) {
    loadingPromise = base44.entities.FeatureFlag.list()
      .then((f) => { cache = f; return f; })
      .catch(() => { cache = []; return []; });
  }
  return loadingPromise;
}

export function refreshFlags() {
  cache = null;
  loadingPromise = null;
  return loadFlags();
}

export function useFeatureFlag(key, fallback = false) {
  const [enabled, setEnabled] = useState(fallback);
  useEffect(() => {
    let active = true;
    loadFlags().then((flags) => {
      if (!active) return;
      const f = flags.find((x) => x.key === key);
      setEnabled(f ? f.enabled : fallback);
    });
    return () => { active = false; };
  }, [key]);
  return enabled;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState([]);
  useEffect(() => { loadFlags().then(setFlags); }, []);
  return flags;
}