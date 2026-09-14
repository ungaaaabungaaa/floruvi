export const boxSizes = [
  { id: "single", name: "Single", people: "1 person" },
  { id: "dual", name: "Dual", people: "2 people" },
  { id: "family", name: "Family", people: "4 or more" },
] as const;
export const boxSchedules = [
  { id: "daily", name: "Daily", pricePeriod: "per day" },
  { id: "weekly", name: "Weekly", pricePeriod: "per week" },
  { id: "fortnightly", name: "Every 2 weeks", pricePeriod: "every 2 weeks" },
] as const;
export function getBoxRequest(size: unknown, schedule: unknown) {
  const box = boxSizes.find((b) => b.id === size);
  const delivery = boxSchedules.find((s) => s.id === schedule);
  if (!box || !delivery) return undefined;
  return {
    interest: `${box.name} box · ${box.people} · ${delivery.name}`,
    message: `I would like a ${box.name.toLowerCase()} vegetable box for ${box.people}, delivered ${delivery.name.toLowerCase()}. Please arrange this subscription and confirm the first delivery date.`,
  };
}

export const boxContents = [
  { slug: "butterhead-lettuce", quantity: 1 },
  { slug: "spinach", quantity: 1 },
  { slug: "cherry-tomatoes", quantity: 1 },
  { slug: "cucumber", quantity: 1 },
  { slug: "carrot", quantity: 1 },
  { slug: "mint", quantity: 1 },
];
