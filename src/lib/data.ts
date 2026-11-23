// All website content lives here. Change text, prices or plans in this one file.

export const site = {
  name: "NutriPath",
  nutritionist: "Dr. Ananya Mehra",
  title: "Certified Clinical Nutritionist",
  email: "hello@nutripath.demo",
  phone: "+91 98765 43210",
};

export const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Plans", href: "#plans" },
  { label: "About", href: "#about" },
  { label: "Reviews", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export const hero = {
  badge: "Personalised nutrition, made simple",
  headline: "Eat better. Feel better. Live better.",
  subtext:
    "Get a diet plan built around your body, your goals and the food you actually enjoy. Book a 1-on-1 consultation online in under 2 minutes.",
  stats: [
    { value: "2,000+", label: "Happy clients" },
    { value: "8+", label: "Years experience" },
    { value: "4.9/5", label: "Average rating" },
  ],
};

export const steps = [
  {
    title: "Choose your plan",
    description: "Pick the plan that matches your goal, whether that's weight loss, muscle gain or just eating healthier.",
  },
  {
    title: "Book a slot",
    description: "Select a date and time that suits you, fill a short health form and pay securely online.",
  },
  {
    title: "Get your diet plan",
    description: "After your consultation, your personalised meal plan appears right in your dashboard.",
  },
];

export type Plan = {
  id: string;
  title: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "consultation",
    title: "Single Consultation",
    duration: "30 minutes",
    price: 499,
    description: "One video call to review your diet and get clear next steps.",
    features: ["30-min video call", "Diet & lifestyle review", "Quick action plan PDF"],
  },
  {
    id: "weight-loss",
    title: "Weight Loss Plan",
    duration: "1 month",
    price: 1999,
    description: "A sustainable plan to lose weight without crash diets.",
    features: ["2 consultations", "Custom weekly meal plan", "WhatsApp support", "Weekly progress check"],
    popular: true,
  },
  {
    id: "muscle-gain",
    title: "Muscle Gain Plan",
    duration: "1 month",
    price: 2499,
    description: "High-protein meals planned around your workouts.",
    features: ["2 consultations", "Protein-focused meal plan", "Supplement guidance", "Weekly progress check"],
  },
  {
    id: "wellness",
    title: "3-Month Wellness Plan",
    duration: "3 months",
    price: 4999,
    description: "Long-term support for healthy habits that actually stick.",
    features: ["6 consultations", "Monthly updated meal plans", "Priority WhatsApp support", "Progress tracker access"],
  },
];

export const about = {
  bio: "Hi, I'm Ananya. For over 8 years I've helped people lose weight, build strength and feel more energetic, all without giving up the food they love. I believe good nutrition should fit into your life, not take it over.",
  highlights: ["M.Sc. Food & Nutrition", "Certified Diabetes Educator", "2,000+ clients across 12 countries"],
};

export const testimonials = [
  {
    name: "Priya S.",
    location: "Delhi",
    text: "Lost 7 kg in 3 months and I never felt hungry. The meal plan used normal home food, which made it so easy to follow.",
  },
  {
    name: "Rahul K.",
    location: "Bengaluru",
    text: "The muscle gain plan was exactly what I needed. Clear, practical and the weekly check-ins kept me on track.",
  },
  {
    name: "Sarah M.",
    location: "London",
    text: "Booking was super simple and the consultation was really thorough. I finally understand what my body needs.",
  },
];

export const faqs = [
  {
    q: "How does the online consultation work?",
    a: "After booking, you get a video call link by email. The call happens at your chosen time, and your diet plan is added to your dashboard afterwards.",
  },
  {
    q: "Do I need to buy special foods?",
    a: "No. Plans are built around regular, easily available food and your own preferences, veg or non-veg.",
  },
  {
    q: "Can I reschedule my booking?",
    a: "Yes, you can reschedule up to 12 hours before your slot from your dashboard.",
  },
  {
    q: "Is my health information private?",
    a: "Yes. Your health form is only visible to you and your nutritionist.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, debit/credit cards and net banking through a secure payment gateway.",
  },
];
