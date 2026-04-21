let enabled = false;
const renderCounts = new Map<string, number>();

export const enableRenderCounters = (value: boolean) => {
  enabled = value;
};

export const recordRender = (name: string) => {
  if (!enabled) {
    return;
  }

  renderCounts.set(name, (renderCounts.get(name) ?? 0) + 1);
};

export const getRenderCountsSnapshot = () => {
  return Object.fromEntries(
    Array.from(renderCounts.entries()).sort(([left], [right]) => left.localeCompare(right)),
  );
};

export const resetRenderCounters = () => {
  renderCounts.clear();
};
