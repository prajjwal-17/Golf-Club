# ProjectIntern

A Next.js MVP for the Digital Heroes golf charity subscription platform PRD.

## Features implemented

- Public landing page with charity-first positioning
- Subscriber dashboard with rolling 5-score Stableford logic
- Admin dashboard with draw simulation modes and prize tier calculations
- Charity directory and contribution summaries
- Winner verification and payout status presentation

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Routes

- `/` public homepage
- `/dashboard` subscriber view
- `/admin` admin control center

## Notes

This version uses seeded in-app sample data so the PRD flow can be reviewed locally without external services. The natural next step would be wiring auth, Stripe, and Supabase-backed persistence.

