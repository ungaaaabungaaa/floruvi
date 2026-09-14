import { Sprout, ArrowDownRight } from "lucide-react";
import { EnquiryForm } from "./enquiry-form";
export function EnquiryPage({
  business,
  product,
}: {
  business: boolean;
  product?: string;
}) {
  return (
    <div className="page-width section enquiry-layout">
      <div className="enquiry-intro">
        <span className="eyebrow">
          {business ? "FOR BUSINESSES" : "FROM OUR GROWING LIST TO YOUR HOME"}
        </span>
        <h1>
          {business ? (
            <>
              A good ingredient.
              <br />
              <em>A better beginning.</em>
            </>
          ) : (
            <>
              Let’s talk
              <br />
              <em>something fresh.</em>
            </>
          )}
        </h1>
        <p>
          {business
            ? "From a neighbourhood café to a busy professional kitchen. Tell us what you need, and let’s explore the possibilities."
            : "Have a crop in mind? Planning your weekly greens? Send us a note and tell us what you’re looking for."}
        </p>
        <div className="enquiry-steps">
          <span className="eyebrow">KEEPING IT SIMPLE</span>
          {[
            "Tell us what you need.",
            "We review the crop, quantity, and location.",
            "We confirm availability and next steps.",
          ].map((step, i) => (
            <div key={step}>
              <span>0{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <div className="enquiry-note">
          <Sprout size={27} />
          <p>
            Every good thing starts
            <br />
            with a conversation.
          </p>
          <ArrowDownRight size={29} />
        </div>
      </div>
      <EnquiryForm
        kind={business ? "business" : "personal"}
        product={product}
      />
    </div>
  );
}
