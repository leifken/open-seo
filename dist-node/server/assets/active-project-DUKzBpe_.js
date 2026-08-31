const LAST_PROJECT_KEY = "openseo:lastProjectId";
function getLastProjectId() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}
function setLastProjectId(projectId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
  }
}
function clearLastProjectId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_PROJECT_KEY);
  } catch {
  }
}
export {
  clearLastProjectId as c,
  getLastProjectId as g,
  setLastProjectId as s
};
