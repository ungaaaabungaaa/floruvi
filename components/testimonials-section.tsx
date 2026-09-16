import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "Ever since I started ordering from Floruvi, dinner prep feels different — the spinach is still crisp on day three, and the tomatoes actually taste like tomatoes. My kids notice the difference too.",
    name: "Lakshmi Iyer",
    designation: "Home cook, Bengaluru",
    src: "https://images.unsplash.com/photo-1463335361701-e90f4c5045d0?w=600&q=80",
  },
  {
    quote:
      "I used to skip vegetables because whatever I bought at the market went bad in two days. Floruvi's boxes changed that completely — everything lasts, everything's fresh, and reordering takes ten seconds.",
    name: "Arjun Mehta",
    designation: "Software engineer, Pune",
    src: "https://images.unsplash.com/photo-1609770652127-4356e43fb575?w=600&q=80",
  },
  {
    quote:
      "Hosting dinner used to mean three separate grocery runs. Now it's one Floruvi box and I'm done — and their recipes give me a new idea every week I wouldn't have thought of myself.",
    name: "Priya Sharma",
    designation: "Marketing manager, Mumbai",
    src: "https://images.unsplash.com/photo-1595754883593-e274aaa13580?w=600&q=80",
  },
];

export function TestimonialsSection() {
  return <AnimatedTestimonials testimonials={testimonials} autoplay />;
}
