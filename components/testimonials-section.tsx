import { publicImage } from "@/lib/public-images";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "Ever since I started ordering from Floruvi, dinner prep feels different — the spinach is still crisp on day three, and the tomatoes actually taste like tomatoes. My kids notice the difference too.",
    name: "Lakshmi Iyer",
    designation: "Home cook, Bengaluru",
    src: publicImage("flourvi/external/testimonials/photo-1463335361701-e90f4c5045d0.847d9519bffb887b.webp", 600, 900).src,
  },
  {
    quote:
      "I used to skip vegetables because whatever I bought at the market went bad in two days. Floruvi's boxes changed that completely — everything lasts, everything's fresh, and reordering takes ten seconds.",
    name: "Arjun Mehta",
    designation: "Software engineer, Pune",
    src: publicImage("flourvi/external/testimonials/photo-1609770652127-4356e43fb575.e977a0cd3387674f.webp", 600, 1067).src,
  },
  {
    quote:
      "Hosting dinner used to mean three separate grocery runs. Now it's one Floruvi box and I'm done — and their recipes give me a new idea every week I wouldn't have thought of myself.",
    name: "Priya Sharma",
    designation: "Marketing manager, Mumbai",
    src: publicImage("flourvi/external/testimonials/photo-1573497019707-1c04de26e58c.85d442b1b1477dc6.webp", 600, 900).src,
  },
  {
    quote:
      "In my kitchen the produce has to be right or the dish falls apart. Floruvi's herbs actually taste like something — I've stopped making the trip to the wholesale market before service.",
    name: "Rohan Kapoor",
    designation: "Chef, Delhi",
    src: publicImage("flourvi/external/testimonials/photo-1757744705465-ea08b0ddc38a.5af0615073ee4cd6.webp", 600, 400).src,
  },
  {
    quote:
      "I don't want to haggle at the market every morning anymore. Floruvi brings the same quality straight to my door, and my grandchildren finally eat their greens without a fuss.",
    name: "Meera Nair",
    designation: "Homemaker, Chennai",
    src: publicImage("flourvi/external/testimonials/photo-1533128361669-69c065857a13.f6c14dce8223cae3.webp", 600, 800).src,
  },
  {
    quote:
      "I've tried every delivery service in the city for the restaurant's herbs and greens. Floruvi is the only one where what arrives actually matches what I ordered — no substitutions, every time.",
    name: "Vikram Rao",
    designation: "Restaurant owner, Hyderabad",
    src: publicImage("flourvi/external/testimonials/photo-1600878459138-e1123b37cb30.8074ec0fefbc0852.webp", 600, 859).src,
  },
];

export function TestimonialsSection() {
  return <AnimatedTestimonials testimonials={testimonials} autoplay />;
}
