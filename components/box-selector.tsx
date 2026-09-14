"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { boxSizes, boxSchedules } from "@/lib/boxes";
export function BoxSelector() {
  const [size, setSize] = useState("dual");
  const [schedule, setSchedule] = useState("weekly");
  return (
    <div className="box-selector">
      <fieldset>
        <legend>Choose your box</legend>
        <div className="box-options">
          {boxSizes.map((box) => (
            <label
              key={box.id}
              className={size === box.id ? "box-option selected" : "box-option"}
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
      <Link
        className="button button-primary"
        href={`/contact?box=${size}&schedule=${schedule}`}
      >
        Request subscription <ArrowRight size={17} />
      </Link>
      <p className="box-note">
        We’ll confirm contents, price, and delivery before you subscribe.
      </p>
    </div>
  );
}
