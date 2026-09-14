"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { useCart } from "./cart-store";
import Link from "next/link";
import Image from "next/image";
import singleImage from "@/src/assets/boxes/single.webp";
import dualImage from "@/src/assets/boxes/dual.webp";
import familyImage from "@/src/assets/boxes/family.webp";
import leafy from "@/src/assets/products/banners/leafy.webp";
import salad from "@/src/assets/boxes/salad.webp";
import { ShoppingBag, Check, Leaf, Truck, Heart } from "lucide-react";
import { formatMoney, type BasketReview } from "@/lib/pricing";
import { boxSchedules } from "@/lib/boxes";
import type { Recipe } from "@/lib/recipes";
import { productImages } from "@/lib/product-images";
const images = { single: singleImage, dual: dualImage, family: familyImage };
export function BoxSelector({
  plans,
  recipes,
}: {
  recipes: Recipe[];
  plans: (BasketReview & { id: string; name: string; people: string })[];
}) {
  const cart = useCart();
  const [message, setMessage] = useState("");
  const [size, setSize] = useState("dual");
  const [schedule, setSchedule] = useState("weekly");
  const delivery = boxSchedules.find((s) => s.id === schedule)!;
  const plan = plans.find((p) => p.id === size)!;
  return (
    <div className="box-builder page-width">
      <section className="box-editorial-hero">
        <div>
          <span className="eyebrow">VEGETABLE SUBSCRIPTIONS</span>
          <h1>
            Good food,
            <br />
            on repeat.
          </h1>
          <p>
            Fresh vegetables delivered to your door.
            <br />
            Your box. Your routine.
          </p>
          <div className="box-hero-values">
            <span>
              <Leaf />
              Fresh produce
            </span>
            <span>
              <Truck />
              Regular delivery
            </span>
            <span>
              <Heart />
              Good food
            </span>
          </div>
        </div>
        <div className="box-hero-image">
          <Image
            src={dualImage}
            alt="A vegetable box with lettuce, spinach, tomatoes, carrots, cucumber & mint"
            fill
            sizes="(max-width:600px) 100vw, 50vw"
            preload
          />
        </div>
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(
            cart.add(`box-${size}-${schedule}`)
              ? "Added to your cart."
              : "Your basket is full. Please review it before adding more.",
          );
        }}
      >
        <fieldset className="box-size-field">
          <legend>Choose your box</legend>
          <p className="box-section-note">
            Same freshness. A size for every household.
          </p>
          <div className="box-plan-cards">
            {plans.map((box) => (
              <label
                className={`box-plan-card ${size === box.id ? "selected" : ""}`}
                key={box.id}
              >
                <Image
                  src={images[box.id as keyof typeof images]}
                  alt={`${box.name} vegetable box`}
                  width={110}
                  height={110}
                />
                <div>
                  <h2>{box.name}</h2>
                  <p>{box.people}</p>
                  <strong>
                    {formatMoney(box.total)}{" "}
                    <small>{delivery.pricePeriod}</small>
                  </strong>
                </div>
                <input
                  type="radio"
                  name="box-size"
                  checked={size === box.id}
                  onChange={() => {
                    setSize(box.id);
                    setMessage("");
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
              <legend>Delivery frequency</legend>
              <p className="box-section-note">
                Choose how often you would like your box.
              </p>
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
                        setMessage("");
                      }}
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="box-checkout-strip">
              <div aria-live="polite">
                <strong>
                  {formatMoney(plan.total)}{" "}
                  <small>{delivery.pricePeriod}</small>
                </strong>

              </div>
              <button
                type="submit"
                className="button button-primary"
                aria-live="polite"
                disabled={plan.total === null}
              >
                {message === "Added to your cart." ? (
                  <>
                    <Check size={18} /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to cart
                  </>
                )}
              </button>
              {message && message !== "Added to your cart." && (
                <p className="box-request-note" role="alert">
                  {message}
                </p>
              )}
            </div>
          </div>
          <aside className="box-seasonal">
            <Image
              src={leafy}
              alt="Fresh leafy greens"
              fill
              sizes="(max-width:700px) 100vw, 45vw"
            />
            <div>
              <h2>
                A fresh mix.
                <br />A familiar routine.
              </h2>
              <p>
                Greens, vegetables & herbs for the meals you make every day.
              </p>
            </div>
          </aside>
        </div>
        <section className="box-contents" aria-live="polite">
          <h2>What’s inside?</h2>
          <p className="box-section-note">
            Your {plan.name.toLowerCase()} box includes:
          </p>
          <div className="box-contents-grid">
            {plan.items.map((item) => (
              <Link href={`/products/${item.slug}`} key={item.slug}>
                <div className="box-content-image">
                  <Image
                    src={productImages[item.slug]}
                    alt={item.name}
                    fill
                    sizes="(max-width:600px) 30vw, 16vw"
                  />
                </div>
                <h3>{item.name}</h3>
                <p>
                  {item.quantity} × {item.packLabel}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </form>
      <section className="box-food-story">
        <Image
          src={salad}
          alt="A fresh vegetable salad"
          width={420}
          height={300}
          sizes="(max-width: 600px) 100vw, 42vw"
        />
        <div>
          <h2>
            Real food.
            <br />
            Everyday favourites.
          </h2>
          <p>Start with a box of fresh ingredients. Make it your own.</p>
          <div className="box-hero-values">
            <span>
              <Leaf />
              Fresh ingredients
            </span>
            <span>
              <Heart />
              Meals to enjoy
            </span>
          </div>
        </div>
      </section>
      <section className="box-faq">
        <h2>Frequently asked questions</h2>
        <Accordion type="single" defaultValue="faq-0">
          {[
            [
              "What is included in the price?",
              "The price is for one box per delivery. There is no extra delivery charge for boxes.",
            ],
            [
              "When will my first box arrive?",
              "The farm will arrange your first delivery with you.",
            ],
            [
              "Is payment taken when I add a box?",
              "No. Your box & frequency are saved in your cart. Recurring billing is not active yet.",
            ],
            [
              "Can I change the box or delivery schedule?",
              "Tell us what you need when we confirm your request. Contact the farm to discuss changes to an arranged delivery.",
            ],
          ].map(([q, a], index) => (
            <AccordionItem key={q} value={`faq-${index}`}>
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
          <h2 id="box-recipes-heading">Recipes for your box</h2>
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
