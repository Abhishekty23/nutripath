import { Leaf } from "lucide-react";

const items = [
  "Weight loss",
  "Muscle gain",
  "PCOS support",
  "Thyroid-friendly diets",
  "Diabetes-friendly meals",
  "Vegetarian & vegan",
  "Sports nutrition",
  "Gut health",
];

// Infinite scrolling strip of focus areas.
export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-slate-100 bg-white py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex w-max gap-10">
        {row.map((text, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap text-lg font-semibold text-slate-400">
            <Leaf size={18} className="text-emerald-500" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
