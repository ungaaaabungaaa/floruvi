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
    src: "https://images.unsplash.com/photo-1573497019707-1c04de26e58c?w=600&q=80",
  },
  {
    quote:
      "In my kitchen the produce has to be right or the dish falls apart. Floruvi's herbs actually taste like something — I've stopped making the trip to the wholesale market before service.",
    name: "Rohan Kapoor",
    designation: "Chef, Delhi",
    src: "https://images.unsplash.com/photo-1757744705465-ea08b0ddc38a?w=600&q=80",
  },
  {
    quote:
      "I don't want to haggle at the market every morning anymore. Floruvi brings the same quality straight to my door, and my grandchildren finally eat their greens without a fuss.",
    name: "Meera Nair",
    designation: "Homemaker, Chennai",
    src: "https://images.unsplash.com/photo-1533128361669-69c065857a13?w=600&q=80",
  },
  {
    quote:
      "I've tried every delivery service in the city for the restaurant's herbs and greens. Floruvi is the only one where what arrives actually matches what I ordered — no substitutions, every time.",
    name: "Vikram Rao",
    designation: "Restaurant owner, Hyderabad",
    src: "https://images.unsplash.com/photo-1600878459138-e1123b37cb30?w=600&q=80",
  },
];

export function TestimonialsSection() {
  return <AnimatedTestimonials testimonials={testimonials} autoplay />;
}
