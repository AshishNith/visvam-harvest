# Viśvam — Order ID Nomenclature & Generation Spec

**Owner:** Arjit · **For:** Web developer · **Scope:** Order numbering for orders placed on visvam.in (custom site, Razorpay + Shiprocket)

---

## 1. Format

```
VSV-<CH>-<YYMMDD>-<NNN>
```

**Examples**
- `VSV-W-260909-007` → 7th web order on 09 Sep 2026
- `VSV-G-260909-003` → 3rd gifting order that day

| Segment | Meaning | Rule |
|---|---|---|
| `VSV` | Brand prefix | Fixed |
| `CH` | Channel | See §2 |
| `YYMMDD` | Order date | **IST (Asia/Kolkata)**, see §4.3 |
| `NNN` | Daily counter | Resets at IST midnight, zero-padded, extends to 4 digits past 999 |

The counter is **shared** across all orders for the day (prepaid and COD alike). Payment method is stored as its own field on the order record — it is not encoded in the ID.

This is the **master order ID**. It goes into Shiprocket's order-reference field. Razorpay's `pay_xxx` is stored *against* the order, never merged into this ID.

## 2. Channel codes

| Code | Channel |
|---|---|
| `W` | Website / D2C — default |
| `G` | Gifting / corporate |
| `S` | Subscription — reserved |
| `M` | Marketplace (Amazon etc.) — reserved |
| `R` | Wholesale / retail direct |

## 3. What must NOT go in the order ID

- **Batch / lot number.** Traceability (FSSAI Schedule 4) lives on the product/shipment record, linked to the order in the DB. One order can draw from multiple batches — encoding a batch here breaks the moment that happens.
- **Payment method, customer ID, pincode, amount, or any PII.** Payment method (prepaid/COD) is a field on the order, not part of the ID.

## 4. Generation rules (all four are mandatory)

### 4.1 Mint on confirmed order only — forks by payment type
- **Prepaid:** issue the number on Razorpay `payment.captured` webhook — **not** at checkout start. Use a temporary `cart_ref` while the customer pays. No number is ever burned on an abandoned/failed payment.
- **COD:** there is no capture. Issue the number when the customer places the order and server-side cart validation passes. *(Optional RTO guard: gate COD minting behind an OTP/IVR confirmation step before generating the number.)*

Both paths call the **same** generator: `generateOrderId(channel)`. Payment type governs *when* the generator is called; it is not passed into the ID.

### 4.2 Atomic counter — no double-issue under concurrency
Never compute `NNN` as "count of today's orders + 1" (two simultaneous orders read the same count and collide). Use an atomic increment:

```sql
INSERT INTO daily_counter (day, seq) VALUES (:ist_day, 1)
ON CONFLICT (day) DO UPDATE SET seq = daily_counter.seq + 1
RETURNING seq;
```

Zero-pad the returned `seq`. Add a **UNIQUE constraint** on the final order ID column and retry once on the (rare) collision.

### 4.3 Date is IST, hard-coded
Derive `YYMMDD` from `Asia/Kolkata`, pinned in the generator — never server/UTC time. An order at 23:50 IST on a UTC server otherwise stamps the previous day. This is the most common bug in date-based IDs.

### 4.4 Idempotent issuance
- **Prepaid:** key generation on the Razorpay `order_id`. Razorpay can fire `payment.captured` more than once — a retry must return the **same** VSV number, not mint a second.
- **COD:** key generation on the `cart_ref` / a client idempotency token — a double-clicked "Place Order" must return the same VSV number.

## 5. End-to-end flow

**Prepaid:** cart → `cart_ref` (temp) → Razorpay checkout → `payment.captured` webhook → verify signature → idempotency check → atomic IST counter → build `VSV-W-…` → persist → push to Shiprocket → store `pay_xxx`.

**COD:** cart → validate (+ optional OTP) → idempotency check → atomic IST counter → build `VSV-W-…` → persist → push to Shiprocket (mark COD, set collectible amount).

## 6. Acceptance criteria

- [ ] No two orders ever share an ID (unique constraint holds under load test).
- [ ] No number is minted for a failed/abandoned prepaid attempt.
- [ ] A duplicated `payment.captured` webhook returns the same ID.
- [ ] A double-submitted COD placement returns the same ID.
- [ ] An order placed 23:50–00:10 IST carries the correct IST date.
- [ ] Counter rolls back to `001` at IST midnight.
- [ ] The same ID appears in the DB, in Shiprocket's reference field, and on the customer's confirmation/invoice.
