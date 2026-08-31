export const configuredApiBase = () => {
  const explicit = window.__HIM_API_BASE__;
  const hosted = location.hostname.endsWith("github.io") ? document.querySelector('meta[name="him-api-base"]')?.content : "";
  return String(explicit || hosted || "").replace(/\/$/, "");
};
export const staticImportUnavailable = () => location.hostname.endsWith("github.io") && !configuredApiBase();

export const metadataApiRequest = async (endpoint, options) => {
  if (staticImportUnavailable()) throw new Error("This static site has no metadata adapter connected. Run the local Node service or configure a hosted API base.");
  const response = await fetch(configuredApiBase() + endpoint, options);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) throw new Error("Public metadata import requires the local Node server and is unavailable on this static Pages build.");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The metadata service could not complete this request.");
  return result;
};
