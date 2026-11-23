# NutriPath: Nutrition Plans & Consultation Booking

A full stack web app where users browse nutrition plans, book a consultation slot, pay online and receive a personalised diet plan in their dashboard. The nutritionist manages bookings, availability and clients from an admin panel.

> Demo project built for portfolio purposes. Not a real medical service.

## Tech stack
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (auth + Postgres) · Razorpay/Stripe (test mode) · Vercel

## Progress
- [x] Day 1: Landing page (responsive)
- [x] Day 2: Auth + database (Supabase, Row Level Security, login/signup, protected dashboards)
- [x] Day 3: Plans from the database, plan detail pages, admin plans manager (create, edit, hide)
- [ ] Day 4: Booking flow + payments
- [ ] Day 5: Admin dashboard
- [ ] Day 6: User dashboard + emails
- [ ] Day 7: Polish, demo logins, screenshots

## Run locally
1. Copy `.env.example` to `.env.local` and add your Supabase publishable key
2. Run the SQL in `supabase/schema.sql` once in Supabase → SQL Editor

```bash
npm install
npm run dev
```
Open http://localhost:3000
