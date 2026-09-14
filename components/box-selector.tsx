"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import singleImage from "@/src/assets/boxes/single.webp";
import dualImage from "@/src/assets/boxes/dual.webp";
import familyImage from "@/src/assets/boxes/family.webp";
import { ArrowRight } from "lucide-react";
import { formatMoney, type BasketReview } from "@/lib/pricing";
import { boxSizes, boxSchedules } from "@/lib/boxes";
export function BoxSelector({
  plans,
}: {
  plans: (BasketReview & { id: string; name: string; people: string })[];
}) {
  const [size, setSize] = useState("dual");
  const [schedule, setSchedule] =
    useState<(typeof boxSchedules)[number]["id"]>("weekly");
  const deliverySchedule = boxSchedules.find(
    (option) => option.id === schedule,
  )!;
  const plan = plans.find((p) => p.id === size)!;
  const boxImage = {
    single: singleImage,
    dual: dualImage,
    family: familyImage,
  }[size as "single" | "dual" | "family"];
  return (
    <section className="page-width section boxes-page">
      <div className="box-photo">
        <Image
          key={size}
          src={boxImage}
          alt={`${plan.name.toLowerCase()} vegetable box with lettuce, spinach, cherry tomatoes, cucumber, carrots and mint`}
          fill
          sizes="(max-width:800px) 100vw, 48vw"
          preload={size === "dual"}
        />
        <span className="box-photo-note">{plan.name} box</span>
      </div>
      <div className="box-copy">
        <span className="eyebrow">VEGETABLE SUBSCRIPTIONS</span>
        <h1>
          Your box.
          <br />
          <em>Your routine.</em>
        </h1>
        <div className="box-selector">
          <fieldset>
            <legend>Choose your box</legend>
            <div className="box-options">
              {boxSizes.map((box) => (
                <label
                  key={box.id}
                  className={
                    size === box.id ? "box-option selected" : "box-option"
                  }
                >
                  <input
                    type="radio"
                    name="box-size"
                    value={box.id}
                    checked={size === box.id}
                    onChange={() => setSize(box.id)}
                  />
                  <strong>{box.name}</strong>
                  <span>{box.people}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Delivery</legend>
            <div className="box-schedules">
              {boxSchedules.map((option) => (
                <label
                  key={option.id}
                  className={schedule === option.id ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="box-schedule"
                    value={option.id}
                    checked={schedule === option.id}
                    onChange={() => setSchedule(option.id)}
                  />
                  {option.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="box-includes" aria-live="polite">
            <div className="box-price">
              <strong>{formatMoney(plan.total)}</strong>
              <span>{deliverySchedule.pricePeriod} · delivery included</span>
            </div>
            <h2>What’s in your box</h2>
            <ul>
              {plan.items.map((item) => (
                <li key={item.slug}>
                  <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  <span>
                    {item.quantity} × {item.packLabel}
                  </span>
                </li>
              ))}
            </ul>
            <div className="box-price-breakdown">
              <span>Produce {formatMoney(plan.subtotal)}</span>
              <span>Delivery {formatMoney(plan.delivery)}</span>
            </div>
            <p>
              One {plan.name.toLowerCase()} box {deliverySchedule.pricePeriod}.
            </p>
          </div>
          <Link
            className="button button-primary"
            href={`/contact?box=${size}&schedule=${schedule}`}
          >
            Request subscription <ArrowRight size={17} />
          </Link>
          <p className="box-note">
            Delivery across India. No payment is taken with this request.
          </p>
        </div>
      </div>
    </section>
  );
}
