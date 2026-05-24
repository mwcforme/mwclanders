# GA4 Funnel Alerts — Setup Guide

## 1. Funnel Exploration (see where users drop)

1. Go to **GA4** → **Explore** → **Blank**
2. Technique: **Funnel exploration**
3. Add steps in order:
   - Step 1: Event `session_start` (LP visit)
   - Step 2: Event `booking_started`
   - Step 3: Event `location_selected`
   - Step 4: Event `date_selected`
   - Step 5: Event `time_selected`
   - Step 6: Event `booking_completed`
4. Set date range to last 30 days
5. Segment by `Device category` to see mobile vs desktop drop-off

This shows exactly where in the funnel you lose people.

---

## 2. Booking Completion Rate Alert

Fires if `booking_completed` drops below threshold — catches silent regressions.

1. Go to **GA4** → **Admin** → **Custom Alerts**
2. Click **Create**
3. Settings:
   - **Alert name:** `booking_completed drop`
   - **Applies to:** All data
   - **Alert frequency:** Daily
   - **Condition:** `booking_completed` event count **is less than** `5` (adjust to your baseline)
   - **Send email to:** `eobrien@menswellnesscenters.com`
4. Save

---

## 3. Key Conversion Events to Mark in GA4

In GA4 → Admin → Events, mark these as **Conversions**:
- `booking_completed` — the primary money metric
- `booking_started` — top-of-funnel signal

Once marked, they appear in Google Ads as importable conversions for Smart Bidding.

---

## 4. Google Ads Offline Conversion Link

To close the loop between Google Ads click and booking:

1. GA4 → Admin → **Google Ads Links** → Link your Ads account
2. In Google Ads → **Tools** → **Conversions** → Import from GA4
3. Import `booking_completed` with value `$500` (estimated per-booked-consult revenue)

This feeds Smart Bidding real conversion data and is the highest-ROI technical change available.

---

## 5. UptimeRobot Setup (free)

1. Go to **uptimerobot.com** → Create free account
2. Add monitor:
   - **Monitor type:** HTTP(s)
   - **URL:** `https://book.menswellnesscenters.com/`
   - **Check interval:** Every 5 minutes
   - **Alert contacts:** Your email + SMS
3. Add a second monitor for the booking funnel:
   - **URL:** `https://book.menswellnesscenters.com/trt`

Cost: free. Peace of mind: $150K/month in ad spend protected.
