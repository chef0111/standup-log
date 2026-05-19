export type SelectedRepository = {
  id: number;
  full_name: string;
  private: boolean;
};

export function parseSelectedRepositories(raw: unknown): SelectedRepository[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: SelectedRepository[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const rec = item as Record<string, unknown>;
    const id = typeof rec.id === 'number' ? rec.id : Number(rec.id);
    const full_name = typeof rec.full_name === 'string' ? rec.full_name : null;
    const isPrivate = typeof rec.private === 'boolean' ? rec.private : rec.private === 'true';
    if (!Number.isFinite(id) || !full_name) {
      continue;
    }
    out.push({ id, full_name, private: Boolean(isPrivate) });
  }
  return out;
}

export const FREE_TIER_REPO_LIMIT = 3;
