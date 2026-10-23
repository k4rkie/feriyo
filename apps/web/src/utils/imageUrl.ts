const BASE_URL: string = import.meta.env.VITE_BASE_BACKEND_URL;

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path}`;
};
