# IVÍM Weight Loss Efficiency Dashboard

Standalone dashboard for daily aggregate reporting. No real campaign data is committed to this repository. First launch uses visibly labeled synthetic demo data.

## Use

Open the deployed dashboard and click **Import daily data**. Upload the included CSV template columns:
`date,platform,campaign,ad_group,ad,spend,impressions,clicks,registrations,scheduled,attended,first_purchases,revenue`

Use YYYY-MM-DD source dates, USD, and Google Ads / Meta Ads as platforms. Export at daily campaign, ad group or ad granularity (not mixed grains). Missing downstream values should be blank, not 0. Browser CSV imports persist only to localStorage in the current browser and are never transmitted or shared.

## Metric governance

- Blended CPR = Google + Meta platform spend / their attributed registration event totals. Not de-duplicated patients.
- Generic Google Ads `Conversions` are not treated as registrations. Use specific Registration conversion action. IVÍM's Google goal names can be misleading: 'Book appointments' maps to Scheduled - Offline; 'Add to cart' to Appointment Completed - Offline. For action segmented reports supply the conversion action column.
- Appointments, attendance and first purchases require consistent backend cohort definitions before interpreting their ratios as verified funnel conversion rates.
- First-purchase cost excludes return purchases.
- The Oct 15, 2026 marker is contextual, not a causal claim.
- Import aggregate counts only. Do **not** import identifiable health information, patient details, names, emails, or medical records.

## Data freshness and sharing

This is a **manual import** dashboard. It does not connect automatically to Google Ads, Meta Ads, GA4, or IVÍM backend. It is not a multi-user reporting database. For production, add server-side credentials, daily ingest, Pillar-owned storage, and access control. Never put platform secrets into source or browser storage.

## Local run

Use a static server within this directory (for example `python -m http.server 8000`) and open http://localhost:8000. Vercel: framework Other, root directory `weight-loss-dashboard`.
