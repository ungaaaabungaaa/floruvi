export const boxSizes = [
  { id: "single", name: "Single", people: "1 person" },
  { id: "dual", name: "Dual", people: "2 people" },
  { id: "family", name: "Family", people: "4 or more" },
] as const;
export const boxSchedules = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "fortnightly", name: "Every 2 weeks" },
] as const;
export function getBoxRequest(size: unknown, schedule: unknown) {
  const box = boxSizes.find((b) => b.id === size);
  const delivery = boxSchedules.find((s) => s.id === schedule);
  if (!box || !delivery) return undefined;
  return {
    interest: `${box.name} box · ${box.people} · ${delivery.name}`,
    message: `I would like a ${box.name.toLowerCase()} vegetable box for ${box.people}, delivered ${delivery.name.toLowerCase()}. Please confirm the contents, price, and delivery coverage.`,
  };
}
