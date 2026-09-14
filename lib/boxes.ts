export const boxSizes = [
  { id: "single", name: "Single", people: "1 person" },
  { id: "dual", name: "Dual", people: "2 people" },
  { id: "family", name: "Family", people: "4 or more" },
] as const;
export const boxSchedules = [
  { id: "once", name: "Once", pricePeriod: "per delivery" },
  { id: "weekly", name: "Weekly", pricePeriod: "per delivery" },
  { id: "monthly", name: "Monthly", pricePeriod: "per delivery" },
] as const;
export function getBoxRequest(size: unknown, schedule: unknown) {
  const box = boxSizes.find((b) => b.id === size);
  const delivery = boxSchedules.find((s) => s.id === schedule);
  if (!box || !delivery) return undefined;
  return {
    interest: `${box.name} box · ${box.people} · ${delivery.name}`,
    message: `I would like a ${box.name.toLowerCase()} vegetable box for ${box.people}, delivered ${delivery.name.toLowerCase()}. Please arrange the first delivery with me.`,
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

export function getCartBox(slug: string) {
  for (const [index, size] of boxSizes.entries()) {
    // Preserve the meaning of boxes already saved in a guest basket.
    for (const schedule of [...boxSchedules,
      { id: "daily", name: "Once a day" },
      { id: "fortnightly", name: "Every 2 weeks" },
    ]) {
      if (slug === `box-${size.id}-${schedule.id}`) {
        return {
          ...size,
          schedule: schedule.name,
          multiplier: [1, 2, 4][index],
          name: `${size.name} box · ${schedule.name}`,
        };
      }
    }
  }
  return undefined;
}
