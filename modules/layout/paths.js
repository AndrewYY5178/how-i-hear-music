const inferredRoot = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");

export const basePath = inferredRoot;

export const withBase = (route, base = basePath) => {
  const normalized = String(route || "/").startsWith("/") ? String(route || "/") : `/${route}`;
  return `${String(base || "").replace(/\/$/, "")}${normalized}` || "/";
};

export const withoutBase = (pathname, base = basePath) => {
  const normalizedBase = String(base || "").replace(/\/$/, "");
  if (!normalizedBase) return pathname || "/";
  if (pathname === normalizedBase || pathname === `${normalizedBase}/`) return "/";
  return pathname.startsWith(`${normalizedBase}/`) ? pathname.slice(normalizedBase.length) || "/" : pathname;
};
