const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return { data, headers: res.headers };
};

export const feedApi = {
  getAll: async ({ page = 1, limit = 20, category } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (category) params.set("category", category);
    const { data, headers } = await request(`/api/feed?${params}`);
    return {
      ...data,
      cacheStatus: headers.get("x-cache") || "MISS",
      cacheBackend: headers.get("x-cache-backend") || "unknown",
    };
  },

  create: async (feedData) => {
    const { data } = await request("/api/feed", {
      method: "POST",
      body: JSON.stringify(feedData),
    });
    return data;
  },

  health: async () => {
    const { data } = await request("/api/feed/health");
    return data;
  },
};
