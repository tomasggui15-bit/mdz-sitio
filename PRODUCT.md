# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **dueños de casa** in Gran Mendoza who are building or renovating their own home. They are usually not from the trade: they don't always know exact part names or sizes, they have a job and little time, and they browse from their phone, often from the obra itself.

Secondary (confirmed as customers, not the main target of the site): plomeros, gasistas, electricistas and arquitectos who order repeatedly for several obras.

The job: get every material for the obra, complete and correct, without losing half a day going to a corralón.

## Product Purpose

Materiales MDZ (materialesmdz.com) is an online catalog of ~22,600 construction materials (agua, gas, electricidad, sanitarios, griferías, herramientas and more) with home delivery only in Gran Mendoza. The customer finds products, builds a list and sends it by WhatsApp; a real person replies the same day with the final price in pesos, delivery included, and the order is delivered to the obra in 24–48 business hours.

Success = more complete lists arriving on WhatsApp, and customers who come back for the next stage of their obra.

## Positioning

MDZ sells time and peace of mind, not the cheapest price:

- **No tiene que moverse:** everything is delivered to the obra.
- **Atención personal:** a person answers fast on WhatsApp and reviews the list, flagging what's missing — essential for a homeowner who isn't from the trade.
- **Todo en un solo pedido:** agua, gas, electricidad and sanitarios together, one delivery.

MDZ does not compete on price and the site never claims to be cheaper.

## Operating Context

- No physical store, no pickup: envío a domicilio only.
- No online checkout and no public prices: the site collects the order; the sale closes on WhatsApp with a quote (presupuesto).
- Network of vendedores: each has a personal link (`/v/<código>`); customers who arrive through it are routed to that vendedor's WhatsApp for 180 days and messages carry the vendedor code. Without a link, orders go to the main number (Tomás, 261 660-9480).
- The owner edits catalog, photos, categories, vendedores and social links from `/admin`.
- Payment: transferencia, Mercado Pago, efectivo contra entrega (consultar).

## Capabilities and Constraints

- Static site (HTML/CSS/JS, no framework), built on deploy by `tools/build.py`, hosted on Netlify (free plan: limited production deploys per month), domain materialesmdz.com.
- Catalog in `catalogo.json`; descriptions in `d/*.json`; product photos in sprite sheets `s2/` plus uploaded `fotos/`. ~5,000 products have photos; the rest show none yet.
- Thousands of SEO pages (`p/`, `r/`) are generated from the catalog; any visual change to product cards must also apply to those templates.
- All prices and amounts in pesos argentinos (ARS).
- Never show the supplier's name or codes; products carry MDZ codes.
- Never promise cuotas or "sin factura" on the site; never claim anything not true.

## Brand Commitments

- Name: Materiales MDZ / Materiales de Construcción MDZ. Instagram @materialesenmdz.
- Existing logo (circular MDZ mark with bricks), navy and obra-yellow identity, Barlow / Barlow Condensed type, obra hazard-stripe motif. The owner explicitly asked for the brand-logo marquee and the stick-figure "cómo comprar" animation.
- Voice: Spanish rioplatense, voseo, plain and direct ("te lo llevamos a la obra"), like a person talking, not corporate.
- The owner wants the site to **not look AI-generated**.

## Evidence on Hand

- Official brand logos of ~30 manufacturers (marcas/), manufacturer YouTube videos per brand.
- No real photos of deliveries, the team, the vehicle or the deposit yet.
- No testimonials or customer messages yet.
- Do NOT fabricate reviews, testimonials, customer counts, ratings or delivery stats. Add proof only when the owner provides it.

## Product Principles

1. Every screen moves a homeowner one step closer to sending a complete list by WhatsApp.
2. A human answers: show that a real person reviews the list; never hide behind automation.
3. Clarity over cleverness: a homeowner who doesn't know the trade must find the right part (types grouped, sizes in order, plain names).
4. Honest by default: no invented proof, no price claims, no promises the business can't keep.
5. Phone first: designed for one hand, on a phone, possibly in a dusty obra.

## Accessibility & Inclusion

Mobile-first, readable outdoors (strong contrast, large tap targets), respects reduced-motion. No formal standard established.
