import { Fragment } from "react";

/** Render dictionary text that uses "\n" for a designed line break. */
export function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}
