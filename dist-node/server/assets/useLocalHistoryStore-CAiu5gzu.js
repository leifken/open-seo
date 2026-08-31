import { useRef, useState, useEffect, useCallback } from "react";
function loadHistory(storageKey, parse, maxItems) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = parse(raw);
    return parsed ? parsed.slice(0, maxItems) : [];
  } catch {
    return [];
  }
}
function saveHistory(storageKey, items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
  }
}
function useLocalHistoryStore({
  storageKey,
  maxItems = 20,
  parse,
  isSameItem,
  createItem,
  getItemKey
}) {
  const parseRef = useRef(parse);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    parseRef.current = parse;
  }, [parse]);
  useEffect(() => {
    setHistory(loadHistory(storageKey, parseRef.current, maxItems));
    setIsLoaded(true);
  }, [maxItems, storageKey]);
  const addItem = useCallback(
    (input) => {
      setHistory((prev) => {
        const filtered = prev.filter(
          (existing) => !isSameItem(existing, input)
        );
        const next = [createItem(input), ...filtered].slice(0, maxItems);
        saveHistory(storageKey, next);
        return next;
      });
    },
    [createItem, isSameItem, maxItems, storageKey]
  );
  const removeItem = useCallback(
    (itemKey) => {
      setHistory((prev) => {
        const next = prev.filter((item) => getItemKey(item) !== itemKey);
        saveHistory(storageKey, next);
        return next;
      });
    },
    [getItemKey, storageKey]
  );
  const clearItems = useCallback(() => {
    setHistory([]);
    saveHistory(storageKey, []);
  }, [storageKey]);
  return { history, isLoaded, addItem, removeItem, clearItems };
}
export {
  useLocalHistoryStore as u
};
