import { fill, formatCurrency } from "./i18n/format";
import type { Messages } from "./i18n/messages";

/**
 * FAQ answers for one site version. Export countries get their own delivery
 * answers. Shared by the FAQ page and the chat assistant, so both say the same.
 */
export function faqGroups(
  t: Messages["faq"],
  version: { domestic: boolean; countryName: string; tag: string; deliveryFeeMinor?: number | null },
) {
  const deliveryFee =
    version.deliveryFeeMinor == null
      ? t.deliveryFeeMissing
      : fill(t.deliveryFee, { fee: formatCurrency(version.deliveryFeeMinor, "INR", version.tag) });
  const exportAnswers = new Map([
    [t.groups.delivery.questions[0][0], t.export.where],
    [t.groups.delivery.questions[1][0], t.export.cost],
    [t.groups.boxes.questions[3][0], t.export.boxDelivery],
  ]);
  return Object.entries(t.groups).map(([id, group]) => ({
    id,
    title: group.title,
    questions: group.questions.map(([question, answer]) => {
      const [q, a] = (!version.domestic && exportAnswers.get(question)) || [question, answer];
      return [q, fill(a, { deliveryFee, country: version.countryName })] as [string, string];
    }),
  }));
}
