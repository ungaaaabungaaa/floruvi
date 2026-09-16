"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { useCart } from "./cart-store";
import Link from "@/components/i18n/link";
import Image from "next/image";
import singleImage from "@/src/assets/boxes/single.webp";
import dualImage from "@/src/assets/boxes/dual.webp";
import familyImage from "@/src/assets/boxes/family.webp";
import leafy from "@/src/assets/products/banners/leafy.webp";
import salad from "@/src/assets/boxes/salad.webp";
import { ShoppingBag, Check, Leaf, Truck, Heart } from "lucide-react";
import type { BasketReview } from "@/lib/pricing";
import { boxSchedules } from "@/lib/boxes";
import type { RecipeSummary } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { productImages } from "@/lib/product-images";
import { Lines } from "./i18n/lines";
import { useI18n } from "./i18n/provider";

const images = { single: singleImage, dual: dualImage, family: familyImage };
type BoxId = keyof typeof images;

export function BoxSelector({
  plans,
  contents,
  recipes,
  labels,
}: {
  plans: (BasketReview & { id: BoxId })[];
  contents: { slug: string; name: string; packLabel: string }[];
  recipes: RecipeSummary[];
  labels: Messages["boxes"];
}) {
  const cart = useCart();
  const { t, fill, money, locale } = useI18n();
  const [status, setStatus] = useState<"idle" | "added" | "full">("idle");
  const [size, setSize] = useState<BoxId>("dual");
  const [schedule, setSchedule] = useState("weekly");
  const plan = plans.find((p) => p.id === size)!;
  const boxName = (id: BoxId) => t.boxes[id].name;
  const inlineBoxName =
    locale.language === "de" ? boxName(size) : boxName(size).toLocaleLowerCase(locale.tag);
  return (
    <div className="box-builder page-width">
      <section className="box-editorial-hero">
        <div>
          <span className="eyebrow">{labels.eyebrow}</span>
          <h1>
            <Lines text={labels.title} />
          </h1>
          <p>
            <Lines text={labels.intro} />
          </p>
          <div className="box-hero-values">
            <span>
              <Leaf />
              {labels.values.fresh}
            </span>
            <span>
              <Truck />
              {labels.values.regular}
            </span>
            <span>
              <Heart />
              {labels.values.good}
            </span>
          </div>
        </div>
        <div className="box-hero-image">
          <Image
            src={dualImage}
            alt={labels.heroAlt}
            fill
            sizes="(max-width:600px) 100vw, 50vw"
            preload
          />
        </div>
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(cart.add(`box-${size}-${schedule}`) ? "added" : "full");
        }}
      >
        <fieldset className="box-size-field">
          <legend>{labels.chooseBox}</legend>
          <p className="box-section-note">{labels.chooseNote}</p>
          <div className="box-plan-cards">
            {plans.map((box) => (
              <label
                className={`box-plan-card ${size === box.id ? "selected" : ""}`}
                key={box.id}
              >
                <Image
                  src={images[box.id]}
                  alt={fill(labels.boxAlt, { name: boxName(box.id) })}
                  width={110}
                  height={110}
                />
                <div>
                  <h2>{boxName(box.id)}</h2>
                  <p>{t.boxes[box.id].people}</p>
                  <strong>
                    {money(box.total)} <small>{t.boxes.perDelivery}</small>
                  </strong>
                </div>
                <input
                  type="radio"
                  name="box-size"
                  checked={size === box.id}
                  onChange={() => {
                    setSize(box.id);
                    setStatus("idle");
                  }}
                  value={box.id}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="box-delivery-layout">
          <div>
            <fieldset>
              <legend>{labels.frequency}</legend>
              <p className="box-section-note">{labels.frequencyNote}</p>
              <div className="box-frequency">
                {boxSchedules.map((option) => (
                  <label
                    className={schedule === option.id ? "selected" : ""}
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="box-schedule"
                      value={option.id}
                      checked={schedule === option.id}
                      onChange={() => {
                        setSchedule(option.id);
                        setStatus("idle");
                      }}
                    />
                    {t.boxes.schedules[option.id]}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="box-checkout-strip">
              <div aria-live="polite">
                <strong>
                  {money(plan.total)} <small>{t.boxes.perDelivery}</small>
                </strong>
              </div>
              <button
                type="submit"
                className="button button-primary"
                aria-live="polite"
                disabled={plan.total === null}
              >
                {status === "added" ? (
                  <>
                    <Check size={18} /> {labels.addedShort}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> {labels.addToCart}
                  </>
                )}
              </button>
              {status === "full" && (
                <p className="box-request-note" role="alert">
                  {labels.full}
                </p>
              )}
            </div>
          </div>
          <aside className="box-seasonal">
            <Image
              src={leafy}
              alt={labels.seasonalAlt}
              fill
              sizes="(max-width:700px) 100vw, 45vw"
            />
            <div>
              <h2>
                <Lines text={labels.seasonalTitle} />
              </h2>
              <p>{labels.seasonalText}</p>
            </div>
          </aside>
        </div>
        <section className="box-contents" aria-live="polite">
          <h2>{labels.insideTitle}</h2>
          <p className="box-section-note">
            {fill(labels.insideNote, { name: inlineBoxName })}
          </p>
          <div className="box-contents-grid">
            {plan.items.map((item) => {
              const product = contents.find((c) => c.slug === item.slug);
              return (
                <Link href={`/products/${item.slug}`} key={item.slug}>
                  <div className="box-content-image">
                    <Image
                      src={productImages[item.slug]}
                      alt={product?.name ?? item.name}
                      fill
                      sizes="(max-width:600px) 30vw, 16vw"
                    />
                  </div>
                  <h3>{product?.name ?? item.name}</h3>
                  <p>
                    {item.quantity} × {product?.packLabel || item.packLabel}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </form>
      <section className="box-food-story">
        <Image
          src={salad}
          alt={labels.storyAlt}
          width={420}
          height={300}
          sizes="(max-width: 600px) 100vw, 42vw"
        />
        <div>
          <h2>
            <Lines text={labels.storyTitle} />
          </h2>
          <p>{labels.storyText}</p>
          <div className="box-hero-values">
            <span>
              <Leaf />
              {labels.storyValues.ingredients}
            </span>
            <span>
              <Heart />
              {labels.storyValues.meals}
            </span>
          </div>
        </div>
      </section>
      <section className="box-faq">
        <h2>{labels.faqTitle}</h2>
        <Accordion type="single" defaultValue="faq-0">
          {labels.faq.map(([q, a], index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent>
                <p>{a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section
        className="product-ways box-recipes"
        aria-labelledby="box-recipes-heading"
      >
        <div className="product-section-heading">
          <h2 id="box-recipes-heading">{labels.recipesTitle}</h2>
        </div>
        <div className="product-meal-grid">
          {recipes.map((recipe) => (
            <Link
              className="product-meal"
              href={`/recipes/${recipe.slug}`}
              key={recipe.slug}
            >
              <div className="product-meal-image">
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  fill
                  sizes="(max-width:600px) 44vw, (max-width:900px) 30vw, 19vw"
                />
              </div>
              <h3>{recipe.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
