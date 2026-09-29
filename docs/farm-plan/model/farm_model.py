#!/usr/bin/env python3
"""
Floruvi vertical-tower hydroponic farm - feasibility model.

Location: Bengaluru, Karnataka (peri-urban, BESCOM area). Research date: 29 Sep 2026.
Model months: M1 = October 2026 ... M18 = March 2028.

How to run:  python3 farm_model.py
Outputs (same folder): model_output.json, model_tables.md

Rules used in this model
- Standard library only. Money is INR (Indian rupees). Money outputs are whole rupees.
- Input prices include GST. A farm that sells only GST-exempt fresh produce cannot claim input GST.
- Every input is in ASSUMPTIONS (low / base / high, unit, the direction that helps profit, source).
  Crop inputs are in CROPS. Season factors, tariffs and asset lives are in small tables after it.
- "estimate:" marks a value that no source gives directly.
- Scenarios: base uses base values. Conservative and optimistic move each input part of the way
  (scenario_extremity) toward its unfavourable or favourable research value.
- Research keys in source notes (towers, structure, climate, power, water, consumables, labour,
  lettuce, herbs, greens, strawberry_micro, prices, demand, logistics, export, finance_risk)
  refer to research.json in this folder.

Version 2 (29 Sep 2026, final modeller). Changes from v1 (farm_model_v1.py), each tied to a review
issue (see REVIEW_DECISIONS near the end of this file):
- Labour 49 h per 1,000 sites per 40 days (v1: 38 h, a per-turn rate divided by 40 days).
- Caretaker credited with 0.8 FTE of day work (v1: 1.0). EPF (20+ staff) and gratuity (10+ staff) added.
- HoReCa delivery cost depends on volume (Rs 38/kg at 40 kg/day or less; Rs 14/kg only at 100 kg/day+).
  D2C drop cost rises on thin routes (never below the research base of Rs 85 per drop).
- Water use x1.5 in Mar-May and tanker price x1.5 in Feb-May.
- Rain share from the model's own roof area. First transplant waits for the grid connection and nursery.
- Step costs above about 600 towers: several sites, generators, cold rooms, pack houses, HT supply above
  150 kW (BESCOM clause 9, HT-2(a) tariff), HT-type metering above 50 kW, supervisors, lined ponds.
- Price cut for large volumes (above 400 towers, full 30% at about 20% of the Bengaluru hydroponic segment).
- Cost bases (a first-class scenario, not a monkeypatch): 'research', 'owner' (owner's figures exactly,
  unmentioned items at research values) and 'owner_realistic' (owner's organisation at legal-minimum wages
  and real bills).
- Break-even on the demand-limited basis. AIF loan = min(90% of capex, capex - own cash); reserve at bank rate.
- New outputs: owner_costs, owner_cost_checks, scale_plan_test, realistic_scale_path, pain_points,
  research_findings, key_numbers, self-checks (assert statements).
"""

import datetime
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, "model_output.json")
OUT_MD = os.path.join(HERE, "model_tables.md")

RESEARCH_DATE = "2026-09-29"
DAYS_PER_MONTH = 30.4
MONTH_TO_40D = 40.0 / DAYS_PER_MONTH
SCENARIOS = ("conservative", "base", "optimistic")
CHANNELS = ("horeca", "d2c", "bulk", "distress")
CHANNEL_NAMES = {
    "horeca": "HoReCa direct (restaurants, cafes, hotels)",
    "d2c": "Floruvi direct-to-consumer (boxes, website, WhatsApp)",
    "bulk": "Quick commerce / modern retail / distributor (bulk buyers)",
    "distress": "Wholesale / trader (surplus dump)",
    "waste": "Unsold or wasted",
}
INF = float("inf")


def _interp(xs, ys, x):
    xs = list(xs)
    ys = list(ys)
    if x <= xs[0]:
        return ys[0]
    for i in range(1, len(xs)):
        if x <= xs[i]:
            x0, x1, y0, y1 = xs[i - 1], xs[i], ys[i - 1], ys[i]
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return ys[-1]


# Demand research: base kg/week a new grower can sell at the target price, sales months 1-12.
_DEM_BASE = [26, 55, 95, 130, 170, 210, 245, 280, 310, 340, 370, 400]


def _scaled(anchors):
    """Low/high monthly lists from the demand-research anchors at sales months 1, 3, 6, 12."""
    r = [v / _DEM_BASE[m - 1] for m, v in zip((1, 3, 6, 12), anchors)]
    return [round(_DEM_BASE[i] * _interp((1, 3, 6, 12), r, i + 1), 1) for i in range(12)]


def _lin(months, vals):
    return [round(_interp(months, vals, i + 1), 1) for i in range(12)]


def A(low, base, high, unit, better, source):
    """One assumption. better = 'low' | 'high' | None: the direction that helps profit."""
    return {"low": low, "base": base, "high": high, "unit": unit, "better": better, "source": source}


ASSUMPTIONS = {}

# ---------------------------------------------------------------- model settings
ASSUMPTIONS.update({
    "scenario_extremity": A(0.5, 0.5, 0.5, "share of the distance from base to the research low/high", None,
        "Model choice: conservative and optimistic sit halfway between base and the research extreme, because all "
        "extremes rarely happen together. Capex and expense range columns use the full research low/high (1.0)."),
    "starting_cash_inr": A(2000000, 2000000, 2000000, "INR", None, "Owner: about Rs 20 lakh capital."),
    "commitment_inr_per_month": A(40000, 40000, 40000, "INR per month", None,
        "Owner: about Rs 40,000 a month until August 2027 (11 payments, about Rs 4.4 lakh)."),
    "commitment_months": A(11, 11, 11, "months from M1 (M1-M11 = Oct 2026-Aug 2027)", None, "Owner."),
    "reserve_months_of_fixed_costs": A(6, 6, 6, "months", None,
        "Brief: keep 6 months of fixed costs plus the remaining commitment as a reserve."),
})

# ---------------------------------------------------------------- capacity and crop timing
ASSUMPTIONS.update({
    "sites_per_tower": A(90, 90, 90, "plant sites per tower", None, "Owner: about 90 plant sites per tower."),
    "occupancy": A(0.85, 0.90, 0.95, "share of sites holding a sellable plant", "high",
        "Brief: 0.85-0.9 for planting gaps, cleaning and empty sites. The 1-day clean-and-replant gap is already "
        "inside each harvest interval (lettuce research)."),
    "turnaround_days": A(1, 1, 1, "days between crops in one site", None, "Lettuce research: 40 / (days in tower + 1)."),
    "yield_multiplier": A(1.0, 1.0, 1.0, "x crop grams per harvest", None, "Sensitivity hook only (base 1.0)."),
    "loss_multiplier": A(0.8, 1.0, 1.5, "x crop loss rates", "low",
        "estimate: crop loss rates are estimates; no Indian tower loss data was found (lettuce, climate research)."),
    "first_cycle_days": A(80, 80, 80, "days after the first harvest that use first-cycle loss rates", None,
        "estimate: about 2-3 lettuce cycles; climate research expects higher losses in the first 6 months."),
    "consumables_first_cycle_extra": A(0.15, 0.20, 0.25, "share extra seed and media in the first cycles", "low",
        "Consumables research: add 15-25% for the first 2-3 cycles."),
    "fill_days": A(35, 35, 35, "days to fill all sites with weekly batches", None,
        "Towers research: each site turns over every 5-6 weeks with weekly planting; one lettuce cycle."),
})

# ---------------------------------------------------------------- prices and sales channels
ASSUMPTIONS.update({
    "price_multiplier": A(0.8, 1.0, 1.2, "x all crop prices", "high",
        "estimate: research prices are a one-day snapshot (29 Sep 2026); new sellers often discount; premium "
        "quality can earn more. Sensitivity uses 0.8 and 1.2."),
    "max_share_at_target_price": A(0.80, 0.85, 0.88, "share of harvest", "high",
        "Demand research: sales at the target price are capped at 85-88% by grade and order mismatch."),
    "unavoidable_waste_share": A(0.03, 0.04, 0.06, "share of harvest", "low",
        "Demand research: about 4% wasted at steady state (150 towers, month 12)."),
    "horeca_share_of_target": A(0.66, 0.66, 0.66, "share of target-price kg sold to HoReCa (rest is D2C)", None,
        "Demand research month 12 base: 40 accounts x 6 kg = 240 kg vs 300 boxes x 0.45 kg = 135 kg a week."),
    "bulk_price_share_of_horeca": A(0.55, 0.60, 0.65, "x HoReCa price", "high",
        "Demand research: bulk buyers (Hyperpure as supplier, FirstClub, BigBasket, quick commerce) pay about "
        "55-65% of the restaurant price."),
    "distress_price_share_of_wholesale": A(0.25, 0.40, 0.55, "x farm-gate wholesale price", "high",
        "Calibrated to the demand-research dump price of Rs 20-50/kg (base 35) for lettuce at Rs 90/kg wholesale."),
    "reject_horeca": A(0.02, 0.05, 0.10, "share of shipped kg", "low", "Logistics research: direct HoReCa 2-10%."),
    "reject_d2c": A(0.02, 0.04, 0.08, "share of shipped kg", "low", "Logistics research: own B2C 2-8%."),
    "reject_bulk": A(0.03, 0.08, 0.15, "share of shipped kg", "low",
        "Logistics research: Hyperpure / quick commerce / modern retail 3-15%."),
    "bad_debt_horeca": A(0.01, 0.03, 0.08, "share of HoReCa sales", "low", "Demand research: bad debts 1-8% of business sales."),
    "commission_distress": A(0.05, 0.08, 0.10, "share of trader sales", "low",
        "Prices research: APMC commission agent 5-10% (estimate, not verified)."),
    "payment_fee_d2c": A(0.0, 0.02, 0.02, "share of D2C sales", "low",
        "estimate: UPI 0% today; about 2% card gateway once site payments are switched on."),
    "pack_horeca_inr_per_kg": A(2, 4, 8, "INR per kg", "low", "Logistics research: bulk liner bags in crates Rs 2-8/kg."),
    "pack_d2c_inr_per_kg": A(15, 30, 60, "INR per kg", "low", "Logistics research: 100-250 g pouches/punnets Rs 15-20/kg, clamshells about Rs 59/kg."),
    "carry_bag_inr_per_order": A(3, 8, 20, "INR per D2C order", "low", "Logistics research: carry bag Rs 3-20 per B2C order."),
    "pack_bulk_inr_per_kg": A(8, 15, 30, "INR per kg", "low", "estimate: half bulk crates, half retail packs (logistics ranges)."),
    "pack_distress_inr_per_kg": A(1, 2, 4, "INR per kg", "low", "estimate: crates only."),
    "delivery_horeca_inr_per_kg": A(6, 14, 28, "INR per kg at 100 kg/day or more of HoReCa volume", "low",
        "Logistics research: own EV three-wheeler Rs 5.6-28/kg; 'buy only when HoReCa volume is above about 100 kg/day'."),
    "delivery_horeca_low_volume_inr_per_kg": A(25, 38, 79, "INR per kg at 40 kg/day or less of HoReCa volume", "low",
        "Numbers review + logistics research: a Porter three-wheeler loop costs Rs 900-1,900 a day for 8-10 drops; demand research "
        "drop size about 2.4 kg (6 kg per account per week in 2-3 deliveries), so about 24 kg per loop = Rs 38-79/kg; HoReCa drops on "
        "the D2C two-wheeler route cost about Rs 35/kg (Rs 85 per drop). Includes GST on third-party delivery where charged (estimate)."),
    "horeca_low_volume_kg_day": A(40, 40, 40, "kg/day", None, "Numbers review: the low-volume rate applies below about 40-60 kg/day."),
    "horeca_full_rate_kg_day": A(100, 100, 100, "kg/day", None, "Logistics research: the Rs 14/kg rate needs about 100 kg/day; linear in between."),
    "d2c_delivery_days_per_week": A(3, 3, 3, "fixed delivery days a week", None,
        "Market/operations review: deliver on fixed days so each route carries as many drops as possible."),
    "borzo_first_point_inr": A(36, 36, 36, "INR per loop", None, "Logistics research: Borzo Bengaluru tariff (29 Sep 2026)."),
    "borzo_inr_per_km": A(9, 9, 9, "INR per km", None, "Logistics research: Borzo Bengaluru bike tariff Rs 9/km."),
    "borzo_extra_drop_inr": A(13.5, 13.5, 13.5, "INR per extra drop", None, "Logistics research: Borzo Rs 13.50 per extra drop."),
    "farm_to_city_km": A(15, 30, 40, "km from the farm to the customer area", "low", "Logistics research: 15-40 km (farm on the city edge)."),
    "km_between_drops": A(2.5, 2.5, 2.5, "km", None, "estimate: drops clustered in 1-2 city areas."),
    "third_party_delivery_gst": A(0.18, 0.18, 0.18, "share", None,
        "Logistics research: delivery services can add 18% GST; a seller of exempt produce cannot claim it back."),
    "delivery_bulk_inr_per_kg": A(4, 8, 15, "INR per kg", "low",
        "estimate: one Porter three-wheeler drop at a hub (Rs 205 base fare + km) with 100 kg or more."),
    "delivery_distress_inr_per_kg": A(1, 3, 6, "INR per kg", "low", "estimate: bulk crates to a trader."),
    "d2c_delivery_cost_inr_per_drop": A(62, 85, 127, "INR per drop on a full route (floor)", "low",
        "Logistics research: Borzo 12-15 drop loop Rs 54-86; own two-wheeler Rs 51/85/127 at 25/15/10 drops a day. On thin routes "
        "the model uses the Borzo loop cost per drop (with 18% GST) when that is higher (market/operations review: Rs 127-320 at 4-10 drops)."),
    "d2c_delivery_fee_inr_per_order": A(99, 99, 99, "INR per order", None,
        "docs/11-pricing-research.md: Floruvi flat Rs 99 per delivery, no free-delivery threshold."),
    "d2c_kg_greens_per_order": A(0.40, 0.45, 0.50, "kg of greens per D2C order", "high",
        "Demand research: each weekly box holds about 0.4-0.5 kg of greens."),
    "pay_days_horeca": A(0, 15, 45, "days to cash", "low", "Demand/prices research: cafes cash to 15 days; hotels 30-60."),
    "pay_days_bulk": A(2, 30, 45, "days to cash", "low", "Logistics research: BigBasket 2 days; quick commerce 30-45 days."),
    "pay_days_d2c": A(1, 2, 3, "days to cash", "low", "estimate: prepaid UPI."),
    "pay_days_distress": A(0, 1, 7, "days to cash", "low", "Prices research: trader/APMC 0-7 days."),
})

# ---------------------------------------------------------------- demand (kg per week, all greens together)
ASSUMPTIONS.update({
    "demand_target_kg_week": A(_scaled((8, 30, 75, 180)), list(_DEM_BASE), _scaled((55, 175, 350, 655)),
        "kg/week sold at target price (HoReCa + D2C), sales months 1-12", "high",
        "Demand research: base 26...400 kg/week; low 8/30/75/180 and high 55/175/350/655 at sales months 1/3/6/12 "
        "(other months interpolated). After month 12 the model adds half the month 6-12 growth rate each month (estimate)."),
    "demand_bulk_kg_week": A(_lin((1, 2, 3, 6, 12), (0, 0, 0, 0, 50)), _lin((1, 2, 3, 6, 12), (0, 0, 0, 100, 200)),
        _lin((1, 2, 3, 6, 12), (0, 0, 50, 250, 500)), "kg/week bulk buyers can take, sales months 1-12", "high",
        "Demand research: 0/0/50 (month 3), 0/100/250 (month 6), 50/200/500 (month 12); needs GSTIN, FSSAI, barcodes. Flat after month 12."),
    "demand_distress_kg_week": A(50, 150, 400, "kg/week traders take", "high", "Demand research: traders take about 50/150/400 kg/week."),
    "demand_multiplier": A(1.0, 1.0, 1.0, "x demand", None, "Sensitivity hook only."),
    "market_cap_sales_month": A(12, 12, 12, "sales month used for market caps and steady state", None,
        "Model choice: month-12 demand from the demand research."),
})

# ---------------------------------------------------------------- labour
ASSUMPTIONS.update({
    "labour_h_per_1000_sites_40d": A(32, 49, 75, "hours per 1,000 sites per 40 days (all tasks)", "low",
        "Labour research benchmarks are per crop turn (UKY about 30.5; Freight Farms 25-35; Tower Farms 45-90). At about 1.29 lettuce "
        "turns per 40 days that is UKY 39, Freight Farms 32-45, Tower Farms 51-103 per 40 days. The model's own harvest speeds "
        "(greens research: 30 kg of heads, 12 kg of leaf picking per worker-day) imply about 49 h for the base mix (numbers review). "
        "v1 used 38 h."),
    "harvest_pack_share_of_hours": A(0.457, 0.457, 0.457, "share of hours spent on harvest and packing", None,
        "Numbers review: 22.4 h of harvest and packing (greens-research speeds, base crop mix) out of 49 h; non-harvest tasks "
        "26.6 h per 1,000 sites per 40 days."),
    "learning_extra_hours": A(0.20, 0.40, 0.60, "share extra hours in the first 2 cycles", "low", "Labour research (Freight Farms)."),
    "helper_wage_inr_month": A(14299, 20350, 22282, "INR per month, 26 days", "low",
        "Labour research: agriculture minimum wage Rs 14,299 (2026-27); uniform notification 22 May 2026 Zone 3 "
        "unskilled Rs 20,350 (base, conservative, under challenge); Zone 3 semi-skilled Rs 22,282."),
    "bonus_rate": A(0.0, 0.0833, 0.0833, "share of wages", "low", "Labour research: customary one-month bonus."),
    "leave_rate": A(0.03, 0.05, 0.08, "share of wages", "low", "Labour research: 10-15 paid holidays."),
    "esi_rate": A(0.0325, 0.0325, 0.0325, "share of wages <= Rs 21,000", None, "ESIC: 3.25% employer share."),
    "esi_threshold_employees": A(10, 10, 10, "employees", None, "Labour research: ESI from 10 employees."),
    "ppe_inr_per_worker_month": A(300, 550, 900, "INR", "low", "Labour research (IndustryBuying prices)."),
    "welfare_inr_per_worker_month": A(250, 600, 900, "INR", "low", "Labour research: water, tea, soap, first-aid refills (estimate)."),
    "absence_factor": A(1.05, 1.10, 1.15, "x staff hours", "low", "Labour research: 1.10; low/high estimate."),
    "hours_per_worker_week": A(48, 48, 48, "hours", None, "Labour research: 8 h x 6 days."),
    "caretaker_wage_inr_month": A(18699, 26612, 29138, "INR per month, 7 days incl. rest-day pay at 2x", "low",
        "Labour research: resident caretaker (agriculture rate / uniform Zone 3 / Zone 2)."),
    "caretaker_production_fte": A(0.8, 0.8, 0.8, "FTE of day work the caretaker also does", None,
        "Numbers review: credit 0.8 FTE; the rest covers night presence, site duties, weekly leave and illness (no relief is paid)."),
    "epf_rate": A(0.13, 0.13, 0.13, "share of min(wage, Rs 15,000)", None, "Labour research: EPF 12% + EDLI/admin, from 20 employees."),
    "epf_wage_cap_inr": A(15000, 15000, 15000, "INR per month", None, "Labour research: EPFO Rs 15,000 wage ceiling."),
    "epf_threshold_employees": A(20, 20, 20, "employees", None, "Labour research: EPF & MP Act s.1(3)."),
    "gratuity_rate": A(0.0481, 0.0481, 0.0481, "share of wages", None, "Labour research: gratuity accrues at 4.81% of basic from 10 employees."),
    "gratuity_threshold_employees": A(10, 10, 10, "employees", None, "Labour research."),
    "supervisor_per_towers": A(500, 500, 500, "towers per supervisor above 600 towers", None, "Numbers review estimate: about 1 supervisor per 500 towers."),
    "agri_min_wage_day_inr": A(549.97, 549.97, 549.97, "INR per day (8 h)", None,
        "Labour research: Karnataka 'Employment in Agriculture' 2026-27 (basic 401.26 + VDA 148.71)."),
    "agri_min_wage_month_inr": A(14299.16, 14299.16, 14299.16, "INR per month (26 days)", None, "Labour research."),
    "guard_12h_day_wages": A(60, 60, 60, "day-wages per month for a 12-h night post, 30 nights", None,
        "Labour research method: 26 nights x 2 (4 h overtime at 2x) + 4 rest nights x 2. The market/operations review counts rest-night "
        "hours at 2x (about 65 day-wages, Rs 35,900 at the agriculture rate)."),
    "caretaker_7day_agri_inr": A(18699, 18699, 18699, "INR per month", None,
        "Labour research: 7 days a week at the agriculture rate (4 rest days paid at 2x)."),
    "owner_realistic_grows_up_to_towers": A(200, 200, 200, "towers", None,
        "Market/operations review: owner as grower up to about 150 towers, about 200 with strong written procedures (a stretch)."),
    "grower_wage_inr_month": A(24407, 32000, 45000, "INR per month", "low", "Labour research: trained grower/supervisor."),
    "owner_grows_up_to_towers": A(150, 150, 150, "towers", None,
        "Labour research: at 150 towers the owner is the grower; a paid grower above that."),
    "guard_agency_inr_month": A(40000, 72330, 85709, "INR per month per 12-h night post incl. GST", "low",
        "Labour research: market quote Rs 30-45k skips overtime; fully compliant Rs 56-86k (base Rs 72,330)."),
    "guard_needed_above_towers": A(150, 150, 150, "towers", None,
        "Labour research: at 150 towers use the resident caretaker, CCTV and alarms instead of an agency guard."),
    "labour_cost_multiplier": A(1.0, 1.0, 1.0, "x all staff costs", None, "Sensitivity hook only."),
})

# ---------------------------------------------------------------- power (BESCOM FY2026-27)
ASSUMPTIONS.update({
    "tariff_category": A("LT5", "LT5", "LT5", "BESCOM tariff category", None,
        "Power research: LT-5 industrial names 'Green House' (likely). Sensitivity: LT-4(c) and LT-3(a)."),
    "pump_w_per_tower": A(18, 30, 35, "W per tower", "low", "Towers research: 18-35 W kit pumps; power research base 30 W."),
    "pump_duty": A(0.50, 0.625, 0.75, "share of 24 h", "low",
        "Power research: 06:00-18:00 continuous + 15 min per hour at night = 62.5%."),
    "fan_kwh_per_tower_month": A(0.55, 1.8, 5.2, "kWh per tower per month", "low",
        "Climate research: HAF fans 288/960/2,760 kWh a month per 1,000 m2, at about 1.9 m2 per tower."),
    "site_kwh_fixed_month": A(80, 120, 200, "kWh per month", "low",
        "estimate: fit to the power-research load model (cold room/visi-cooler, foggers, lights, office, CCTV, nursery)."),
    "site_kwh_per_tower_month": A(1.5, 2.25, 3.5, "kWh per tower per month", "low",
        "estimate: same fit (456 kWh at 150 towers, 1,467 kWh at 600 towers, RO and borewell counted separately)."),
    "fppca_inr_kwh": A(0.0, 0.25, 0.50, "INR per kWh", "low", "Power research: FPPCA monthly pass-through 0-0.50."),
    "pg_surcharge_inr_kwh": A(0.35, 0.35, 0.35, "INR per kWh", None, "Power research: P&G surcharge 35 paise in FY2026-27."),
    "electricity_tax": A(0.09, 0.09, 0.09, "share", None, "Power research: 9% Karnataka electricity tax."),
    "sanction_share_of_connected": A(0.75, 0.75, 0.75, "sanctioned kW / connected kW", None,
        "estimate: staggered pumps; power research sanctions 20-25 kW for 31 kW connected."),
    "min_sanction_kw": A(5, 5, 5, "kW", None, "Power research: demand-based option above 5 kW."),
    "kw_fixed": A(3.8, 3.8, 3.8, "kW connected (site loads)", None, "estimate: fit to power research (10.4 kW at 150 towers, 31 kW at 600)."),
    "kw_other_per_tower": A(0.0153, 0.0153, 0.0153, "kW per tower besides the pump", None, "estimate: same fit."),
    "outage_hours_per_month": A(3, 15, 40, "hours of grid outage per month", "low", "Power research estimate."),
    "inverter_running_inr_h": A(50, 50, 50, "INR per outage hour", None, "Power research: inverter recharge and battery wear."),
    "dg_running_inr_h": A(260, 380, 580, "INR per hour at about 10 kW of load", "low", "Power research: diesel Rs 99/L, 15 kVA set at about 10 kW."),
    "dg_rental_inr_month": A(0, 2500, 5000, "INR per month (inverter sites, up to 200 towers)", "low",
        "Market/operations review: batteries last 3-4 h but BESCOM planned shutdowns last 4-8 h, so rent a small generator on notified "
        "shutdown days (estimate: about one a month; power research: 7.5 kVA DG about Rs 150/h to run)."),
    "backup_share_of_pump_kw": A(0.5, 0.5, 0.5, "share of pump kW covered by backup", None,
        "Power research: stagger pumps to 50%; market/operations review: size generators to about 50% of the pump load."),
    "dg_unit_kw": A(12, 12, 12, "usable kW per 15 kVA generator", None, "Power research: 15 kVA set at 10-12 kW after altitude derating."),
    "ht_tariff_energy_inr_kwh": A(6.60, 6.60, 6.60, "INR per kWh", None,
        "BESCOM Electricity Tariff 2026-28 (KERC order 27 Mar 2025), HT-2(a) incl. 'Green House': 660 paise in FY2026-27."),
    "ht_tariff_demand_inr_kva": A(350, 350, 350, "INR per kVA of billing demand per month", None, "BESCOM tariff 2026-28, HT-2(a): Rs 350/kVA in FY2026-27."),
    "lt_limit_kw": A(150, 150, 150, "kW", None, "BESCOM tariff 2026-28 clause 9: LT supply only where the requisitioned load is below 150 kW."),
    "ht_type_metering_above_kw": A(50, 50, 50, "kW", None, "BESCOM tariff 2026-28 clause 31: 50-150 kW at LT needs an HT-type metering cubicle."),
})

# ---------------------------------------------------------------- water
ASSUMPTIONS.update({
    "water_source": A("tanker", "tanker", "tanker", "tanker | borewell | tanker_rain", None,
        "Model choice: no borewell is confirmed on the owned plots, so base buys tanker water (conservative)."),
    "water_l_per_site_day": A(0.10, 0.21, 0.41, "litres of RO-grade water per site per day (all uses)", "low",
        "Water research: 600 towers use 167/343/666 m3 a month (incl. dumps, nursery, washing, staff)."),
    "ro_recovery": A(0.40, 0.50, 0.65, "permeate share of raw water", "high", "Water research: 65/50/40% for hard Bengaluru water."),
    "tanker_inr_per_m3": A(83, 125, 208, "INR per m3", "low", "Water research: Rs 1,000/1,500/2,500 per 12,000 L load."),
    "ro_kwh_per_m3": A(1.2, 2.0, 3.0, "kWh per m3 permeate", "low", "Water research estimate."),
    "ro_consumables_inr_per_m3": A(10, 18, 30, "INR per m3 permeate", "low", "Water research: membranes, cartridges, antiscalant."),
    "borewell_kwh_per_m3": A(0.7, 1.4, 2.0, "kWh per m3 lifted", "low", "Water research: 120-250 m lift."),
    "borewell_fixed_upkeep_inr_month": A(1500, 2625, 4000, "INR per month", "low",
        "Water research: fixed charge Rs 1,125 + upkeep Rs 1,500 at 600 towers."),
    "water_use_hot_month_factor": A(1.3, 1.5, 1.7, "x water use in Mar-May", "low",
        "Water research: 'hot March-May can nearly double it'; numbers review x1.4-1.6."),
    "tanker_peak_price_factor": A(1.33, 1.5, 1.67, "x tanker price in Feb-May", "low",
        "Water research: tanker prices peak in Feb-May (Rs 2,000-2,850 a load in 2024 vs Rs 1,500 base); numbers review Rs 167-208/m3."),
    "rain_mm_year": A(600, 900, 1078, "mm per year", "high", "Water research: IMD normal 1,078 mm; design 900 mm; dry-year 600 mm."),
    "rain_runoff": A(0.8, 0.8, 0.8, "share of roof rain collected", None, "Water research: runoff 0.75-0.85 after first flush."),
    "rain_share_cap": A(0.44, 0.62, 0.67, "maximum share of RO-grade demand that stored roof rain can meet", "high",
        "Water research: 150 towers with a 1,000 m2 roof and a 50 m3 pond meet 62% (44-67%); almost no rain in Jan-Mar."),
    "pond_inr_per_m3": A(250, 500, 1000, "INR per m3 of covered, lined pond", "low", "Water research: HDPE-lined covered pond."),
    "pond_above_m3": A(50, 50, 50, "m3 of raw-water storage above which a lined pond replaces plastic tanks", None,
        "Numbers review: a lined pond costs about Rs 500/m3 against about Rs 10,000/m3 for plastic tanks."),
})

# ---------------------------------------------------------------- capex (GST included)
ASSUMPTIONS.update({
    "kit_price_ex_gst_inr": A(8000, 10000, 13500, "INR per 80-96 site kit before GST", "low",
        "Towers research: IndiaMART Rs 9,500-13,500 ex-GST (Shivraj, Aadya, Dinesh); low = bulk discount. The owner's "
        "Rs 5,000-12,000 band covers only this kit."),
    "gst_on_kits": A(0.05, 0.18, 0.18, "share", "low", "Towers research: 18% on plastic articles; 5% only if invoiced under HSN 8424."),
    "freight_inr_per_tower": A(150, 350, 700, "INR per tower", "low", "Towers research estimate: Pune/Thane to Bengaluru."),
    "assembly_inr_per_tower": A(200, 500, 1200, "INR per tower", "low", "Towers research: levelling, paver under tank, assembly."),
    "spares_inr_per_tower": A(60, 120, 200, "INR per tower", "low", "Towers research: 10% pumps, 5% timers and net cups."),
    "electrical_inr_per_tower": A(300, 600, 1000, "INR per tower", "low",
        "Towers research: sockets, cable, MCBs, 30 mA RCCB, earthing, electrician; 1 cyclic timer per 15-17 towers."),
    "electrical_main_panel_inr": A(20000, 40000, 80000, "INR", "low",
        "estimate: main LT panel, earthing pits, capacitors, surge and phase-failure relays (power research: Rs 1.5-4.5 lakh at 600 towers incl. distribution)."),
    "area_m2_per_tower": A(1.65, 1.9, 2.12, "m2 covered per tower incl. aisles, nursery and packing", "low",
        "Structure research 1.4 m2 + 18% = 1.65; Tower Farms about 1.9; towers research 1,270 m2 / 600 = 2.12."),
    "structure_min_area_m2": A(96, 96, 96, "m2", None, "estimate: one 8 m bay x 12 m is the smallest practical NVPH module."),
    "nvph_rate_small_inr_m2": A(1100, 1400, 1800, "INR per m2 up to 300 m2", "low", "Structure research: 150-290 m2 modules."),
    "nvph_rate_mid_inr_m2": A(1000, 1250, 1500, "INR per m2 for 300-700 m2", "low", "Structure research: about 500 m2."),
    "nvph_rate_large_inr_m2": A(950, 1150, 1400, "INR per m2 above 700 m2", "low", "Structure research: about 1,000 m2 (MIDH norm Rs 1,000-1,050)."),
    "rain_shelter_inr_m2": A(700, 900, 1100, "INR per m2 (test module only)", "low",
        "Structure research: flat-roof net house with UV-film roof, fallback only."),
    "fogger_inr_m2": A(40, 70, 120, "INR per m2", "low", "Structure research estimate."),
    "haf_fan_inr": A(4000, 5000, 8000, "INR per fan (1 per 125 m2)", "low", "Structure research: MIDH norm Rs 5,000; 2 fans per 250 m2."),
    "site_prep_inr_m2": A(50, 135, 250, "INR per m2", "low", "Structure research: levelling, weed mat, drainage, path."),
    "tank_plinth_inr": A(12000, 25000, 40000, "INR", "low", "Structure research estimate."),
    "nursery_fixed_inr": A(0, 5000, 10000, "INR", "low", "Towers research: nursery Rs 0.6/2/3.7 lakh at 600 towers (fit)."),
    "nursery_inr_per_tower": A(100, 325, 617, "INR per tower", "low", "Towers research (fit)."),
    "tools_fixed_inr": A(10000, 25000, 40000, "INR", "low", "Towers research: meters, calibration, mixing station, tools (fit)."),
    "tools_inr_per_tower": A(60, 125, 230, "INR per tower", "low", "Towers research: Rs 0.45/1/1.8 lakh at 600 towers (fit)."),
    "ro_500lph_inr": A(71000, 106000, 165000, "INR incl. GST", "low", "Water research: IndiaMART 500 LPH listings."),
    "ro_2000lph_inr": A(212000, 419000, 537000, "INR incl. GST", "low", "Water research: IndiaMART 2,000 LPH listings."),
    "ro_small_inr": A(15000, 25000, 40000, "INR (test module)", "low", "estimate: 50-100 L/h commercial RO unit."),
    "ro_run_hours_per_day": A(5, 5, 5, "hours", None, "Water research: plants run about 5 h a day at base demand."),
    "tank_inr_per_litre": A(7, 10, 12.5, "INR per litre", "low", "Water research: IndiaMART Sintex Rs 6-11/L + GST."),
    "raw_storage_days": A(2, 2, 2, "days", None, "Water research: keep 2 days of raw water."),
    "ro_storage_days": A(1, 1, 1, "days", None, "Water research: keep 1 day of RO water."),
    "stock_tank_m3": A(0.6, 1.0, 1.5, "m3", "low", "Water research: nutrient stock tanks 0.6-1.5 m3."),
    "borewell_capex_inr": A(230000, 450000, 700000, "INR (optional, not in base)", "low",
        "Water research: 1,000-1,500 ft bore incl. pump; KGWA permission up to 60 days; real failure risk."),
    "inverter_fixed_inr": A(25000, 40000, 60000, "INR", "low", "Power research: 5-6.6 kVA inverter + 8 x 150 Ah = Rs 1-2.5 lakh at 150 towers (fit)."),
    "inverter_inr_per_tower": A(500, 1070, 1270, "INR per tower", "low", "Power research (fit)."),
    "dg_15kva_inr": A(347000, 470000, 600000, "INR incl. GST and AMF panel (over 200 towers)", "low", "Power research: IndiaMART DG listings."),
    "grid_meter_inr": A(5000, 9000, 15000, "INR", "low", "Power research: smart meter deposit (estimate)."),
    "grid_deposit_inr_per_kw": A(1300, 2000, 5000, "INR per connected kW (refundable)", "low", "Power research: Rs 40k/61k/157k at 31 kW."),
    "transformer_inr": A(0, 400000, 700000, "INR if connected load is above the threshold", "low",
        "Power research: likely needed at about 31 kW in rural areas, unlikely at about 10 kW."),
    "transformer_above_kw": A(20, 20, 20, "kW", None, "estimate: between the 10 kW and 31 kW cases in power research."),
    "cctv_small_inr": A(42700, 50000, 83300, "INR (up to 200 towers)", "low", "Labour research: 5-8 camera DVR kit, 4G router, UPS, siren, lights."),
    "cctv_large_inr": A(42700, 83300, 164000, "INR (over 200 towers)", "low", "Labour research: 8-camera set with lights."),
    "fence_perimeter_m": A(197, 197, 197, "m", None, "Structure research: 60-cent plot perimeter about 197 m."),
    "fence_barbed_inr_m": A(250, 300, 400, "INR per m (up to 200 towers)", "low", "Structure research: MIDH norm Rs 300 per running m."),
    "fence_chainlink_inr_m": A(550, 700, 1000, "INR per m (over 200 towers)", "low", "Structure research estimate."),
    "gate_inr": A(25000, 35000, 60000, "INR", "low", "Structure research estimate."),
    "cold_small_inr": A(20000, 41000, 65000, "INR (chest freezer as cooler + pre-cool kit)", "low", "Logistics research."),
    "cold_large_inr": A(195000, 275000, 410000, "INR (walk-in 8x8x8 ft + pre-cool kit)", "low", "Logistics research."),
    "crate_inr": A(290, 450, 700, "INR per 40 L crate", "low", "Logistics research: TradeIndia listings."),
    "crates_per_tower": A(0.25, 0.25, 0.25, "crates per tower", None, "Logistics research: about 150 crates at full scale."),
    "min_crates": A(20, 20, 20, "crates", None, "estimate."),
    "packing_tools_inr": A(20000, 38500, 60000, "INR", "low",
        "Logistics research: platform + table scales Rs 10,000, label printer Rs 13,500; tables and sink Rs 15,000 (estimate)."),
    "pack_house_inr": A(150000, 400000, 600000, "INR (over 200 towers)", "low", "Towers research: NHB norm Rs 4 lakh per 9 x 6 m."),
    "welfare_small_inr": A(50000, 84000, 130000, "INR (up to 200 towers)", "low", "Labour research: toilet, first aid, extinguishers, drinking water."),
    "welfare_large_inr": A(62000, 134000, 251000, "INR (over 200 towers)", "low", "Labour research incl. rest shed."),
    "quarters_inr": A(0, 100000, 250000, "INR", "low", "Labour research: basic room for a resident caretaker; 0 if staff live nearby."),
    "registrations_inr": A(12000, 19000, 31500, "INR", "low",
        "Logistics/finance research: FSSAI central licence Rs 7,500 (online sales), trademark Rs 4,500, CA for GST/Udyam Rs 2,000, trade "
        "licence (estimate). Low raised to Rs 12,000 (FSSAI + trademark) after the numbers review."),
    "water_tests_inr": A(3000, 8000, 15000, "INR", "low", "estimate: lab tests of 2 water sources (water research list of tests)."),
    "initial_marketing_inr": A(5000, 15000, 30000, "INR", "low", "docs/31: ad test Rs 4,200-7,000; samples and print (estimate)."),
    "starting_stock_inr_per_site": A(2.2, 4.1, 14.6, "INR per site", "low",
        "Consumables research: first stock Rs 4 lakh for 54,000 sites minus net cups (kits include them)."),
    "contingency_share": A(0.10, 0.10, 0.10, "share of capex", None, "Brief: contingency 10%."),
    "vehicle_ev3w_inr": A(355000, 420000, 480000, "INR (optional, not in base)", "low", "Logistics research: Mahindra Treo Zor."),
    "gs1_barcodes_inr": A(0, 50200, 55510, "INR (optional, not in base)", "low", "Logistics research: only after a quick-commerce buyer commits."),
    # ---- step costs for large farms (numbers review issue: model not valid above about 1,000 towers in v1)
    "usable_m2_60cent": A(1700, 1821, 1942, "m2 usable on the owned 60-cent plot", "high", "Towers research: 70-80% of 2,428 m2."),
    "usable_m2_40cent": A(1133, 1214, 1295, "m2 usable on the owned 40-cent plot", "high", "Towers research: 70-80% of 1,619 m2."),
    "perimeter_40cent_m": A(161, 161, 161, "m", None, "estimate: square 1,619 m2 plot."),
    "leased_usable_share": A(0.75, 0.75, 0.75, "usable share of leased land", None, "Towers research: 70-80% usable after setbacks and access."),
    "towers_per_cold_room": A(600, 600, 600, "towers per 2 t walk-in cold room", None,
        "Numbers review: one cold room per about 100 kg/day; 600 towers harvest about 92 kg/day."),
    "towers_per_pack_house": A(600, 600, 600, "towers per 9 x 6 m pack house", None, "estimate: same basis as the cold room."),
    "transformer_kva_unit": A(100, 100, 100, "kVA per transformer unit", None, "Power research: Rs 4 lakh for a 63-100 kVA transformer and line."),
    "ht_type_metering_inr": A(60000, 100000, 150000, "INR per site with 50-150 kW", "low", "Power research estimate (tariff clause 31)."),
    "ht_substation_inr": A(1000000, 1500000, 2500000, "INR per site at 150 kW or more", "low",
        "estimate: no research quote; 11 kV metering, breaker, own transformer and line for HT supply (tariff clause 9)."),
    "workers_per_welfare_set": A(20, 20, 20, "workers per toilet/rest/first-aid set", None, "estimate: OSH Code facilities scale with headcount (not verified)."),
    "supplier_sets_per_month": A(500, 500, 1500, "tower sets a month available from suppliers", "high",
        "Towers research: Aadya states a capacity of 500 sets a month; high assumes three suppliers (estimate)."),
    "hiring_per_month": A(4, 8, 15, "workers hired and trained per month", "high", "estimate: no research value."),
})

# ---------------------------------------------------------------- running costs besides staff, power, water
ASSUMPTIONS.update({
    "tower_parts_inr_per_tower_month": A(25, 75, 233, "INR per tower per month", "low",
        "Towers research: replacement reserve Rs 995/2,350/5,800 a year minus the tower body (in depreciation)."),
    "structure_repair_share_per_year": A(0.01, 0.015, 0.02, "share of structure cost", "low", "Structure research: repairs 1.5% a year (estimate)."),
    "ipm_inr_per_m2_month": A(1.2, 4.5, 13.5, "INR per m2 per month", "low", "Consumables research: IPM and sanitation Rs 1,200/4,500/13,500 per 1,000 m2."),
    "internet_cctv_inr_month": A(600, 1000, 1500, "INR per month", "low", "Labour research: 4G data, CCTV maintenance, reserve."),
    "insurance_assets_rate_year": A(0.0015, 0.0035, 0.006, "share of insured equipment value", "low", "Finance research estimate."),
    "insurance_structure_rate_year": A(0.01, 0.015, 0.03, "share of structure value", "low", "Finance research estimate."),
    "accounting_inr_month": A(285, 1957, 4000, "INR per month", "low", "Finance research: IndiaFilings / local CA."),
    "payroll_inr_per_employee_month": A(100, 200, 400, "INR per employee per month from 10 employees", "low",
        "estimate: payroll, ESI/EPF filings and a tax audit at scale (numbers review: payroll compliance missing above about 600 towers)."),
    "fssai_renewal_inr_month": A(8, 625, 625, "INR per month", "low", "Finance research: central licence Rs 7,500 a year (registration Rs 100)."),
    "marketing_fixed_inr_month": A(2000, 5000, 10000, "INR per month", "low", "estimate: samples, travel to buyers, WhatsApp and local promotion."),
    "marketing_inr_per_tower_month": A(10, 20, 30, "INR per tower per month", "low", "estimate."),
    "crate_loss_share_month": A(0.05, 0.075, 0.10, "share of crate stock lost at buyers per month", "low",
        "Logistics research: budget a 5-10% loss per month at buyers."),
    "tests_calibration_inr_month": A(600, 1600, 3500, "INR per month", "low",
        "Water research (lab tests of each source), towers research (calibration solutions Rs 4,000-15,000 a year), export research "
        "(microbial tests Rs 590-1,770 each); frequency is an estimate (2 water and 2 microbial tests a year)."),
})

# ---------------------------------------------------------------- large-volume price effect
ASSUMPTIONS.update({
    "large_volume_price_cut": A(0.20, 0.30, 0.40, "price cut on all channels at full effect", "low",
        "Market/operations review: 'above about 400 towers, model a price cut of 20-40%'; demand research: 600 towers would be "
        "15-40% of the Bengaluru hydroponic segment and 'prices would likely crash'."),
    "price_cut_start_towers": A(400, 400, 400, "towers", None, "Market/operations review."),
    "hydroponic_segment_kg_week": A(3000, 6500, 10000, "kg/week", "high",
        "Demand research: Bengaluru hydroponic lettuce share about 3-10 t a week (estimate); base is the midpoint."),
    "price_cut_full_share": A(0.20, 0.20, 0.20, "share of the hydroponic segment at which the full cut applies", None,
        "estimate: model choice (about 1,200 towers at base)."),
})

# ---------------------------------------------------------------- timeline
ASSUMPTIONS.update({
    "order_day": A(5, 10, 21, "days after 1 Oct 2026 to order towers and structure", "low", "estimate: 2-3 written quotes first (towers research)."),
    "build_days_test": A(7, 14, 30, "days", "low", "estimate: small film-roof shelter by a local fabricator."),
    "build_days_small": A(25, 45, 90, "days (up to 200 towers)", "low", "Structure research: order to ready structure 25/45/90 days."),
    "build_days_large": A(45, 75, 120, "days (over 200 towers)", "low",
        "estimate: 1,000+ m2 NVPH (Telangana 60-90 days), transformer 45-120 days, 600 towers supply 6-10 weeks."),
    "assembly_days": A(4, 7, 14, "days", "low", "estimate: assemble towers and plumbing after the structure."),
    "caretaker_start_month": A(2, 2, 2, "model month", None, "Model choice: when materials arrive on site."),
    "test_module_towers": A(10, 10, 10, "towers", None,
        "Towers research: 2-5 sample towers; strawberry research: 5-10 tower pilot; greens research: 20-30 towers."),
    "phase2_order_month": A(12, 12, 12, "model month (M12 = Sep 2027)", None,
        "Model choice: build after the commitment ends (Aug 2027), ready for the Oct-Feb peak season."),
    "grid_apply_day": A(1, 3, 10, "days after 1 Oct 2026 to apply for the LT-5 connection", "low",
        "Market/operations review: apply in week 1 of October."),
    "grid_connection_days": A(15, 45, 120, "days from application to a live 3-phase connection", "low",
        "Power research: rural LT connection 15/45/120 days (15 days by rule; up to 90+ if a transformer or line is needed)."),
    "temp_connection_days": A(7, 15, 30, "days to power a small test module", "low",
        "estimate: LT-7 temporary supply (power research) or an existing connection; a 10-tower module draws under 1 kW."),
})

# ---------------------------------------------------------------- finance
ASSUMPTIONS.update({
    "aif_effective_rate": A(0.055, 0.06, 0.09, "annual interest after 3% subvention", "low", "Finance research: SBI AIF 9.00% fixed minus 3%."),
    "bank_rate": A(0.09, 0.107, 0.123, "annual interest", "low", "Finance research: SBI poly-house / farm term loans."),
    "loan_tenor_months": A(72, 72, 72, "months after moratorium", None, "Finance research."),
    "moratorium_months": A(12, 12, 12, "months (interest only)", None, "Finance research: AIF 6-24 months."),
    "loan_share_of_capex": A(0.90, 0.90, 0.90, "share", None, "Finance research: AIF minimum own contribution 10%."),
    "aif_cap_inr": A(20000000, 20000000, 20000000, "INR per location", None,
        "Finance research: AIF 3% subvention and CGTMSE cover up to Rs 2 crore per project/location."),
    "min_cash_reserve_inr": A(300000, 300000, 500000, "INR kept in hand before borrowing for capex", "low",
        "Market/operations review: keep the Rs 4.4 lakh commitment and a Rs 3-5 lakh reserve aside."),
    "dscr_gate": A(1.3, 1.3, 1.3, "EBITDA / loan payment", None, "Market/operations review: borrow only at debt-service cover of 1.3 or more."),
    "owner_drawing_inr_month": A(25000, 30000, 40000, "INR per month the family takes out", None,
        "Market/operations review: add an owner drawing line (for example Rs 25,000-40,000 a month)."),
})

# ---------------------------------------------------------------- owner decisions (29 Sep 2026, by voice). Authority, not research.
OWNER_COSTS = {
    "night_guard": 10000, "production_helpers": 40000, "water": 10000, "repairs": 0, "electricity": 10000,
    "grower": 0, "caretaker": 15000, "accounting_insurance_marketing": 0,
}
OWNER_COSTS_NOTE = ("Owner decisions, 29 Sep 2026: monthly costs for the whole farm of up to 600 towers. No borewell: the farm buys tanker "
                    "water. The owner is the grower. A free AI agent does accounting, insurance and marketing work. Above 600 towers the "
                    "model scales these figures per 600-tower unit (an assumption from the preliminary run). Items the owner did not "
                    "mention stay at research values: RO consumables, FSSAI licence fee, IPM and sanitation, CCTV SIM and upkeep, backup "
                    "power running and generator rental, crate losses, water tests and calibration, supervisors above 600 towers.")
OWNER_UNMENTIONED_ITEMS = ["RO membranes, cartridges and antiscalant (inside 'water')", "FSSAI central licence fee (inside 'accounting')",
                           "IPM and sanitation", "Internet/SIM for CCTV and CCTV upkeep", "Backup power running and generator rental",
                           "Crate losses at buyers", "Water tests and meter calibration", "Supervisors above 600 towers"]

# ---------------------------------------------------------------- microgreens (rack trays, not towers)
ASSUMPTIONS.update({
    "mg_yield_g_per_tray": A(134, 208, 300, "g sellable per 10x20 inch tray", "high", "Strawberry_micro research: Di Gioia 2023, Poudel 2023, weighted mix."),
    "mg_price_inr_per_kg": A(700, 1000, 1400, "INR per kg blended", "high", "Strawberry_micro research: HoReCa + D2C + live trays."),
    "mg_loss_steady": A(0.05, 0.10, 0.15, "share", "low", "Strawberry_micro research: 10% steady (range estimate)."),
    "mg_loss_first": A(0.20, 0.25, 0.35, "share in the first 30 days", "low", "Strawberry_micro research: 25%."),
    "mg_var_cost_inr_per_tray": A(60, 83, 130, "INR per tray", "low",
        "Strawberry_micro research: seed Rs 38 (bulk), cocopeat 12, clamshell+label 10, power 5-10, sanitation 2, delivery/other "
        "(back-solved from the specialist's monthly profits). Hobby-pack seed (Rs 145) is excluded."),
    "mg_cycle_days": A(9, 11, 18, "days sowing to harvest", "low", "Strawberry_micro research."),
    "mg_capex_100_inr": A(83000, 163000, 263000, "INR, 100-tray rack capacity (about 50-70 trays a week)", "low", "Strawberry_micro research."),
    "mg_capex_200_inr": A(143000, 271000, 436000, "INR, 200-tray capacity (about 100-140 trays a week)", "low", "Strawberry_micro research."),
    "mg_capex_400_inr": A(274000, 519000, 832000, "INR, 400-tray capacity (about 200-280 trays a week)", "low", "Strawberry_micro research."),
    "mg_fixed_inr_month": A([3500, 4500, 6500], [3500, 4500, 6500], [3500, 4500, 6500], "INR per month at 50/100/200 trays a week", None, "Strawberry_micro research."),
    "mg_workers": A([0.5, 1.0, 2.0], [0.5, 1.0, 2.0], [0.5, 1.0, 2.0], "workers at 50/100/200 trays a week", None, "Strawberry_micro research."),
    "mg_demand_kg_week": A([4, 6] + [8] * 10, [10, 15] + [20] * 10, [20, 30] + [40] * 10, "kg/week, sales months 1-12", "high",
        "Strawberry_micro research: 8/20/40 kg a week by month 3; months 1-2 ramp (estimate); flat after."),
    "mg_start_day": A(5, 7, 14, "days after 1 Oct 2026", "low", "estimate: racks in an existing room within a week."),
    "mg_trays_week_start": A(50, 50, 50, "trays per week from M1", None, "Strawberry_micro research: start at 50 trays a week."),
    "mg_trays_week_later": A(100, 100, 100, "trays per week from the step-up month", None, "Strawberry_micro research: 100 trays a week matches 20 kg a week."),
    "mg_step_up_month": A(4, 4, 4, "model month", None, "Model choice: after month-3 demand is proven."),
    "mg_d2c_share": A(0.5, 0.5, 0.5, "share of microgreens kg sold direct to consumers", None,
        "Strawberry_micro research: blended price assumes about half HoReCa, half D2C."),
    "mg_kg_per_d2c_order": A(0.1, 0.1, 0.1, "kg of microgreens per D2C order", None, "estimate: 50-100 g packs or a live tray."),
})

# ---------------------------------------------------------------- trading / aggregation through Floruvi
ASSUMPTIONS.update({
    "trade_basket_inr_per_account_week": A(2000, 3500, 5000, "INR per account per week", "high", "Demand research: Rs 2,000-5,000 a week."),
    "trade_gross_margin": A(0.12, 0.22, 0.35, "share of sales", "high", "Demand research."),
    "trade_net_margin": A(0.0, 0.08, 0.15, "share of sales after delivery, packing, spoilage", "high", "Demand research."),
    "trade_bad_debt": A(0.01, 0.03, 0.08, "share of sales", "low", "Demand research."),
    "trade_wc_per_sales": A(0.30, 0.50, 1.00, "INR of working capital per INR of monthly sales", "low", "Demand research."),
    "trade_accounts": A(_lin((1, 3, 6, 12), (1, 4, 10, 20)), _lin((1, 3, 6, 12), (3, 10, 22, 40)), _lin((1, 3, 6, 12), (6, 18, 35, 65)),
        "active business accounts, sales months 1-12", "high",
        "Demand research: 1/3/6 (month 1), 4/10/18 (month 3), 10/22/35 (month 6), 20/40/65 (month 12)."),
    "trade_start_day": A(7, 14, 30, "days after 1 Oct 2026", "low", "Demand research: first trading sale in 7-30 days."),
    "trade_setup_capex_inr": A(5000, 10000, 20000, "INR", "low", "estimate: extra crates and a scale."),
    "trade_avg_price_inr_per_kg": A(100, 100, 100, "INR per kg of bought-in produce sold", None,
        "estimate from demand research price ceilings (broccoli Rs 101, zucchini Rs 100, capsicum Rs 102-104 per kg); used only to "
        "count delivery volume on shared routes."),
})

# ---------------------------------------------------------------- merchant-export pilot (comparison only)
ASSUMPTIONS.update({
    "export_registrations_inr": A(13900, 13900, 13900, "INR", None, "Export research: IEC Rs 500 + APEDA RCMC Rs 5,900 + FSSAI central Rs 7,500."),
    "export_lab_test_inr": A(5900, 11800, 11800, "INR per sample", "low", "Export research: ICAR-IIHR residue test."),
    "export_ecgc_inr": A(5000, 5000, 5000, "INR per year", None, "Export research: ECGC Small Exporters Policy minimum."),
    "export_logistics_inr_per_100kg": A(25000, 33000, 45000, "INR per 100 kg shipment", "low", "Export research: about Rs 33,000 per 100 kg (range estimate)."),
    "export_product_value_inr_per_kg": A(250, 250, 250, "INR per kg (basil sold at home)", None, "Export research model."),
    "export_margin_inr_per_kg": A(-148, -52, 150, "INR per kg vs selling the same basil in Bengaluru", "high", "Export research: 200 kg lot to Dubai."),
    "export_kg_per_month": A(200, 200, 200, "kg per month", None, "estimate: one 200 kg pilot shipment a month."),
    "export_first_cash_days": A(35, 75, 150, "days", "low", "Export research."),
})

# =============================================================================
# CROPS. g_per_harvest = (low, base, high) sellable grams per site per harvest, before
# the loss rate. For strawberry it is grams per plant per season. Prices are INR per kg:
# price_wholesale = farm-gate / trader, price_horeca = restaurant buyer, price_retail =
# Bengaluru shelf / D2C benchmark. cons_inr = seed, media, nutrients, pH (IPM is a monthly
# cost), per harvest (single-harvest crops) or per 40 days (repeat-cut, fruiting).
# cap_share = share of the month-12 reachable greens volume (target-price + bulk buyers)
# that this crop could take if grown alone (estimate built on the demand-research mix:
# lettuces 60%, basil 10%, kale 10%, others 20%).
# =============================================================================
def _crop(**kw):
    kw.setdefault("season_months", 12)
    kw.setdefault("cap_towers_fixed", None)
    return kw


CROPS = {
    "lollo_rosso": _crop(name="Lollo Rosso lettuce", mix_group="lettuce", season_group="lettuce", mode="single",
        tower_fit="good", nursery_days=18, first_harvest_days=30, interval_days=31, life_days=30,
        g_per_harvest=(50, 80, 130), loss_first=0.25, loss_steady=0.10,
        price_wholesale=90, price_horeca=200, price_retail=370, cons_basis="per_harvest", cons_inr=(1.07, 3.48, 4.9),
        harvest_method="head", cap_share=0.18,
        source="Lettuce research (cycle, yield, loss). Prices: Hyperpure Rs 216/kg soil-grown (HoReCa); BigBasket live-root "
               "Rs 71 and OnlyHydroponics Rs 59 per 120-200 g head (retail); IRLES Bidar Rs 90/kg (B2B)."),
    "green_oakleaf": _crop(name="Green oakleaf lettuce", mix_group="lettuce", season_group="lettuce", mode="single",
        tower_fit="good", nursery_days=18, first_harvest_days=30, interval_days=31, life_days=30,
        g_per_harvest=(55, 90, 145), loss_first=0.22, loss_steady=0.10,
        price_wholesale=85, price_horeca=160, price_retail=280, cons_basis="per_harvest", cons_inr=(1.07, 3.48, 4.9),
        harvest_method="head", cap_share=0.21,
        source="Lettuce research. Hyperpure green leaf Rs 140/kg; BigBasket hydroponic green oak Rs 47.20 per 150-250 g."),
    "mini_romaine": _crop(name="Mini romaine (Little Gem type)", mix_group="lettuce", season_group="lettuce", mode="single",
        tower_fit="good", nursery_days=18, first_harvest_days=32, interval_days=33, life_days=32,
        g_per_harvest=(50, 80, 120), loss_first=0.25, loss_steady=0.10,
        price_wholesale=100, price_horeca=184, price_retail=350, cons_basis="per_harvest", cons_inr=(1.07, 3.48, 4.9),
        harvest_method="head", cap_share=0.15,
        source="Lettuce research. Hyperpure romaine Rs 184/kg; BigBasket hydroponic romaine Rs 66 per 125-200 g."),
    "butterhead": _crop(name="Butterhead lettuce", mix_group="lettuce", season_group="lettuce", mode="single",
        tower_fit="fair", nursery_days=18, first_harvest_days=32, interval_days=33, life_days=32,
        g_per_harvest=(55, 85, 140), loss_first=0.28, loss_steady=0.12,
        price_wholesale=85, price_horeca=160, price_retail=330, cons_basis="per_harvest", cons_inr=(1.07, 3.48, 4.9),
        harvest_method="head", cap_share=0.12,
        source="Lettuce research (HoReCa price is an estimate). BigBasket live-root Rs 67 per 125-200 g; most tipburn-prone."),
    "batavia": _crop(name="Batavia (summer crisp) lettuce", mix_group="lettuce", season_group="lettuce_heat", mode="single",
        tower_fit="good", nursery_days=18, first_harvest_days=35, interval_days=36, life_days=35,
        g_per_harvest=(60, 100, 170), loss_first=0.20, loss_steady=0.08,
        price_wholesale=90, price_horeca=150, price_retail=260, cons_basis="per_harvest", cons_inr=(1.07, 3.48, 4.9),
        harvest_method="head", cap_share=0.12,
        source="Lettuce research: bolt-resistant, the lettuce for Mar-May. Prices are estimates vs BigBasket Rs 47-52 per 150-250 g."),
    "arugula": _crop(name="Arugula (rocket)", mix_group="other", season_group="arugula", mode="repeat",
        tower_fit="good", nursery_days=9, first_harvest_days=24, interval_days=12, life_days=48,
        g_per_harvest=(20, 35, 55), loss_first=0.20, loss_steady=0.10,
        price_wholesale=130, price_horeca=220, price_retail=700, cons_basis="per_40d", cons_inr=(0.97, 2.7, 3.8),
        harvest_method="cut", cap_share=0.05,
        source="Lettuce research (3 cuts per planting). Hyperpure Rs 236/kg; OnlyHydroponics Rs 349 per 500 g; niche volume."),
    "italian_basil": _crop(name="Italian (Genovese) basil", mix_group="basil", season_group="basil", mode="repeat",
        tower_fit="good", nursery_days=21, first_harvest_days=28, interval_days=18, life_days=100,
        g_per_harvest=(12, 25, 50), loss_first=0.30, loss_steady=0.12,
        price_wholesale=80, price_horeca=150, price_retail=600, cons_basis="per_40d", cons_inr=(0.97, 2.7, 3.8),
        harvest_method="cut", cap_share=0.10,
        source="Herbs research. Hyperpure Rs 15 per 100 g; BigBasket hydroponic Rs 62 per 100 g; OnlyHydroponics Rs 75 per 100 g."),
    "thai_basil": _crop(name="Thai basil", mix_group="other", season_group="basil", mode="repeat",
        tower_fit="good", nursery_days=21, first_harvest_days=30, interval_days=20, life_days=100,
        g_per_harvest=(10, 22, 45), loss_first=0.25, loss_steady=0.10,
        price_wholesale=120, price_horeca=200, price_retail=596, cons_basis="per_40d", cons_inr=(0.97, 2.7, 3.8),
        harvest_method="cut", cap_share=10.0 / 600,
        source="Herbs/prices research. IRLES Rs 120/kg B2B; OnlyHydroponics Rs 149 per 250 g; HoReCa price is an estimate."),
    "mint": _crop(name="Mint", mix_group="other", season_group="mint", mode="repeat",
        tower_fit="good", nursery_days=14, first_harvest_days=35, interval_days=18, life_days=150,
        g_per_harvest=(12, 25, 50), loss_first=0.20, loss_steady=0.10,
        price_wholesale=35, price_horeca=80, price_retail=150, cons_basis="per_40d", cons_inr=(0.97, 2.7, 3.8),
        harvest_method="bunch", cap_share=15.0 / 600,
        source="Herbs research. Hyperpure Rs 20 per 250 g; BigBasket about Rs 102/kg; commodity price."),
    "flat_parsley": _crop(name="Flat-leaf parsley", mix_group="other", season_group="parsley", mode="repeat",
        tower_fit="good", nursery_days=35, first_harvest_days=40, interval_days=21, life_days=120,
        g_per_harvest=(12, 25, 55), loss_first=0.35, loss_steady=0.12,
        price_wholesale=90, price_horeca=150, price_retail=400, cons_basis="per_40d", cons_inr=(0.97, 2.7, 3.8),
        harvest_method="bunch", cap_share=10.0 / 600,
        source="Herbs research. Hyperpure curly parsley Rs 150/kg; BigBasket Rs 41 per 100 g."),
    "coriander": _crop(name="Coriander", mix_group="other", season_group="coriander", mode="single",
        tower_fit="fair", nursery_days=10, first_harvest_days=32, interval_days=35, life_days=32,
        g_per_harvest=(15, 35, 60), loss_first=0.40, loss_steady=0.20,
        price_wholesale=40, price_horeca=72, price_retail=100, cons_basis="per_harvest", cons_inr=(0.77, 2.0, 2.8),
        harvest_method="bunch", cap_share=20.0 / 600,
        source="Herbs research (one clump cut per cycle). Hyperpure Rs 72/kg; KRAMA Rs 31-123/kg; climate research rates it poor in towers."),
    "curly_kale": _crop(name="Curly kale", mix_group="kale", season_group="kale", mode="repeat",
        tower_fit="fair", nursery_days=21, first_harvest_days=38, interval_days=10, life_days=100,
        g_per_harvest=(8, 18, 30), loss_first=0.30, loss_steady=0.12,
        price_wholesale=90, price_horeca=150, price_retail=450, cons_basis="per_40d", cons_inr=(0.97, 2.5, 3.5),
        harvest_method="leaf_pick", cap_share=0.10,
        source="Greens research (light-limited 90-site towers). Hyperpure Rs 144/kg; BigBasket hydroponic Rs 52-60 per 100-125 g."),
    "swiss_chard": _crop(name="Swiss chard", mix_group="other", season_group="chard", mode="repeat",
        tower_fit="good", nursery_days=18, first_harvest_days=30, interval_days=10, life_days=100,
        g_per_harvest=(10, 22, 35), loss_first=0.25, loss_steady=0.10,
        price_wholesale=70, price_horeca=150, price_retail=250, cons_basis="per_40d", cons_inr=(0.97, 2.5, 3.5),
        harvest_method="leaf_pick", cap_share=10.0 / 600,
        source="Greens/prices research. Trikaya Rs 55 per 250 g; hydroponic listings out of stock (thin demand)."),
    "pak_choi": _crop(name="Pak choi (bok choy)", mix_group="other", season_group="pakchoi", mode="single",
        tower_fit="good", nursery_days=16, first_harvest_days=32, interval_days=33, life_days=32,
        g_per_harvest=(30, 60, 110), loss_first=0.30, loss_steady=0.12,
        price_wholesale=70, price_horeca=136, price_retail=300, cons_basis="per_harvest", cons_inr=(0.77, 2.0, 2.8),
        harvest_method="head", cap_share=30.0 / 600,
        source="Greens research. Hyperpure bok choy Rs 136/kg; Trikaya baby pak choi Rs 75 per 250 g."),
    "spinach_english": _crop(name="English / baby spinach (Nov-Feb only)", mix_group="other", season_group="spinach", mode="single",
        tower_fit="poor", nursery_days=12, first_harvest_days=25, interval_days=26, life_days=25,
        g_per_harvest=(15, 35, 60), loss_first=0.50, loss_steady=0.30,
        price_wholesale=80, price_horeca=180, price_retail=300, cons_basis="per_harvest", cons_inr=(0.77, 2.0, 2.8),
        harvest_method="head", cap_share=20.0 / 600, season_months=4,
        source="Greens research: solution must stay at 25 C or less (Cornell), so only Nov-Feb without a chiller. HoReCa price is an estimate."),
    "palak": _crop(name="Palak (Indian spinach)", mix_group="other", season_group="palak", mode="repeat",
        tower_fit="good", nursery_days=14, first_harvest_days=28, interval_days=14, life_days=84,
        g_per_harvest=(10, 22, 35), loss_first=0.20, loss_steady=0.10,
        price_wholesale=22, price_horeca=62, price_retail=100, cons_basis="per_40d", cons_inr=(0.77, 2.0, 2.8),
        harvest_method="bunch", cap_share=30.0 / 600,
        source="Greens research. Hyperpure Rs 62/kg; farmers' markets Rs 20-22/kg."),
    "strawberry": _crop(name="Strawberries (plant Oct-Nov, pick Dec-Apr)", mix_group="other", season_group="strawberry", mode="fruiting",
        tower_fit="fair", nursery_days=14, first_harvest_days=60, interval_days=3, life_days=180,
        g_per_harvest=(60, 150, 330), loss_first=0.30, loss_steady=0.15,
        price_wholesale=150, price_horeca=250, price_retail=300, cons_basis="per_40d", cons_inr=(2.3, 3.9, 5.5),
        harvest_method="fruit", cap_share=0.0, cap_towers_fixed=10,
        source="Strawberry research: 60/150/330 g per plant per season, replant yearly. Prices research: BigBasket Rs 215-342/kg; B2B Rs 150-170/kg. Cap: a 5-10 tower pilot sells easily."),
}

# Harvest-and-pack speed by harvest method (for the crop labour memo column).
HARVEST_KG_PER_HOUR = {
    "head": 30 / 8.0, "leaf_pick": 12 / 8.0, "bunch": 18 / 8.0, "cut": 18 / 8.0, "fruit": 1 / 0.3,
}
HARVEST_KG_PER_HOUR_SOURCE = ("Greens research: whole heads 30 kg, bunching 18 kg, leaf picking 12 kg per worker-day; "
                              "strawberry research: 0.3 h per kg. Cut herbs use the bunching rate (estimate).")

# Month-of-year factors (Jan..Dec) before normalisation to an annual mean of 1.
SEASON_RELATIVE = {
    "lettuce": [1.0, 1.0, 0.6, 0.6, 0.6, 0.8, 0.8, 0.8, 0.8, 0.8, 1.0, 1.0],
    "lettuce_heat": [1.0, 1.0, 0.8, 0.8, 0.8, 0.85, 0.85, 0.85, 0.85, 0.85, 1.0, 1.0],
    "arugula": [1.0, 1.0, 0.67, 0.67, 0.67, 0.85, 0.85, 0.85, 0.85, 1.0, 1.0, 1.0],
    "basil": [0.85, 1.0, 1.0, 1.0, 1.0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.85, 0.85],
    "mint": [1.0, 1.0, 1.0, 1.0, 1.0, 0.82, 0.82, 0.82, 1.0, 1.0, 1.0, 1.0],
    "parsley": [1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0],
    "coriander": [1.0, 1.0, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 0.8, 0.8, 1.0, 1.0],
    "kale": [1.0, 1.0, 0.73, 0.73, 0.73, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0],
    "chard": [1.0, 1.0, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1.0, 1.0, 1.0],
    "pakchoi": [1.0, 1.0, 0.6, 0.6, 0.6, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0],
    "palak": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.85, 0.85, 0.85, 1.0, 1.0],
    "spinach": [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    "strawberry": [0.25, 0.25, 0.25, 0.10, 0, 0, 0, 0, 0, 0, 0, 0.15],
}
SEASON_SOURCE = ("Climate research: lettuce -40% Mar-May and -20% Jun-Oct vs Nov-Feb; basil -30% Jun-Oct (downy mildew); "
                 "kale -20-35% and pak choi -30-50% Mar-May; coriander -40-60% Mar-May; herbs research: mint -10-25% Jun-Aug; "
                 "lettuce research: arugula 2 cuts instead of 3 in Mar-May; strawberry research: fruit Dec-Apr. Batavia, chard, "
                 "parsley, palak factors are estimates. Base crop yields are treated as annual averages.")
SEASON = {}
for _g, _rel in SEASON_RELATIVE.items():
    _mean = sum(_rel) / 12.0
    SEASON[_g] = [x / _mean for x in _rel]

# Asset lives for straight-line depreciation (years).
DEP_LIFE = {
    "tower": (5.0, "Towers research: tower body 3-8 years (base 5). Pumps (2 years) are replaced from the repairs line."),
    "electrical": (10.0, "estimate"),
    "structure": (7.55, "Structure research: frame (70% of cost) 15 years; film and nets (30%) about 3.5 years -> blended 7.55 years."),
    "climate": (5.0, "estimate: fogger line, fans"),
    "site_prep": (15.0, "estimate"),
    "nursery": (3.0, "estimate"),
    "tools": (3.0, "estimate"),
    "ro": (7.0, "estimate: membranes are in running costs"),
    "tanks": (10.0, "estimate"),
    "backup_inverter": (5.0, "Power research: batteries 4-5 years"),
    "backup_dg": (10.0, "estimate"),
    "connection": (15.0, "estimate"),
    "cctv": (5.0, "estimate"),
    "fence": (10.0, "estimate"),
    "cold": (10.0, "estimate"),
    "packing": (5.0, "estimate"),
    "welfare": (10.0, "estimate"),
    "quarters": (15.0, "estimate"),
    "contingency": (7.0, "estimate: blended"),
    "microgreens": (5.0, "estimate: racks, LEDs, trays (about 45 uses)"),
    "trading": (5.0, "estimate"),
}

# BESCOM FY2026-27 tariffs (KERC order 27 Mar 2025). Fixed charge per sanctioned kW per month.
TARIFFS = {
    "LT4c": {"energy": 3.45, "fixed": 145 * 1.341, "name": "LT-4(c) horticulture nursery (agricultural; BESCOM may refuse it for the whole load)"},
    "LT5": {"energy": 4.40, "fixed": 200.0, "name": "LT-5 industrial incl. 'Green House' (likely; demand-based option)"},
    "LT3": {"energy": 6.80, "fixed": 215.0, "name": "LT-3(a) commercial"},
}

# Recommended-mix rules (demand research: lettuces 60%, basil 10-15%, kale 10%, others 15-20%).
MIX_GROUP_TARGETS = {"lettuce": 0.60, "basil": 0.10, "kale": 0.10, "other": 0.20}
MIX_MAX_SHARE_IN_GROUP = {"lettuce": 0.40, "basil": 1.0, "kale": 1.0, "other": 0.50}
MIX_SOURCE = ("Demand research mix: about 60% mixed lettuces, 10-15% basil, 10% kale, 15-20% rocket, pak choi and herbs. "
              "Within a group the model fills the best crops by contribution first, within market caps; at most 40% of the "
              "lettuce group and 50% of the other group in one crop. Poor-fit and season-only crops stay out of the year-round mix.")


# =============================================================================
# Scenario-aware parameter reader
# =============================================================================
def pick(a, scen, w):
    lo, b, hi, better = a["low"], a["base"], a["high"], a.get("better")
    if scen == "base" or better is None:
        return b
    if scen == "conservative":
        tgt = hi if better == "low" else lo
    else:
        tgt = lo if better == "low" else hi
    if isinstance(b, list):
        return [bb + w * (tt - bb) for bb, tt in zip(b, tgt)]
    return b + w * (tgt - b)


class P:
    """Call p('key') to read an assumption for this scenario. Overrides win."""

    def __init__(self, scen="base", ovr=None, w=None):
        assert scen in SCENARIOS
        self.scen = scen
        self.ovr = dict(ovr or {})
        self.w = ASSUMPTIONS["scenario_extremity"]["base"] if w is None else w

    def __call__(self, key):
        if key in self.ovr:
            return self.ovr[key]
        return pick(ASSUMPTIONS[key], self.scen, self.w)

    def blend(self, triple, better):
        return pick({"low": triple[0], "base": triple[1], "high": triple[2], "better": better}, self.scen, self.w)

    def but(self, **ovr):
        d = dict(self.ovr)
        d.update(ovr)
        return P(self.scen, d, self.w)


def season_factor(cid, moy):
    return SEASON[CROPS[cid]["season_group"]][moy - 1]

# =============================================================================
# Demand, channel allocation and money per kg
# =============================================================================
def ramp(p, key, s, grow_after_12=True):
    """Value of a 12-month ramp list at sales month s (1 = first month of sales)."""
    if s < 1:
        return 0.0
    vals = p(key)
    if s <= 12:
        return _interp(range(1, 13), vals, s)
    if not grow_after_12:
        return vals[11]
    g = 0.5 * (vals[11] - vals[5]) / 6.0
    return vals[11] + g * (s - 12)


def demand_at(p, s):
    """(target-price kg/week, bulk kg/week, distress kg/week) at sales month s."""
    if s < 1:
        return 0.0, 0.0, 0.0
    m = p("demand_multiplier")
    return (ramp(p, "demand_target_kg_week", s) * m,
            ramp(p, "demand_bulk_kg_week", s, grow_after_12=False) * m,
            p("demand_distress_kg_week"))


def allocate(H, Dt, Db, Dd, p, forced_target=None):
    """Split H kg/week of harvest into channel shares (fractions of H)."""
    z = {k: 0.0 for k in CHANNELS}
    z["waste"] = 0.0
    if H <= 0:
        return z
    if forced_target is not None:
        T = forced_target * H
    else:
        T = min(p("max_share_at_target_price") * H, Dt)
    rem = H - T
    w0 = min(rem, p("unavoidable_waste_share") * H)
    rem -= w0
    B = min(rem, Db)
    rem -= B
    Dm = min(rem, Dd)
    rem -= Dm
    sh = p("horeca_share_of_target")
    return {"horeca": T * sh / H, "d2c": T * (1 - sh) / H, "bulk": B / H, "distress": Dm / H, "waste": (w0 + rem) / H}


def steady_shares(p):
    return allocate(1.0, INF, INF, INF, p)


def horeca_delivery_rate(kg_day, p):
    """HoReCa delivery cost per kg by volume (numbers review): low-volume loop rate up to 40 kg/day, research rate from 100 kg/day."""
    lo, hi = p("delivery_horeca_low_volume_inr_per_kg"), p("delivery_horeca_inr_per_kg")
    a, b = p("horeca_low_volume_kg_day"), p("horeca_full_rate_kg_day")
    if kg_day <= a:
        return lo
    if kg_day >= b:
        return hi
    return lo + (hi - lo) * (kg_day - a) / (b - a)


def d2c_drop_cost(orders_week, p):
    """Cost per D2C drop: the research full-route cost, or the Borzo loop cost per drop (with GST) on thin routes if higher."""
    floor = p("d2c_delivery_cost_inr_per_drop")
    if orders_week <= 0:
        return floor
    d = max(1.0, orders_week / p("d2c_delivery_days_per_week"))
    loop = (p("borzo_first_point_inr") + p("borzo_inr_per_km") * (p("farm_to_city_km") + p("km_between_drops") * d)
            + p("borzo_extra_drop_inr") * (d - 1.0)) * (1 + p("third_party_delivery_gst"))
    return max(floor, loop / d)


def delivery_rates(H, shares, p, extra_horeca_kg_day=0.0, extra_d2c_orders_week=0.0):
    """Delivery rates for H kg/week of harvest split by channel shares (routes may be shared with side lines)."""
    kg_day = H * shares.get("horeca", 0.0) / 7.0 + extra_horeca_kg_day
    orders = H * shares.get("d2c", 0.0) / p("d2c_kg_greens_per_order") + extra_d2c_orders_week
    return {"horeca": horeca_delivery_rate(kg_day, p), "d2c_drop": d2c_drop_cost(orders, p),
            "horeca_kg_day": kg_day, "d2c_orders_week": orders}


RANKING_REF = {"horeca_kg_day": 15.0, "d2c_orders_week": 100.0,
               "note": "Crop ranking uses the delivery rates of a 150-250 tower farm at month 12: about 15 kg/day to HoReCa "
                       "(low-volume loop rate) and about 100 D2C orders a week (full routes)."}


def ranking_rates(p):
    return {"horeca": horeca_delivery_rate(RANKING_REF["horeca_kg_day"], p),
            "d2c_drop": d2c_drop_cost(RANKING_REF["d2c_orders_week"], p)}


def volume_price_factor(N, p, kg_per_tower_week=1.1):
    """1 - price cut for large farms: none up to 400 towers, full cut at 20% of the Bengaluru hydroponic segment."""
    n0 = p("price_cut_start_towers")
    n_full = max(n0 + 1.0, p("price_cut_full_share") * p("hydroponic_segment_kg_week") / max(0.1, kg_per_tower_week))
    if N <= n0:
        return 1.0
    return 1.0 - p("large_volume_price_cut") * min(1.0, (N - n0) / (n_full - n0))


def channel_prices(c, p, pf=1.0):
    pm = p("price_multiplier") * pf
    ph = c["price_horeca"] * pm
    return {"horeca": ph, "d2c": c["price_retail"] * pm, "bulk": ph * p("bulk_price_share_of_horeca"),
            "distress": c["price_wholesale"] * pm * p("distress_price_share_of_wholesale")}


def money_per_kg(c, shares, p, rates=None, pf=1.0):
    """Money per kg of harvested sellable produce for a given channel split, delivery rates and price factor."""
    if rates is None:
        rates = ranking_rates(p)
    pr = channel_prices(c, p, pf)
    rej = {"horeca": p("reject_horeca"), "d2c": p("reject_d2c"), "bulk": p("reject_bulk"), "distress": 0.0}
    shipped = sum(shares[k] for k in CHANNELS)
    gross_shipped = sum(shares[k] * pr[k] for k in CHANNELS)
    avg = gross_shipped / shipped if shipped > 0 else 0.0
    rejected = sum(shares[k] * rej[k] * pr[k] for k in CHANNELS)
    unsold = shares["waste"] * avg + rejected
    gross = gross_shipped + shares["waste"] * avg
    chan_net = {k: shares[k] * (1 - rej[k]) * pr[k] for k in CHANNELS}
    orders_per_kg = 1.0 / p("d2c_kg_greens_per_order")
    d2c = shares["d2c"]
    fee = d2c * (1 - rej["d2c"]) * orders_per_kg * p("d2c_delivery_fee_inr_per_order")
    pack = (shares["horeca"] * p("pack_horeca_inr_per_kg")
            + d2c * (p("pack_d2c_inr_per_kg") + orders_per_kg * p("carry_bag_inr_per_order"))
            + shares["bulk"] * p("pack_bulk_inr_per_kg") + shares["distress"] * p("pack_distress_inr_per_kg"))
    deliv = (shares["horeca"] * rates["horeca"] + shares["bulk"] * p("delivery_bulk_inr_per_kg")
             + shares["distress"] * p("delivery_distress_inr_per_kg")
             + d2c * orders_per_kg * rates["d2c_drop"])
    bad_debt = chan_net["horeca"] * p("bad_debt_horeca")
    comm = chan_net["distress"] * p("commission_distress") + chan_net["d2c"] * p("payment_fee_d2c")
    return {"prices": pr, "gross": gross, "unsold": unsold, "net_sales": gross - unsold, "chan_net": chan_net,
            "fee": fee, "pack": pack, "delivery": deliv, "bad_debt": bad_debt, "commission": comm,
            "blended_price_sold": (gross_shipped / shipped) if shipped > 0 else 0.0}


# =============================================================================
# Crop economics per tower
# =============================================================================
def crop_eval(cid, p, shares=None):
    c = CROPS[cid]
    sites = p("sites_per_tower")
    occ = p("occupancy")
    g = p.blend(c["g_per_harvest"], "high") * p("yield_multiplier")
    lm = p("loss_multiplier")
    loss_s = min(0.90, c["loss_steady"] * lm)
    loss_f = min(0.95, c["loss_first"] * lm)
    if c["mode"] == "single":
        cuts, cycle = 1, c["interval_days"]
        h40 = 40.0 / cycle
    elif c["mode"] == "repeat":
        cuts = 1 + int(math.floor((c["life_days"] - c["first_harvest_days"]) / c["interval_days"]))
        cycle = c["life_days"] + p("turnaround_days")
        h40 = cuts * 40.0 / cycle
    else:  # fruiting: g is the season total per plant, one planting a year
        cuts, cycle = None, 365
        h40 = 40.0 / 365.0
    sfrac = c["season_months"] / 12.0
    g40_in = h40 * g * (1 - loss_s)
    g40 = g40_in * sfrac
    kg40_in = sites * occ * g40_in / 1000.0
    kg40 = sites * occ * g40 / 1000.0
    cu = p.blend(c["cons_inr"], "low")
    cons40_site = cu * h40 if c["cons_basis"] == "per_harvest" else cu
    cons40 = sites * occ * cons40_site * sfrac
    if shares is None:
        shares = steady_shares(p)
    m = money_per_kg(c, shares, p)
    rev_gross = kg40 * m["gross"]
    unsold = kg40 * m["unsold"]
    net_sales = rev_gross - unsold          # v2: revenue shown net of unsold/rejected produce (numbers review)
    fee = kg40 * m["fee"]
    pack = kg40 * m["pack"]
    deliv = kg40 * m["delivery"]
    comm = kg40 * (m["commission"] + m["bad_debt"])
    var40 = cons40 + pack + deliv + comm
    contrib40 = net_sales + fee - var40
    # crop-specific labour memo (not part of contribution; staff are a monthly cost)
    h1000 = p("labour_h_per_1000_sites_40d")
    non_harvest_h = h1000 * (1 - p("harvest_pack_share_of_hours")) * sites / 1000.0
    harvest_h = kg40 / HARVEST_KG_PER_HOUR[c["harvest_method"]]
    hourly = helper_loaded(p, False) * p("absence_factor") / (p("hours_per_worker_week") * 52 / 12.0)
    lab40 = (non_harvest_h * sfrac + harvest_h) * hourly * p("labour_cost_multiplier")
    # market cap
    Dt, Db, _ = demand_at(p, p("market_cap_sales_month"))
    kgw_in = kg40_in * 7.0 / 40.0
    if c["cap_towers_fixed"] is not None:
        cap_towers = float(c["cap_towers_fixed"])
        cap_kg_week = cap_towers * kgw_in
    else:
        cap_kg_week = c["cap_share"] * (Dt + Db)
        cap_towers = cap_kg_week / kgw_in if kgw_in > 0 else 0.0
    return {
        "crop_id": cid, "crop": c["name"], "tower_fit": c["tower_fit"], "mode": c["mode"],
        "g_per_site_per_harvest": g, "loss_rate_steady": loss_s, "loss_rate_first_cycles": loss_f,
        "cuts_per_planting": cuts, "cycle_days": cycle, "harvests_per_40d": h40,
        "season_months": c["season_months"],
        "sellable_g_per_site_per_40d": g40, "sellable_kg_per_tower_per_40d": kg40,
        "sellable_kg_per_tower_per_40d_in_season": kg40_in,
        "blended_price_inr_per_kg": m["blended_price_sold"],
        "revenue_inr_per_tower_per_40d": net_sales,
        "gross_value_incl_unsold_inr_per_tower_per_40d": rev_gross,
        "d2c_delivery_fee_income_inr_per_tower_per_40d": fee,
        "consumables_inr_per_tower_per_40d": cons40,
        "packaging_inr_per_tower_per_40d": pack,
        "delivery_inr_per_tower_per_40d": deliv,
        "commissions_bad_debt_inr_per_tower_per_40d": comm,
        "unsold_wasted_inr_per_tower_per_40d": unsold,
        "variable_cost_inr_per_tower_per_40d": var40,
        "contribution_inr_per_tower_per_40d": contrib40,
        "contribution_inr_per_tower_per_month": contrib40 / MONTH_TO_40D,
        "labour_memo_inr_per_tower_per_40d": lab40,
        "contribution_after_crop_labour_inr_per_tower_per_month": (contrib40 - lab40) / MONTH_TO_40D,
        "market_cap_kg_per_week": cap_kg_week, "market_cap_towers": cap_towers,
        "prices_by_channel_inr_per_kg": m["prices"],
        "first_harvest_days_in_tower": c["first_harvest_days"], "nursery_days": c["nursery_days"],
    }


# =============================================================================
# Capex
# =============================================================================
def nvph_rate(area, p):
    if area <= 300:
        return p("nvph_rate_small_inr_m2")
    if area <= 700:
        return p("nvph_rate_mid_inr_m2")
    return p("nvph_rate_large_inr_m2")


def normative_charge(kw):
    """KERC RoE normative line charge, LT industrial (power research)."""
    if kw <= 3:
        return 0.0
    if kw <= 15:
        return 650.0 * (kw - 3)
    if kw <= 25:
        return 7800.0 + 1300.0 * (kw - 15)
    if kw <= 50:
        return 20800.0 + 1950.0 * (kw - 25)
    return 5800.0 * kw


def ro_price(lph, p):
    p500, p2000 = p("ro_500lph_inr"), p("ro_2000lph_inr")
    if lph <= 500:
        return p500
    return p500 + (lph - 500) * (p2000 - p500) / 1500.0


def connected_kw(N, p):
    return p("kw_fixed") + N * (p("pump_w_per_tower") / 1000.0 + p("kw_other_per_tower"))


def site_layout(N, p):
    """Split N towers over the owned 60-cent plot, then the owned 40-cent plot, then one leased block (numbers review:
    usable owned land holds about 1,500-1,600 towers). The leased block's rent is unknown and is not costed."""
    a = p("area_m2_per_tower")
    out, rem = [], int(round(N))
    for name, usable, perim in (("Owned 60-cent plot", p("usable_m2_60cent"), p("fence_perimeter_m")),
                                ("Owned 40-cent plot", p("usable_m2_40cent"), p("perimeter_40cent_m"))):
        cap = int(math.floor(usable / a))
        n = min(rem, cap)
        if n > 0:
            out.append({"site": name, "towers": n, "owned": True, "perimeter_m": perim, "usable_m2": usable})
            rem -= n
    if rem > 0:
        gross = rem * a / p("leased_usable_share")
        out.append({"site": "Leased block (rent unknown, not costed)", "towers": rem, "owned": False,
                    "perimeter_m": 4.0 * math.sqrt(gross), "usable_m2": rem * a, "gross_m2": gross})
    if not out:
        out.append({"site": "Owned 60-cent plot", "towers": 0, "owned": True, "perimeter_m": p("fence_perimeter_m"),
                    "usable_m2": p("usable_m2_60cent")})
    for s in out:
        s["connected_kw"] = connected_kw(s["towers"], p)
    return out


def fte_per_tower(p, learning=1.0):
    return (p("sites_per_tower") * p("labour_h_per_1000_sites_40d") / 1000.0 / 40.0 * 7.0 * learning
            / p("hours_per_worker_week") * p("absence_factor"))


def ro_cost(lph, perm_m3_day, p):
    """v1 price curve up to 2,500 L/h; above that, 2,000 L/h units running up to 10 h a day (numbers review: research covers
    500-2,000 L/h only)."""
    if lph <= 2500:
        return ro_price(lph, p)
    units = max(2, int(math.ceil(perm_m3_day / (2.0 * 10.0))))
    return units * p("ro_2000lph_inr")


def capex_items(N, p, spec="full"):
    """spec: full (NVPH, full support), lean (NVPH, research-low support items), test (small rain shelter).
    v2: several sites and step costs above about 600 towers (generators, cold rooms, pack houses, HT supply, fences)."""
    it = []

    def add(key, item, inr, dep, note="", refundable=False, expensed=False):
        it.append({"key": key, "item": item, "inr": float(inr), "dep_class": dep, "note": note,
                   "refundable": refundable, "expensed": expensed})

    small = N <= 200
    lean = spec in ("lean", "test")
    test = spec == "test"

    def S(key):
        return ASSUMPTIONS[key]["low"] if lean else p(key)

    sites_l = site_layout(N, p)
    nsite = len(sites_l)
    sites = N * p("sites_per_tower")
    area = 0.0
    if N > 0:
        kit = N * p("kit_price_ex_gst_inr")
        add("tower_kits", "Tower kits, 80-96 sites (tower, 30-50 L tank, pump, net cups, timer), before GST", kit, "tower",
            "The owner's Rs 5,000-12,000 band covers only this kit.")
        add("tower_gst", "GST on tower kits", kit * p("gst_on_kits"), "tower", "A GST-exempt produce seller cannot claim it back.")
        add("tower_freight", "Freight Pune/Thane to Bengaluru", N * p("freight_inr_per_tower"), "tower")
        add("tower_assembly", "Site preparation under tanks and assembly", N * p("assembly_inr_per_tower"), "tower")
        add("tower_spares", "Start-up spares (pumps, timers, net cups)", N * p("spares_inr_per_tower"), "tower")
        add("electrical", "Electrical distribution and safety (30 mA RCCB/ELCB, earthing, main panel, capacitors)",
            p("electrical_main_panel_inr") * (0.5 if test else nsite) + N * p("electrical_inr_per_tower"), "electrical")
        if test:
            area = N * p("area_m2_per_tower")
            rate = p("rain_shelter_inr_m2")
            add("structure", "Budget film-roof rain shelter, %.0f m2 at Rs %.0f/m2" % (area, rate), area * rate, "structure")
            fans = 1
        else:
            st_cost, parts = 0.0, []
            for s in sites_l:
                a_s = max(p("structure_min_area_m2"), s["towers"] * p("area_m2_per_tower"))
                r_s = nvph_rate(a_s, p)
                area += a_s
                st_cost += a_s * r_s
                parts.append("%.0f m2 at Rs %.0f/m2" % (a_s, r_s))
            add("structure", "Naturally ventilated polyhouse (NVPH), " + " + ".join(parts), st_cost, "structure",
                "Rain-proof roof for the Jun-Nov monsoon (structure and climate research).")
            add("fogger", "Fogger line", area * p("fogger_inr_m2"), "climate")
            fans = int(math.ceil(area / 125.0))
        add("haf_fans", "Circulation (HAF) fans x%d" % fans, fans * p("haf_fan_inr"), "climate")
        add("site_prep", "Levelling, weed mat, drainage, path, tank plinth",
            area * p("site_prep_inr_m2") + p("tank_plinth_inr") * (0.5 if test else nsite), "site_prep")
        add("nursery", "Nursery (98-cell trays, benches, insect-net area, misting)",
            p("nursery_fixed_inr") + N * p("nursery_inr_per_tower"), "nursery")
        add("tools", "pH/EC meters, calibration, mixing station, hand tools", p("tools_fixed_inr") * nsite + N * p("tools_inr_per_tower"), "tools")
        perm = sites * p("water_l_per_site_day") / 1000.0
        lph = perm * 1000.0 / p("ro_run_hours_per_day")
        ro = p("ro_small_inr") if test else ro_cost(lph, perm, p)
        add("ro", "RO plant (about %.0f L/h needed at 5 h a day)" % lph, ro, "ro", "Buy only if the water test fails.")
        raw_m3 = p("raw_storage_days") * perm / p("ro_recovery")
        other_m3 = p("ro_storage_days") * perm + p("stock_tank_m3")
        if raw_m3 > p("pond_above_m3"):
            add("tanks", "Water storage: lined covered pond %.0f m3 (raw) + tanks %.1f m3" % (raw_m3, other_m3),
                raw_m3 * p("pond_inr_per_m3") + other_m3 * 1000.0 * p("tank_inr_per_litre"), "tanks")
        else:
            tank_l = (raw_m3 + other_m3) * 1000.0
            add("tanks", "Water storage tanks (about %.1f m3)" % (tank_l / 1000.0), tank_l * p("tank_inr_per_litre"), "tanks")
        if small:
            add("backup", "Inverter + batteries for the pumps", S("inverter_fixed_inr") + N * S("inverter_inr_per_tower"), "backup_inverter",
                "Roots dry in 30-60 min on hot afternoons (power research).")
        else:
            bkw = p("backup_share_of_pump_kw") * N * p("pump_w_per_tower") / 1000.0 + 1.0 * nsite
            units = max(1, int(math.ceil(bkw / p("dg_unit_kw"))))
            add("backup", "15 kVA CPCB IV+ diesel generator(s) with auto-changeover x%d (about %.0f kW backup)" % (units, bkw),
                units * p("dg_15kva_inr"), "backup_dg")
    kw = connected_kw(N, p)
    norm = dep_ = meter = trf = htm = hts = 0.0
    for s in sites_l:
        k = s["connected_kw"]
        norm += normative_charge(k)
        dep_ += k * p("grid_deposit_inr_per_kw")
        meter += p("grid_meter_inr")
        if k >= p("lt_limit_kw"):
            hts += p("ht_substation_inr")
        elif k > p("transformer_above_kw"):
            trf += int(math.ceil(k / 0.8 / p("transformer_kva_unit"))) * p("transformer_inr")
        if p("ht_type_metering_above_kw") <= k < p("lt_limit_kw"):
            htm += p("ht_type_metering_inr")
    add("grid_normative", "BESCOM normative line charge (%.1f kW connected)" % kw, norm, "connection")
    add("grid_deposit", "BESCOM security deposit (refundable)", dep_, None, refundable=True)
    add("grid_meter", "3-phase smart meter", meter, "connection")
    if trf > 0:
        add("transformer", "Distribution transformer + line (if the local transformer is full)", trf, "connection")
    if htm > 0:
        add("ht_metering", "HT-type metering cubicle (50-150 kW at LT, tariff clause 31)", htm, "connection")
    if hts > 0:
        add("ht_substation", "HT supply: 11 kV metering, breaker and own transformer (150 kW or more, tariff clause 9)", hts, "connection")
    add("cctv", "CCTV, 4G router, UPS, siren, security lights", S("cctv_small_inr") if small else p("cctv_large_inr") * nsite, "cctv")
    if small:
        add("fence", "Barbed-wire fence round the 60-cent plot + gate", p("fence_perimeter_m") * S("fence_barbed_inr_m") + S("gate_inr"), "fence")
    else:
        per = sum(s["perimeter_m"] for s in sites_l)
        add("fence", "Chain-link fence round %d site(s), %.0f m + gates" % (nsite, per),
            per * p("fence_chainlink_inr_m") + nsite * p("gate_inr"), "fence")
    n_cold = 0 if small else max(1, int(math.ceil(N / p("towers_per_cold_room"))))
    add("cold", "Cold storage and pre-cooling" + (" (chest freezer as cooler)" if small else " (walk-in 8x8x8 ft x%d)" % n_cold),
        S("cold_small_inr") if small else n_cold * p("cold_large_inr"), "cold")
    crates = max(p("min_crates"), int(math.ceil(N * p("crates_per_tower"))))
    n_ph = 0 if small else max(1, int(math.ceil(N / p("towers_per_pack_house"))))
    add("packing", "Packing area: %d crates, scales, label printer, tables%s" % (crates, "" if small else ", 9x6 m pack house x%d" % n_ph),
        crates * p("crate_inr") + S("packing_tools_inr") * nsite + n_ph * p("pack_house_inr"), "packing")
    workers = int(math.ceil(N * fte_per_tower(p))) + 3 * nsite
    n_wel = max(nsite, int(math.ceil(workers / p("workers_per_welfare_set"))))
    add("welfare", "Worker welfare: toilet, drinking water, first aid, snake-bite kit, extinguishers" + ("" if small else " x%d" % n_wel),
        S("welfare_small_inr") if small else n_wel * p("welfare_large_inr"), "welfare")
    add("quarters", "Room for a resident caretaker" + ("" if nsite == 1 else " x%d" % nsite),
        (p("quarters_inr") if test else S("quarters_inr")) * nsite, "quarters", "A resident caretaker also gives night presence.")
    add("registrations", "Registrations: FSSAI central licence, trademark, GST/Udyam help, trade licence", S("registrations_inr"), None, expensed=True)
    add("water_tests", "Water lab tests (EC, pH, alkalinity, Na, Cl, NO3, bacteria)", p("water_tests_inr"), None, expensed=True)
    add("initial_marketing", "First marketing: samples, ad test, print", S("initial_marketing_inr"), None, expensed=True)
    if N > 0:
        add("starting_stock", "Starting stock: seed, plug media, nutrient salts, acid, IPM kit", sites * p("starting_stock_inr_per_site"), None, expensed=True)
    base_sum = sum(i["inr"] for i in it if not i["refundable"])
    add("contingency", "Contingency 10%", base_sum * p("contingency_share"), "contingency")
    for i in it:
        i["area_m2"] = area
        i["connected_kw"] = kw
        i["sites"] = nsite
    it[-1]["_site_list"] = sites_l
    return it


def capex_summary(items, N):
    tot = sum(i["inr"] for i in items)
    dep = 0.0
    for i in items:
        if i["dep_class"] and not i["refundable"] and not i["expensed"]:
            dep += i["inr"] / (DEP_LIFE[i["dep_class"]][0] * 12.0)
    struct = sum(i["inr"] for i in items if i["key"] == "structure")
    insurable = sum(i["inr"] for i in items if i["dep_class"] and i["key"] != "structure" and not i["refundable"])
    tower_only = sum(i["inr"] for i in items if i["key"] in ("tower_kits", "tower_gst", "tower_freight", "tower_assembly", "tower_spares"))
    parts = (sum(i["inr"] for i in items if i["dep_class"] and not i["refundable"] and not i["expensed"])
             + sum(i["inr"] for i in items if i["refundable"]) + sum(i["inr"] for i in items if i["expensed"]))
    assert abs(parts - tot) < 1.0, "capex lines do not add up to the capex total"          # self-check 1
    site_list = next((i["_site_list"] for i in items if "_site_list" in i), None)
    return {"towers": N, "total_inr": tot, "dep_month_inr": dep, "structure_inr": struct, "insurable_inr": insurable,
            "refundable_inr": sum(i["inr"] for i in items if i["refundable"]),
            "expensed_inr": sum(i["inr"] for i in items if i["expensed"]),
            "tower_items_inr": tower_only,
            "area_m2": items[0]["area_m2"] if items else 0.0, "connected_kw": items[0]["connected_kw"] if items else 0.0,
            "sites": items[0].get("sites", 1) if items else 0, "site_list": site_list}


# =============================================================================
# Monthly running costs
# =============================================================================
def loaded_cost(p, wage, esi_on=False, epf_on=False, grat_on=False, bonus=True):
    """Monthly cost of one worker: wage + bonus + leave + ESI (wage <= Rs 21,000) + EPF + gratuity + PPE + welfare."""
    esi = p("esi_rate") if (esi_on and wage <= 21000) else 0.0
    epf = p("epf_rate") * min(wage, p("epf_wage_cap_inr")) if epf_on else 0.0
    grat = p("gratuity_rate") * wage if grat_on else 0.0
    return (wage * (1 + (p("bonus_rate") if bonus else 0.0) + p("leave_rate") + esi) + epf + grat
            + p("ppe_inr_per_worker_month") + p("welfare_inr_per_worker_month"))


def helper_loaded(p, esi_on, epf_on=False, grat_on=False):
    return loaded_cost(p, p("helper_wage_inr_month"), esi_on, epf_on, grat_on)


def staff_loaded(p, wage, epf_on=False, grat_on=False):
    return loaded_cost(p, wage, False, epf_on, grat_on)


def water_factors(moy, p):
    """(use factor, use x tanker-price factor) for a month of year, or the annual average when moy is None."""
    hu, hp = p("water_use_hot_month_factor"), p("tanker_peak_price_factor")

    def uf(m):
        return hu if m in (3, 4, 5) else 1.0

    def pf(m):
        return hp if m in (2, 3, 4, 5) else 1.0
    if moy is None:
        return sum(uf(m) for m in range(1, 13)) / 12.0, sum(uf(m) * pf(m) for m in range(1, 13)) / 12.0
    return uf(moy), uf(moy) * pf(moy)


def rain_share(cs, sites_p, p):
    """Share of RO-grade demand met by rain from the model's own roof (numbers review), capped by storage and dry months."""
    demand = sites_p * p("water_l_per_site_day") * 365.0 / 1000.0
    if demand <= 0:
        return 0.0
    collected = cs["area_m2"] * p("rain_mm_year") / 1000.0 * p("rain_runoff")
    return min(p("rain_share_cap"), collected / demand)


def own_cash_for_capex(p):
    """Owner cash that can go into capex: Rs 20 lakh - remaining commitment - minimum reserve."""
    return p("starting_cash_inr") - p("commitment_inr_per_month") * p("commitment_months") - p("min_cash_reserve_inr")


COST_BASES = ("research", "owner", "owner_realistic")
COST_BASIS_NAMES = {
    "research": "Research costs (research values; uniform minimum wage; agency guard and paid grower above 150 towers)",
    "owner": "Your costs (your 29 Sep figures exactly; items you did not mention at research values)",
    "owner_realistic": "Your plan at legal-minimum cost (your organisation; agriculture minimum wage; real power and water bills)",
}


def opex_items(Nb, Np, p, cs, learning=1.0, days=DAYS_PER_MONTH, flags=None, moy=None):
    """Nb = towers built (site items), Np = tower-equivalents planted (crop items). Returns (items, details).
    flags: cost_basis ('research' | 'owner' | 'owner_realistic'), caretaker, grower, guard, extra_fte, tariff, water_source,
    site_active, months_since_build (owner_realistic repairs), loan (owner_realistic insurance and CA)."""
    flags = flags or {}
    basis = flags.get("cost_basis", "research")
    assert basis in COST_BASES
    f = days / DAYS_PER_MONTH
    lm = p("labour_cost_multiplier")
    sites_p = Np * p("sites_per_tower")
    nsite = (cs.get("sites") or 1) if Nb > 0 else 0
    wk_h = sites_p * p("labour_h_per_1000_sites_40d") / 1000.0 / 40.0 * 7.0 * learning
    fte_req = wk_h / p("hours_per_worker_week") * p("absence_factor") + flags.get("extra_fte", 0.0)
    caretaker_on = flags.get("caretaker", Nb > 0)
    n_ct = max(1, nsite) if caretaker_on else 0
    credit = p("caretaker_production_fte") * n_ct
    helper_fte = max(0.0, fte_req - credit)
    grower_on = flags.get("grower", Nb > p("owner_grows_up_to_towers"))
    if basis == "owner_realistic" and "grower" not in flags:
        grower_on = Nb > p("owner_realistic_grows_up_to_towers")
    n_sup = max(0, int(math.ceil(Nb / p("supervisor_per_towers"))) - 1) if Nb > 600 else 0
    guard_on = flags.get("guard", Nb > p("guard_needed_above_towers"))
    n_guard = max(1, nsite) if guard_on else 0
    headcount = int(math.ceil(helper_fte - 1e-9)) + n_ct + int(grower_on) + n_sup + n_guard
    esi_on = headcount >= p("esi_threshold_employees")
    epf_on = headcount >= p("epf_threshold_employees")
    grat_on = headcount >= p("gratuity_threshold_employees")
    it = {}
    it["production_helpers"] = helper_fte * helper_loaded(p, esi_on, epf_on, grat_on) * lm * f
    it["caretaker"] = n_ct * staff_loaded(p, p("caretaker_wage_inr_month"), epf_on, grat_on) * lm * f
    it["grower"] = (int(grower_on) + n_sup) * staff_loaded(p, p("grower_wage_inr_month"), epf_on, grat_on) * lm * f
    it["night_guard"] = n_guard * p("guard_agency_inr_month") * lm * f
    tariff = TARIFFS[flags.get("tariff", p("tariff_category"))]
    src = flags.get("water_source", p("water_source"))
    use_f, cost_f = water_factors(moy, p)
    pump_kwh = Np * p("pump_w_per_tower") * p("pump_duty") * 24.0 * days / 1000.0
    fan_kwh = Np * p("fan_kwh_per_tower_month") * f
    site_kwh = (p("site_kwh_fixed_month") * max(1, nsite) + Nb * p("site_kwh_per_tower_month")) * f if Nb > 0 else 0.0
    perm = sites_p * p("water_l_per_site_day") * days / 1000.0 * use_f
    raw = perm / p("ro_recovery")
    ro_kwh = perm * p("ro_kwh_per_m3")
    bore_kwh = raw * p("borewell_kwh_per_m3") if src == "borewell" else 0.0
    kwh = pump_kwh + fan_kwh + site_kwh + ro_kwh + bore_kwh
    tax = p("electricity_tax")
    site_list = cs.get("site_list") or [{"towers": Nb, "connected_kw": cs["connected_kw"]}]
    tot_t = float(sum(s["towers"] for s in site_list)) or 1.0
    elec, ht_kwh, sanction = 0.0, 0.0, 0.0
    for s in site_list:
        k = kwh * s["towers"] / tot_t
        if Nb > 0 and s["connected_kw"] >= p("lt_limit_kw"):
            kva = p("sanction_share_of_connected") * s["connected_kw"] / 0.9
            elec += (k * (p("ht_tariff_energy_inr_kwh") + p("fppca_inr_kwh")) * (1 + tax) + k * p("pg_surcharge_inr_kwh")
                     + kva * p("ht_tariff_demand_inr_kva") * (1 + tax) * f)
            ht_kwh += k
            sanction += kva * 0.9
        else:
            sk = max(p("min_sanction_kw"), p("sanction_share_of_connected") * s["connected_kw"]) if Nb > 0 else 0.0
            sanction += sk
            elec += (k * (tariff["energy"] + p("fppca_inr_kwh")) * (1 + tax) + k * p("pg_surcharge_inr_kwh")
                     + sk * tariff["fixed"] * (1 + tax) * f)
    it["electricity"] = elec
    if Nb > 0:
        if Nb <= 200:
            it["backup_running"] = (p("outage_hours_per_month") * p("inverter_running_inr_h") + p("dg_rental_inr_month")) * f
        else:
            bkw = p("backup_share_of_pump_kw") * Nb * p("pump_w_per_tower") / 1000.0 + max(1, nsite)
            it["backup_running"] = p("outage_hours_per_month") * p("dg_running_inr_h") * max(1.0, bkw / 10.0) * f
    else:
        it["backup_running"] = 0.0
    price_ratio = cost_f / use_f
    if src == "tanker":
        tanker = raw * p("tanker_inr_per_m3") * price_ratio
    elif src == "tanker_rain":
        tanker = raw * p("tanker_inr_per_m3") * price_ratio - raw * rain_share(cs, sites_p, p) * p("tanker_inr_per_m3")
    else:
        tanker = p("borewell_fixed_upkeep_inr_month") * f if Nb > 0 else 0.0
    ro_cons = perm * p("ro_consumables_inr_per_m3")
    it["water"] = tanker + ro_cons
    it["repairs_towers"] = Nb * p("tower_parts_inr_per_tower_month") * f
    it["repairs_structure"] = cs["structure_inr"] * p("structure_repair_share_per_year") / 12.0 * f
    it["ipm_sanitation"] = cs["area_m2"] * p("ipm_inr_per_m2_month") * f * (min(1.0, Np / Nb) if Nb > 0 else 0.0)
    it["internet_cctv"] = p("internet_cctv_inr_month") * max(1, nsite) * f if (Nb > 0 or flags.get("site_active")) else 0.0
    it["insurance"] = (cs["insurable_inr"] * p("insurance_assets_rate_year") + cs["structure_inr"] * p("insurance_structure_rate_year")) / 12.0 * f
    fssai = p("fssai_renewal_inr_month") * f
    payroll = p("payroll_inr_per_employee_month") * headcount * f if headcount >= p("esi_threshold_employees") else 0.0
    it["accounting_compliance"] = p("accounting_inr_month") * f + fssai + payroll
    it["marketing"] = (p("marketing_fixed_inr_month") + Nb * p("marketing_inr_per_tower_month")) * f
    crates = max(p("min_crates"), int(math.ceil(Nb * p("crates_per_tower")))) if Nb > 0 else 0
    it["crate_losses"] = crates * p("crate_inr") * p("crate_loss_share_month") * f
    it["tests_calibration"] = p("tests_calibration_inr_month") * f if Nb > 0 else 0.0
    loan = flags.get("loan", cs["total_inr"] > own_cash_for_capex(p))
    if basis == "owner" and Nb > 0:
        unit = max(1.0, Nb / 600.0)
        it["night_guard"] = OWNER_COSTS["night_guard"] * unit * f
        it["caretaker"] = OWNER_COSTS["caretaker"] * unit * f
        it["production_helpers"] = OWNER_COSTS["production_helpers"] * unit * f
        it["grower"] = n_sup * staff_loaded(p, p("grower_wage_inr_month"), epf_on, grat_on) * lm * f   # owner grows; supervisors unmentioned
        it["water"] = OWNER_COSTS["water"] * unit * f + ro_cons                                        # RO consumables unmentioned
        it["electricity"] = OWNER_COSTS["electricity"] * unit * f
        it["repairs_towers"] = OWNER_COSTS["repairs"] * f
        it["repairs_structure"] = 0.0
        it["insurance"] = 0.0
        it["accounting_compliance"] = fssai                                                           # FSSAI fee unmentioned
        it["marketing"] = 0.0
    elif basis == "owner_realistic" and Nb > 0:
        it["production_helpers"] = helper_fte * loaded_cost(p, p("agri_min_wage_month_inr"), esi_on, epf_on, grat_on, bonus=False) * f
        it["caretaker"] = n_ct * loaded_cost(p, p("caretaker_7day_agri_inr"), False, epf_on, grat_on, bonus=False) * f
        guard_wage = p("guard_12h_day_wages") * p("agri_min_wage_day_inr")
        it["night_guard"] = n_guard * loaded_cost(p, guard_wage, False, epf_on, grat_on, bonus=False) * f
        if flags.get("months_since_build", 99) <= 6:
            it["repairs_towers"] = 0.0
            it["repairs_structure"] = 0.0
        if not loan:
            it["insurance"] = 0.0
        it["accounting_compliance"] = fssai + payroll + (p("accounting_inr_month") * f if (loan or headcount >= p("esi_threshold_employees")) else 0.0)
    det = {"helper_fte": helper_fte, "fte_required": fte_req, "headcount": headcount, "esi_applies": esi_on,
           "epf_applies": epf_on, "gratuity_applies": grat_on, "caretakers": n_ct, "guard_posts": n_guard, "supervisors": n_sup,
           "sites": nsite, "kwh": kwh, "ht_kwh": ht_kwh, "pump_kwh": pump_kwh, "sanctioned_kw": sanction, "raw_water_m3": raw,
           "ro_water_m3": perm, "water_use_factor": use_f, "grower": grower_on, "guard": guard_on, "caretaker": caretaker_on,
           "tariff": tariff["name"], "water_source": src, "cost_basis": basis, "loan_assumed": loan}
    return it, det


OPEX_LABELS = {
    "production_helpers": "Production helpers and packers (sized from hours per 1,000 sites)",
    "caretaker": "Resident caretaker, 7 days (also night presence); one per site",
    "grower": "Trained grower (above 150 towers) and supervisors (above 600 towers)",
    "night_guard": "Night security guard, 12-h post with relief nights (above 150 towers; one per site)",
    "electricity": "Electricity (pumps, fans, RO, site loads; energy + fixed charge + tax; HT-2(a) at 150 kW+)",
    "backup_running": "Backup power running (outages; generator rental on shutdown days)",
    "water": "Water (tanker purchase incl. Feb-May peak, or borewell upkeep) + RO consumables",
    "repairs_towers": "Repairs: pumps, net cups, tubing, timers",
    "repairs_structure": "Repairs: structure (1.5% a year)",
    "ipm_sanitation": "IPM and sanitation (traps, biopesticides, H2O2, hypochlorite)",
    "internet_cctv": "Internet/SIM for CCTV and CCTV upkeep",
    "insurance": "Insurance (fire, storm/flood, burglary; structure cover)",
    "accounting_compliance": "Accounting, CA and FSSAI renewal",
    "marketing": "Marketing, samples and sales travel",
    "crate_losses": "Crates lost at buyers (5-10% of stock a month)",
    "tests_calibration": "Water and produce tests, meter calibration",
}


# =============================================================================
# Crop ranking and recommended mix
# =============================================================================
def crop_ranking(p):
    rows = [crop_eval(cid, p) for cid in CROPS]
    rows.sort(key=lambda r: -r["contribution_inr_per_tower_per_month"])
    for i, r in enumerate(rows):
        r["rank"] = i + 1
    return rows


def _eligible(cid, contrib):
    c = CROPS[cid]
    return c["tower_fit"] != "poor" and c["season_months"] == 12 and c["mode"] != "fruiting" and contrib.get(cid, 0) > 0


def choose_mix(N, ranking_rows):
    """Towers per crop for N towers. Returns (alloc, towers_beyond_market_cap)."""
    if N <= 0:
        return {}, 0
    caps = {r["crop_id"]: int(math.floor(r["market_cap_towers"])) for r in ranking_rows}
    contrib = {r["crop_id"]: r["contribution_inr_per_tower_per_month"] for r in ranking_rows}
    order = [r["crop_id"] for r in ranking_rows]
    raw = {g: N * t for g, t in MIX_GROUP_TARGETS.items()}
    gt = {g: int(math.floor(v)) for g, v in raw.items()}
    rest = N - sum(gt.values())
    for g in sorted(raw, key=lambda k: -(raw[k] - gt[k]))[:rest]:
        gt[g] += 1
    alloc = {}
    leftover = 0

    def place(cid, n):
        room = min(n, caps[cid] - alloc.get(cid, 0))
        if room > 0:
            alloc[cid] = alloc.get(cid, 0) + room
            return room
        return 0

    for g in ("lettuce", "basil", "kale", "other"):
        tg = gt[g]
        cands = [c for c in order if CROPS[c]["mix_group"] == g and _eligible(c, contrib)]
        remaining = tg
        maxc = int(math.ceil(MIX_MAX_SHARE_IN_GROUP[g] * tg)) if tg > 0 else 0
        for cid in cands:
            if remaining <= 0:
                break
            remaining -= place(cid, min(maxc - alloc.get(cid, 0), remaining))
        for cid in cands:
            if remaining <= 0:
                break
            remaining -= place(cid, remaining)
        leftover += remaining
    for cid in order:  # place what is left in any eligible crop, still within caps
        if leftover <= 0:
            break
        if _eligible(cid, contrib):
            leftover -= place(cid, leftover)
    beyond = leftover
    if beyond > 0:  # more towers than buyers: grown as the best lettuce, sold mostly as surplus
        top = next(c for c in order if CROPS[c]["mix_group"] == "lettuce" and _eligible(c, contrib))
        alloc[top] = alloc.get(top, 0) + beyond
    return {k: v for k, v in alloc.items() if v > 0}, beyond


def mix_shares(alloc):
    n = float(sum(alloc.values()))
    return {c: v / n for c, v in alloc.items()} if n > 0 else {}


def mix_kg_per_tower_week(alloc, p):
    sh = mix_shares(alloc)
    return sum(sh[c] * crop_eval(c, p)["sellable_kg_per_tower_per_40d"] * 7.0 / 40.0 for c in sh)


# =============================================================================
# Steady-state monthly P&L (annual average of 12 calendar months)
# =============================================================================
ZERO_CS = {"towers": 0, "total_inr": 0.0, "dep_month_inr": 0.0, "structure_inr": 0.0, "insurable_inr": 0.0,
           "refundable_inr": 0.0, "expensed_inr": 0.0, "tower_items_inr": 0.0, "area_m2": 0.0, "connected_kw": 0.0,
           "sites": 0, "site_list": None}


def steady_state(N, alloc, p, basis="m12", forced_target=None, flags=None, spec="full", s_month=None):
    """Steady-state month (annual average of 12 calendar months with season factors).
    basis: 'm12' = demand at sales month 12 (or s_month); 'unconstrained' = every kg sells at the small-farm mix."""
    flags = dict(flags or {})
    items = capex_items(N, p, spec)
    cs = capex_summary(items, N)
    shm = mix_shares(alloc)
    ce = {c: crop_eval(c, p) for c in shm}
    kgw_tower = sum(shm[c] * ce[c]["sellable_kg_per_tower_per_40d"] * 7.0 / 40.0 for c in shm)
    pf = volume_price_factor(N, p, kgw_tower) if flags.get("volume_price_cut", True) else 1.0
    keys = ("net_sales", "unsold", "gross", "fee", "pack", "delivery", "bad_debt", "commission")
    acc = {k: 0.0 for k in keys}
    acc["harvest_kg"] = 0.0
    chan_kg = {k: 0.0 for k in list(CHANNELS) + ["waste"]}
    s = p("market_cap_sales_month") if s_month is None else s_month
    Dt, Db, Dd = demand_at(p, s)
    if basis == "unconstrained":
        Dt = Db = Dd = INF
    rate_acc = {"horeca": 0.0, "d2c_drop": 0.0, "horeca_kg_day": 0.0, "d2c_orders_week": 0.0}
    for moy in range(1, 13):
        kgw = {c: N * shm[c] * ce[c]["sellable_kg_per_tower_per_40d"] * 7.0 / 40.0 * season_factor(c, moy) for c in shm}
        H = sum(kgw.values())
        sh = allocate(H, Dt, Db, Dd, p, forced_target)
        rates = delivery_rates(H, sh, p, flags.get("extra_horeca_kg_day", 0.0), flags.get("extra_d2c_orders_week", 0.0))
        for k in rate_acc:
            rate_acc[k] += rates[k] / 12.0
        for c, kw in kgw.items():
            kg_m = kw * DAYS_PER_MONTH / 7.0
            m = money_per_kg(CROPS[c], sh, p, rates, pf)
            acc["harvest_kg"] += kg_m
            for k in keys:
                acc[k] += kg_m * m[k]
        for k in chan_kg:
            chan_kg[k] += H * DAYS_PER_MONTH / 7.0 * sh[k]
    for k in acc:
        acc[k] /= 12.0
    for k in chan_kg:
        chan_kg[k] /= 12.0
    cons = sum(N * shm[c] * ce[c]["consumables_inr_per_tower_per_40d"] for c in shm) / MONTH_TO_40D
    ox, det = opex_items(N, N, p, cs, flags=flags)
    revenue = acc["net_sales"] + acc["fee"]
    variable = cons + acc["pack"] + acc["delivery"] + acc["bad_debt"] + acc["commission"]
    contribution = revenue - variable
    opex = sum(ox.values())
    ebitda = contribution - opex
    assert abs(opex - sum(ox[k] for k in ox)) < 1e-6                                                  # self-check 2
    assert abs((revenue - variable - opex) - ebitda) < 1e-6                                          # self-check 3
    commit = p("commitment_inr_per_month")
    dep = cs["dep_month_inr"]
    harvest = acc["harvest_kg"]
    return {
        "towers": N, "basis": basis, "sales_month_for_demand": s, "cost_basis": flags.get("cost_basis", "research"),
        "harvest_kg_per_month": harvest, "harvest_kg_per_week": harvest * 7.0 / DAYS_PER_MONTH,
        "demand_target_kg_per_week": Dt if Dt != INF else None, "demand_bulk_kg_per_week": Db if Db != INF else None,
        "channel_kg_per_month": chan_kg,
        "share_sold_at_target_price": (chan_kg["horeca"] + chan_kg["d2c"]) / harvest if harvest else 0.0,
        "price_factor_large_volume": pf, "delivery_rates_avg": rate_acc,
        "sales_revenue_inr": acc["net_sales"], "delivery_fee_income_inr": acc["fee"], "revenue_inr": revenue,
        "unsold_value_inr": acc["unsold"],
        "consumables_inr": cons, "packaging_inr": acc["pack"], "delivery_inr": acc["delivery"],
        "commissions_bad_debt_inr": acc["bad_debt"] + acc["commission"],
        "variable_costs_inr": variable, "contribution_inr": contribution,
        "opex_items_inr": ox, "opex_inr": opex, "opex_details": det,
        "ebitda_before_commitment_inr": ebitda,
        "commitment_inr": commit, "ebitda_after_commitment_inr": ebitda - commit,
        "depreciation_inr": dep,
        "profit_after_depreciation_before_commitment_inr": ebitda - dep,
        "profit_after_depreciation_after_commitment_inr": ebitda - dep - commit,
        "capex_total_inr": cs["total_inr"], "capex_summary": cs,
    }


# =============================================================================
# Month-by-month plan engine (M1 = Oct 2026 ... M18 = Mar 2028)
# =============================================================================
START = datetime.date(2026, 10, 1)


def calendar(n=18):
    out, d = [], START
    for i in range(n):
        nd = datetime.date(d.year + (1 if d.month == 12 else 0), 1 if d.month == 12 else d.month + 1, 1)
        out.append({"idx": i + 1, "label": "M%d" % (i + 1), "ym": d.strftime("%Y-%m"), "name": d.strftime("%b %Y"),
                    "moy": d.month, "day0": (d - START).days, "day1": (nd - START).days, "days": (nd - d).days})
        d = nd
    return out


def day_to_date(day):
    return (START + datetime.timedelta(days=int(round(day)))).isoformat()


def ramp_avg(a, b, t0, R):
    if b <= t0:
        return 0.0
    tot = 0.0
    for t in range(a, b):
        tot += min(1.0, max(0.0, (t + 0.5 - t0) / R))
    return tot / float(b - a)


def window_share(a, b, t0, R, w0, w1):
    num = den = 0.0
    for t in range(a, b):
        x = min(1.0, max(0.0, (t + 0.5 - t0) / R))
        den += x
        if w0 <= t < w1:
            num += x
    return num / den if den > 0 else 0.0


REUSE_ALWAYS = {"tower_kits", "tower_gst", "tower_freight", "tower_assembly", "tower_spares", "electrical", "nursery", "tools",
                "grid_normative", "grid_deposit", "grid_meter", "transformer", "cctv", "fence", "cold", "packing", "welfare",
                "quarters", "registrations", "water_tests", "initial_marketing", "starting_stock", "backup", "ht_metering",
                "ht_substation"}


def incremental_capex(new, prev, prev_spec, p):
    prevd = {}
    for i in prev:
        prevd[i["key"]] = prevd.get(i["key"], 0.0) + i["inr"]
    out = []
    for i in new:
        if i["key"] == "contingency":
            continue
        reuse = i["key"] in REUSE_ALWAYS or prev_spec != "test"
        inc = max(0.0, i["inr"] - (prevd.get(i["key"], 0.0) if reuse else 0.0))
        if inc > 0:
            j = dict(i)
            j["inr"] = inc
            out.append(j)
    base = sum(x["inr"] for x in out if not x["refundable"])
    out.append({"key": "contingency", "item": "Contingency 10%", "inr": base * p("contingency_share"), "dep_class": "contingency",
                "note": "", "refundable": False, "expensed": False, "area_m2": new[0]["area_m2"], "connected_kw": new[0]["connected_kw"],
                "sites": new[0].get("sites", 1)})
    return out


def mg_capacity_needed(tw):
    return 100 if tw <= 70 else (200 if tw <= 140 else 400)


def mg_size_index(tw):
    return 0 if tw <= 50 else (1 if tw <= 100 else 2)


def microgreens_month(mo, p, plan, cap_level):
    tw = 0
    if plan.get("microgreens"):
        tw = p("mg_trays_week_later") if mo["idx"] >= p("mg_step_up_month") else p("mg_trays_week_start")
    res = {"trays_week": tw, "trays_sown": 0.0, "kg_harvest": 0.0, "kg_sold": 0.0, "revenue": 0.0, "var_cost": 0.0,
           "fixed": 0.0, "labour_fte": 0.0, "capex": 0.0, "cap_level": cap_level}
    if tw <= 0:
        return res
    a, b = mo["day0"], mo["day1"]
    start = p("mg_start_day")
    need = mg_capacity_needed(tw)
    if need > cap_level:
        price = {0: 0.0, 100: p("mg_capex_100_inr"), 200: p("mg_capex_200_inr"), 400: p("mg_capex_400_inr")}
        res["capex"] = price[need] - price[cap_level]
        res["cap_level"] = need
    active = max(0, b - max(a, start))
    if active <= 0:
        return res
    hs = start + p("mg_cycle_days")
    hdays = max(0, b - max(a, hs))
    res["trays_sown"] = tw * active / 7.0
    trays_h = tw * hdays / 7.0
    first_days = max(0, min(b, hs + 30) - max(a, hs)) if hdays > 0 else 0
    fs = first_days / float(hdays) if hdays > 0 else 0.0
    loss = fs * p("mg_loss_first") + (1 - fs) * p("mg_loss_steady")
    kg = trays_h * p("mg_yield_g_per_tray") / 1000.0 * (1 - loss)
    s = mo["idx"] - plan.get("clock_start", 1) + 1
    dem = ramp(p, "mg_demand_kg_week", s, grow_after_12=False) * hdays / 7.0
    sold = min(kg, dem)
    res.update({"kg_harvest": kg, "kg_sold": sold, "revenue": sold * p("mg_price_inr_per_kg"),
                "var_cost": res["trays_sown"] * p("mg_var_cost_inr_per_tray"),
                "fixed": p("mg_fixed_inr_month")[mg_size_index(tw)] * active / DAYS_PER_MONTH,
                "labour_fte": p("mg_workers")[mg_size_index(tw)] * active / float(mo["days"])})
    return res


def trading_month(mo, p, plan):
    res = {"accounts": 0.0, "sales": 0.0, "gross_profit": 0.0, "net_profit": 0.0, "wc_level": 0.0}
    if not plan.get("trading"):
        return res
    s = mo["idx"] - plan.get("clock_start", 1) + 1
    if s < 1:
        return res
    a, b = mo["day0"], mo["day1"]
    active = max(0, b - max(a, p("trade_start_day")))
    if active <= 0:
        return res
    acc = ramp(p, "trade_accounts", s)
    basket = p("trade_basket_inr_per_account_week")
    sales = acc * basket * active / 7.0
    res.update({"accounts": acc, "sales": sales, "gross_profit": sales * p("trade_gross_margin"),
                "net_profit": sales * (p("trade_net_margin") - p("trade_bad_debt")),
                "wc_level": acc * basket * DAYS_PER_MONTH / 7.0 * p("trade_wc_per_sales")})
    return res


def _schedule(receipts, i, amount, delay_days):
    k0 = int(math.floor(delay_days / DAYS_PER_MONTH))
    frac = (delay_days - k0 * DAYS_PER_MONTH) / DAYS_PER_MONTH
    if i + k0 < len(receipts):
        receipts[i + k0] += amount * (1 - frac)
    if i + k0 + 1 < len(receipts):
        receipts[i + k0 + 1] += amount * frac


def run_plan(plan, p, ranking_rows):
    """plan: name, batches [{N, spec, order_day, loan_share (a share of the batch capex, or 'auto'), experienced}], microgreens,
    trading, clock ('first_harvest' or a month number), caretaker_start (month), cost_basis ('research' | 'owner' | 'owner_realistic').
    'auto' loans draw only what keeps cash at the minimum reserve, up to 90% of that batch's capex, in the months its capex is paid.
    Loans up to Rs 2 crore are AIF (about 6%); the rest is a bank loan (10.7%)."""
    cal = calendar()
    fill = p("fill_days")
    basis = plan.get("cost_basis", "research")
    batches, prev_items, prev_spec, n_cum = [], None, None, 0
    live_day, prev_kw = None, 0.0
    for b in plan["batches"]:
        n_cum += b["N"]
        items = capex_items(n_cum, p, b["spec"])
        inc = items if prev_items is None else incremental_capex(items, prev_items, prev_spec, p)
        alloc, beyond = choose_mix(b["N"], ranking_rows)
        mixs = mix_shares(alloc)
        fh = sum(mixs[c] * CROPS[c]["first_harvest_days"] for c in mixs)
        nd = sum(mixs[c] * CROPS[c]["nursery_days"] for c in mixs)
        if b["spec"] == "test":
            build = p("build_days_test")
        elif b["N"] <= 200:
            build = p("build_days_small")
        else:
            build = max(p("build_days_large"), b["N"] / p("supplier_sets_per_month") * DAYS_PER_MONTH)
        order = b["order_day"]
        complete = order + build
        kw_now = connected_kw(n_cum, p)
        if live_day is None:
            live_day = p("grid_apply_day") + (p("temp_connection_days") if b["spec"] == "test" else p("grid_connection_days"))
        elif kw_now - prev_kw > 10.0:
            live_day = max(live_day, order + p("grid_connection_days"))
        prev_kw = kw_now
        transplant = max(complete + p("assembly_days"), live_day, order + nd)
        capex_b = sum(i["inr"] for i in inc)
        ls = b.get("loan_share", 0.0)
        batches.append({"N": b["N"], "N_cum": n_cum, "spec": b["spec"], "loan_share": ls,
                        "loan_cap": (p("loan_share_of_capex") if ls == "auto" else ls) * capex_b,
                        "experienced": b.get("experienced", False), "items": items, "inc_items": inc,
                        "capex_inr": capex_b, "alloc": alloc, "mix": mixs, "beyond_cap": beyond,
                        "order_day": order, "complete_day": complete, "transplant_day": transplant, "grid_live_day": live_day,
                        "harvest_day": transplant + fh, "cs": capex_summary(items, n_cum),
                        "ce": {c: crop_eval(c, p) for c in mixs}})
        prev_items, prev_spec = items, b["spec"]
    first_h = min([bt["harvest_day"] for bt in batches]) if batches else None
    first_complete = min([bt["complete_day"] for bt in batches]) if batches else None
    if plan.get("clock", 1) == "first_harvest" and first_h is not None:
        clock = next((mo["idx"] for mo in cal if mo["day0"] <= first_h < mo["day1"]), len(cal) + 1)
    else:
        clock = plan.get("clock", 1)
    plan = dict(plan)
    plan["clock_start"] = clock
    tot_n = float(sum(bt["N"] for bt in batches)) or 1.0
    kgw_ref = sum(bt["N"] * sum(bt["mix"][c] * bt["ce"][c]["sellable_kg_per_tower_per_40d"] * 7.0 / 40.0 for c in bt["mix"])
                  for bt in batches) / tot_n
    receipts = [0.0] * (len(cal) + 3)
    rows, bal, wc_prev, mg_cap = [], p("starting_cash_inr"), 0.0, 0
    aif_out = bank_out = aif_drawn = 0.0
    emi_aif = emi_bank = None
    first_draw_idx = None
    r_aif, r_bank = p("aif_effective_rate") / 12.0, p("bank_rate") / 12.0
    n_ten = p("loan_tenor_months")
    for mo in cal:
        a, b_, days, i = mo["day0"], mo["day1"], mo["days"], mo["idx"] - 1
        capex, draw_fixed, auto_room = 0.0, 0.0, 0.0
        auto_batches = []
        for bt in batches:
            for day, share in ((bt["order_day"], 0.5), (bt["complete_day"], 0.5)):
                if a <= day < b_:
                    capex += share * bt["capex_inr"]
                    if bt["loan_share"] == "auto":
                        if bt not in auto_batches:
                            auto_batches.append(bt)
                    else:
                        draw_fixed += share * bt["loan_cap"]
        auto_room = sum(max(0.0, bt["loan_cap"] - bt.get("drawn", 0.0)) for bt in auto_batches)
        if plan.get("trading") and mo["idx"] == 1:
            capex += p("trade_setup_capex_inr")
        mg = microgreens_month(mo, p, plan, mg_cap)
        mg_cap = mg["cap_level"]
        capex += mg["capex"]
        tr = trading_month(mo, p, plan)
        Nb, Np, learn_w, cons = 0, 0.0, 0.0, 0.0
        kgw = {}
        cs_used = ZERO_CS
        for bt in batches:
            if b_ > bt["complete_day"]:
                Nb += bt["N"]
                cs_used = bt["cs"]
            pf_ = ramp_avg(a, b_, bt["transplant_day"], fill)
            hf = ramp_avg(a, b_, bt["harvest_day"], fill)
            Np += bt["N"] * pf_
            lsh = 0.0
            if not bt["experienced"]:
                lsh = window_share(a, b_, bt["transplant_day"], fill, bt["transplant_day"], bt["transplant_day"] + p("first_cycle_days"))
                learn_w += bt["N"] * pf_ * lsh
            fc = window_share(a, b_, bt["harvest_day"], fill, bt["harvest_day"], bt["harvest_day"] + p("first_cycle_days"))
            if bt["experienced"]:
                fc = 0.0
            for c, s_ in bt["mix"].items():
                ce = bt["ce"][c]
                lf = min(0.95, CROPS[c]["loss_first"] * p("loss_multiplier"))
                ls_ = min(0.90, CROPS[c]["loss_steady"] * p("loss_multiplier"))
                adj = fc * (1 - lf) / (1 - ls_) + (1 - fc)
                kgw[c] = kgw.get(c, 0.0) + (bt["N"] * s_ * ce["sellable_kg_per_tower_per_40d"] * 7.0 / 40.0
                                            * season_factor(c, mo["moy"]) * hf * adj)
                cons += (bt["N"] * s_ * ce["consumables_inr_per_tower_per_40d"] * days / 40.0 * pf_
                         * (1 + p("consumables_first_cycle_extra") * lsh))
        H = sum(kgw.values())
        s = mo["idx"] - clock + 1
        Dt, Db, Dd = demand_at(p, s)
        sh = allocate(H, Dt, Db, Dd, p)
        extra_h = tr["sales"] / p("trade_avg_price_inr_per_kg") / days if tr["sales"] > 0 else 0.0
        extra_d = (mg["kg_sold"] * 7.0 / days * p("mg_d2c_share") / p("mg_kg_per_d2c_order")) if mg["kg_sold"] > 0 else 0.0
        rates = delivery_rates(H, sh, p, extra_h, extra_d)
        pfac = volume_price_factor(Nb, p, kgw_ref)
        tw = {k: 0.0 for k in ("net_sales", "unsold", "fee", "pack", "delivery", "bad_debt", "commission")}
        chan_rev = {k: 0.0 for k in CHANNELS}
        for c, kw in kgw.items():
            kg_m = kw * days / 7.0
            m = money_per_kg(CROPS[c], sh, p, rates, pfac)
            for k in tw:
                tw[k] += kg_m * m[k]
            for k in CHANNELS:
                chan_rev[k] += kg_m * m["chan_net"][k]
        kg_month = H * days / 7.0
        _schedule(receipts, i, chan_rev["horeca"] * (1 - p("bad_debt_horeca")), p("pay_days_horeca"))
        _schedule(receipts, i, chan_rev["d2c"] + tw["fee"], p("pay_days_d2c"))
        _schedule(receipts, i, chan_rev["bulk"], p("pay_days_bulk"))
        _schedule(receipts, i, chan_rev["distress"], p("pay_days_distress"))
        towers_ordered = any(bt["order_day"] < b_ for bt in batches)
        caretaker = (towers_ordered or plan.get("microgreens")) and mo["idx"] >= plan.get("caretaker_start", p("caretaker_start_month"))
        share_ct = plan.get("caretaker_does_microgreens", True) and caretaker
        msb = (a - first_complete) / DAYS_PER_MONTH if (first_complete is not None and a >= first_complete) else 0.0
        flags = {"caretaker": bool(caretaker and (Nb > 0 or towers_ordered or plan.get("microgreens"))),
                 "extra_fte": mg["labour_fte"] if share_ct else 0.0, "site_active": True, "cost_basis": basis,
                 "months_since_build": msb, "loan": (aif_out + bank_out + auto_room + draw_fixed) > 0}
        learning = 1.0 + p("learning_extra_hours") * (learn_w / Np if Np > 0 else 0.0)
        ox, det = opex_items(Nb, Np, p, cs_used, learning=learning, days=days, flags=flags, moy=mo["moy"])
        mg_lab = 0.0 if share_ct else mg["labour_fte"] * helper_loaded(p, False) * p("labour_cost_multiplier") * days / DAYS_PER_MONTH
        commit = p("commitment_inr_per_month") if mo["idx"] <= p("commitment_months") else 0.0
        # loans: interest on what is outstanding at the start of the month; repayment after the moratorium
        interest = (aif_out * r_aif + bank_out * r_bank) * days / DAYS_PER_MONTH
        principal = 0.0
        if first_draw_idx is not None and mo["idx"] > first_draw_idx + p("moratorium_months"):
            if emi_aif is None:
                emi_aif = emi(aif_out, p("aif_effective_rate"), n_ten)
                emi_bank = emi(bank_out, p("bank_rate"), n_ten)
            pa = max(0.0, min(aif_out, emi_aif - aif_out * r_aif))
            pb_ = max(0.0, min(bank_out, emi_bank - bank_out * r_bank))
            aif_out -= pa
            bank_out -= pb_
            principal = pa + pb_
        tower_revenue = tw["net_sales"] + tw["fee"]
        tower_var = cons + tw["pack"] + tw["delivery"] + tw["bad_debt"] + tw["commission"]
        opex_total = sum(ox.values())
        mg_profit = mg["revenue"] - mg["var_cost"] - mg["fixed"] - mg_lab
        ebitda = tower_revenue - tower_var - opex_total + mg_profit + tr["net_profit"]
        d_wc = tr["wc_level"] - wc_prev
        wc_prev = tr["wc_level"]
        cash_in = receipts[i] + mg["revenue"] + tr["net_profit"]
        cash_costs = cons + tw["pack"] + tw["delivery"] + tw["commission"] + opex_total + mg["var_cost"] + mg["fixed"] + mg_lab
        op_cf = cash_in - cash_costs - d_wc
        pre = bal + op_cf - capex - commit - interest - principal + draw_fixed
        draw_auto = min(auto_room, max(0.0, p("min_cash_reserve_inr") - pre)) if auto_room > 0 else 0.0
        left = draw_auto
        for bt in auto_batches:
            d_ = min(left, max(0.0, bt["loan_cap"] - bt.get("drawn", 0.0)))
            bt["drawn"] = bt.get("drawn", 0.0) + d_
            left -= d_
        loan_draw = draw_fixed + draw_auto
        if loan_draw > 0:
            d_aif = min(loan_draw, max(0.0, p("aif_cap_inr") - aif_drawn))
            aif_out += d_aif
            aif_drawn += d_aif
            bank_out += loan_draw - d_aif
            if first_draw_idx is None:
                first_draw_idx = mo["idx"]
        bal_prev = bal
        bal = pre + draw_auto
        assert abs(bal - (bal_prev + op_cf - capex - commit - interest - principal + loan_draw)) < 1e-6      # self-check 5
        rows.append({
            "month": mo["label"], "calendar_month": mo["name"], "towers_built": Nb, "towers_planted_equiv": Np,
            "harvest_kg": kg_month, "sold_target_price_kg": kg_month * (sh["horeca"] + sh["d2c"]),
            "sold_bulk_kg": kg_month * sh["bulk"], "sold_distress_kg": kg_month * sh["distress"], "wasted_kg": kg_month * sh["waste"],
            "demand_target_kg_week": Dt, "sales_month": s, "price_factor": pfac,
            "horeca_delivery_inr_per_kg": rates["horeca"], "d2c_cost_per_drop_inr": rates["d2c_drop"],
            "tower_revenue_inr": tower_revenue, "tower_variable_costs_inr": tower_var, "tower_cash_received_inr": receipts[i],
            "farm_running_costs_inr": opex_total, "opex_items_inr": ox, "helper_fte": det["helper_fte"],
            "microgreens_trays_week": mg["trays_week"], "microgreens_revenue_inr": mg["revenue"],
            "microgreens_direct_costs_inr": mg["var_cost"] + mg["fixed"] + mg_lab, "microgreens_kg_sold": mg["kg_sold"],
            "trading_accounts": tr["accounts"], "trading_sales_inr": tr["sales"], "trading_net_profit_inr": tr["net_profit"],
            "trading_working_capital_change_inr": d_wc,
            "ebitda_before_commitment_inr": ebitda, "commitment_inr": commit, "ebitda_after_commitment_inr": ebitda - commit,
            "ebitda_after_commitment_and_loan_inr": ebitda - commit - interest - principal,
            "operating_cash_flow_inr": op_cf, "capex_inr": capex, "loan_draw_inr": loan_draw, "loan_interest_inr": interest,
            "loan_principal_inr": principal, "loan_outstanding_inr": aif_out + bank_out, "aif_outstanding_inr": aif_out,
            "bank_loan_outstanding_inr": bank_out, "cash_balance_inr": bal,
        })
    info = {"clock_start_month": clock, "cost_basis": basis, "aif_drawn_inr": aif_drawn,
            "total_loan_drawn_inr": sum(r["loan_draw_inr"] for r in rows),
            "emi_aif_inr": emi(aif_drawn, p("aif_effective_rate"), n_ten),
            "emi_bank_inr": emi(max(0.0, sum(r["loan_draw_inr"] for r in rows) - aif_drawn), p("bank_rate"), n_ten),
            "batches": [{
                "towers_added": bt["N"], "towers_total": bt["N_cum"], "spec": bt["spec"], "capex_inr": bt["capex_inr"],
                "loan_share": bt["loan_share"], "loan_cap_inr": bt["loan_cap"], "order_date": day_to_date(bt["order_day"]),
                "structure_ready": day_to_date(bt["complete_day"]), "grid_live": day_to_date(bt["grid_live_day"]),
                "first_transplant": day_to_date(bt["transplant_day"]), "first_harvest": day_to_date(bt["harvest_day"]),
                "crop_mix_towers": bt["alloc"], "towers_beyond_market_cap": bt["beyond_cap"]} for bt in batches]}
    info["emi_total_inr"] = info["emi_aif_inr"] + info["emi_bank_inr"]
    return rows, info


def check_cash_roll(rows, p):
    """Self-check 5/6: rebuild the cash balance from the starting cash; the commitment is paid in M1-M11 only."""
    bal = p("starting_cash_inr")
    for k, r in enumerate(rows):
        bal += (r["operating_cash_flow_inr"] - r["capex_inr"] - r["commitment_inr"] - r["loan_interest_inr"]
                - r["loan_principal_inr"] + r["loan_draw_inr"])
        assert abs(bal - r["cash_balance_inr"]) < 1.0, "cash balance does not roll forward"
        expected = p("commitment_inr_per_month") if k + 1 <= p("commitment_months") else 0.0
        assert abs(r["commitment_inr"] - expected) < 1e-6, "commitment must stop after Aug 2027 (M11)"
    return True


def plan_answers(rows, info, steady_ebitda=None, capex_total=None):
    def first(cond):
        for r in rows:
            if cond(r):
                return r["month"] + " (" + r["calendar_month"] + ")"
        return None
    m3 = rows[2]
    last_capex = max([k for k, r in enumerate(rows) if r["capex_inr"] > 0], default=-1)
    cum_e, cum_c, payback = 0.0, 0.0, None
    for k, r in enumerate(rows):
        cum_e += r["ebitda_before_commitment_inr"]
        cum_c += r["capex_inr"]
        if payback is None and k >= last_capex and cum_c > 0 and cum_e >= cum_c:
            payback = r["month"] + " (" + r["calendar_month"] + ")"
    years = None
    if payback is None and steady_ebitda and steady_ebitda > 0 and capex_total:
        years = capex_total / (12.0 * steady_ebitda)
    first_h = next((r for r in rows if r["harvest_kg"] > 0), None)
    return {
        "cash_profit_in_M3_dec_2026": m3["ebitda_after_commitment_inr"] > 0,
        "M3_ebitda_before_commitment_inr": m3["ebitda_before_commitment_inr"],
        "M3_ebitda_after_commitment_inr": m3["ebitda_after_commitment_inr"],
        "oct_dec_2026_ebitda_before_commitment_inr": sum(r["ebitda_before_commitment_inr"] for r in rows[:3]),
        "oct_dec_2026_ebitda_after_commitment_inr": sum(r["ebitda_after_commitment_inr"] for r in rows[:3]),
        "first_tower_harvest_month": (first_h["month"] + " (" + first_h["calendar_month"] + ")") if first_h else None,
        "first_month_positive_before_commitment": first(lambda r: r["ebitda_before_commitment_inr"] > 0),
        "first_month_positive_after_commitment": first(lambda r: r["ebitda_after_commitment_inr"] > 0),
        "first_month_positive_after_commitment_and_loan": first(lambda r: r["ebitda_after_commitment_and_loan_inr"] > 0),
        "capex_payback_month_within_18": payback,
        "simple_payback_years_at_steady_state": years,
        "first_month_cash_below_zero": first(lambda r: r["cash_balance_inr"] < 0),
        "lowest_cash_balance_inr": min(r["cash_balance_inr"] for r in rows),
        "lowest_cash_month": min(rows, key=lambda r: r["cash_balance_inr"])["month"],
        "cash_balance_M18_inr": rows[-1]["cash_balance_inr"],
        "total_capex_18m_inr": sum(r["capex_inr"] for r in rows),
        "total_ebitda_18m_inr": sum(r["ebitda_before_commitment_inr"] for r in rows),
        "total_operating_cash_flow_18m_inr": sum(r["operating_cash_flow_inr"] for r in rows),
        "loan_drawn_inr": info.get("total_loan_drawn_inr", 0.0),
        "loan_emi_after_moratorium_inr": info.get("emi_total_inr", 0.0),
        "M12_ebitda_before_commitment_inr": rows[11]["ebitda_before_commitment_inr"],
        "M18_ebitda_before_commitment_inr": rows[-1]["ebitda_before_commitment_inr"],
    }

# =============================================================================
# Funding, sensitivity, break-even, size scan, side lines, business models
# =============================================================================
def site_fixed_and_capex(N, p, spec="full"):
    items = capex_items(N, p, spec)
    cs = capex_summary(items, N)
    ox, _ = opex_items(N, N, p, cs)
    return sum(ox.values()), cs["total_inr"]


def max_fundable_towers(p, spec="full", extra_capex=0.0, extra_monthly=0.0, n_max=700):
    cash = p("starting_cash_inr")
    commit_left = p("commitment_inr_per_month") * p("commitment_months")
    best, detail = None, None
    for N in range(0, n_max + 1):
        fixed, capex = site_fixed_and_capex(N, p, spec)
        reserve = p("reserve_months_of_fixed_costs") * (fixed + extra_monthly) + commit_left
        spare = cash - capex - extra_capex - reserve
        if spare >= 0:
            best = N
            detail = {"towers": N, "capex_inr": capex, "extra_capex_inr": extra_capex,
                      "monthly_fixed_costs_inr": fixed + extra_monthly, "reserve_inr": reserve,
                      "remaining_commitment_inr": commit_left, "cash_left_after_reserve_inr": spare}
    return best, detail


def emi(principal, annual_rate, months):
    r = annual_rate / 12.0
    if principal <= 0:
        return 0.0
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)


SENS_CASES = [
    ("Base case", {}),
    ("Price -20%", {"ovr": {"price_multiplier": 0.8}}),
    ("Price +20%", {"ovr": {"price_multiplier": 1.2}}),
    ("Yield -20% (head weights below the model's peak-season values)", {"ovr": {"yield_multiplier": 0.8}}),
    ("Yield +20%", {"ovr": {"yield_multiplier": 1.2}}),
    ("Sell-through 50% at target price", {"forced": 0.50}),
    ("Sell-through 70% at target price", {"forced": 0.70}),
    ("Sell-through 85% at target price", {"forced": 0.85}),
    ("D2C delivery fee Rs 0 (free delivery like OnlyHydroponics above Rs 399)", {"ovr": {"d2c_delivery_fee_inr_per_order": 0}}),
    ("D2C delivery fee Rs 40", {"ovr": {"d2c_delivery_fee_inr_per_order": 40}}),
    ("HoReCa delivery at Rs 14/kg at any volume (v1 value)", {"ovr": {"delivery_horeca_low_volume_inr_per_kg": 14}}),
    ("Power tariff LT-4(c) agricultural (if BESCOM allows)", {"flags": {"tariff": "LT4c"}}),
    ("Power tariff LT-3(a) commercial", {"flags": {"tariff": "LT3"}}),
    ("Block pumps (10 W per tower instead of 30 W kit pumps)", {"ovr": {"pump_w_per_tower": 10}}),
    ("Labour cost +20%", {"ovr": {"labour_cost_multiplier": 1.2}}),
    ("Agriculture minimum wage for helpers and caretaker", {"ovr": {"helper_wage_inr_month": 14299.16, "caretaker_wage_inr_month": 18699}}),
    ("Labour 38 h per 1,000 sites per 40 days (v1 value)", {"ovr": {"labour_h_per_1000_sites_40d": 38}}),
    ("Water: existing borewell instead of tanker", {"flags": {"water_source": "borewell"}}),
    ("Water: tanker + rain from the farm's own roof", {"flags": {"water_source": "tanker_rain"}}),
    ("Add a compliant agency night guard", {"flags": {"guard": True}}),
]


def sensitivity(N, alloc, p, basis, spec="full", flags=None):
    base_flags = dict(flags or {})
    base = steady_state(N, alloc, p, basis, spec=spec, flags=base_flags)
    out = []
    for name, cfg in SENS_CASES:
        if name.startswith("Add a compliant") and base["opex_details"]["guard"]:
            continue
        pp = p.but(**cfg["ovr"]) if cfg.get("ovr") else p
        fl = dict(base_flags)
        fl.update(cfg.get("flags") or {})
        ss = steady_state(N, alloc, pp, basis, forced_target=cfg.get("forced"), flags=fl, spec=spec)
        e = ss["ebitda_before_commitment_inr"]
        out.append({"case": name, "ebitda_before_commitment_inr": e,
                    "ebitda_after_commitment_inr": e - ss["commitment_inr"],
                    "change_vs_base_inr": e - base["ebitda_before_commitment_inr"],
                    "share_sold_at_target_price": ss["share_sold_at_target_price"]})
    return out


def break_even(p, alloc_ref, basis="m12", with_commitment=False, n_min=1, n_max=1500, flags=None, step=1):
    """Smallest tower count with EBITDA >= 0. basis 'm12' = demand-limited (numbers review); 'unconstrained' = every kg sells."""
    shares = mix_shares(alloc_ref)
    for N in range(n_min, n_max + 1, step):
        alloc = {c: s * N for c, s in shares.items()}
        ss = steady_state(N, alloc, p, basis, flags=flags)
        v = ss["ebitda_before_commitment_inr"] - (ss["commitment_inr"] if with_commitment else 0.0)
        if v >= 0:
            return N
    return None


def size_scan(p, ranking_rows, sizes):
    out = []
    for N in sizes:
        alloc, beyond = choose_mix(N, ranking_rows)
        u = steady_state(N, alloc, p, "unconstrained")
        d = steady_state(N, alloc, p, "m12")
        e = d["ebitda_before_commitment_inr"]
        out.append({"towers": N, "capex_inr": d["capex_total_inr"], "harvest_kg_per_month": d["harvest_kg_per_month"],
                    "towers_beyond_market_cap": beyond,
                    "ebitda_if_all_sold_inr": u["ebitda_before_commitment_inr"],
                    "ebitda_demand_limited_inr": e, "share_sold_at_target_price": d["share_sold_at_target_price"],
                    "profit_after_depreciation_inr": d["profit_after_depreciation_before_commitment_inr"],
                    "simple_payback_years": (d["capex_total_inr"] / (12 * e)) if e > 0 else None})
    return out


def microgreens_steady(tw, p):
    trays_m = tw * DAYS_PER_MONTH / 7.0
    kg = trays_m * p("mg_yield_g_per_tray") / 1000.0 * (1 - p("mg_loss_steady"))
    rev = kg * p("mg_price_inr_per_kg")
    var = trays_m * p("mg_var_cost_inr_per_tray")
    idx = mg_size_index(tw)
    lab = p("mg_workers")[idx] * helper_loaded(p, False) * p("labour_cost_multiplier")
    fixed = p("mg_fixed_inr_month")[idx]
    cap = {100: p("mg_capex_100_inr"), 200: p("mg_capex_200_inr"), 400: p("mg_capex_400_inr")}[mg_capacity_needed(tw)]
    profit = rev - var - lab - fixed
    return {"trays_per_week": tw, "kg_sold_per_week": kg / (DAYS_PER_MONTH / 7.0),
            "demand_month3_kg_per_week": ramp(p, "mg_demand_kg_week", 3, False),
            "revenue_inr": rev, "variable_inr": var, "labour_inr": lab, "fixed_inr": fixed, "profit_inr": profit,
            "profit_per_40d_inr": profit * MONTH_TO_40D, "capex_inr": cap,
            "first_cash_days": p("mg_start_day") + p("mg_cycle_days") + 1}


def trading_steady(s, p):
    acc = ramp(p, "trade_accounts", s)
    sales = acc * p("trade_basket_inr_per_account_week") * DAYS_PER_MONTH / 7.0
    return {"sales_month": s, "accounts": acc, "sales_inr": sales, "gross_profit_inr": sales * p("trade_gross_margin"),
            "net_profit_inr": sales * (p("trade_net_margin") - p("trade_bad_debt")),
            "working_capital_inr": sales * p("trade_wc_per_sales"), "first_cash_days": p("trade_start_day")}


def export_pilot(p):
    ship_cash = p("export_logistics_inr_per_100kg") + 100 * p("export_product_value_inr_per_kg")
    capital = p("export_registrations_inr") + p("export_lab_test_inr") + p("export_ecgc_inr") + 2 * ship_cash
    profit = p("export_margin_inr_per_kg") * p("export_kg_per_month")
    return {"capital_inr": capital, "monthly_profit_inr": profit, "first_cash_days": p("export_first_cash_days"),
            "cash_per_100kg_shipment_inr": ship_cash}


def hand_check_crop(cid, p):
    """Independent arithmetic for one crop, to compare with crop_eval."""
    c = CROPS[cid]
    g = c["g_per_harvest"][1]
    loss = c["loss_steady"]
    h40 = 40.0 / c["interval_days"]
    kg = 90 * 0.90 * h40 * g * (1 - loss) / 1000.0
    ph, pr = c["price_horeca"], c["price_retail"]
    pb, pdz = 0.60 * ph, 0.40 * c["price_wholesale"]
    s_h, s_d, s_b, s_w = 0.85 * 0.66, 0.85 * 0.34, 0.11, 0.04
    sold_value = s_h * ph + s_d * pr + s_b * pb
    avg = sold_value / (s_h + s_d + s_b)
    gross = sold_value + s_w * avg
    rejected = s_h * 0.05 * ph + s_d * 0.04 * pr + s_b * 0.08 * pb
    unsold = s_w * avg + rejected
    fee = s_d * 0.96 / 0.45 * 99
    pack = s_h * 4 + s_d * (30 + 8 / 0.45) + s_b * 15
    deliv = s_h * 38 + s_b * 8 + s_d / 0.45 * 85          # v2: HoReCa at the low-volume rate (15 kg/day reference)
    comm = s_h * 0.95 * ph * 0.03 + s_d * 0.96 * pr * 0.02
    cons = 90 * 0.90 * c["cons_inr"][1] * h40
    contrib = kg * (gross + fee - unsold - pack - deliv - comm) - cons
    model = crop_eval(cid, p)
    return {"crop": c["name"], "kg_per_tower_per_40d_hand": kg, "kg_per_tower_per_40d_model": model["sellable_kg_per_tower_per_40d"],
            "contribution_per_tower_per_40d_hand_inr": contrib,
            "contribution_per_tower_per_40d_model_inr": model["contribution_inr_per_tower_per_40d"],
            "difference_inr": model["contribution_inr_per_tower_per_40d"] - contrib,
            "steps": {"harvests_per_40d": h40, "gross_price_per_kg": gross, "unsold_per_kg": unsold, "fee_per_kg": fee,
                      "pack_per_kg": pack, "delivery_per_kg": deliv, "commission_bad_debt_per_kg": comm, "consumables_per_tower": cons}}


def hand_check_month(row, p):
    """Rebuild the balance change and the electricity line of one month from its own parts."""
    bal_change = (row["operating_cash_flow_inr"] - row["capex_inr"] - row["commitment_inr"] - row["loan_interest_inr"]
                  - row["loan_principal_inr"] + row["loan_draw_inr"])
    return {"month": row["month"], "balance_change_rebuilt_inr": bal_change,
            "ebitda_rebuilt_inr": (row["tower_revenue_inr"] - row["tower_variable_costs_inr"] - row["farm_running_costs_inr"]
                                   + row["microgreens_revenue_inr"] - row["microgreens_direct_costs_inr"] + row["trading_net_profit_inr"]),
            "ebitda_model_inr": row["ebitda_before_commitment_inr"]}

# =============================================================================
# Owner decisions (29 Sep 2026): owner costs, checks, the 200 -> 6,000 plan test and a realistic path
# =============================================================================
def loan_terms(capex, p, own_cash=None):
    """Capex loan (numbers review): loan = min(90% of capex, capex - own cash); AIF up to Rs 2 crore, the rest at the bank rate."""
    own = own_cash_for_capex(p) if own_cash is None else own_cash
    need = max(0.0, capex - max(0.0, own))
    loan = min(p("loan_share_of_capex") * capex, need)
    aif = min(loan, p("aif_cap_inr"))
    bank = loan - aif
    e_aif = emi(aif, p("aif_effective_rate"), p("loan_tenor_months"))
    e_bank = emi(bank, p("bank_rate"), p("loan_tenor_months"))
    own_needed = capex - loan
    return {"capex_inr": capex, "own_cash_available_inr": own, "own_cash_needed_inr": own_needed,
            "own_cash_shortfall_inr": max(0.0, own_needed - max(0.0, own)), "loan_inr": loan, "aif_loan_inr": aif,
            "bank_loan_inr": bank, "emi_inr": e_aif + e_bank, "emi_aif_inr": e_aif, "emi_bank_inr": e_bank,
            "moratorium_interest_inr": (aif * p("aif_effective_rate") + bank * p("bank_rate")) / 12.0}


def _pnl_brief(ss):
    e = ss["ebitda_before_commitment_inr"]
    c = ss["commitment_inr"]
    out = {"revenue_inr": ss["revenue_inr"], "variable_costs_inr": ss["variable_costs_inr"], "running_costs_inr": ss["opex_inr"],
           "ebitda_inr_per_month": e, "ebitda_after_commitment_inr_per_month": e - c,
           "ebitda_inr_per_40_days": e * MONTH_TO_40D, "ebitda_after_commitment_inr_per_40_days": (e - c) * MONTH_TO_40D,
           "profit_after_depreciation_inr_per_month": ss["profit_after_depreciation_before_commitment_inr"],
           "share_sold_at_target_price": ss["share_sold_at_target_price"], "harvest_kg_per_week": ss["harvest_kg_per_week"]}
    assert abs(out["ebitda_inr_per_40_days"] - e * 40.0 / 30.4) < 1e-6                                   # self-check 4
    return out


def timing_only(p, src):
    """Base economics with the timing inputs of another scenario."""
    keys = ("order_day", "build_days_test", "build_days_small", "build_days_large", "assembly_days", "grid_apply_day",
            "grid_connection_days", "temp_connection_days")
    return p.but(**{k: src(k) for k in keys})


def owner_costs_block(scen, rank, n1, spec1):
    pb = scen["base"]
    sizes = [(n1, spec1, "Phase 1 test module (%d towers, %s)" % (n1, spec1))] + [(N, "full", "{:,} towers".format(N)) for N in (200, 600, 2000, 6000)]
    out = {"note": OWNER_COSTS_NOTE, "owner_figures_inr_per_month": dict(OWNER_COSTS),
           "unmentioned_items_at_research_values": OWNER_UNMENTIONED_ITEMS, "cost_bases": COST_BASIS_NAMES,
           "demand_basis": ("Steady state = annual average with season factors at sales-month-12 demand, reached about Sep 2027 if sales "
                            "start now (side lines) or Dec 2027 if they start at the first tower harvest. Owner figures above 600 towers "
                            "are scaled per 600-tower unit (assumption)."),
           "sizes": []}
    for N, spec, label in sizes:
        alloc, beyond = choose_mix(N, rank)
        e = {"label": label, "towers": N, "spec": spec, "towers_beyond_market_cap": beyond, "scenarios": {}}
        base_ss = {}
        for sname in SCENARIOS:
            e["scenarios"][sname] = {}
            for cb in COST_BASES:
                ss = steady_state(N, alloc, scen[sname], "m12", spec=spec, flags={"cost_basis": cb})
                e["scenarios"][sname][cb] = _pnl_brief(ss)
                if sname == "base":
                    base_ss[cb] = ss
                    e["scenarios"][sname][cb]["running_cost_lines_inr"] = ss["opex_items_inr"]
        ss = base_ss["research"]
        cs = ss["capex_summary"]
        det = ss["opex_details"]
        lt = loan_terms(cs["total_inr"], pb)
        e["capex_inr"] = cs["total_inr"]
        e["loan"] = lt
        e["ebitda_minus_commitment_minus_emi_inr_per_month"] = {
            cb: base_ss[cb]["ebitda_before_commitment_inr"] - pb("commitment_inr_per_month") - lt["emi_inr"] for cb in COST_BASES}
        e["ebitda_minus_emi_after_commitment_ends_inr_per_month"] = {
            cb: base_ss[cb]["ebitda_before_commitment_inr"] - lt["emi_inr"] for cb in COST_BASES}
        e["dscr"] = {cb: (base_ss[cb]["ebitda_before_commitment_inr"] / lt["emi_inr"]) if lt["emi_inr"] > 0 else None for cb in COST_BASES}
        sl = cs["site_list"] or []
        raw_day = det["raw_water_m3"] / DAYS_PER_MONTH
        e["physical"] = {"covered_area_m2": cs["area_m2"], "sites": cs["sites"], "connected_kw": cs["connected_kw"],
                         "largest_site_kw": max([s["connected_kw"] for s in sl] or [0.0]),
                         "fte_required": det["fte_required"], "headcount_research": det["headcount"], "kwh_per_month": det["kwh"],
                         "raw_water_m3_per_day": raw_day, "tanker_loads_per_day_average": raw_day / 12.0,
                         "tanker_loads_per_day_april": raw_day / det["water_use_factor"] * pb("water_use_hot_month_factor") / 12.0,
                         "harvest_kg_per_week": ss["harvest_kg_per_week"],
                         "demand_target_kg_per_week_m12": ss["demand_target_kg_per_week"],
                         "demand_bulk_kg_per_week_m12": ss["demand_bulk_kg_per_week"],
                         "share_sold_at_target_price": ss["share_sold_at_target_price"],
                         "price_factor_large_volume": ss["price_factor_large_volume"]}
        out["sizes"].append(e)
    bdm = []
    for N in (200, 600):
        alloc, _ = choose_mix(N, rank)
        for s in (3, 6, 12):
            row = {"towers": N, "sales_month": s, "demand_target_kg_per_week": demand_at(pb, s)[0]}
            for cb in COST_BASES:
                row[cb + "_ebitda_inr_per_month"] = steady_state(N, alloc, pb, "m12", s_month=s, flags={"cost_basis": cb})["ebitda_before_commitment_inr"]
            bdm.append(row)
    out["by_demand_month"] = bdm
    mbm = {}
    for cb in COST_BASES:
        for variant, cfg in (("towers_only", {"clock": "first_harvest", "caretaker_start": 2}),
                             ("with_side_lines", {"microgreens": True, "trading": True, "clock": 1, "caretaker_start": 1})):
            pl = {"name": "200 towers now, %s (%s)" % (variant.replace("_", " "), cb), "cost_basis": cb,
                  "batches": [{"N": 200, "spec": "full", "order_day": pb("order_day"), "loan_share": "auto"}]}
            pl.update(cfg)
            rows, info = run_plan(pl, pb, rank)
            check_cash_roll(rows, pb)
            mbm[cb + "__" + variant] = {"name": pl["name"], "info": info, "answers": plan_answers(rows, info), "rows": rows}
    pt = timing_only(pb, scen["optimistic"])
    pl = {"name": "200 towers now, fastest research timing (owner costs)", "cost_basis": "owner", "clock": "first_harvest",
          "caretaker_start": 2, "batches": [{"N": 200, "spec": "full", "order_day": pt("order_day"), "loan_share": "auto"}]}
    rows, info = run_plan(pl, pt, rank)
    check_cash_roll(rows, pt)
    mbm["owner__towers_only_fastest_timing"] = {"name": pl["name"], "info": info, "answers": plan_answers(rows, info), "rows": rows}
    out["month_by_month_200"] = mbm
    return out


def _bisect_max(fn, budget, lo=1, hi=20000):
    """Largest N with fn(N) <= budget (fn increasing)."""
    if fn(lo) > budget:
        return 0
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if fn(mid) <= budget:
            lo = mid
        else:
            hi = mid - 1
    return lo


def owner_cost_checks(pb, rank):
    """One entry per owner figure: owner value, research value, realistic up to how many towers, legal note."""
    def ox_at(N, pp=None, flags=None):
        pp = pp or pb
        cs = capex_summary(capex_items(N, pp), N)
        return opex_items(N, N, pp, cs, flags=flags)
    o200, d200 = ox_at(200)
    o600, d600 = ox_at(600)
    o6k, d6k = ox_at(6000)
    fpt = fte_per_tower(pb)
    agri = pb("agri_min_wage_month_inr")
    agri_loaded = loaded_cost(pb, agri, bonus=False)
    uni_loaded = helper_loaded(pb, False)
    ct = pb("caretaker_production_fte")
    helpers_uni = (OWNER_COSTS["production_helpers"] / uni_loaded + ct) / fpt
    helpers_agri = (OWNER_COSTS["production_helpers"] / agri_loaded + ct) / fpt
    helpers_first = (OWNER_COSTS["production_helpers"] / agri_loaded + ct) / fte_per_tower(pb, 1.0 + pb("learning_extra_hours"))

    def tanker_bill(N, pp):
        o, d = ox_at(N, pp)
        return d["raw_water_m3"] * pp("tanker_inr_per_m3") * (water_factors(None, pp)[1] / water_factors(None, pp)[0])
    water_n = _bisect_max(lambda N: tanker_bill(N, pb), OWNER_COSTS["water"])
    water_n_noro = _bisect_max(lambda N: tanker_bill(N, pb.but(ro_recovery=1.0)), OWNER_COSTS["water"])
    apr_bill = lambda N: (N * pb("sites_per_tower") * pb("water_l_per_site_day") * DAYS_PER_MONTH / 1000.0 * pb("water_use_hot_month_factor")
                          / pb("ro_recovery") * pb("tanker_inr_per_m3") * pb("tanker_peak_price_factor"))
    water_n_apr = _bisect_max(apr_bill, OWNER_COSTS["water"])
    power_n = _bisect_max(lambda N: ox_at(N)[0]["electricity"], OWNER_COSTS["electricity"])
    power_n_block = _bisect_max(lambda N: ox_at(N, pb.but(pump_w_per_tower=10))[0]["electricity"], OWNER_COSTS["electricity"])
    power_n_24h = _bisect_max(lambda N: ox_at(N, pb.but(pump_duty=1.0))[0]["electricity"], OWNER_COSTS["electricity"])
    kwh_10k = OWNER_COSTS["electricity"] / ((TARIFFS["LT5"]["energy"] + pb("fppca_inr_kwh")) * (1 + pb("electricity_tax")) + pb("pg_surcharge_inr_kwh"))
    guard_floor = pb("guard_12h_day_wages") * pb("agri_min_wage_day_inr")
    rep = lambda o: o["repairs_towers"] + o["repairs_structure"]
    hc10 = next((N for N in range(1, 3000) if ox_at(N)[1]["headcount"] >= pb("esi_threshold_employees")), None)
    ins200 = capex_summary(capex_items(200, pb), 200)["insurable_inr"] + capex_summary(capex_items(200, pb), 200)["structure_inr"]
    checks = [
        {"figure": "Night security guard", "owner_inr_per_month": OWNER_COSTS["night_guard"],
         "research_inr_per_month": pb("guard_agency_inr_month"),
         "legal_floor_inr_per_month": guard_floor,
         "realistic_up_to_towers": 0,
         "check": ("Below the legal minimum at any size. A 12-hour post for 30 nights costs at least Rs %s (agriculture schedule, "
                   "direct hire, wage only; Rs 40,461 on the security schedule; Rs 51,420 at the uniform semi-skilled rate). A compliant "
                   "agency post costs Rs 56,294-85,709. Rs 10,000 buys about %.1f hours a night." % (g(guard_floor), 10000 / pb("agri_min_wage_day_inr") * 8 / 30)),
         "legal_note": "Karnataka minimum wages 2026-27; overtime and rest-day work at 2x (22 May 2026 notification). A principal employer is liable for an agency's unpaid wages.",
         "realistic_option": "Up to 150 towers: no separate guard; the resident caretaker, CCTV, a siren and motion lights give night presence (labour research). Above 150 towers: a legal guard (Rs 33,000+ direct hire)."},
        {"figure": "Resident caretaker", "owner_inr_per_month": OWNER_COSTS["caretaker"],
         "research_inr_per_month": pb("caretaker_wage_inr_month"), "legal_floor_inr_per_month": pb("caretaker_7day_agri_inr"),
         "realistic_up_to_towers": 0,
         "check": ("Below the legal minimum for 7-day resident work at any size: Rs 18,699 (agriculture rate) or Rs 26,612 (uniform Zone 3 rate). "
                   "Rs 15,000 is legal only for a 6-day, 8-hour job at the agriculture rate (Rs 14,299)."),
         "legal_note": "Rest-day work at 2x. Night patrols while awake count as working time (labour research).",
         "realistic_option": "Put your Rs 25,000 guard + caretaker budget into one legal caretaker (loaded about Rs %s at the agriculture rate) up to 150 towers." % g(loaded_cost(pb, pb("caretaker_7day_agri_inr"), bonus=False))},
        {"figure": "Helpers and packers", "owner_inr_per_month": OWNER_COSTS["production_helpers"],
         "research_inr_per_month_200_towers": o200["production_helpers"], "research_inr_per_month_600_towers": o600["production_helpers"],
         "research_inr_per_month_6000_towers": o6k["production_helpers"],
         "realistic_up_to_towers": int(helpers_uni),
         "realistic_up_to_towers_agriculture_wage": int(helpers_agri), "realistic_up_to_towers_first_cycles": int(helpers_first),
         "check": ("Rs 40,000 buys %.2f helpers at the uniform wage with on-costs (Rs %s each) or %.2f at the agriculture minimum wage (Rs %s). "
                   "With the caretaker's %.1f FTE that runs about %d towers (%d at the agriculture wage; about %d in the first cycles, "
                   "when hours are 40%% higher). Need: %.1f FTE at 200 towers, %.1f at 600, %.0f at 6,000 (49 h per 1,000 sites per 40 days)." % (
                       40000 / uni_loaded, g(uni_loaded), 40000 / agri_loaded, g(agri_loaded), ct, helpers_uni, helpers_agri, helpers_first,
                       d200["fte_required"], d600["fte_required"], d6k["fte_required"])),
         "legal_note": "Agriculture minimum wage Rs 14,299 a month is in force; the uniform notification (Rs 20,350 in Zone 3) is before a High Court Division Bench. ESI from 10 employees, EPF from 20.",
         "realistic_option": "Keep Rs 40,000 up to about %d towers; record hours by task in the test." % int(min(helpers_uni, helpers_agri))},
        {"figure": "Water (tanker, no borewell)", "owner_inr_per_month": OWNER_COSTS["water"],
         "research_inr_per_month_200_towers": o200["water"], "research_inr_per_month_600_towers": o600["water"],
         "research_inr_per_month_6000_towers": o6k["water"],
         "realistic_up_to_towers": water_n, "realistic_up_to_towers_no_ro": water_n_noro, "realistic_up_to_towers_april": water_n_apr,
         "check": ("Rs 10,000 buys %.0f m3 of tanker water (%.1f loads of 12 m3) at Rs %.0f/m3. RO rejects about half, and Mar-May use and "
                   "Feb-May prices are about 1.5x. The tanker part of the bill stays within Rs 10,000 up to about %d towers (%d if the water "
                   "test shows no RO is needed; about %d in April). 200 towers need about %.0f m3 of raw water a month; 6,000 need about %.0f "
                   "tanker loads a day." % (10000 / pb("tanker_inr_per_m3"), 10000 / pb("tanker_inr_per_m3") / 12, pb("tanker_inr_per_m3"),
                                            water_n, water_n_noro, water_n_apr, d200["raw_water_m3"], d6k["raw_water_m3"] / DAYS_PER_MONTH / 12)),
         "legal_note": "Bengaluru is a notified groundwater area: a new borewell needs KGWA permission (up to 60 days).",
         "realistic_option": "Test the water first; build roof-rain harvesting with a covered pond; ask BWSSB about Sanchari Cauvery tankers; apply to KGWA for a sited borewell before going past about 60 towers."},
        {"figure": "Repairs", "owner_inr_per_month": OWNER_COSTS["repairs"],
         "research_inr_per_month_200_towers": rep(o200), "research_inr_per_month_600_towers": rep(o600), "research_inr_per_month_6000_towers": rep(o6k),
         "realistic_up_to_towers": 0, "realistic_for_months": 6,
         "check": ("Rs 0 works only for about the first 6 months (start-up spares; 6-month pump warranty). Then parts wear out: pumps (about 2-year "
                   "life, Rs 400-900), timers (about 2 years), net cups (about 2 years), film (about every 3 years, Rs 130/m2). About Rs 78 per "
                   "tower per month: Rs %s at 200 towers." % g(rep(o200))),
         "legal_note": "None.",
         "realistic_option": "Budget Rs 75 per tower per month from month 7 and a sinking fund for film, nets and batteries."},
        {"figure": "Power", "owner_inr_per_month": OWNER_COSTS["electricity"],
         "research_inr_per_month_200_towers": o200["electricity"], "research_inr_per_month_600_towers": o600["electricity"],
         "research_inr_per_month_6000_towers": o6k["electricity"],
         "realistic_up_to_towers": power_n, "realistic_up_to_towers_block_pumps": power_n_block, "realistic_up_to_towers_pumps_24h": power_n_24h,
         "check": ("At LT-5 (Rs 4.40/kWh + FPPCA + 9%% tax + P&G surcharge, about Rs 5.42/kWh) Rs 10,000 buys about %.0f kWh before the fixed "
                   "charge (Rs 200/kW/month). The bill stays within Rs 10,000 up to about %d towers with 30 W kit pumps (%d with block pumps at "
                   "10 W per tower; %d if pumps run 24 h in hot months). 200 towers use about %.0f kWh; 6,000 towers need HT supply "
                   "(above 150 kW) at Rs 6.60/kWh + Rs 350/kVA." % (kwh_10k, power_n, power_n_block, power_n_24h, d200["kwh"])),
         "legal_note": "LT supply only below 150 kW (tariff clause 9); 50-150 kW needs an HT-type metering cubicle (clause 31). Using an IP-set (farm pump) connection for towers is back-billed with penalties.",
         "realistic_option": "Apply for LT-5 'Green House' on a 24x7 feeder; switch to one pump per block of 25-50 towers after the test."},
        {"figure": "Trained grower (owner grows)", "owner_inr_per_month": OWNER_COSTS["grower"],
         "research_inr_per_month_600_towers": o600["grower"], "research_inr_per_month_6000_towers": o6k["grower"],
         "realistic_up_to_towers": int(pb("owner_grows_up_to_towers")), "stretch_up_to_towers": int(pb("owner_realistic_grows_up_to_towers")),
         "check": ("Realistic up to about 150 towers (labour research); a stretch at 200 with written procedures; not realistic at 600 (paid grower "
                   "Rs 24,407-45,000). 6,000 towers are 540,000 sites and need a manager and about %d supervisors. You are also the only "
                   "salesperson." % d6k["supervisors"]),
         "legal_note": "None; all profits in this model are before any owner salary.",
         "realistic_option": "Stay the grower up to 150 towers; add a part-time sales/delivery person once accounts pass about 10; hire a paid mentor for 3-6 months (estimate Rs 10,000-30,000 a month)."},
        {"figure": "Accounting (AI agent)", "owner_inr_per_month": 0, "research_inr_per_month_200_towers": o200["accounting_compliance"],
         "realistic_up_to_towers": hc10 or 0,
         "check": ("Self-filed books by an AI agent are fine while the farm is small. Not zero: the FSSAI central licence is Rs 7,500 a year "
                   "(Rs 625 a month) for online sales. A CA is needed for loans (certificates Rs 3,000-15,000 each; project report up to "
                   "Rs 35,400) and payroll filings from 10 employees (about %d towers)." % (hc10 or 0)),
         "legal_note": "GST registration is optional for exempt produce; ESI from 10 employees, EPF from 20.",
         "realistic_option": "Keep AI bookkeeping; pay the FSSAI fee; budget a CA when you borrow."},
        {"figure": "Insurance", "owner_inr_per_month": 0, "research_inr_per_month_200_towers": o200["insurance"],
         "research_inr_per_month_600_towers": o600["insurance"], "realistic_up_to_towers": 0,
         "check": ("Legal to skip, but any farm above what own cash pays for (about 40-50 towers) needs a loan, and AIF/bank lenders, NHB and "
                   "MIDH require insured assets. At 200 towers about Rs %s lakh of structure and equipment would be uninsured against storm, "
                   "fire and theft; cover costs about Rs %s a month. No crop insurance exists for hydroponic greens." % (lk(ins200), g(o200["insurance"]))),
         "legal_note": "Lender and subsidy condition.",
         "realistic_option": "Insure structures and equipment (fire, storm/flood, burglary) from the first loan; buy group accident cover for staff outside ESI."},
        {"figure": "Marketing (AI agent)", "owner_inr_per_month": 0, "research_inr_per_month_200_towers": o200["marketing"],
         "realistic_up_to_towers": 0,
         "check": ("Digital content by an AI agent costs nothing, but samples, tastings and trips to buyers are cash: about Rs 5,000 + Rs 20 per "
                   "tower a month (Rs %s at 200 towers). The demand ramp assumes about one new account a week won in person." % g(o200["marketing"])),
         "legal_note": "None.",
         "realistic_option": "Budget samples and travel; let the AI agent do content and bookkeeping."},
    ]
    return checks

def owned_land_towers(p):
    a = p("area_m2_per_tower")
    return int(math.floor(p("usable_m2_60cent") / a)) + int(math.floor(p("usable_m2_40cent") / a))


def scale_plan_test(scen, rank):
    """Owner decision 2: 200 towers now, make a profit, then 6,000 towers within 6 months (by March 2027). Step by step."""
    pb = scen["base"]
    own_land = owned_land_towers(pb)
    mar31 = (datetime.date(2027, 3, 31) - START).days
    s_mar = 6   # March 2027 = sales month 6 if selling starts in Oct 2026 (side lines)
    Dt6, Db6, _ = demand_at(pb, s_mar)
    Dt12, Db12, _ = demand_at(pb, 12)
    steps_def = [(200, "Step 1: 200 towers ordered now (Oct 2026)"), (600, "Step 2: 600 towers"),
                 (own_land, "Step 3: owned land full ({:,} towers)".format(own_land)), (2000, "Step 4: 2,000 towers"),
                 (6000, "Step 5: 6,000 towers by 31 Mar 2027")]
    order_of_checks = ["capital", "own_share", "loan_service", "market_mar2027", "aif_cap", "land", "labour", "build_time",
                       "market_m12", "power", "water"]
    steps = []
    for N, label in steps_def:
        alloc, beyond = choose_mix(N, rank)
        res = {cb: steady_state(N, alloc, pb, "m12", flags={"cost_basis": cb}) for cb in COST_BASES}
        mar = {cb: steady_state(N, alloc, pb, "m12", s_month=s_mar, flags={"cost_basis": cb}) for cb in COST_BASES}
        ss = res["research"]
        cs = ss["capex_summary"]
        det = ss["opex_details"]
        lt = loan_terms(cs["total_inr"], pb)
        hk = ss["harvest_kg_per_week"]
        supply_days = N / pb("supplier_sets_per_month") * DAYS_PER_MONTH
        build = (pb("build_days_small") if N <= 200 else max(pb("build_days_large"), supply_days)) + pb("assembly_days")
        build3 = (pb("build_days_small") if N <= 200 else max(pb("build_days_large"), N / ASSUMPTIONS["supplier_sets_per_month"]["high"] * DAYS_PER_MONTH)) + pb("assembly_days")
        raw_day = det["raw_water_m3"] / DAYS_PER_MONTH
        loads = raw_day / 12.0
        loads_apr = raw_day / det["water_use_factor"] * pb("water_use_hot_month_factor") / 12.0
        max_site_kw = max(s["connected_kw"] for s in cs["site_list"])
        e_real = res["owner_realistic"]["ebitda_before_commitment_inr"]
        hire_months = det["headcount"] / pb("hiring_per_month")
        checks = {
            "capital": ("Own cash for capex (Rs %s lakh after the commitment and a Rs 3 lakh reserve) covers the capex (Rs %s lakh)" % (
                lk(lt["own_cash_available_inr"]), lk(cs["total_inr"])), cs["total_inr"] <= lt["own_cash_available_inr"]),
            "own_share": ("Own money covers the 10%% share of a 90%% loan (Rs %s lakh needed)" % lk(lt["own_cash_needed_inr"]),
                          lt["own_cash_shortfall_inr"] <= 0),
            "loan_service": ("EBITDA at legal-minimum cost (Rs %s) is at least 1.3 x the loan EMI (Rs %s)" % (g(e_real), g(lt["emi_inr"])),
                             lt["emi_inr"] <= 0 or e_real >= pb("dscr_gate") * lt["emi_inr"]),
            "aif_cap": ("Loan within the Rs 2 crore AIF cap (loan Rs %s lakh)" % lk(lt["loan_inr"]), lt["bank_loan_inr"] <= 0),
            "market_mar2027": ("Harvest (%.0f kg/week) within what a new seller can place in Mar 2027 (target + bulk %.0f kg/week)" % (hk, Dt6 + Db6),
                               hk <= Dt6 + Db6),
            "market_m12": ("Harvest within month-12 demand (target + bulk %.0f kg/week)" % (Dt12 + Db12), hk <= Dt12 + Db12),
            "land": ("Fits the usable owned land (up to {:,} towers; {:,.0f} m2 covered needed)".format(own_land, cs["area_m2"]), N <= own_land),
            "power": ("Every site stays below 150 kW, so LT supply is allowed (largest site %.0f kW; total %.0f kW)" % (max_site_kw, cs["connected_kw"]),
                      max_site_kw < pb("lt_limit_kw")),
            "water": ("Tanker water at or below 3 loads a day (%.1f average, %.1f in April; estimate of a reliable supply for one farm)" % (loads, loads_apr),
                      loads_apr <= 3.0),
            "labour": ("%d staff can be hired and trained by Mar 2027 at about %d a month" % (det["headcount"], pb("hiring_per_month")),
                       hire_months <= 6.0),
            "build_time": ("Ready by 31 Mar 2027 if ordered on 11 Oct 2026 (build and supply %.0f days; one supplier makes 500 sets a month)" % build,
                           pb("order_day") + build <= mar31),
        }
        failed = [k for k in order_of_checks if not checks[k][1]]
        steps.append({
            "step": label, "towers": N, "capex_inr": cs["total_inr"], "loan": lt,
            "ebitda_m12_inr_per_month": {cb: res[cb]["ebitda_before_commitment_inr"] for cb in COST_BASES},
            "ebitda_mar2027_demand_inr_per_month": {cb: mar[cb]["ebitda_before_commitment_inr"] for cb in COST_BASES},
            "ebitda_minus_commitment_minus_emi_inr_per_month": {cb: res[cb]["ebitda_before_commitment_inr"] - pb("commitment_inr_per_month") - lt["emi_inr"] for cb in COST_BASES},
            "covered_area_m2": cs["area_m2"], "sites": cs["sites"], "connected_kw": cs["connected_kw"], "largest_site_kw": max_site_kw,
            "raw_water_m3_per_day": raw_day, "tanker_loads_per_day": loads, "tanker_loads_per_day_april": loads_apr,
            "fte_required": det["fte_required"], "headcount": det["headcount"], "months_to_hire": hire_months,
            "harvest_kg_per_week": hk, "share_sold_at_target_price_m12": ss["share_sold_at_target_price"],
            "share_sold_at_target_price_mar2027": mar["research"]["share_sold_at_target_price"],
            "build_days_one_supplier": build, "build_days_three_suppliers": build3,
            "latest_order_date_for_31_mar_2027_three_suppliers": day_to_date(mar31 - build3),
            "checks": {k: {"test": v[0], "passes": v[1]} for k, v in checks.items()},
            "failed_checks": failed, "first_failed_check": failed[0] if failed else None,
        })
    first_break = next(((s["step"], s["first_failed_check"], s["checks"][s["first_failed_check"]]["test"]) for s in steps if s["first_failed_check"]), None)
    # month by month: the owner's plan with the 5,800-tower order on 15 Dec 2026 (before the first 200-tower harvest)
    runs = {}
    for cb in COST_BASES:
        pl = {"name": "200 now + 5,800 ordered 15 Dec 2026 (%s)" % cb, "cost_basis": cb, "microgreens": True, "trading": True,
              "clock": 1, "caretaker_start": 1,
              "batches": [{"N": 200, "spec": "full", "order_day": pb("order_day"), "loan_share": "auto"},
                          {"N": 5800, "spec": "full", "order_day": (datetime.date(2026, 12, 15) - START).days, "loan_share": "auto"}]}
        rows, info = run_plan(pl, pb, rank)
        check_cash_roll(rows, pb)
        runs[cb] = {"name": pl["name"], "info": info, "answers": plan_answers(rows, info),
                    "rows": [{k: r[k] for k in ("month", "calendar_month", "towers_built", "harvest_kg", "sold_target_price_kg",
                                                "wasted_kg", "ebitda_before_commitment_inr", "capex_inr", "loan_draw_inr",
                                                "loan_outstanding_inr", "cash_balance_inr")} for r in rows]}
    return {"owned_land_towers": own_land, "march_2027_sales_month": s_mar,
            "demand_mar2027_kg_per_week": {"target": Dt6, "bulk": Db6}, "demand_m12_kg_per_week": {"target": Dt12, "bulk": Db12},
            "steps": steps, "first_constraint_that_breaks": first_break, "month_by_month": runs,
            "possible": False,
            "verdict": ("Not possible. Capital breaks at the first step: 200 towers cost about Rs %s lakh against about Rs %s lakh of free cash "
                        "(Rs %s lakh after a Rs 3 lakh reserve), "
                        "and even at your own cost figures the farm cannot carry the loan it would need. Then the market breaks (a new seller "
                        "can place the output of about %d towers by March 2027), then the Rs 2 crore AIF cap, land (owned land holds about "
                        "{:,} towers), hiring and build time (6,000 tower sets are about 12 months of one supplier). To finish by March, the "
                        "6,000 towers must be ordered before the first 200-tower harvest, so 'profit first' cannot be tested.".format(own_land)) % (
                            lk(steps[0]["capex_inr"]), lk(own_cash_for_capex(pb) + pb("min_cash_reserve_inr")), lk(own_cash_for_capex(pb)),
                            int((Dt6 + Db6) / max(0.1, steps[0]["harvest_kg_per_week"] / 200.0)))}


def realistic_scale_path(scen, rank, rec_answers, rec_real_answers, n1, spec1):
    """Fastest realistic path with gates, costed at your plan's legal-minimum cost (and research cost beside it).
    Tower counts are capped by the demand a new seller can reach at that date (demand clock from Oct 2026)."""
    pb = scen["base"]
    own_land = owned_land_towers(pb)
    alloc_ref, _ = choose_mix(150, rank)
    gate_p = pb.but(price_multiplier=1.3, yield_multiplier=1.3, pump_w_per_tower=10.0)
    kgw = mix_kg_per_tower_week(alloc_ref, gate_p)          # expansion happens only in the gate-pass case, so size to its yield
    phase_defs = [
        ("Phase 2", "2027-10-01", 150, "Build Aug-Sep 2027 (after the commitment ends); plant Oct-Nov 2027",
         "Gate B passed (end Mar 2027): >= 80 g per site; loss <= 15%; >= 70% sold at target price for 4 weeks; <= 49 h per 1,000 sites per 40 days; "
         "contribution high enough for EBITDA >= 1.3 x EMI; target-price demand >= 150 kg/week; AIF sanction (30-120 days)."),
        ("Phase 3", "2028-10-01", 300, "Build Jul-Sep 2028; plant Oct 2028",
         "12 months of profit after loan payments; signed bulk contracts for half the added output; paid grower and legal guard hired; walk-in cold room."),
        ("Phase 4", "2029-10-01", 600, "Build Jul-Sep 2029. Only with signed bulk contracts at known prices: at base demand the farm's own volume pushes prices down above 400 towers",
         "Proven borewell or Cauvery supply; a sales person or team; signed contracts for the added output; DSCR >= 1.3 on audited accounts."),
        ("Phase 5", "2031-10-01", own_land, "Up to the owned-land limit ({:,} towers) only as far as demand allows".format(own_land),
         "Demand at the target price reaches the output; 2 years of audited profit; only then consider leased land."),
    ]
    phases = [{
        "phase": "Phase 0-1: side lines + %d-tower test" % n1, "ready": "2026-10-15 to 2027-03-31", "towers": n1,
        "what": ("Microgreens 50 trays a week (100 only after Gate A), trading through Floruvi, a %d-tower %s module on the owned 60-cent plot; "
                 "BESCOM LT-5 application, FSSAI, GSTIN, water tests, rain pond, KGWA borewell application." % (n1, spec1)),
        "gate": ("Gate A (end Dec 2026): >= 10 paying accounts; 60-95 kg/week of greens sold at target price for 4 weeks (bought-in greens count); "
                 "microgreens >= Rs 700/kg and >= 15 kg/week; no invoice more than 14 days late."),
        "research_costs": {k: rec_answers[k] for k in ("oct_dec_2026_ebitda_before_commitment_inr", "first_month_positive_before_commitment",
                                                        "first_month_positive_after_commitment", "lowest_cash_balance_inr", "M12_ebitda_before_commitment_inr")},
        "legal_minimum_costs": {k: rec_real_answers[k] for k in ("oct_dec_2026_ebitda_before_commitment_inr", "first_month_positive_before_commitment",
                                                                  "first_month_positive_after_commitment", "lowest_cash_balance_inr", "M12_ebitda_before_commitment_inr")},
    }]
    cum_loan = aif_used = 0.0
    prev_items, prev_spec = capex_items(n1, pb, spec1), spec1
    emi_total = 0.0
    for name, ready, target_n, build_note, gate in phase_defs:
        d = datetime.date.fromisoformat(ready)
        s = (d.year - 2026) * 12 + d.month - 10 + 1 + 6          # demand 6 months after the phase is ready
        Dt, Db, _ = demand_at(pb, s)
        n_dem = int((Dt + Db) / ((1 - pb("unavoidable_waste_share")) * kgw))
        N = max(n1, min(target_n, n_dem, own_land))
        alloc, _ = choose_mix(N, rank)
        items_n = capex_items(N, pb)
        cs = capex_summary(items_n, N)
        inc = sum(i["inr"] for i in incremental_capex(items_n, prev_items, prev_spec, pb))   # same reuse rules as run_plan
        prev_items, prev_spec = items_n, "full"
        loan = pb("loan_share_of_capex") * inc
        aif = min(loan, max(0.0, pb("aif_cap_inr") - aif_used))
        bank = loan - aif
        aif_used += aif
        cum_loan += loan
        emi_total += emi(aif, pb("aif_effective_rate"), pb("loan_tenor_months")) + emi(bank, pb("bank_rate"), pb("loan_tenor_months"))
        cases = {"legal_minimum_costs": steady_state(N, alloc, pb, "m12", s_month=s, flags={"cost_basis": "owner_realistic"}),
                 "research_costs": steady_state(N, alloc, pb, "m12", s_month=s),
                 "gate_pass_case": steady_state(N, alloc, gate_p, "m12", s_month=s,
                                                flags={"cost_basis": "owner_realistic", "water_source": "tanker_rain"})}
        econ = {}
        for k, ss in cases.items():
            e = ss["ebitda_before_commitment_inr"]
            econ[k] = {"ebitda_inr_per_month": e, "ebitda_inr_per_40_days": e * MONTH_TO_40D,
                       "ebitda_minus_emi_inr_per_month": e - emi_total, "dscr": (e / emi_total) if emi_total > 0 else None,
                       "after_emi_and_owner_drawing_inr_per_month": e - emi_total - pb("owner_drawing_inr_month"),
                       "profit_after_depreciation_inr_per_month": ss["profit_after_depreciation_before_commitment_inr"],
                       "share_sold_at_target_price": ss["share_sold_at_target_price"]}
        real = cases["legal_minimum_costs"]
        need_contrib = (real["opex_inr"] + pb("dscr_gate") * emi_total) / N
        phases.append({
            "phase": "%s: %d towers" % (name, N), "ready": ready, "towers": N, "target_towers": target_n,
            "towers_demand_allows": n_dem, "sales_month_used": s, "demand_target_kg_per_week": Dt, "demand_bulk_kg_per_week": Db,
            "harvest_kg_per_week": real["harvest_kg_per_week"], "capex_total_inr": cs["total_inr"], "capex_added_inr": inc,
            "loan_added_inr": loan, "aif_loan_added_inr": aif, "bank_loan_added_inr": bank, "loans_total_inr": cum_loan,
            "emi_total_inr": emi_total, "what": build_note, "gate": gate, "economics": econ,
            "contribution_needed_per_tower_per_month_for_dscr_1_3": need_contrib,
            "contribution_base_per_tower_per_month": real["contribution_inr"] / N,
            "covered_area_m2": cs["area_m2"], "connected_kw": cs["connected_kw"],
            "tanker_loads_per_day": real["opex_details"]["raw_water_m3"] / DAYS_PER_MONTH / 12.0,
            "headcount": real["opex_details"]["headcount"],
        })
    phases.append({"phase": "6,000 towers", "ready": "Not before about 2031 (estimate)", "towers": 6000,
                   "what": ("A different business (wholesale): a 10-year lease on 3.5-4 acres, HT power, about 230 m3 of water a day, 80-120 staff, "
                            "7-8 t a week of signed contracts and Rs 13-15 crore."),
                   "gate": "Review only after 2 years of audited profit at 1,000 towers or more."})
    # debt cover of smaller improvements at Phase 2 (150 towers, demand 6 months after Oct 2027)
    ph2 = phases[1]
    a150, _ = choose_mix(ph2["towers"], rank)

    def _cover(pp, water):
        fl = {"cost_basis": "owner_realistic", "water_source": water}
        e = steady_state(ph2["towers"], a150, pp, "m12", s_month=ph2["sales_month_used"], flags=fl)["ebitda_before_commitment_inr"]
        return e / ph2["emi_total_inr"] if ph2["emi_total_inr"] > 0 else None
    c1 = _cover(pb.but(price_multiplier=1.2, pump_w_per_tower=10.0), "tanker_rain")
    c2 = _cover(pb.but(price_multiplier=1.2, yield_multiplier=1.2, pump_w_per_tower=10.0), "tanker_rain")
    c3 = _cover(pb.but(price_multiplier=1.2, yield_multiplier=1.2, pump_w_per_tower=10.0), "borewell")
    return {"phases": phases, "kg_per_tower_per_week_gate_case": kgw,
            "phase2_debt_cover_of_smaller_gains": {"prices_+20%_block_pumps_rain": c1, "prices_and_yields_+20%_block_pumps_rain": c2,
                                                   "prices_and_yields_+20%_block_pumps_borewell": c3},
            "gate_pass_case_definition": ("Your plan at legal-minimum cost + prices and yields both 30%% above base (about Rs %s of contribution per "
                                          "tower per month, twice the base) + block pumps (10 W per tower) + roof rain from the farm's own roof. "
                                          "Smaller gains do not carry the Phase 2 loan: prices +20%% with block pumps and rain give debt cover %.2f; "
                                          "prices +20%% and yields +20%% give %.2f (%.2f with a borewell).") % (
                                              g(ph2["contribution_needed_per_tower_per_month_for_dscr_1_3"]), c1, c2, c3),
            "demand_rule": ("Towers are capped by the target-price + bulk demand a new seller reaches 6 months after each phase is ready "
                            "(base demand ramp; one owner-salesperson), at the gate-pass yield.")}


# =============================================================================
# Review decisions, pain points, research findings, key numbers
# =============================================================================
REVIEW_DECISIONS = [
    # numbers audit
    {"id": "A1", "reviewer": "numbers audit", "severity": "critical", "issue": "Owner-case profit comes from illegal or physically impossible figures.",
     "decision": "accept", "reason": "Evidence holds (legal floors, physical bills). Added a 'your plan at legal-minimum cost' column beside your figures at every size, plus break points per figure."},
    {"id": "A2", "reviewer": "numbers audit", "severity": "critical", "issue": "200-tower owner result is a month-12 steady state that ignores funding.",
     "decision": "accept", "reason": "Month-by-month runs of 200 towers now at each cost basis with an automatic AIF loan; demand month shown; EBITDA - commitment - EMI line."},
    {"id": "A3", "reviewer": "numbers audit", "severity": "critical", "issue": "Rs 10,000 night guard is below the legal minimum.",
     "decision": "accept", "reason": "Labour research: 60 day-wages at Rs 549.97 = Rs 33,000 for a 12-h post. Legal-minimum case uses it above 150 towers; no separate guard up to 150."},
    {"id": "A4", "reviewer": "numbers audit", "severity": "critical", "issue": "Model not valid above about 1,000 towers.",
     "decision": "accept", "reason": "Added step costs: sites, generators per 12 kW of backup, cold rooms and pack houses per 600 towers, fences by perimeter, HT supply at 150 kW+ (HT-2(a), verified in the tariff book), HT-type metering 50-150 kW, supervisors, EPF/gratuity, lined ponds, RO units, supplier-limited build time. Land lease is not costed (rent unknown) and is flagged."},
    {"id": "A5", "reviewer": "numbers audit", "severity": "major", "issue": "Production labour understated by about 27-29%.",
     "decision": "accept", "reason": "Research rates are per turn; the model's own harvest speeds imply 49 h. Base now 49 h (32/75)."},
    {"id": "A6", "reviewer": "numbers audit", "severity": "major", "issue": "Rs 40,000 of helpers runs only about 150-190 towers.", "decision": "accept",
     "reason": "Check now in the model: about 138 towers (uniform wage), 185 (agriculture wage), 132 in the first cycles."},
    {"id": "A7", "reviewer": "numbers audit", "severity": "major", "issue": "Rs 10,000 power runs only about 79 towers.", "decision": "accept",
     "reason": "Model check: 79 towers with kit pumps, 151 with block pumps."},
    {"id": "A8", "reviewer": "numbers audit", "severity": "major", "issue": "Rs 10,000 tanker water supplies only about 70 towers with RO.", "decision": "accept",
     "reason": "With the accepted hot-month factors the model gives about 51 towers (102 without RO; 30 in April)."},
    {"id": "A9", "reviewer": "numbers audit", "severity": "major", "issue": "'No repairs' ignores about Rs 78 per tower per month.", "decision": "accept",
     "reason": "Legal-minimum case: Rs 0 for 6 months after the build, then research values (Rs 75/tower + structure 1.5%/year)."},
    {"id": "A10", "reviewer": "numbers audit", "severity": "major", "issue": "Rs 15,000 caretaker is legal only for 6 days x 8 h.", "decision": "accept",
     "reason": "Legal-minimum case uses Rs 18,699 (7 days, agriculture rate)."},
    {"id": "A11", "reviewer": "numbers audit", "severity": "major", "issue": "Overrides deleted RO consumables and the FSSAI fee.", "decision": "accept",
     "reason": "Owner case keeps both at research values; all unmentioned items are listed."},
    {"id": "A12", "reviewer": "numbers audit", "severity": "major", "issue": "Rs 0 insurance, accounting and marketing is not fully possible.", "decision": "accept",
     "reason": "Owner column keeps your zeros; legal-minimum case adds insurance and a CA when a loan is used, FSSAI, and samples/travel."},
    {"id": "A13", "reviewer": "numbers audit", "severity": "major", "issue": "HoReCa delivery Rs 14/kg used far below 100 kg/day.", "decision": "accept",
     "reason": "Rs 38/kg up to 40 kg/day, linear to Rs 14 at 100 kg/day; trading volume shares the route in plans with trading."},
    {"id": "A14", "reviewer": "numbers audit", "severity": "major", "issue": "Water use and tanker price flat all year.", "decision": "accept",
     "reason": "Water use x1.5 in Mar-May, tanker price x1.5 in Feb-May (annual tanker bill +35%)."},
    {"id": "A15", "reviewer": "numbers audit", "severity": "major", "issue": "Break-even stated on an 'every kg sold' basis.", "decision": "accept",
     "reason": "Break-even is now demand-limited; the every-kg-sold table is labelled as such."},
    {"id": "A16", "reviewer": "numbers audit", "severity": "major", "issue": "Peak-season head weights above the best published tower result.", "decision": "partial",
     "reason": "Kept 80 g as the annual value because the lettuce research (80-100 g, adjusted for Bengaluru) and climate research (100 g year average) state year-round figures. Added the conflict note and a 'yield -20%' case beside base in every summary."},
    {"id": "A17", "reviewer": "numbers audit", "severity": "minor", "issue": "Caretaker credited with a full shift, night presence and microgreens.", "decision": "accept",
     "reason": "Credit 0.8 FTE; extra work is paid as helper time."},
    {"id": "A18", "reviewer": "numbers audit", "severity": "minor", "issue": "EBITDA labelled 'cash profit' although working capital makes cash flow negative.", "decision": "accept",
     "reason": "Labelled 'EBITDA (before working capital)'; operating cash flow shown beside it."},
    {"id": "A19", "reviewer": "numbers audit", "severity": "minor", "issue": "600-tower EMI applies the AIF rate to the whole gap.", "decision": "accept",
     "reason": "AIF on capex only (min(90% of capex, capex - own cash)); reserve at the bank rate."},
    {"id": "A20", "reviewer": "numbers audit", "severity": "minor", "issue": "Rain case uses a 2,000 m2 roof the model does not have.", "decision": "accept",
     "reason": "Rain share = own roof area x rain x runoff / demand, capped at 62%."},
    {"id": "A21", "reviewer": "numbers audit", "severity": "minor", "issue": "Registrations low value cannot pay the FSSAI central licence.", "decision": "accept",
     "reason": "Low raised to Rs 12,000."},
    {"id": "A22", "reviewer": "numbers audit", "severity": "minor", "issue": "Crop ranking revenue includes unsold produce.", "decision": "accept",
     "reason": "Revenue shown as net sales; contribution unchanged by this presentation fix."},
    {"id": "A23", "reviewer": "numbers audit", "severity": "minor", "issue": "First harvest assumes power and seedlings are ready.", "decision": "accept",
     "reason": "Transplant = latest of structure ready + assembly, grid connection live, sowing + nursery days."},
    {"id": "A24", "reviewer": "numbers audit", "severity": "minor", "issue": "EPF and gratuity missing.", "decision": "accept", "reason": "EPF 13% of min(wage, Rs 15,000) at 20+ staff; gratuity 4.81% at 10+."},
    {"id": "A25", "reviewer": "numbers audit", "severity": "minor", "issue": "Owner as grower unrealistic above about 150 towers.", "decision": "accept",
     "reason": "Legal-minimum case: owner grows up to 150 (stretch 200); paid grower above; supervisors above 600."},
    {"id": "A26", "reviewer": "numbers audit", "severity": "minor", "issue": "Recommended plan's profit rests on estimates (microgreens, trading).", "decision": "accept",
     "reason": "Dependency stated; runs without microgreens and without trading; gate before the microgreens step-up."},
    # market / operations
    {"id": "R1", "reviewer": "market/operations", "severity": "critical", "issue": "Capital breaks before the first step.", "decision": "accept",
     "reason": "Model: 200 towers Rs 50.9 lakh vs Rs 12.6 lakh usable; EMI above EBITDA even at your figures."},
    {"id": "R2", "reviewer": "market/operations", "severity": "critical", "issue": "200 -> 6,000 towers by March 2027 is not possible.", "decision": "accept",
     "reason": "Step-by-step test added; every resource breaks; gated path added."},
    {"id": "R3", "reviewer": "market/operations", "severity": "critical", "issue": "Output far above demand; prices held fixed at large volumes.", "decision": "accept",
     "reason": "Price cut above 400 towers (full 30% at about 1,200 towers); path towers capped by demand."},
    {"id": "R4", "reviewer": "market/operations", "severity": "critical", "issue": "Owner figures make 200 towers look profitable.", "decision": "accept", "reason": "Three cost bases side by side."},
    {"id": "R5", "reviewer": "market/operations", "severity": "critical", "issue": "No plan makes a cash profit by December 2026.", "decision": "accept",
     "reason": "Confirmed by the month-by-month runs; December goal reset to sales milestones."},
    {"id": "R6", "reviewer": "market/operations", "severity": "major", "issue": "Guard and caretaker below minimum wage at any size.", "decision": "accept", "reason": "See A3 and A10."},
    {"id": "R7", "reviewer": "market/operations", "severity": "major", "issue": "Rs 10,000 water supports about 64 towers.", "decision": "accept", "reason": "See A8."},
    {"id": "R8", "reviewer": "market/operations", "severity": "major", "issue": "Rs 10,000 power supports about 79 towers; HT above 150 kW.", "decision": "accept",
     "reason": "HT-2(a) Rs 350/kVA + Rs 6.60/kWh confirmed in the BESCOM 2026-28 tariff book; applied per site at 150 kW+."},
    {"id": "R9", "reviewer": "market/operations", "severity": "major", "issue": "Rs 40,000 helpers run about 140-190 towers.", "decision": "accept", "reason": "See A5 and A6."},
    {"id": "R10", "reviewer": "market/operations", "severity": "major", "issue": "Repairs, insurance, fees and samples cannot be zero.", "decision": "accept", "reason": "See A9, A11 and A12."},
    {"id": "R11", "reviewer": "market/operations", "severity": "major", "issue": "Owner is grower, manager and the only salesperson.", "decision": "accept",
     "reason": "Kept as advice and pain point (sales help at 10+ accounts, paid grower above 150-200, mentor); not costed in base because the size is an estimate."},
    {"id": "R12", "reviewer": "market/operations", "severity": "major", "issue": "D2C profit depends on the Rs 99 fee and month-12 route density.", "decision": "accept",
     "reason": "Fee cases Rs 0/40 added; thin-route drop cost from the Borzo tariff when above Rs 85."},
    {"id": "R13", "reviewer": "market/operations", "severity": "major", "issue": "Tower heads are small; 200-tower mix over-supplies crops early.", "decision": "partial",
     "reason": "Advice accepted (sell by weight, alternate sites, chef approval). Per-crop monthly caps not added: the whole-farm demand cap binds first at those sizes and those plans are already rejected."},
    {"id": "R14", "reviewer": "market/operations", "severity": "major", "issue": "Grid, AIF and channel set-up can each add 1-4 months.", "decision": "accept",
     "reason": "Grid connection in the timing; AIF 30-120 days in the path; bulk buyers only from sales month 3."},
    {"id": "R15", "reviewer": "market/operations", "severity": "major", "issue": "Backup power undersized.", "decision": "accept",
     "reason": "Generator rental on shutdown days up to 200 towers; generators sized to 50% of pump load above."},
    {"id": "R16", "reviewer": "market/operations", "severity": "major", "issue": "Scale-up lands in the worst season.", "decision": "accept", "reason": "Path adds capacity only for Oct-Nov planting."},
    {"id": "R17", "reviewer": "market/operations", "severity": "major", "issue": "Owned land holds about 1,500-1,600 towers; rent-free plot is a trap.", "decision": "accept",
     "reason": "Model: 1,596 towers on owned land; leased block beyond."},
    {"id": "R18", "reviewer": "market/operations", "severity": "major", "issue": "Grower skill, tower design at scale, hardware quality.", "decision": "accept", "reason": "Pain points and gates."},
    {"id": "R19", "reviewer": "market/operations", "severity": "major", "issue": "Results above about 600 towers not reliable.", "decision": "partial",
     "reason": "Step costs and HT tariff added. Output is not cut in the owner column when paid staff are too few; instead the checks show how many towers your staff budget can run."},
    {"id": "R20", "reviewer": "market/operations", "severity": "major", "issue": "Phase 1 has no stop-loss.", "decision": "accept", "reason": "Stop rules written into the plan."},
    {"id": "R21", "reviewer": "market/operations", "severity": "minor", "issue": "Microgreens demand/price optimistic; a room must exist.", "decision": "accept",
     "reason": "Start at 50 trays; step up only after 15 kg/week at Rs 700/kg for 4 weeks."},
    {"id": "R22", "reviewer": "market/operations", "severity": "minor", "issue": "Trading earns little; export cannot pay within 90 days.", "decision": "accept", "reason": "Advance payment; no export cash before Q2 2027."},
    {"id": "R23", "reviewer": "market/operations", "severity": "minor", "issue": "Steady-state tables read as near-term profit.", "decision": "accept",
     "reason": "Earliest dates and month-by-month results printed next to steady values."},
    {"id": "R24", "reviewer": "market/operations", "severity": "minor", "issue": "No case pays the owner; replacement spending skipped.", "decision": "accept",
     "reason": "Owner drawing (Rs 30,000) and profit after depreciation shown in the path."},
]

REJECTED_OR_NOT_MODELLED = [
    "A16 (partial): lettuce head weight kept at 80 g as a year-round value (lettuce and climate research both state year-round figures); a yield -20% case is shown instead.",
    "R13 (partial): per-crop monthly market caps not added; the whole-farm demand cap binds first and those large plans are already rejected.",
    "R19 (partial): owner-column output is not cut when the owner's staff budget is too small; the checks report how many towers that budget can run.",
    "Numbers audit option 'cap outputs at 1,000 towers': step costs were added instead, so 2,000 and 6,000 towers are costed (estimates beyond 600 towers).",
    "Land lease cost above about 1,600 towers not added: the rent is unknown (no research value); leaving it out flatters large farms, which lose money anyway.",
    "Running-cost contingency not added to base: base is the value to bet on; the conservative case and research ranges carry the buffer.",
    "Theft and animal-damage allowance not added: no research value for its size; listed as a pain point.",
]


def build_pain_points(R):
    pb = R["pb"]
    oc = R["owner_costs"]
    sz = {e["towers"]: e for e in oc["sizes"]}
    s200 = sz[200]
    s600 = sz[600]
    s6k = sz[6000]
    chk = {c["figure"]: c for c in R["owner_cost_checks"]}
    rec = R["plans"]["recommended"]["answers"]
    mb = oc["month_by_month_200"]["owner__towers_only"]
    b200 = mb["info"]["batches"][0]
    sp = R["scale_plan_test"]
    t600 = R["profit"]["t600"]["base"]
    P = []

    def add(cat, sev, pain, evidence, fix):
        P.append({"category": cat, "severity": sev, "pain": pain, "evidence": evidence, "fix": fix})

    add("Capital and loans", "critical", "Your Rs 20 lakh cannot pay for 200 towers, let alone 600 or 6,000.",
        "Capex: 200 towers Rs %s lakh; 600 towers Rs %s lakh; 6,000 towers Rs %s crore. Usable cash after the Rs 4.4 lakh commitment and a Rs 3 lakh reserve: Rs %s lakh (model; towers research)." % (
            lk(s200["capex_inr"]), lk(s600["capex_inr"]), "%.1f" % (s6k["capex_inr"] / 1e7), lk(own_cash_for_capex(pb))),
        "Spend only on a 10-20 tower test and the side lines now (about Rs 10-11 lakh).")
    add("Capital and loans", "critical", "Even at your own cost figures the farm cannot repay the loan it would need.",
        "200 towers need a loan of about Rs %s lakh; EMI about Rs %s a month after a 12-month moratorium. EBITDA at your figures Rs %s; at legal-minimum cost Rs %s (debt cover %.2f and below; lenders want 1.3)." % (
            lk(s200["loan"]["loan_inr"]), g(s200["loan"]["emi_inr"]), g(s200["scenarios"]["base"]["owner"]["ebitda_inr_per_month"]),
            g(s200["scenarios"]["base"]["owner_realistic"]["ebitda_inr_per_month"]), s200["dscr"]["owner"] or 0),
        "Borrow (AIF) only after measured test data show EBITDA of at least 1.3 x the EMI.")
    add("Capital and loans", "major", "Subsidies and the AIF loan are slow and capped.",
        "Every capital subsidy needs approval before building and pays 6-24 months later; NHB needs more than 4,000 m2 on one site and a 10-year title and pays 35%; AIF subvention covers up to Rs 2 crore per location, needs 10% own money and takes 30-120 days (finance research).",
        "Count subsidies as a bonus; apply only for a pre-approved later phase.")
    add("Capital and loans", "major", "The Rs 40,000 monthly commitment competes for the same cash until August 2027.",
        "11 payments, about Rs 4.4 lakh (owner). Recommended plan: first month with profit after the commitment is %s." % rec["first_month_positive_after_commitment"],
        "Ring-fence Rs 4.4 lakh now; keep cash at or above the remaining commitment + Rs 3 lakh.")
    add("Capital and loans", "major", "A failed farm loan can put family land at risk.",
        "Outside AIF/CGTMSE cover, banks ask to mortgage owned land for Rs 30-60 lakh loans (finance research).",
        "Do not pledge family land for an unproven farm.")
    add("Market and sales", "critical", "A new seller cannot sell what large tower farms grow.",
        "Month-12 target-price demand about %.0f kg/week (base, one owner-salesperson). Share sold at target price: 600 towers %s; 6,000 towers %s (model; demand research)." % (
            R["demand_m12"]["target"], pc(t600["share_sold_at_target_price"]), pc(s6k["physical"]["share_sold_at_target_price"])),
        "Size towers to signed weekly orders; add towers only after 4 weeks at 70% or more sold at the target price.")
    add("Market and sales", "critical", "Restaurant prices in Bengaluru are low and already served by strong suppliers.",
        "Hyperpure delivers lettuce at Rs 140-216/kg, basil Rs 150/kg, bok choy Rs 136/kg, palak Rs 62/kg; farm-gate lettuce Rs 35-70/kg; BigBasket lists 24 hydroponic lettuces; OnlyHydroponics has 60,000+ customers (prices, demand research).",
        "Price near Hyperpure for HoReCa; sell premium packs and boxes direct; compete on freshness and reliability.")
    add("Market and sales", "major", "Well-funded fresh-produce companies lost money or shut.",
        "Deep Rooted (Bengaluru) lost Rs 52 crore on Rs 34 crore revenue and shut in March 2025; Otipy, Clover, WayCool lost 55-74% of revenue (demand research).",
        "Keep spending low; grow only against orders.")
    add("Market and sales", "major", "Floruvi's current list prices are far above the local market.",
        "Floruvi list prices are 1.4-8.6 times Bengaluru shelf prices (iceberg Rs 1,120/kg vs Rs 130/kg); microgreens Rs 280 per 50 g vs Rs 79-99 (prices research).",
        "Reprice to Bengaluru levels before pushing volume.")
    add("Market and sales", "major", "Home delivery profit depends on the Rs 99 fee.",
        "At 200 towers, a Rs 0 fee changes EBITDA by Rs %s a month (sensitivity, your costs); OnlyHydroponics delivers free above Rs 399 (market/operations review)." % g(
            next((x["change_vs_base_inr"] for x in R["sensitivity"]["t200_owner_costs"] if x["case"].startswith("D2C delivery fee Rs 0")), 0)),
        "Test the fee with 20-30 paying customers; sell Rs 400-500 boxes; deliver on fixed days.")
    add("Market and sales", "major", "Buyers pay late and some never pay.",
        "Restaurants 0-45 days, bulk buyers 30-45 days; bad debts 1-8%; only 3% of B2B produce listings offer credit (prices, demand research).",
        "Take UPI in advance from new accounts; at most 7 days of credit; stop supply after 2 unpaid invoices.")
    add("Market and sales", "major", "Bulk channels need paperwork and time before the first order.",
        "Quick commerce needs GSTIN, FSSAI, trademark, GS1 barcodes (Rs 50,200) and e-invoicing; first order 7-60 days; supplier gets 45-65% of shelf price (logistics research).",
        "Start FSSAI, GSTIN, Udyam and trademark now; buy barcodes only after a buyer commits in writing.")
    add("Market and sales", "minor", "Tower heads are smaller than shop heads.",
        "Tower lettuce 80-100 g (trials 53-95 g) vs 125-250 g heads on shelves (lettuce research).",
        "Sell by weight, as mixed-leaf and live-root packs; test alternate-site planting for bigger heads.")
    add("Staff and labour law", "critical", "Your guard and caretaker budgets are below the legal minimum wage.",
        "Legal floor for a 12-h, 30-night guard about Rs %s (agriculture schedule); 7-day caretaker Rs 18,699 (labour research). You budget Rs 10,000 and Rs 15,000." % g(chk["Night security guard"]["legal_floor_inr_per_month"]),
        "Up to 150 towers use one legal resident caretaker + CCTV + siren (about Rs %s with on-costs); hire a legal guard only above 150 towers." % g(loaded_cost(pb, pb("caretaker_7day_agri_inr"), bonus=False)))
    add("Staff and labour law", "major", "Towers need more hands than expected.",
        "49 h per 1,000 sites per 40 days (+40%% in the first cycles): 200 towers need %.1f FTE, 600 towers %.1f, 6,000 towers %.0f. Rs 40,000 of helpers runs about %d towers (labour research; numbers review)." % (
            s200["physical"]["fte_required"], s600["physical"]["fte_required"], s6k["physical"]["fte_required"], chk["Helpers and packers"]["realistic_up_to_towers"]),
        "Record hours by task in the test; sell bulk crates to cut packing hours.")
    add("Staff and labour law", "major", "Minimum wages may rise 42% for farm work.",
        "Uniform notification of 22 May 2026: Rs 20,350 (Zone 3) vs agriculture Rs 14,299; the High Court refused interim relief (labour research).",
        "Budget helpers at Rs 20,350; watch the Division Bench ruling.")
    add("Staff and labour law", "minor", "Payroll rules start at small headcounts.",
        "ESI from 10 employees, EPF from 20, gratuity from 10; agency guards can count (labour research).",
        "Track headcount; pay by bank transfer; keep wage registers.")
    add("Water", "critical", "No borewell: every litre is bought by tanker, at peak prices in the dry months.",
        "Tanker Rs 125/m3 base, Rs 2,000-2,850 a load in Feb-May 2024; RO rejects about half; Rs 10,000 covers the tanker bill of about %d towers (%d in April). 6,000 towers need about %.0f loads a day (water research; model)." % (
            chk["Water (tanker, no borewell)"]["realistic_up_to_towers"], chk["Water (tanker, no borewell)"]["realistic_up_to_towers_april"], s6k["physical"]["tanker_loads_per_day_average"]),
        "Test the water; build roof-rain storage; ask BWSSB about Cauvery tankers; apply to KGWA for a sited borewell.")
    add("Water", "major", "Local groundwater is too salty and hard for recirculating towers without RO.",
        "Median EC about 1,480 uS/cm, Na 80 mg/L, Cl 273 mg/L, HCO3 343 mg/L; hydroponic limits Na < 50, Cl < 70 (water research).",
        "Install RO only if the lab test fails; never use a salt softener.")
    add("Water", "major", "A new borewell can fail and needs permission.",
        "Rs 2.3-7 lakh for 1,000-1,500 ft; 10-80% failure risk (base 40%); KGWA permission up to 60 days in a notified area (water research).",
        "Use a hydrogeologist; put water assets only on owned land.")
    add("Power", "major", "Power costs more than Rs 10,000 beyond about 80 towers, and outages kill roots.",
        "LT-5 about Rs 5.42/kWh + Rs 200/kW; Rs 10,000 runs about %d towers (%d with block pumps). Outages about 15 h a month; planned shutdowns 4-8 h; roots dry in 30-60 min on hot afternoons (power research)." % (
            chk["Power"]["realistic_up_to_towers"], chk["Power"]["realistic_up_to_towers_block_pumps"]),
        "Get LT-5 'Green House' on a 24x7 feeder in writing; inverter + generator rental; power-fail alarms; block pumps after the test.")
    add("Power", "major", "Wrong tariff or feeder can wreck the numbers.",
        "LT-3 commercial costs about 44% more than LT-5; farm (IP) feeders give only about 7 h of 3-phase power a day; loads of 150 kW+ need HT supply (tariff clause 9) (power research; tariff book).",
        "Apply in week 1 of October on the owned plot; never run towers on an IP-set connection.")
    add("Operations and crops", "major", "Tower yields are low and uncertain.",
        "Tower trials: 95 g (ideal indoor), 61-79 g (tropical greenhouse), 53 g (Indian indoor); bottom tier 43%% lighter; the model's 80 g base is a year average (lettuce research). Yield -20%% changes 150-tower EBITDA by Rs %s a month." % g(
            next((x["change_vs_base_inr"] for x in R["sensitivity"]["phase2"] if x["case"].startswith("Yield -20%")), 0)),
        "Weigh every harvest by tower tier during the test; decide on measured grams per site.")
    add("Operations and crops", "major", "Root disease can wipe out a reservoir, and learning losses are high.",
        "Pythium spreads through recirculating water and no fungicide is registered; first-cycle losses 20-40%; Bowery Farming shut after a pathogen outbreak (climate, finance research).",
        "Many small independent reservoirs; sanitise between cycles; quarantine seedlings; keep solution at 25 C or less.")
    add("Operations and crops", "major", "Bengaluru's hot and wet seasons cut yields.",
        "Mar-May: lettuce -40% (range 25-60%), tanks 26-31 C; Jun-Oct: basil -30% from downy mildew, low light (climate research).",
        "Switch to Batavia and basil in Mar-May; shade and insulate tanks; night fans in the monsoon; add capacity only for Oct-Nov.")
    add("Operations and crops", "major", "Cheap tower kits hide gaps and scams.",
        "Rs 5,000-12,000 buys only the kit; installed cost about Rs %s per tower before the structure; IndiaMART prices for similar towers range Rs 10,500-2.2 lakh; unstabilised plastic can lose 70%% of its strength in a year; pump warranty often 6 months (towers research)." % g(R["capex"]["t600"]["installed_cost_per_tower_excl_structure_inr"]),
        "Buy 2-5 samples from 2 suppliers; demand datasheets and warranties; refuse buy-back or guaranteed-income offers.")
    add("Operations and crops", "minor", "Seed and supplies can run out.",
        "Several Rijk Zwaan, Enza, Namdhari and Tokita packs were out of stock (consumables research).",
        "Order seed 2-3 cycles ahead from 2 suppliers.")
    add("Land and site", "major", "Owned land holds about 1,600 towers; the free plot is a trap.",
        "Usable owned land about 3,035 m2 = about {:,} towers at 1.9 m2 each; the large plot is rent-free for 1 year only; NHB/MIDH need 10 years of title or use (towers, finance research).".format(sp["owned_land_towers"]),
        "Put every permanent asset on the owned 60-cent plot; nothing permanent on the 1-year plot without a 10-year lease.")
    add("Timeline", "critical", "No plan gives a cash profit by December 2026.",
        "200 towers ordered on 11 Oct: first harvest %s; Dec 2026 EBITDA at your costs Rs %s. Recommended plan: Oct-Dec EBITDA Rs %s; first month with profit %s (after the commitment: %s) (model)." % (
            b200["first_harvest"], g(mb["answers"]["M3_ebitda_before_commitment_inr"]), g(rec["oct_dec_2026_ebitda_before_commitment_inr"]),
            rec["first_month_positive_before_commitment"], rec["first_month_positive_after_commitment"]),
        "Reset the December goal to sales milestones (10+ paying accounts, 60-95 kg/week sold at target price).")
    add("Timeline", "major", "Grid connection, loans and channels each add months.",
        "Rural LT connection 15-120 days; AIF sanction 30-120 days; FSSAI central licence up to 60 days; quick commerce first order 7-60 days (power, finance, logistics research).",
        "Apply for LT-5, FSSAI, GSTIN and Udyam in week 1.")
    add("Scale plan", "critical", "200 -> 6,000 towers by March 2027 breaks every resource.",
        sp["verdict"], "Drop the 6,000-by-March target; follow the gated path.")
    add("Compliance and tax", "minor", "Some rules cost money even for a small farm.",
        "FSSAI central licence Rs 7,500 a year for online sales; input GST (5-18%) cannot be reclaimed on exempt produce; tower produce may be taxed as business income; a pack house needs building permission (finance research).",
        "Get a written CA opinion; keep books from day one.")
    add("Side lines and export", "major", "The quick-cash side lines rest on estimates.",
        "Microgreens lose money below about Rs 700/kg blended and need about 20 kg/week of orders by month 3; trading keeps only about 5%% of sales after bad debt. Without microgreens the recommended plan's lowest cash is Rs %s (model; strawberry_micro, demand research)." % g(
            R["plans"]["recommended_without_microgreens"]["answers"]["lowest_cash_balance_inr"]),
        "Start at 50 trays a week; step up only after 4 weeks at 15 kg/week and Rs 700/kg; trade only for advance payment.")
    add("Side lines and export", "minor", "Export will not bring cash soon.",
        "First paid shipment about 75 days away (35-150); basil to Dubai earns about Rs 52/kg less than selling it in Bengaluru; mint, coriander and lettuce lose Rs 30-240/kg by air (export research).",
        "Finish IEC/RCMC/FSSAI; export only premium herbs, 100% advance, from Q2 2027.")
    add("Side lines and export", "minor", "Strawberries in towers are a small trial at best.",
        "About 150 g per plant per season in towers (60 g in a US tower trial); fruit only Dec-Apr; pollination needed (strawberry research).",
        "At most a 5-10 tower trial planted in Oct-Nov.")
    add("Owner and people", "major", "One person cannot grow, sell, deliver and collect for a large farm.",
        "The demand ramp assumes one owner-salesperson reaching 40 accounts and 300 boxes by month 12; the owner can grow up to about 150 towers (labour research; demand research).",
        "Add a part-time sales/delivery person once accounts pass 10; hire a paid mentor for 3-6 months.")
    add("Owner and people", "major", "No case pays the family yet.",
        "All profits are before any owner salary; a Rs 30,000 drawing needs EBITDA above the loan EMI + Rs 30,000 (market/operations review).",
        "Judge each phase on profit after loan payments and an owner drawing.")
    add("Model limits", "minor", "Several inputs are estimates or one-day snapshots.",
        "Prices are a 29 Sep 2026 snapshot; demand ramp, loss rates, step costs above 600 towers, generator rental and hiring speed are estimates; land lease above 1,600 towers is not costed; some supplier pages were blocked (research notes).",
        "Replace estimates with test-module records every week.")
    return P


RESEARCH_KEY_ITEMS = {
    "towers": ["Tower kit, 80-96 sites", "Installed cost per 90-site tower", "All-in capex, 600 towers", "Towers affordable from", "Usable area, 60-cent", "Pump life", "Tower body life"],
    "structure": ["NVPH installed cost, about 1,000 m2", "NVPH installed cost, 150-290", "Flat-roof net house with UV-film roof", "UV film replacement interval", "Subsidy share of admissible cost", "Time from order to ready structure"],
    "climate": ["Lettuce sellable head weight in towers", "Tower per-plant yield penalty", "Solution temperature in a shaded above-ground tank", "Crop loss rate, first 6 months", "Crop loss rate after month 6", "Lettuce yield drop in Mar-May", "Basil yield drop in Jun-Oct"],
    "power": ["BESCOM LT-5 industrial energy charge", "All-in electricity cost, LT-5", "Monthly electricity bill, 150 towers, LT-5", "Monthly electricity bill, 600 towers, LT-5", "Time to get a new LT connection", "Power outages on a rural", "Safe daytime pump stop"],
    "water": ["Total water use, 600 towers", "Groundwater EC", "RO recovery", "Private tanker, 12,000 L load", "New borewell, complete", "Chance a new borewell is dry", "Monthly water cost, 150 towers: (b) tanker only", "Rain share of RO-grade demand, 150 towers"],
    "consumables": ["Consumables per lettuce site per 40 days", "Nutrient solution cost, leafy greens", "Lettuce seed, pelleted hybrid", "IPM and sanitation total", "First consumables stock"],
    "labour": ["Min wage: Employment in Agriculture", "Uniform min wage, unskilled", "Agency night guard, 12-h shift, 30 nights: fully compliant", "Resident caretaker, 7 days", "Labour hours per 1,000 plant sites per cycle", "Headcount: 600 towers", "Market wage: trained hydroponic grower"],
    "lettuce": ["Tower vs horizontal hydroponics", "Tropical greenhouse tower", "Indian indoor tower trial", "Sellable weight per site, loose-leaf lettuce", "HoReCa price, romaine", "Retail shelf, hydroponic live-root heads", "Seed-to-first-sale lead time"],
    "herbs": ["Genovese basil: sellable yield", "Basil HoReCa price, Bengaluru", "Basil premium retail price", "Revenue per site per 40 days: basil at HoReCa price", "Basil downy mildew", "Suggested herb sites at start"],
    "greens": ["Curly kale: sellable yield", "Pak choi: sellable yield", "Hyperpure B2B price, curly kale", "Hyperpure B2B price, bok choy", "Farmers' market modal price", "Per-plant yield penalty"],
    "strawberry_micro": ["Strawberry marketable yield per tower plant", "Microgreen sellable yield per 10x20", "Microgreen blended realised price", "Microgreen break-even blended price", "Microgreen monthly cash profit at 100 trays", "Microgreen volume a new seller can sell"],
    "prices": ["HoReCa price: Hyperpure Bengaluru loose-leaf", "Farm-gate / trader asking price: soil lettuce", "Farm-gate / B2B asking price: hydroponic", "Shelf price: BigBasket hydroponic live-root", "Floruvi list price", "Payment term: HoReCa direct"],
    "demand": ["Volume a new grower can sell at the target price: month 3", "Volume a new grower can sell at the target price: month 12", "Active business accounts: month 12", "Bengaluru lettuce market, all channels", "Share of harvest sold at the target price: 600 towers, month 6", "Loss as % of revenue at funded"],
    "logistics": ["Borzo multi-drop B2C loop", "Porter three-wheeler daily HoReCa loop", "B2C delivered cost per drop, own two-wheeler", "HoReCa delivered cost per kg, own EV", "Walk-in cold room", "Quick-commerce onboarding"],
    "export": ["Time from 30 Sep 2026 to first paid export shipment", "Landed cost CPT Dubai", "Export margin over domestic sale, basil", "Export margin, leaf lettuce by air", "FSSAI Central licence, Trader/Merchant", "APEDA RCMC"],
    "finance_risk": ["AIF effective borrower interest rate", "Non-AIF bank term loan rate", "NHB and NHM minimum protected area", "Time from application to subsidy cash: MIDH", "Deployable capital after commitments", "Crop loss from a root-disease outbreak"],
}


def research_findings():
    path = os.path.join(HERE, "research.json")
    try:
        with open(path, encoding="utf-8") as fh:
            topics = json.load(fh)
    except (OSError, ValueError):
        return [{"topic": "research.json not found", "key_numbers": [], "sources": []}]
    out = []
    for t in topics:
        keys = RESEARCH_KEY_ITEMS.get(t["key"], [])
        items = []
        for kw in keys:
            it = next((x for x in t.get("line_items", []) if x["name"].startswith(kw)), None)
            if it:
                items.append({"name": it["name"], "low": it["low"], "base": it["base"], "high": it["high"], "unit": it["unit"],
                              "source": it.get("source", "")[:240], "confidence": it.get("confidence")})
        out.append({"key": t["key"], "topic": t["topic"], "summary": t["summary"], "key_numbers": items,
                    "top_risks": t.get("risks", [])[:3], "sources": t.get("sources", [])[:6],
                    "sources_total": len(t.get("sources", []))})
    return out


def build_key_numbers(R):
    pb = R["pb"]
    oc = {e["towers"]: e for e in R["owner_costs"]["sizes"]}
    s200, s600, s2k, s6k = oc[200], oc[600], oc[2000], oc[6000]
    chk = {c["figure"]: c for c in R["owner_cost_checks"]}
    rec = R["plans"]["recommended"]["answers"]
    p1p = R["profit"]["phase1_plan"]["base"]
    be = R["break_even"]["cases"]
    own_be = be["Your costs (owner figures exactly)"]
    own_be_n = own_be["owner_run_up_to_%d_towers" % int(pb("owner_grows_up_to_towers"))] or own_be["paid_grower_and_guard_above_%d_towers" % int(pb("owner_grows_up_to_towers"))]
    sp = R["scale_plan_test"]
    mb = R["owner_costs"]["month_by_month_200"]["owner__towers_only"]

    def e(sz, cb, s="base"):
        return sz["scenarios"][s][cb]["ebitda_inr_per_month"]

    def k(label, value, unit, note=""):
        v = int(round(value)) if unit.startswith("INR") or unit in ("towers", "model month (M1 = Oct 2026)") else round(float(value), 1)
        return {"label": label, "value": v, "unit": unit, "note": note}
    return [
        k("Capex, 200 towers (base, GST incl., NVPH, full site)", s200["capex_inr"], "INR", "Low %s, high %s (research ranges)." % (g(capex_summary(capex_items(200, P("optimistic", w=1.0)), 200)["total_inr"]), g(capex_summary(capex_items(200, P("conservative", w=1.0)), 200)["total_inr"]))),
        k("Capex, 600 towers (base)", s600["capex_inr"], "INR", "Unchanged from v1."),
        k("Capex, 6,000 towers (base, with step costs; land lease not costed)", s6k["capex_inr"], "INR", "3 sites, HT supply, 8 generators, 10 cold rooms."),
        k("Own cash usable for capex", own_cash_for_capex(pb), "INR", "Rs 20 lakh - Rs 4.4 lakh commitment - Rs 3 lakh reserve."),
        k("200 towers, EBITDA at your cost figures (month-12 demand)", e(s200, "owner"), "INR per month", "Per 40 days %s; after the commitment %s." % (g(s200["scenarios"]["base"]["owner"]["ebitda_inr_per_40_days"]), g(s200["scenarios"]["base"]["owner"]["ebitda_after_commitment_inr_per_month"]))),
        k("200 towers, EBITDA at legal-minimum cost of your plan", e(s200, "owner_realistic"), "INR per month", "Conservative %s; optimistic %s." % (g(e(s200, "owner_realistic", "conservative")), g(e(s200, "owner_realistic", "optimistic")))),
        k("200 towers, EBITDA at research cost", e(s200, "research"), "INR per month", "Paid grower and agency guard above 150 towers."),
        k("200 towers, loan and EMI", s200["loan"]["emi_inr"], "INR per month", "Loan %s (AIF ~6%%, 72 months after a 12-month moratorium)." % g(s200["loan"]["loan_inr"])),
        k("600 towers, EBITDA at your cost figures", e(s600, "owner"), "INR per month", "Legal-minimum %s; research %s; EMI %s." % (g(e(s600, "owner_realistic")), g(e(s600, "research")), g(s600["loan"]["emi_inr"]))),
        k("2,000 towers, EBITDA at your cost figures", e(s2k, "owner"), "INR per month", "Research %s. Output is %.1fx month-12 demand." % (g(e(s2k, "research")), s2k["physical"]["harvest_kg_per_week"] / (s2k["physical"]["demand_target_kg_per_week_m12"] + s2k["physical"]["demand_bulk_kg_per_week_m12"]))),
        k("6,000 towers, EBITDA at your cost figures", e(s6k, "owner"), "INR per month", "Research %s; legal-minimum %s." % (g(e(s6k, "research")), g(e(s6k, "owner_realistic")))),
        k("Break-even at your cost figures (month-12 demand)", own_be_n or 0, "towers", "No size breaks even at legal-minimum or research cost."),
        k("Month-12 target-price demand for a new seller", R["demand_m12"]["target"], "kg per week", "Plus about %.0f kg/week to bulk buyers." % R["demand_m12"]["bulk"]),
        k("Share of harvest sold at the target price, 600 towers", R["profit"]["t600"]["base"]["share_sold_at_target_price"] * 100, "%", "6,000 towers: %.0f%%." % (s6k["physical"]["share_sold_at_target_price"] * 100)),
        k("Recommended plan: Oct-Dec 2026 EBITDA before the commitment", rec["oct_dec_2026_ebitda_before_commitment_inr"], "INR", "Dec 2026 alone %s; after the commitment %s." % (g(rec["M3_ebitda_before_commitment_inr"]), g(rec["M3_ebitda_after_commitment_inr"]))),
        k("Recommended plan: first month with profit before the commitment", int((rec["first_month_positive_before_commitment"] or "M0").split()[0][1:]), "model month (M1 = Oct 2026)", "%s; after the commitment %s." % (rec["first_month_positive_before_commitment"], rec["first_month_positive_after_commitment"])),
        k("Recommended plan: lowest cash balance", rec["lowest_cash_balance_inr"], "INR", "%s; conservative inputs go below zero." % rec["lowest_cash_month"]),
        k("Phase 1 plan (10-tower test + microgreens + trading): steady EBITDA", p1p["ebitda_before_commitment_inr"], "INR per month", "Per 40 days %s; conservative %s; optimistic %s." % (g(p1p["per_40_days"]["ebitda_before_commitment_inr"]), g(R["profit"]["phase1_plan"]["conservative"]["ebitda_before_commitment_inr"]), g(R["profit"]["phase1_plan"]["optimistic"]["ebitda_before_commitment_inr"]))),
        k("Your Rs 40,000 helpers run up to", chk["Helpers and packers"]["realistic_up_to_towers"], "towers", "%d at the agriculture wage; %d in the first cycles." % (chk["Helpers and packers"]["realistic_up_to_towers_agriculture_wage"], chk["Helpers and packers"]["realistic_up_to_towers_first_cycles"])),
        k("Your Rs 10,000 power covers up to", chk["Power"]["realistic_up_to_towers"], "towers", "%d with block pumps." % chk["Power"]["realistic_up_to_towers_block_pumps"]),
        k("Your Rs 10,000 tanker water covers up to", chk["Water (tanker, no borewell)"]["realistic_up_to_towers"], "towers", "%d without RO; %d in April." % (chk["Water (tanker, no borewell)"]["realistic_up_to_towers_no_ro"], chk["Water (tanker, no borewell)"]["realistic_up_to_towers_april"])),
        k("Legal minimum for a 12-h night guard (30 nights, agriculture schedule, wage only)", chk["Night security guard"]["legal_floor_inr_per_month"], "INR per month", "You budget Rs 10,000."),
        k("Legal minimum for a 7-day resident caretaker (agriculture rate)", pb("caretaker_7day_agri_inr"), "INR per month", "You budget Rs 15,000."),
        k("Labour needed", pb("labour_h_per_1000_sites_40d"), "hours per 1,000 sites per 40 days", "v1 used 38; +40% in the first two cycles."),
        k("Installed cost per tower before the structure", R["capex"]["t600"]["installed_cost_per_tower_excl_structure_inr"], "INR per tower", "Your Rs 5,000-12,000 quote covers only the kit."),
        k("Towers that fit on the owned land", sp["owned_land_towers"], "towers", "About 3,035 m2 usable at 1.9 m2 per tower."),
        k("200 towers ordered now: first harvest; Dec 2026 EBITDA at your costs", mb["answers"]["M3_ebitda_before_commitment_inr"], "INR", "First harvest %s." % mb["info"]["batches"][0]["first_harvest"]),
        k("6,000 towers: tanker loads a day", s6k["physical"]["tanker_loads_per_day_average"], "loads of 12 m3", "%.0f in April." % s6k["physical"]["tanker_loads_per_day_april"]),
    ]


def run_self_checks(R):
    """Records the assert-based checks that ran during the build, plus a few cross-checks on the results."""
    pb = R["pb"]
    for key in ("phase1", "max_fundable", "phase2", "t600"):
        items = R["capex"][key]["items"]
        assert abs(sum(i["inr"] for i in items) - R["capex"][key]["summary"]["total_inr"]) < 1.0
        assert abs(sum(R["opex"][key]["items_inr"].values()) - R["opex"][key]["total_inr"]) < 1.0
    for key in ("phase1", "max_fundable", "phase2", "t600"):
        for s in SCENARIOS:
            row = R["profit"][key][s]
            assert abs(row["revenue_inr"] - row["variable_costs_inr"] - row["opex_inr"] - row["ebitda_before_commitment_inr"]) < 1.0
            for kk, v in row["per_40_days"].items():
                assert abs(v - row[kk] * 40.0 / 30.4) < 1e-6
    hc = R["hand_check"]
    assert abs(hc["crop"]["difference_inr"]) < 1.0, "hand check of the crop line failed"
    assert abs(hc["month"]["balance_change_rebuilt_inr"] - hc["month"]["balance_change_model_inr"]) < 1.0
    n_plans = len(R["plans"]) + len(R["owner_costs"]["month_by_month_200"]) + len(R["scale_plan_test"]["month_by_month"])
    return [
        {"check": "Capex lines add up to the capex total (every capex call; asserted in capex_summary)", "passed": True},
        {"check": "Monthly cost lines add up to the running-cost total (every steady state and the four cost tables)", "passed": True},
        {"check": "Revenue - variable costs - running costs = EBITDA (every steady state and profit table)", "passed": True},
        {"check": "Per 40 days = per month x 40 / 30.4 (every profit table)", "passed": True},
        {"check": "Cash balance rolls forward from Rs 20 lakh month by month (%d plans)" % n_plans, "passed": True},
        {"check": "The Rs 40,000 commitment is paid in M1-M11 (Oct 2026-Aug 2027) only (%d plans)" % n_plans, "passed": True},
        {"check": "Hand check of the Lollo Rosso crop line matches the model", "passed": True},
    ]


# =============================================================================
# Build every result
# =============================================================================
def rnd(o, money=False):
    if isinstance(o, dict):
        return {k: rnd(v, money or ("inr" in str(k).lower())) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [rnd(v, money) for v in o]
    if isinstance(o, float):
        if math.isinf(o):
            return None
        return int(round(o)) if money else round(o, 3)
    return o


def pnl_row(ss):
    keys = ["harvest_kg_per_month", "share_sold_at_target_price", "revenue_inr", "variable_costs_inr", "contribution_inr",
            "opex_inr", "ebitda_before_commitment_inr", "commitment_inr", "ebitda_after_commitment_inr", "depreciation_inr",
            "profit_after_depreciation_before_commitment_inr", "profit_after_depreciation_after_commitment_inr"]
    out = {k: ss[k] for k in keys}
    out["per_40_days"] = {k: ss[k] * MONTH_TO_40D for k in keys if k.endswith("_inr")}
    return out


def phase1_plan_pnl(n1, alloc1, sp, spec1):
    """Steady-state month for Phase 1 towers + microgreens (caretaker shares the work) + trading at sales month 12."""
    ss = steady_state(n1, alloc1, sp, "m12", spec=spec1, flags={"extra_fte": sp("mg_workers")[1]})
    mg = microgreens_steady(100, sp)
    tr = trading_steady(12, sp)
    revenue = ss["revenue_inr"] + mg["revenue_inr"] + tr["net_profit_inr"]
    variable = ss["variable_costs_inr"] + mg["variable_inr"] + mg["fixed_inr"]
    ebitda = revenue - variable - ss["opex_inr"]
    dep = ss["depreciation_inr"] + mg["capex_inr"] / (DEP_LIFE["microgreens"][0] * 12) + sp("trade_setup_capex_inr") / (DEP_LIFE["trading"][0] * 12)
    commit = sp("commitment_inr_per_month")
    row = {"harvest_kg_per_month": ss["harvest_kg_per_month"], "share_sold_at_target_price": ss["share_sold_at_target_price"],
           "revenue_inr": revenue, "variable_costs_inr": variable, "contribution_inr": revenue - variable, "opex_inr": ss["opex_inr"],
           "ebitda_before_commitment_inr": ebitda, "commitment_inr": commit, "ebitda_after_commitment_inr": ebitda - commit,
           "depreciation_inr": dep, "profit_after_depreciation_before_commitment_inr": ebitda - dep,
           "profit_after_depreciation_after_commitment_inr": ebitda - dep - commit,
           "parts_inr": {"towers_ebitda_inr": ss["ebitda_before_commitment_inr"] + 0.0,
                         "microgreens_margin_before_labour_inr": mg["revenue_inr"] - mg["variable_inr"] - mg["fixed_inr"],
                         "trading_net_profit_inr": tr["net_profit_inr"]}}
    row["per_40_days"] = {k: v * MONTH_TO_40D for k, v in row.items() if k.endswith("_inr") and not isinstance(v, dict)}
    return row


def build_results():
    pb, pc, po = P("base"), P("conservative"), P("optimistic")
    scen = {"conservative": pc, "base": pb, "optimistic": po}
    p_low, p_high = P("optimistic", w=1.0), P("conservative", w=1.0)   # full research low / high costs

    # ---- B. crop ranking
    rank = crop_ranking(pb)
    rc = {r["crop_id"]: r for r in crop_ranking(pc)}
    ro = {r["crop_id"]: r for r in crop_ranking(po)}
    after_lab = sorted(rank, key=lambda r: -r["contribution_after_crop_labour_inr_per_tower_per_month"])
    lab_rank = {r["crop_id"]: i + 1 for i, r in enumerate(after_lab)}
    for r in rank:
        cid = r["crop_id"]
        r["contribution_inr_per_tower_per_month_conservative"] = rc[cid]["contribution_inr_per_tower_per_month"]
        r["contribution_inr_per_tower_per_month_optimistic"] = ro[cid]["contribution_inr_per_tower_per_month"]
        r["rank_after_crop_labour"] = lab_rank[cid]
        in_season_kg_month = 600 * r["sellable_kg_per_tower_per_40d_in_season"] / MONTH_TO_40D
        cap_kg_month = r["market_cap_kg_per_week"] * DAYS_PER_MONTH / 7.0
        r["all_600_towers_kg_per_month"] = in_season_kg_month
        r["market_cap_kg_per_month"] = cap_kg_month
        r["all_600_output_vs_market_cap"] = in_season_kg_month / cap_kg_month if cap_kg_month > 0 else None
        r["all_600_contribution_if_all_sold_inr_per_month"] = 600 * r["contribution_inr_per_tower_per_month"]

    # ---- sizes, break-even, phase choice
    n600 = 600
    alloc150, _ = choose_mix(150, rank)
    n_own = int(pb("owner_grows_up_to_towers"))

    def be2(pp, flags=None, commit=False, basis="m12"):
        return {"owner_run_up_to_%d_towers" % n_own: break_even(pp, alloc150, basis, commit, 1, n_own, flags),
                "paid_grower_and_guard_above_%d_towers" % n_own: break_even(pp, alloc150, basis, commit, n_own + 1, 1500, flags, step=5)}
    agri = {"helper_wage_inr_month": ASSUMPTIONS["helper_wage_inr_month"]["low"],
            "caretaker_wage_inr_month": ASSUMPTIONS["caretaker_wage_inr_month"]["low"]}
    be = {"cases": {
        "Base (tanker water, uniform minimum wage)": be2(pb),
        "Base, including the Rs 40,000 commitment": be2(pb, commit=True),
        "Base + existing borewell": be2(pb, {"water_source": "borewell"}),
        "Base + agriculture minimum wage": be2(pb.but(**agri)),
        "Base + borewell + agriculture minimum wage": be2(pb.but(**agri), {"water_source": "borewell"}),
        "Base + prices 20% higher": be2(pb.but(price_multiplier=1.2)),
        "Base + yields 20% higher": be2(pb.but(yield_multiplier=1.2)),
        "Conservative": be2(pc),
        "Optimistic": be2(po),
        "Your costs (owner figures exactly)": be2(pb, {"cost_basis": "owner"}),
        "Your plan at legal-minimum cost": be2(pb, {"cost_basis": "owner_realistic"}),
    }, "basis": "demand-limited (month-12 demand for a new seller; numbers review)"}
    be["cases_every_kg_sold"] = {k: be2(v[0], v[1], basis="unconstrained") for k, v in (
        ("Base (tanker water, uniform minimum wage)", (pb, None)), ("Base + existing borewell", (pb, {"water_source": "borewell"})),
        ("Base + borewell + agriculture minimum wage", (pb.but(**agri), {"water_source": "borewell"})),
        ("Base + prices 20% higher", (pb.but(price_multiplier=1.2), None)), ("Base + yields 20% higher", (pb.but(yield_multiplier=1.2), None)),
        ("Optimistic", (po, None)))}
    be["owner_grower_regime_towers"] = be["cases"]["Base (tanker water, uniform minimum wage)"]["owner_run_up_to_%d_towers" % n_own]
    be["optimistic_owner_regime_towers"] = be["cases"]["Optimistic"]["owner_run_up_to_%d_towers" % n_own]
    kgw_tower = mix_kg_per_tower_week(alloc150, pb)
    Dt12, Db12, Dd12 = demand_at(pb, pb("market_cap_sales_month"))
    be["month12_target_price_demand_kg_per_week"] = Dt12
    be["month12_bulk_buyer_demand_kg_per_week"] = Db12
    be["mix_kg_per_tower_per_week"] = kgw_tower
    be["towers_month12_target_demand_can_absorb"] = Dt12 / (pb("max_share_at_target_price") * kgw_tower)
    be["towers_month12_target_plus_bulk_can_absorb"] = (Dt12 + Db12) / ((1 - pb("unavoidable_waste_share")) * kgw_tower)

    scan_sizes = [10, 20, 30, 50, 75, 100, 125, 150, 175, 200, 300, 450, 600]
    scan = size_scan(pb, rank, scan_sizes)
    n2 = n_own
    best2 = size_scan(pb, rank, [n2])[0]
    _sh150 = mix_shares(alloc150)

    def _e(n):
        return steady_state(n, {c: v * n for c, v in _sh150.items()}, pb, "unconstrained")["ebitda_before_commitment_inr"]
    be["profit_per_extra_tower_caretaker_does_the_work_inr_per_month"] = (_e(60) - _e(20)) / 40.0
    be["profit_per_extra_tower_paid_helpers_inr_per_month"] = (_e(150) - _e(100)) / 50.0
    be["caretaker_covers_towers"] = pb("caretaker_production_fte") / (
        pb("sites_per_tower") * pb("labour_h_per_1000_sites_40d") / 1000.0 / 40.0 * 7.0 / pb("hours_per_worker_week") * pb("absence_factor"))
    _ox100, _ = opex_items(100, 100, pb, capex_summary(capex_items(100, pb), 100))
    be["site_costs_that_do_not_grow_inr_per_month"] = (_ox100["caretaker"] + _ox100["backup_running"] + _ox100["internet_cctv"]
                                                        + _ox100["accounting_compliance"] + pb("marketing_fixed_inr_month"))
    be["best_base_size_towers"] = max(scan, key=lambda s: s["ebitda_if_all_sold_inr"])["towers"]
    be["best_base_ebitda_inr_per_month"] = max(s["ebitda_if_all_sold_inr"] for s in scan)

    n_rule, rule_detail = max_fundable_towers(pb, "full")
    n_rule_lean, lean_detail = max_fundable_towers(pb, "lean")
    n_test = int(pb("test_module_towers"))
    trade_wc12 = trading_steady(12, pb)["working_capital_inr"]
    side_capex = pb("mg_capex_200_inr") + pb("trade_setup_capex_inr") + trade_wc12
    side_monthly = pb("mg_fixed_inr_month")[1]
    n_plan_full, plan_full_detail = max_fundable_towers(pb, "full", extra_capex=side_capex, extra_monthly=side_monthly)
    if n_plan_full is not None and be["owner_grower_regime_towers"] and n_plan_full >= be["owner_grower_regime_towers"]:
        n1, spec1 = n_plan_full, "full"
    else:
        n1, spec1 = n_test, "test"
    test_fixed, test_capex = site_fixed_and_capex(n1, pb, spec1)
    commit_left = pb("commitment_inr_per_month") * pb("commitment_months")
    plan_rule_check = {
        "phase1_towers": n1, "phase1_spec": spec1, "phase1_capex_inr": test_capex,
        "side_line_capital_inr": side_capex, "reserve_inr": pb("reserve_months_of_fixed_costs") * (test_fixed + side_monthly) + commit_left,
    }
    plan_rule_check["cash_left_after_reserve_inr"] = (pb("starting_cash_inr") - test_capex - side_capex - plan_rule_check["reserve_inr"])

    alloc1, beyond1 = choose_mix(n1, rank)
    alloc2, beyond2 = choose_mix(n2, rank)
    alloc600, beyond600 = choose_mix(n600, rank)
    alloc_rule, _ = choose_mix(max(1, n_rule or 1), rank)

    # ---- E/F. capex and monthly costs
    sizes = [("phase1", n1, spec1, alloc1), ("max_fundable", n_rule or 0, "full", alloc_rule),
             ("phase2", n2, "full", alloc2), ("t600", n600, "full", alloc600)]
    capex = {}
    opex = {}
    for key, N, spec, alloc in sizes:
        items_b = capex_items(N, pb, spec)
        cs_b = capex_summary(items_b, N)
        capex[key] = {"towers": N, "spec": spec, "items": items_b, "summary": cs_b,
                      "total_low_inr": capex_summary(capex_items(N, p_low, spec), N)["total_inr"],
                      "total_high_inr": capex_summary(capex_items(N, p_high, spec), N)["total_inr"],
                      "installed_cost_per_tower_excl_structure_inr": (
                          (pb("kit_price_ex_gst_inr") * (1 + pb("gst_on_kits")) + pb("freight_inr_per_tower") + pb("assembly_inr_per_tower")
                           + pb("spares_inr_per_tower") + pb("electrical_inr_per_tower")) * (1 + pb("contingency_share")))}
        ox_b, det_b = opex_items(N, N, pb, cs_b)
        ox_l, _ = opex_items(N, N, p_low, capex_summary(capex_items(N, p_low, spec), N))
        ox_h, _ = opex_items(N, N, p_high, capex_summary(capex_items(N, p_high, spec), N))
        opex[key] = {"towers": N, "items_inr": ox_b, "details": det_b, "total_inr": sum(ox_b.values()),
                     "total_low_inr": sum(ox_l.values()), "total_high_inr": sum(ox_h.values()),
                     "commitment_inr": pb("commitment_inr_per_month"), "depreciation_inr": cs_b["dep_month_inr"]}

    # ---- G. profit tables
    profit = {}
    for key, N, spec, alloc in sizes:
        profit[key] = {"towers": N, "spec": spec}
        for sname, sp in scen.items():
            profit[key][sname] = pnl_row(steady_state(N, alloc, sp, "m12", spec=spec))
            profit[key][sname + "_if_all_sold"] = pnl_row(steady_state(N, alloc, sp, "unconstrained", spec=spec))
    base_ss = {key: steady_state(N, alloc, pb, "m12", spec=spec) for key, N, spec, alloc in sizes}
    profit["phase1_plan"] = {"towers": n1, "spec": spec1 + " towers + microgreens 100 trays/week + trading (month-12 level)"}
    for sname, sp in scen.items():
        profit["phase1_plan"][sname] = phase1_plan_pnl(n1, alloc1, sp, spec1)

    # ---- H. month-by-month plans
    ph2_month = int(pb("phase2_order_month"))
    ph2_day = calendar()[ph2_month - 1]["day0"]
    include_ph2 = best2["ebitda_demand_limited_inr"] > 0
    rec_batches = [{"N": n1, "spec": spec1, "order_day": pb("order_day")}]
    if include_ph2:
        rec_batches.append({"N": n2 - n1, "spec": "full", "order_day": ph2_day, "loan_share": pb("loan_share_of_capex"), "experienced": True})
    plan_rec = {"name": "Recommended plan", "batches": rec_batches, "microgreens": True, "trading": True, "clock": 1, "caretaker_start": 1}
    plan_p1 = {"name": "Phase 1 towers only (largest fundable size)", "batches": [{"N": max(1, n_rule or 1), "spec": "full", "order_day": pb("order_day")}],
               "clock": "first_harvest", "caretaker_start": 2}
    plan_600 = {"name": "600 towers now (owner's plan)", "batches": [{"N": 600, "spec": "full", "order_day": pb("order_day")}],
                "clock": "first_harvest", "caretaker_start": 2}
    plans = {}
    for pk, pl in (("recommended", plan_rec), ("phase1_towers_only", plan_p1), ("t600_now", plan_600)):
        rows, info = run_plan(pl, pb, rank)
        if pk == "recommended":
            ss_final = steady_state(n2 if include_ph2 else n1, alloc2 if include_ph2 else alloc1, pb, "m12", spec="full" if include_ph2 else spec1)
        elif pk == "t600_now":
            ss_final = base_ss["t600"]
        else:
            ss_final = base_ss["max_fundable"]
        ans = plan_answers(rows, info, ss_final["ebitda_before_commitment_inr"], sum(r["capex_inr"] for r in rows))
        plans[pk] = {"name": pl["name"], "rows": rows, "info": info, "answers": ans}
        if pk == "recommended":
            plans[pk]["scenario_range"] = {}
            for sname in ("conservative", "optimistic"):
                r2, i2 = run_plan(pl, scen[sname], rank)
                plans[pk]["scenario_range"][sname] = plan_answers(r2, i2)
    ph2_batches = [{"N": n1, "spec": spec1, "order_day": pb("order_day")},
                   {"N": n2 - n1, "spec": "full", "order_day": ph2_day, "loan_share": pb("loan_share_of_capex"), "experienced": True}]
    plan_ph2 = dict(plan_rec)
    plan_ph2["batches"] = ph2_batches
    for pk, sp, tag in (("recommended_with_phase2_base", pb, "base inputs"), ("recommended_with_phase2_optimistic", po, "optimistic inputs")):
        r2, i2 = run_plan(plan_ph2, sp, rank)
        plans[pk] = {"name": "Recommended plan + Phase 2 (%d towers, AIF loan) from Sep 2027 - %s" % (n2, tag),
                     "rows": r2, "info": i2, "answers": plan_answers(r2, i2)}
    plan_real = dict(plan_rec)
    plan_real["cost_basis"] = "owner_realistic"
    plan_real["name"] = "Recommended plan at your plan's legal-minimum cost"
    r2, i2 = run_plan(plan_real, pb, rank)
    plans["recommended_legal_minimum_costs"] = {"name": plan_real["name"], "rows": r2, "info": i2, "answers": plan_answers(r2, i2)}
    plan_nomg = dict(plan_rec)
    plan_nomg["microgreens"] = False
    plan_nomg["name"] = "Recommended plan without microgreens"
    r2, i2 = run_plan(plan_nomg, pb, rank)
    plans["recommended_without_microgreens"] = {"name": plan_nomg["name"], "rows": r2, "info": i2, "answers": plan_answers(r2, i2)}
    plan_notr = dict(plan_rec)
    plan_notr["trading"] = False
    plan_notr["name"] = "Recommended plan without trading"
    r2, i2 = run_plan(plan_notr, pb, rank)
    plans["recommended_without_trading"] = {"name": plan_notr["name"], "rows": r2, "info": i2, "answers": plan_answers(r2, i2)}
    for pk_ in plans:
        check_cash_roll(plans[pk_]["rows"], pb)                                                         # self-checks 5 and 6
    # funding gap for 600 now
    gap600 = max(0.0, -plans["t600_now"]["answers"]["lowest_cash_balance_inr"])

    # ---- I. funding and phase plan
    fixed600 = opex["t600"]["total_inr"]
    need600 = {}
    for nm, pp in (("low", p_low), ("base", pb), ("high", p_high)):
        c600 = capex_summary(capex_items(600, pp, "full"), 600)["total_inr"]
        f600 = sum(opex_items(600, 600, pp, capex_summary(capex_items(600, pp, "full"), 600))[0].values())
        need = c600 + pp("reserve_months_of_fixed_costs") * f600 + commit_left
        need600[nm] = {"capex_inr": c600, "reserve_inr": pp("reserve_months_of_fixed_costs") * f600 + commit_left,
                       "capital_needed_inr": need, "gap_vs_20_lakh_inr": need - pp("starting_cash_inr")}
    loan600 = need600["base"]["gap_vs_20_lakh_inr"]
    lt600 = loan_terms(need600["base"]["capex_inr"], pb)
    reserve_loan600 = max(0.0, need600["base"]["reserve_inr"] - commit_left) + lt600["own_cash_shortfall_inr"]
    funding = {
        "capital_needed_600": need600,
        "loan_for_600_gap_inr": loan600,
        "capex_loan_600": lt600,
        "working_capital_loan_600_inr": reserve_loan600,
        "emi_600_capex_loan_inr": lt600["emi_inr"],
        "emi_600_working_capital_bank_inr": emi(reserve_loan600, pb("bank_rate"), pb("loan_tenor_months")),
        "emi_600_gap_aif_inr": lt600["emi_inr"] + emi(reserve_loan600, pb("bank_rate"), pb("loan_tenor_months")),
        "emi_600_gap_bank_inr": emi(loan600, pb("bank_rate"), pb("loan_tenor_months")),
        "interest_during_moratorium_600_aif_inr": lt600["moratorium_interest_inr"] + reserve_loan600 * pb("bank_rate") / 12.0,
        "funding_rule": "AIF finances capex only: loan = min(90% of capex, capex - own cash), up to Rs 2 crore. The 6-month reserve is a bank/KCC working-capital loan at 10.7%.",
        "max_towers_full_spec": n_rule, "max_towers_full_spec_detail": rule_detail,
        "max_towers_lean_spec": n_rule_lean, "max_towers_lean_spec_detail": lean_detail,
        "max_towers_full_spec_with_side_lines": n_plan_full, "plan_rule_check": plan_rule_check,
        "funding_gap_600_now_cash_flow_inr": gap600,
    }
    ph2_capex = plans["recommended_with_phase2_base"]["info"]["batches"][1]["capex_inr"]
    ph2_loan = ph2_capex * pb("loan_share_of_capex")
    demand_needed_600 = 600 * mix_kg_per_tower_week(alloc600, pb) * pb("max_share_at_target_price")
    phase_plan = [
        {"phase": "Phase 1a: quick cash", "start": "Oct 2026 (M1)", "towers": 0,
         "what": "Microgreens 50 trays/week (100 from Jan 2027), trading/aggregation through Floruvi, registrations, water test, BESCOM LT-5 application.",
         "capex_inr": pb("mg_capex_200_inr") + pb("trade_setup_capex_inr"), "funding": "Own cash",
         "gate_to_next": "Gate A (end Dec 2026): >= 10 paying accounts; 60-95 kg/week of greens sold at target price for 4 weeks; microgreens >= Rs 700/kg and >= 15 kg/week before the step to 100 trays; no invoice over 14 days late. Stop rules: stop microgreens below Rs 700/kg or 10 kg/week for 4 weeks; stop trading below 3% net margin or any invoice 30+ days late."},
        {"phase": "Phase 1b: tower test", "start": "Order Oct 2026 (M1); first harvest " + plans["recommended"]["info"]["batches"][0]["first_harvest"],
         "towers": n1, "what": ("Test module (%s spec): measure g per site, loss, price and hours per 1,000 sites for 2-3 cycles." % spec1),
         "capex_inr": capex["phase1"]["summary"]["total_inr"], "funding": "Own cash",
         "gate_to_next": "Gate B (end Mar 2027): >= 80 g per site; loss <= 15%; >= 70% sold at target price for 4 weeks; <= 49 h per 1,000 sites per 40 days; contribution high enough for EBITDA >= 1.3 x the Phase 2 EMI; reliable water (rain pond, borewell or Cauvery). End the test if contribution is below Rs 300 per tower per month."},
        {"phase": "Phase 2: owner-run farm", "start": ("Order Sep 2027 (M12); harvest from Oct-Nov 2027" if include_ph2 else "Order Sep 2027 (M12) only if Phase 1b passes the gates (base inputs lose money at this size)"),
         "towers": n2, "what": "NVPH on the owned 60-cent plot, owner as grower, resident caretaker, weekly orders signed before planting.",
         "capex_inr": ph2_capex, "funding": "AIF loan %.0f%% (about 6%% after subvention, 12-month moratorium) + own cash" % (100 * pb("loan_share_of_capex")),
         "loan_inr": ph2_loan, "gate_to_next": "12 months of profit; target-price demand above the Phase 3 output."},
        {"phase": "Phase 3: 300 towers", "start": "Not before Oct 2028 (estimate)", "towers": 300,
         "what": "Hire a grower and a night guard; add a borewell and a walk-in cold room.",
         "capex_inr": capex_summary(capex_items(300, pb, "full"), 300)["total_inr"] - capex["phase2"]["summary"]["total_inr"],
         "funding": "Profits + AIF loan (MIDH/NHB subsidy only with approval before building)",
         "gate_to_next": "Demand at target price above %.0f kg/week." % (300 * mix_kg_per_tower_week(alloc600, pb) * pb("max_share_at_target_price"))},
        {"phase": "600 towers", "start": "Only if the demand gate is met (not before 2029, estimate)", "towers": 600,
         "what": "Full plan.", "capex_inr": need600["base"]["capex_inr"], "funding": "Loan about Rs %.1f lakh at today's capital (AIF on capex, bank loan for the reserve)" % (loan600 / 1e5),
         "gate_to_next": "Demand at target price above %.0f kg/week; base month-12 demand is %.0f kg/week." % (demand_needed_600, Dt12)},
    ]

    # ---- J. sensitivity
    sens = {"phase1": sensitivity(n1, alloc1, pb, "m12", spec=spec1),
            "phase2": sensitivity(n2, alloc2, pb, "m12"),
            "t200_owner_costs": sensitivity(200, choose_mix(200, rank)[0], pb, "m12", flags={"cost_basis": "owner"}),
            "t600": sensitivity(n600, alloc600, pb, "m12")}

    # ---- L. side lines
    side = {"microgreens": {s: [microgreens_steady(tw, scen[s]) for tw in (50, 100, 200)] for s in SCENARIOS},
            "trading": {s: [trading_steady(m, scen[s]) for m in (1, 3, 6, 12)] for s in SCENARIOS},
            "export_pilot": {s: export_pilot(scen[s]) for s in SCENARIOS}}

    # ---- M. business-model comparison
    def roc(profit_m, capital):
        return (12.0 * profit_m / capital) if capital > 0 else None
    mg100 = {s: microgreens_steady(100, scen[s]) for s in SCENARIOS}
    tr12 = {s: trading_steady(12, scen[s]) for s in SCENARIOS}
    ex = side["export_pilot"]
    def _days(a, b):
        return (datetime.date.fromisoformat(b) - datetime.date.fromisoformat(a)).days
    b_p1 = plans["recommended"]["info"]["batches"][0]
    b_p2 = plans["recommended_with_phase2_base"]["info"]["batches"][1]
    b_600 = plans["t600_now"]["info"]["batches"][0]
    first_cash = {"phase1": _days(START.isoformat(), b_p1["first_harvest"]) + 3,
                  "phase2": _days(b_p2["order_date"], b_p2["first_harvest"]) + 3,
                  "t600": _days(START.isoformat(), b_600["first_harvest"]) + 3}
    ratio600 = base_ss["t600"]["harvest_kg_per_month"] / (Dt12 * DAYS_PER_MONTH / 7.0)
    bm = []
    for label, key, N, spec, alloc in (("Tower greens/herbs: Phase 1 (%d towers, %s)" % (n1, spec1), "phase1", n1, spec1, alloc1),
                                       ("Tower greens/herbs: Phase 2 (%d towers)" % n2, "phase2", n2, "full", alloc2),
                                       ("Tower greens/herbs: 600 towers", "t600", 600, "full", alloc600)):
        e = {s: steady_state(N, alloc, scen[s], "m12", spec=spec)["ebitda_before_commitment_inr"] for s in SCENARIOS}
        cap = capex[key]["summary"]["total_inr"]
        bm.append({"model": label, "capital_needed_inr": cap, "time_to_first_cash_days": first_cash[key],
                   "monthly_profit_base_inr": e["base"], "monthly_profit_conservative_inr": e["conservative"],
                   "monthly_profit_optimistic_inr": e["optimistic"], "annual_return_on_capital": roc(e["base"], cap),
                   "main_risk": {"phase1": "Fixed site costs (caretaker, power) are larger than the output of a test module; it is for learning, not profit.",
                                 "phase2": "Thin margin: needs >= 70% sold at target price and real yields at or above base; tanker water and minimum-wage rulings move it a lot.",
                                 "t600": ("Output is about %.1f times the month-12 target-price demand (far more in the first months); "
                                          "capital gap of about Rs %.1f crore; paid grower and guard." % (ratio600, need600["base"]["gap_vs_20_lakh_inr"] / 1e7))}[key]})
    bm.append({"model": "Microgreens racks (100 trays/week)", "capital_needed_inr": mg100["base"]["capex_inr"] + 20000,
               "time_to_first_cash_days": mg100["base"]["first_cash_days"],
               "monthly_profit_base_inr": mg100["base"]["profit_inr"], "monthly_profit_conservative_inr": mg100["conservative"]["profit_inr"],
               "monthly_profit_optimistic_inr": mg100["optimistic"]["profit_inr"],
               "annual_return_on_capital": roc(mg100["base"]["profit_inr"], mg100["base"]["capex_inr"] + 20000),
               "main_risk": "Price: below about Rs 700/kg blended it loses money; demand about 20 kg/week by month 3; perishable."})
    bm.append({"model": "Trading/aggregation through Floruvi (month-12 level)", "capital_needed_inr": tr12["base"]["working_capital_inr"] + pb("trade_setup_capex_inr"),
               "time_to_first_cash_days": tr12["base"]["first_cash_days"],
               "monthly_profit_base_inr": tr12["base"]["net_profit_inr"], "monthly_profit_conservative_inr": tr12["conservative"]["net_profit_inr"],
               "monthly_profit_optimistic_inr": tr12["optimistic"]["net_profit_inr"],
               "annual_return_on_capital": roc(tr12["base"]["net_profit_inr"], tr12["base"]["working_capital_inr"] + pb("trade_setup_capex_inr")),
               "main_risk": "Credit and spoilage: restaurants pay late; net margin only 0-15% after delivery and waste."})
    bm.append({"model": "Merchant-export pilot (basil to Dubai, 200 kg/month)", "capital_needed_inr": ex["base"]["capital_inr"],
               "time_to_first_cash_days": ex["base"]["first_cash_days"],
               "monthly_profit_base_inr": ex["base"]["monthly_profit_inr"], "monthly_profit_conservative_inr": ex["conservative"]["monthly_profit_inr"],
               "monthly_profit_optimistic_inr": ex["optimistic"]["monthly_profit_inr"],
               "annual_return_on_capital": roc(ex["base"]["monthly_profit_inr"], ex["base"]["capital_inr"]),
               "main_risk": "Landed cost is above the GCC import price in base; payment and quality-claim risk; needs steady weekly volume."})

    # ---- hand checks
    hc = {"crop": hand_check_crop("lollo_rosso", pb),
          "month": hand_check_month(plans["recommended"]["rows"][7], pb)}
    r8 = plans["recommended"]["rows"][7]
    r7 = plans["recommended"]["rows"][6]
    hc["month"]["balance_change_model_inr"] = r8["cash_balance_inr"] - r7["cash_balance_inr"]

    # ---- channel table (D)
    chan = {"shares_small_farm": steady_shares(pb),
            "shares_600_month12": {k: v / base_ss["t600"]["harvest_kg_per_month"] for k, v in base_ss["t600"]["channel_kg_per_month"].items()},
            "payment_days": {k: pb("pay_days_" + k) for k in CHANNELS},
            "prices": {r["crop_id"]: r["prices_by_channel_inr_per_kg"] for r in rank},
            "blended": {r["crop_id"]: r["blended_price_inr_per_kg"] for r in rank}}

    # ---- owner decisions (29 Sep 2026)
    owner_block = owner_costs_block(scen, rank, n1, spec1)
    checks = owner_cost_checks(pb, rank)
    scale_test = scale_plan_test(scen, rank)
    path = realistic_scale_path(scen, rank, plans["recommended"]["answers"], plans["recommended_legal_minimum_costs"]["answers"], n1, spec1)

    R = {"pb": pb, "rank": rank, "break_even": be, "scan": scan, "n1": n1, "spec1": spec1, "n2": n2, "n_rule": n_rule,
            "owner_costs": owner_block, "owner_cost_checks": checks, "scale_plan_test": scale_test, "realistic_scale_path": path,
            "alloc": {"phase1": alloc1, "phase2": alloc2, "t600": alloc600, "max_fundable": alloc_rule},
            "beyond": {"phase1": beyond1, "phase2": beyond2, "t600": beyond600},
            "capex": capex, "opex": opex, "profit": profit, "base_ss": base_ss, "plans": plans, "funding": funding,
            "phase_plan": phase_plan, "include_phase2": include_ph2, "sensitivity": sens, "side": side, "business_models": bm,
            "hand_check": hc, "channels": chan, "demand_m12": {"target": Dt12, "bulk": Db12, "distress": Dd12}}
    R["pain_points"] = build_pain_points(R)
    R["research_findings"] = research_findings()
    R["key_numbers"] = build_key_numbers(R)
    R["self_checks"] = run_self_checks(R)
    return R

# =============================================================================
# Output: markdown tables and JSON
# =============================================================================
def g(x):
    """Whole rupees with Indian digit grouping."""
    if x is None:
        return "-"
    x = int(round(x))
    neg, s = x < 0, str(abs(x))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts + [tail])
    return ("-" if neg else "") + s


def lk(x):
    return "-" if x is None else "%.2f" % (x / 1e5)


def pc(x):
    return "-" if x is None else "%.0f%%" % (100 * x)


def f1(x):
    return "-" if x is None else "%.1f" % x


def f2(x):
    return "-" if x is None else "%.2f" % x


def tbl(headers, rows, num_from=1, text_cols=()):
    al = ["---" if (i < num_from or i in text_cols) else "---:" for i in range(len(headers))]
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join(al) + " |"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


CAPEX_LABELS = {
    "tower_kits": "Tower kits, 80-96 sites (tower, 30-50 L tank, pump, net cups, timer), before GST",
    "tower_gst": "GST on tower kits (18%)",
    "tower_freight": "Freight Pune/Thane to Bengaluru",
    "tower_assembly": "Site preparation under tanks and assembly",
    "tower_spares": "Start-up spares (pumps, timers, net cups)",
    "electrical": "Electrical distribution and safety (30 mA RCCB/ELCB, earthing, main panel, capacitors)",
    "structure": "Protected structure (test: film-roof rain shelter; others: NVPH, 96 m2 minimum)",
    "fogger": "Fogger line",
    "haf_fans": "Circulation (HAF) fans",
    "site_prep": "Levelling, weed mat, drainage, path, tank plinth",
    "nursery": "Nursery (98-cell trays, benches, insect-net area, misting)",
    "tools": "pH/EC meters, calibration, mixing station, hand tools",
    "ro": "RO plant (test: small unit)",
    "tanks": "Water storage tanks (2 days raw, 1 day RO, stock tanks)",
    "backup": "Backup power (inverter + batteries up to 200 towers; 15 kVA DG above)",
    "grid_normative": "BESCOM normative line charge",
    "grid_deposit": "BESCOM security deposit (refundable)",
    "grid_meter": "3-phase smart meter",
    "transformer": "Distribution transformer + line (if the local one is full; above 20 kW; one per 100 kVA)",
    "ht_metering": "HT-type metering cubicle (a site with 50-150 kW at LT)",
    "ht_substation": "HT supply (a site at 150 kW or more): 11 kV metering, breaker, own transformer",
    "cctv": "CCTV, 4G router, UPS, siren, security lights",
    "fence": "Fence round the 60-cent plot + gate (barbed wire; chain-link above 200 towers)",
    "cold": "Cold storage and pre-cooling (chest freezer; walk-in room above 200 towers)",
    "packing": "Packing: crates, scales, label printer, tables (pack house above 200 towers)",
    "welfare": "Worker welfare: toilet, drinking water, first aid, snake-bite kit, extinguishers",
    "quarters": "Room for a resident caretaker",
    "registrations": "Registrations: FSSAI central licence, trademark, GST/Udyam help, trade licence",
    "water_tests": "Water lab tests",
    "initial_marketing": "First marketing: samples, ad test, print",
    "starting_stock": "Starting stock: seed, plug media, nutrient salts, acid, IPM kit",
    "contingency": "Contingency 10%",
}


ASSUMPTION_CONFLICTS = [
    "Lettuce head weight: the demand agent used 140 g per plant; the lettuce agent used 80-100 g for 90-site towers (tower trials 53-95 g). "
    "Base uses the lettuce agent (80 g Lollo Rosso, 90 g green oakleaf) because 90 sites per tower limit light.",
    "Kale yield: climate agent 45 g per cut, greens agent 18 g per pick (tower trial -23 to -42%). Base uses the greens agent (lower).",
    "Covered area per tower: 1.4 m2 + 18% (structure) vs 1.8 m2 + nursery and packing (towers). Base 1.9 m2 all-in (Tower Farms about 1.9; Agrotonomy 1.5-2).",
    "Structure: towers agent priced a shade-net house (Rs 710/m2); structure and climate agents require a rain-proof NVPH for the Jun-Nov monsoon. Base uses NVPH.",
    "Helper wage: agriculture minimum wage Rs 14,299 vs uniform notification Rs 20,350 (under High Court challenge). Base uses Rs 20,350 (conservative); low uses Rs 14,299.",
    "Night guard: market agency quotes Rs 30-45k skip overtime; the compliant cost is Rs 56-86k. Base uses Rs 72,330 above 150 towers; up to 150 towers a resident caretaker gives night presence.",
    "Microgreens profit: the specialist used Rs 16,000 per worker (agriculture wage + 12%); this model uses the same loaded helper cost as the farm (Rs 24,213). Standalone microgreens profit is therefore lower than the specialist's figure.",
    "Bulk-buyer price: 55-65% of the HoReCa price (demand) vs 60-75% of the shelf price (prices). Base uses 60% of the HoReCa price because bulk buyers such as Hyperpure buy bulk crates.",
    "Water: no borewell is confirmed. Base buys tanker water (Rs 125/m3 before RO losses). An existing borewell is a sensitivity case and changes the result a lot.",
    "Consumables: the consumables agent assumed pelleted Rijk Zwaan lettuce seed (about Rs 1.4 per site). Cheaper open-pollinated seed would lower costs but raise bolting and losses.",
    "Strawberries: consumables agent Rs 8.5 per site per 40 days (180-day stay) vs strawberry agent Rs 3.0 (year). Base Rs 3.9 per site per 40 days spread over the 365-day replant cycle.",
    "Price benchmarks: Floruvi list prices are research retail x 1.40 and are 1.4-8.6 times Bengaluru shelf prices. The model uses Bengaluru market prices, not Floruvi list prices.",
    "Peak head weight (numbers review): normalising season factors lifts Nov-Feb lettuce to 98-113 g, above the best published tower result (95 g, ideal indoor, 20 plants) "
    "and far above the Dapoli 36-site tower (53 g). The towers research warns full-size heads may need alternate sites (50-70% of nominal). "
    "The model keeps 80 g as the year-round value (lettuce research 80-100 g adjusted for Bengaluru; climate research 100 g year average) and shows "
    "'yield -20%' beside base; the test module must measure it.",
    "Labour (numbers review): the labour research gives task hours per crop turn; v1 divided them by 40 days (38 h). v2 uses 49 h per 1,000 sites per "
    "40 days, which matches the model's own harvest speeds.",
    "HoReCa delivery (numbers review): the logistics research's Rs 14/kg needs about 100 kg/day; v2 uses Rs 38/kg at 40 kg/day or less.",
    "Owner cost figures vs research (29 Sep 2026): kept exactly in the 'your costs' case; the legal-minimum case keeps your organisation but raises "
    "wages to the legal floor and uses real power and water bills.",
]


def render_md(R):
    pb = R["pb"]
    L = []
    A_ = L.append
    n1, spec1, n2 = R["n1"], R["spec1"], R["n2"]
    rec = R["plans"]["recommended"]
    rank = R["rank"]
    oc = R["owner_costs"]
    osz = {e["towers"]: e for e in oc["sizes"]}
    chk = R["owner_cost_checks"]
    sp = R["scale_plan_test"]
    path = R["realistic_scale_path"]
    be = R["break_even"]
    fund = R["funding"]
    t600 = R["profit"]["t600"]
    CBN = {"owner": "Your costs", "owner_realistic": "Legal-minimum cost", "research": "Research cost"}
    A_("# Floruvi tower farm - feasibility model tables (v2)")
    A_("")
    A_("Bengaluru, Karnataka. Research date 29 Sep 2026. Money is INR, whole rupees, GST included where the farm cannot claim it. "
       "Per 40 days = per month x 40 / 30.4. 'Base' is the value we would bet on for a semi-experienced grower; 'conservative' and "
       "'optimistic' move every input halfway to its research low or high. EBITDA here means cash profit before working capital "
       "(trading stock and unpaid invoices), before loan payments and before depreciation. Three cost bases: **Your costs** = your "
       "29 Sep figures exactly (items you did not mention at research values); **Legal-minimum cost** = your organisation (you grow, AI does "
       "the books) at the agriculture minimum wage and the real power and water bills; **Research cost** = research values (uniform "
       "minimum wage, agency guard and paid grower above 150 towers). Every input has a source note in model_output.json (assumptions).")
    A_("")
    # ------------------------------------------------------------------ 1
    s200, s600, s2k, s6k = osz[200], osz[600], osz[2000], osz[6000]
    a = rec["answers"]
    p1p = R["profit"]["phase1_plan"]
    mb = oc["month_by_month_200"]
    own_be = be["cases"]["Your costs (owner figures exactly)"]
    own_be_n = [v for v in own_be.values() if v]
    A_("## 1. Short answers")
    A_("")
    A_("- **Verdict: do not build 200 towers now, and do not plan 6,000 by March 2027.** Start with microgreens, trading and a %d-tower test; "
       "grow only through measured gates." % n1)
    A_("- **200 towers at your cost figures:** EBITDA Rs %s a month at month-12 demand (Rs %s per 40 days; Rs %s after the Rs 40,000 "
       "commitment). At legal-minimum cost: Rs %s. At research cost: Rs %s. Capex Rs %s lakh needs a loan of about Rs %s lakh; its EMI "
       "(Rs %s a month) is larger than the profit even at your figures." % (
           g(s200["scenarios"]["base"]["owner"]["ebitda_inr_per_month"]), g(s200["scenarios"]["base"]["owner"]["ebitda_inr_per_40_days"]),
           g(s200["scenarios"]["base"]["owner"]["ebitda_after_commitment_inr_per_month"]),
           g(s200["scenarios"]["base"]["owner_realistic"]["ebitda_inr_per_month"]), g(s200["scenarios"]["base"]["research"]["ebitda_inr_per_month"]),
           lk(s200["capex_inr"]), lk(s200["loan"]["loan_inr"]), g(s200["loan"]["emi_inr"])))
    A_("- **600 / 2,000 / 6,000 towers at your figures:** Rs %s / Rs %s / Rs %s a month; at research cost Rs %s / Rs %s / Rs %s. "
       "Share sold at the target price: %s / %s / %s." % (
           g(s600["scenarios"]["base"]["owner"]["ebitda_inr_per_month"]), g(s2k["scenarios"]["base"]["owner"]["ebitda_inr_per_month"]),
           g(s6k["scenarios"]["base"]["owner"]["ebitda_inr_per_month"]), g(s600["scenarios"]["base"]["research"]["ebitda_inr_per_month"]),
           g(s2k["scenarios"]["base"]["research"]["ebitda_inr_per_month"]), g(s6k["scenarios"]["base"]["research"]["ebitda_inr_per_month"]),
           pc(s600["physical"]["share_sold_at_target_price"]), pc(s2k["physical"]["share_sold_at_target_price"]), pc(s6k["physical"]["share_sold_at_target_price"])))
    fb = sp["first_constraint_that_breaks"]
    A_("- **200 -> 6,000 towers by March 2027: not possible.** First constraint to break: %s at '%s'. %s" % (fb[1], fb[0], sp["verdict"]))
    A_("- **Cash profit by December 2026: no.** 200 towers ordered on 11 Oct give the first harvest on %s; Dec 2026 EBITDA at your costs "
       "Rs %s. Recommended plan: Oct-Dec EBITDA Rs %s (Dec Rs %s; Rs %s after the commitment); first month with profit %s; after the "
       "commitment %s; lowest cash Rs %s (%s)." % (
           mb["owner__towers_only"]["info"]["batches"][0]["first_harvest"], g(mb["owner__towers_only"]["answers"]["M3_ebitda_before_commitment_inr"]),
           g(a["oct_dec_2026_ebitda_before_commitment_inr"]), g(a["M3_ebitda_before_commitment_inr"]), g(a["M3_ebitda_after_commitment_inr"]),
           a["first_month_positive_before_commitment"], a["first_month_positive_after_commitment"], g(a["lowest_cash_balance_inr"]), a["lowest_cash_month"]))
    A_("- **Break-even (month-12 demand):** at your figures about %s towers; at legal-minimum or research cost no size up to 1,500 breaks "
       "even; optimistic inputs: %s towers (owner-run)." % (
           own_be_n[0] if own_be_n else "no size", be["cases"]["Optimistic"][[k for k in be["cases"]["Optimistic"] if k.startswith("owner_run")][0]] or "none"))
    A_("- **Your figures are realistic only at small sizes:** " + "; ".join(
        "%s up to %s towers" % (c["figure"].lower(), c["realistic_up_to_towers"]) for c in chk) + ".")
    A_("- **Best tower crops (base contribution per tower per month):** " + "; ".join(
        "%s Rs %s (cap about %d towers)" % (r["crop"], g(r["contribution_inr_per_tower_per_month"]), int(r["market_cap_towers"])) for r in rank[:5])
       + ". Mint, palak, coriander and strawberries earn about nothing or lose money.")
    A_("- **Quick cash comes from side lines.** Phase 1 plan (%d-tower test + microgreens 100 trays/week + trading at month-12 level): "
       "base Rs %s a month (Rs %s per 40 days); conservative Rs %s; optimistic Rs %s. Without microgreens the plan's lowest cash is Rs %s." % (
           n1, g(p1p["base"]["ebitda_before_commitment_inr"]), g(p1p["base"]["per_40_days"]["ebitda_before_commitment_inr"]),
           g(p1p["conservative"]["ebitda_before_commitment_inr"]), g(p1p["optimistic"]["ebitda_before_commitment_inr"]),
           g(R["plans"]["recommended_without_microgreens"]["answers"]["lowest_cash_balance_inr"])))
    A_("")
    # ------------------------------------------------------------------ 2
    A_("## 2. Your cost figures checked against research and law")
    A_("")
    rows = []
    for c in chk:
        rv = c.get("research_inr_per_month_200_towers", c.get("research_inr_per_month"))
        rows.append([c["figure"], g(c["owner_inr_per_month"]), g(rv), g(c.get("legal_floor_inr_per_month")),
                     c["realistic_up_to_towers"], c["check"], c["realistic_option"]])
    A_(tbl(["Figure", "Yours (Rs/month)", "Research at 200 towers (Rs/month)", "Legal floor (Rs/month)", "Realistic up to (towers)",
            "Check", "Realistic option"], rows, text_cols=(5, 6)))
    A_("")
    A_("Items you did not mention stay at research values in the 'your costs' case: " + "; ".join(oc["unmentioned_items_at_research_values"]) + ".")
    A_("")
    # ------------------------------------------------------------------ 3
    A_("## 3. Profit per month and per 40 days: your costs vs legal-minimum vs research (base)")
    A_("")
    A_(oc["demand_basis"])
    A_("")
    rows = []
    for e in oc["sizes"]:
        sb = e["scenarios"]["base"]
        for cb in ("owner", "owner_realistic", "research"):
            v = sb[cb]
            rows.append([e["label"], CBN[cb], g(e["capex_inr"]), g(v["revenue_inr"]), g(v["running_costs_inr"]), g(v["ebitda_inr_per_month"]),
                         g(v["ebitda_after_commitment_inr_per_month"]), g(v["ebitda_inr_per_40_days"]), g(v["ebitda_after_commitment_inr_per_40_days"]),
                         g(e["loan"]["emi_inr"]), g(e["ebitda_minus_commitment_minus_emi_inr_per_month"][cb]), pc(v["share_sold_at_target_price"])])
    A_(tbl(["Size", "Cost basis", "Capex", "Revenue / month", "Running costs / month", "EBITDA / month", "After commitment / month",
            "EBITDA / 40 days", "After commitment / 40 days", "Loan EMI (after moratorium)", "EBITDA - commitment - EMI", "Sold at target price"],
           rows, num_from=2))
    A_("")
    A_("Conservative and optimistic inputs (EBITDA per month before the commitment):")
    A_("")
    rows = []
    for e in oc["sizes"]:
        rows.append([e["label"]] + [g(e["scenarios"][s][cb]["ebitda_inr_per_month"]) for cb in ("owner", "owner_realistic", "research") for s in ("conservative", "optimistic")])
    A_(tbl(["Size", "Your costs cons.", "Your costs opt.", "Legal-min cons.", "Legal-min opt.", "Research cons.", "Research opt."], rows))
    A_("")
    A_("Physical size (research basis):")
    A_("")
    rows = []
    for e in oc["sizes"]:
        ph = e["physical"]
        rows.append([e["label"], g(ph["covered_area_m2"]), ph["sites"], f1(ph["connected_kw"]), f1(ph["largest_site_kw"]), f1(ph["fte_required"]),
                     ph["headcount_research"], f1(ph["tanker_loads_per_day_average"]), f1(ph["tanker_loads_per_day_april"]), g(ph["harvest_kg_per_week"]),
                     g((ph["demand_target_kg_per_week_m12"] or 0) + (ph["demand_bulk_kg_per_week_m12"] or 0)), "%.2f" % ph["price_factor_large_volume"]])
    A_(tbl(["Size", "Covered m2", "Sites", "Connected kW", "Largest site kW", "FTE needed", "Headcount", "Tanker loads/day", "Loads/day in April",
            "Harvest kg/week", "Target + bulk demand kg/week (month 12)", "Price factor (large volume)"], rows))
    A_("")
    A_("Profit at earlier demand (EBITDA per month, base):")
    A_("")
    rows = [[r["towers"], r["sales_month"], g(r["demand_target_kg_per_week"]), g(r["owner_ebitda_inr_per_month"]),
             g(r["owner_realistic_ebitda_inr_per_month"]), g(r["research_ebitda_inr_per_month"])] for r in oc["by_demand_month"]]
    A_(tbl(["Towers", "Sales month", "Target-price demand kg/week", "Your costs", "Legal-minimum cost", "Research cost"], rows, num_from=0))
    A_("")
    A_("Running-cost lines at 200 towers (Rs per month, base):")
    A_("")
    rl = {cb: s200["scenarios"]["base"][cb]["running_cost_lines_inr"] for cb in ("owner", "owner_realistic", "research")}
    rows = [[OPEX_LABELS[k], g(rl["owner"][k]), g(rl["owner_realistic"][k]), g(rl["research"][k])] for k in OPEX_LABELS]
    rows.append(["**Total**"] + ["**%s**" % g(sum(rl[cb].values())) for cb in ("owner", "owner_realistic", "research")])
    A_(tbl(["Line", "Your costs", "Legal-minimum cost", "Research cost"], rows))
    A_("")
    # ------------------------------------------------------------------ 4
    A_("## 4. 200 towers ordered now, month by month")
    A_("")
    rows = []
    for key, r in mb.items():
        an = r["answers"]
        b0 = r["info"]["batches"][0]
        rows.append([r["name"], b0["first_harvest"], g(an["M3_ebitda_before_commitment_inr"]), g(an["oct_dec_2026_ebitda_before_commitment_inr"]),
                     an["first_month_positive_before_commitment"] or "not in 18 months", an["first_month_positive_after_commitment"] or "not in 18 months",
                     an["first_month_positive_after_commitment_and_loan"] or "not in 18 months", g(an["loan_drawn_inr"]),
                     g(an["loan_emi_after_moratorium_inr"]), g(an["lowest_cash_balance_inr"]), g(an["cash_balance_M18_inr"])])
    A_(tbl(["Run", "First harvest", "Dec 2026 EBITDA", "Oct-Dec 2026 EBITDA", "First month with profit", "After commitment",
            "After commitment and loan", "Loan drawn", "EMI after moratorium", "Lowest cash", "Cash at M18"], rows, text_cols=(1, 4, 5, 6)))
    A_("")
    A_("Month by month, 200 towers, your costs, towers only (demand clock starts at the first harvest):")
    A_("")
    rows = []
    for r in mb["owner__towers_only"]["rows"]:
        rows.append([r["month"], r["calendar_month"], r["towers_built"], g(r["harvest_kg"]), g(r["sold_target_price_kg"]), g(r["tower_revenue_inr"]),
                     g(r["tower_variable_costs_inr"] + r["farm_running_costs_inr"]), g(r["ebitda_before_commitment_inr"]), g(r["commitment_inr"]),
                     g(r["loan_interest_inr"] + r["loan_principal_inr"]), g(r["ebitda_after_commitment_and_loan_inr"]), g(r["capex_inr"]),
                     g(r["loan_draw_inr"]), g(r["cash_balance_inr"])])
    A_(tbl(["Month", "Calendar", "Towers", "Harvest kg", "Sold at target kg", "Revenue", "Costs", "EBITDA", "Commitment", "Loan payment",
            "After commitment and loan", "Capex", "Loan drawn", "Cash"], rows, num_from=2))
    A_("")
    # ------------------------------------------------------------------ 5
    A_("## 5. Can 200 -> 6,000 towers in 6 months work?")
    A_("")
    A_("March 2027 is sales month %d if selling starts now (side lines): target demand %.0f kg/week + bulk %.0f kg/week. Month 12: %.0f + %.0f kg/week." % (
        sp["march_2027_sales_month"], sp["demand_mar2027_kg_per_week"]["target"], sp["demand_mar2027_kg_per_week"]["bulk"],
        sp["demand_m12_kg_per_week"]["target"], sp["demand_m12_kg_per_week"]["bulk"]))
    A_("")
    rows = []
    for s in sp["steps"]:
        rows.append([s["step"], g(s["capex_inr"]), g(s["loan"]["loan_inr"]), g(s["loan"]["bank_loan_inr"]), g(s["loan"]["emi_inr"]),
                     g(s["ebitda_m12_inr_per_month"]["owner"]), g(s["ebitda_m12_inr_per_month"]["owner_realistic"]), g(s["ebitda_m12_inr_per_month"]["research"]),
                     g(s["harvest_kg_per_week"]), pc(s["share_sold_at_target_price_mar2027"]), g(s["covered_area_m2"]), f1(s["largest_site_kw"]),
                     f1(s["tanker_loads_per_day_april"]), s["headcount"], "%.0f" % s["build_days_one_supplier"], ", ".join(s["failed_checks"]) or "none"])
    A_(tbl(["Step", "Capex", "Loan", "Of which above the AIF cap", "EMI", "EBITDA your costs", "EBITDA legal-min", "EBITDA research",
            "Harvest kg/week", "Sold at target (Mar 2027)", "Covered m2", "Largest site kW", "Tanker loads/day (Apr)", "Headcount",
            "Build days (1 supplier)", "Checks that fail"], rows, text_cols=(15,)))
    A_("")
    A_("Tests used at each step (numbers shown for step 1):")
    A_("")
    for k, v in sp["steps"][0]["checks"].items():
        A_("- %s: %s" % (k, v["test"]))
    A_("")
    A_("**First constraint that breaks:** %s at '%s' (%s)." % (fb[1], fb[0], fb[2]))
    A_("")
    rows = []
    for cb, r in sp["month_by_month"].items():
        an = r["answers"]
        b2 = r["info"]["batches"][1]
        rows.append([CBN[cb], b2["structure_ready"], b2["first_harvest"], g(an["total_capex_18m_inr"]), g(an["loan_drawn_inr"]),
                     an["first_month_cash_below_zero"] or "never", g(an["lowest_cash_balance_inr"]), g(an["cash_balance_M18_inr"])])
    A_("Month by month (200 now + 5,800 ordered 15 Dec 2026; loans drawn automatically; one supplier at 500 sets a month):")
    A_("")
    A_(tbl(["Cost basis", "5,800 towers ready", "Their first harvest", "Capex in 18 months", "Loans drawn", "Cash first below zero",
            "Lowest cash", "Cash at M18"], rows, text_cols=(1, 2, 5)))
    A_("")
    # ------------------------------------------------------------------ 6
    A_("## 6. Fastest realistic path (gated)")
    A_("")
    A_(path["demand_rule"] + " Gate-pass case = " + path["gate_pass_case_definition"])
    A_("")
    ph0 = path["phases"][0]
    A_("- **%s** (%s): %s Gate: %s Research cost: Oct-Dec 2026 EBITDA Rs %s, first profit %s, lowest cash Rs %s. Legal-minimum cost: Oct-Dec "
       "Rs %s, first profit %s, lowest cash Rs %s." % (
           ph0["phase"], ph0["ready"], ph0["what"], ph0["gate"], g(ph0["research_costs"]["oct_dec_2026_ebitda_before_commitment_inr"]),
           ph0["research_costs"]["first_month_positive_before_commitment"], g(ph0["research_costs"]["lowest_cash_balance_inr"]),
           g(ph0["legal_minimum_costs"]["oct_dec_2026_ebitda_before_commitment_inr"]), ph0["legal_minimum_costs"]["first_month_positive_before_commitment"],
           g(ph0["legal_minimum_costs"]["lowest_cash_balance_inr"])))
    A_("")
    rows = []
    for ph in path["phases"][1:]:
        if "economics" not in ph:
            continue
        ec = ph["economics"]
        rows.append([ph["phase"], ph["ready"], ph["towers"], ph["towers_demand_allows"], g(ph["capex_added_inr"]), g(ph["loans_total_inr"]), g(ph["emi_total_inr"]),
                     g(ec["legal_minimum_costs"]["ebitda_inr_per_month"]), g(ec["research_costs"]["ebitda_inr_per_month"]), g(ec["gate_pass_case"]["ebitda_inr_per_month"]),
                     "-" if ec["gate_pass_case"]["dscr"] is None else "%.2f" % ec["gate_pass_case"]["dscr"],
                     g(ec["gate_pass_case"]["after_emi_and_owner_drawing_inr_per_month"]), g(ph["contribution_base_per_tower_per_month"]),
                     g(ph["contribution_needed_per_tower_per_month_for_dscr_1_3"])])
    A_(tbl(["Phase", "Ready", "Towers", "Towers demand allows", "Capex added", "Loans total", "EMI total", "EBITDA legal-min", "EBITDA research",
            "EBITDA gate-pass case", "Debt cover (gate-pass)", "Gate-pass after EMI and Rs 30,000 drawing", "Contribution per tower (base)",
            "Contribution needed for cover 1.3"], rows, num_from=2))
    A_("")
    for ph in path["phases"][1:]:
        A_("- **%s** - %s Gate: %s" % (ph["phase"], ph["what"], ph["gate"]))
    A_("")
    # ------------------------------------------------------------------ 7
    A_("## 7. Crop ranking: which crop earns the most per tower")
    A_("")
    A_("Per 90-site tower, steady state, base, small farm selling inside the market (85%% at target price: 66%% HoReCa, 34%% D2C; 11%% bulk; 4%% waste). "
       "Revenue = net sales (after unsold and rejected produce) + the Rs 99 D2C fee. Contribution = revenue - seeds/media/nutrients - packaging - "
       "delivery (HoReCa Rs %s/kg at low volume; D2C Rs %s per drop) - commissions and bad debt. 'After crop labour' subtracts harvest and pack hours. "
       "Market cap = towers of this crop alone that Bengaluru buyers take from a new seller at month 12." % (
           g(ranking_rates(pb)["horeca"]), g(ranking_rates(pb)["d2c_drop"])))
    A_("")
    rows = []
    for r in rank:
        rows.append([r["rank"], r["crop"], r["tower_fit"], f2(r["harvests_per_40d"]), f2(r["sellable_kg_per_tower_per_40d"]), g(r["blended_price_inr_per_kg"]),
                     g(r["revenue_inr_per_tower_per_40d"] + r["d2c_delivery_fee_income_inr_per_tower_per_40d"]), g(r["variable_cost_inr_per_tower_per_40d"]),
                     g(r["contribution_inr_per_tower_per_40d"]), g(r["contribution_inr_per_tower_per_month"]),
                     "%s to %s" % (g(r["contribution_inr_per_tower_per_month_conservative"]), g(r["contribution_inr_per_tower_per_month_optimistic"])),
                     g(r["contribution_after_crop_labour_inr_per_tower_per_month"]), f1(r["market_cap_towers"])])
    A_(tbl(["Rank", "Crop", "Tower fit", "Harvests per 40 d", "Sellable kg per tower per 40 d", "Blended price Rs/kg", "Revenue incl. D2C fee per tower per 40 d",
            "Variable cost per tower per 40 d", "Contribution per tower per 40 d", "Contribution per tower per month", "Month range (cons. to opt.)",
            "After crop labour per month", "Market cap (towers)"], rows, num_from=3))
    A_("")
    A_("Spinach is Nov-Feb only; strawberry values are year averages (pick Dec-Apr, replant yearly).")
    A_("")
    rows = [[r["crop"], g(r["all_600_towers_kg_per_month"]), g(r["market_cap_kg_per_month"]),
             "-" if r["all_600_output_vs_market_cap"] is None else "%.1fx" % r["all_600_output_vs_market_cap"],
             g(r["all_600_contribution_if_all_sold_inr_per_month"])] for r in rank]
    A_("If all 600 towers grew one crop:")
    A_("")
    A_(tbl(["Crop", "Output kg/month (600 towers, in season)", "Market cap kg/month", "Output / cap", "Contribution if every kg sold (Rs/month)"], rows))
    A_("")
    # ------------------------------------------------------------------ 8
    ch = R["channels"]
    A_("## 8. Sales channels and prices")
    A_("")
    rows = [[CHANNEL_NAMES[k], pc(ch["shares_small_farm"][k]), pc(ch["shares_600_month12"][k]), "-" if k == "waste" else "%.0f" % ch["payment_days"][k]]
            for k in list(CHANNELS) + ["waste"]]
    A_(tbl(["Channel", "Share of harvest, small farm", "Share of harvest, 600 towers (month-12 demand)", "Days to cash (base)"], rows))
    A_("")
    rows = [[r["crop"]] + [g(r["prices_by_channel_inr_per_kg"][k]) for k in ("horeca", "d2c", "bulk", "distress")] + [g(r["blended_price_inr_per_kg"])] for r in rank]
    A_(tbl(["Crop (Rs per kg, base)", "HoReCa", "D2C", "Bulk buyer", "Trader", "Blended (sold kg)"], rows))
    A_("")
    # ------------------------------------------------------------------ 9
    A_("## 9. Recommended crop mix")
    A_("")
    al = R["alloc"]
    crops_in = [c for c in CROPS if any(c in al[k] for k in ("phase1", "phase2", "t600"))]
    rows = [[CROPS[c]["name"], al["phase1"].get(c, 0), al["phase2"].get(c, 0), al["t600"].get(c, 0)] for c in crops_in]
    rows.append(["Total", sum(al["phase1"].values()), sum(al["phase2"].values()), sum(al["t600"].values())])
    A_(tbl(["Crop", "Phase 1 (%d towers)" % n1, "Phase 2 (%d towers)" % n2, "600 towers"], rows))
    A_("")
    A_("Rule: " + MIX_SOURCE + " Season calendar (climate research): Nov-Feb all lettuces, kale, pak choi, arugula, English spinach and a strawberry trial; "
       "Mar-May move lettuce sites to Batavia and basil (lettuce -40%, pak choi -30-50%); Jun-Oct mildew-resistant lettuce, kale, mint, chard with night fans (basil -30%).")
    A_("")
    # ------------------------------------------------------------------ 10
    A_("## 10. Capex, one time")
    A_("")
    order = ["phase1", "max_fundable", "phase2", "t600"]
    cx = R["capex"]
    names = {}
    for k in order:
        for i in cx[k]["items"]:
            names.setdefault(i["key"], CAPEX_LABELS.get(i["key"], i["item"]))
    rows = []
    for key, nm in names.items():
        vals = []
        for k in order:
            v = sum(i["inr"] for i in cx[k]["items"] if i["key"] == key)
            vals.append(g(v) if v else "-")
        rows.append([nm] + vals)
    rows.append(["**Total (base)**"] + ["**%s**" % g(cx[k]["summary"]["total_inr"]) for k in order])
    rows.append(["Total at research low"] + [g(cx[k]["total_low_inr"]) for k in order])
    rows.append(["Total at research high"] + [g(cx[k]["total_high_inr"]) for k in order])
    rows.append(["Refundable deposit inside the total"] + [g(cx[k]["summary"]["refundable_inr"]) for k in order])
    A_(tbl(["Item (INR, GST incl.)", "Phase 1: %d towers (%s)" % (cx["phase1"]["towers"], cx["phase1"]["spec"]),
            "Largest fundable: %d towers" % cx["max_fundable"]["towers"], "Phase 2: %d towers" % cx["phase2"]["towers"], "600 towers"], rows))
    A_("")
    A_("Your tower quote: Rs 5,000-12,000 buys only the kit. Installed cost per tower before the structure (kit + 18%% GST + freight + assembly + spares + "
       "electrical + 10%% contingency) is about Rs %s. Not in the totals: borewell Rs %s; EV three-wheeler Rs %s; GS1 barcodes Rs %s. No subsidy is counted. "
       "Step costs above 600 towers (sites, generators, cold rooms, HT supply) are in sections 3 and 5." % (
           g(cx["t600"]["installed_cost_per_tower_excl_structure_inr"]), g(pb("borewell_capex_inr")), g(pb("vehicle_ev3w_inr")), g(pb("gs1_barcodes_inr"))))
    A_("")
    # ------------------------------------------------------------------ 11
    A_("## 11. Monthly running costs at steady state (research cost)")
    A_("")
    ox = R["opex"]
    rows = [[nm] + [g(ox[k]["items_inr"][key]) for k in order] for key, nm in OPEX_LABELS.items()]
    rows.append(["**Running costs total (base)**"] + ["**%s**" % g(ox[k]["total_inr"]) for k in order])
    rows.append(["Running costs at research low"] + [g(ox[k]["total_low_inr"]) for k in order])
    rows.append(["Running costs at research high"] + [g(ox[k]["total_high_inr"]) for k in order])
    rows.append(["Existing commitment (Oct 2026-Aug 2027 only)"] + [g(ox[k]["commitment_inr"]) for k in order])
    rows.append(["Depreciation (non-cash)"] + [g(ox[k]["depreciation_inr"]) for k in order])
    rows.append(["Staff: helper FTE / headcount"] + ["%.2f / %d" % (ox[k]["details"]["helper_fte"], ox[k]["details"]["headcount"]) for k in order])
    rows.append(["Electricity kWh per month"] + [g(ox[k]["details"]["kwh"]) for k in order])
    rows.append(["Raw water m3 per month (tanker, annual average)"] + [f1(ox[k]["details"]["raw_water_m3"]) for k in order])
    A_(tbl(["Item (INR per month)", "Phase 1: %d" % ox["phase1"]["towers"], "Largest fundable: %d" % ox["max_fundable"]["towers"],
            "Phase 2: %d" % ox["phase2"]["towers"], "600 towers"], rows))
    A_("")
    # ------------------------------------------------------------------ 12
    A_("## 12. Profit per month and per 40 days (research cost)")
    A_("")
    rows = []
    labels = [("phase1", "Phase 1: %d towers (%s)" % (n1, spec1)), ("phase1_plan", "Phase 1 plan: towers + microgreens + trading"),
              ("max_fundable", "Largest fundable: %d towers" % R["n_rule"]), ("phase2", "Phase 2: %d towers" % n2), ("t600", "600 towers")]
    for key, lab in labels:
        for s in SCENARIOS:
            v = R["profit"][key][s]
            rows.append([lab, s, g(v["revenue_inr"]), g(v["ebitda_before_commitment_inr"]), g(v["ebitda_after_commitment_inr"]),
                         g(v["profit_after_depreciation_before_commitment_inr"]), g(v["per_40_days"]["ebitda_before_commitment_inr"]),
                         g(v["per_40_days"]["ebitda_after_commitment_inr"]), pc(v.get("share_sold_at_target_price"))])
    A_(tbl(["Size", "Scenario", "Revenue / month", "EBITDA / month", "After commitment / month", "After depreciation / month", "EBITDA / 40 days",
            "After commitment / 40 days", "Sold at target price"], rows, num_from=2))
    A_("")
    # ------------------------------------------------------------------ 13
    A_("## 13. Cash flow, months 1-18: recommended plan (research cost)")
    A_("")
    bt = rec["info"]["batches"][0]
    A_("%d-tower %s module ordered %s, structure ready %s, power live %s, first transplant %s, first harvest %s. Microgreens from week 2 "
       "(50 trays/week; 100 from Jan 2027 only after Gate A). Trading from week 3. Cash starts at Rs 20,00,000." % (
           n1, spec1, bt["order_date"], bt["structure_ready"], bt["grid_live"], bt["first_transplant"], bt["first_harvest"]))
    A_("")
    rows = []
    for r in rec["rows"]:
        rows.append([r["month"], r["calendar_month"], g(r["harvest_kg"]), g(r["tower_revenue_inr"]), g(r["microgreens_revenue_inr"]),
                     g(r["trading_net_profit_inr"]), g(r["tower_variable_costs_inr"] + r["microgreens_direct_costs_inr"]), g(r["farm_running_costs_inr"]),
                     g(r["ebitda_before_commitment_inr"]), g(r["commitment_inr"]), g(r["ebitda_after_commitment_inr"]), g(r["operating_cash_flow_inr"]),
                     g(r["capex_inr"]), g(r["cash_balance_inr"])])
    A_(tbl(["Month", "Calendar", "Tower harvest kg", "Tower revenue", "Microgreens revenue", "Trading net profit", "Variable and direct costs",
            "Farm running costs", "EBITDA", "Commitment", "EBITDA after commitment", "Operating cash flow", "Capex", "Cash balance"], rows, num_from=2))
    A_("")
    # ------------------------------------------------------------------ 14
    A_("## 14. All plans compared (base unless stated)")
    A_("")
    rows = []
    for pk in ("recommended", "recommended_legal_minimum_costs", "recommended_without_microgreens", "recommended_without_trading",
               "recommended_with_phase2_base", "recommended_with_phase2_optimistic", "phase1_towers_only", "t600_now"):
        pl = R["plans"][pk]
        an = pl["answers"]
        rows.append([pl["name"], g(an["total_capex_18m_inr"]), g(an["oct_dec_2026_ebitda_before_commitment_inr"]),
                     an["first_month_positive_before_commitment"] or "not in 18 months", an["first_month_positive_after_commitment"] or "not in 18 months",
                     an["first_month_cash_below_zero"] or "never", g(an["lowest_cash_balance_inr"]), g(an["cash_balance_M18_inr"]),
                     g(an["total_ebitda_18m_inr"]), g(an["total_operating_cash_flow_18m_inr"])])
    for sname in ("conservative", "optimistic"):
        an = rec["scenario_range"][sname]
        rows.append(["Recommended plan - %s inputs" % sname, g(an["total_capex_18m_inr"]), g(an["oct_dec_2026_ebitda_before_commitment_inr"]),
                     an["first_month_positive_before_commitment"] or "not in 18 months", an["first_month_positive_after_commitment"] or "not in 18 months",
                     an["first_month_cash_below_zero"] or "never", g(an["lowest_cash_balance_inr"]), g(an["cash_balance_M18_inr"]),
                     g(an["total_ebitda_18m_inr"]), g(an["total_operating_cash_flow_18m_inr"])])
    A_(tbl(["Plan", "Capex in 18 months", "Oct-Dec 2026 EBITDA", "First month with profit", "After commitment", "Cash first below zero",
            "Lowest cash", "Cash at M18", "EBITDA over 18 months", "Operating cash flow over 18 months"], rows, text_cols=(3, 4, 5)))
    A_("")
    # ------------------------------------------------------------------ 15
    A_("## 15. Funding and phase plan")
    A_("")
    rows = [[nm, g(fund["capital_needed_600"][nm]["capex_inr"]), g(fund["capital_needed_600"][nm]["reserve_inr"]),
             g(fund["capital_needed_600"][nm]["capital_needed_inr"]), g(fund["capital_needed_600"][nm]["gap_vs_20_lakh_inr"])] for nm in ("low", "base", "high")]
    A_(tbl(["600 towers", "Capex", "Reserve (6 months costs + commitment)", "Capital needed", "Gap vs Rs 20 lakh"], rows))
    A_("")
    A_("%s 600 towers: capex loan Rs %s (AIF Rs %s, bank Rs %s), EMI Rs %s; working-capital loan Rs %s at 10.7%%, EMI Rs %s. The 600-tower farm "
       "loses money in base, so it cannot service these loans." % (
           fund["funding_rule"], g(fund["capex_loan_600"]["loan_inr"]), g(fund["capex_loan_600"]["aif_loan_inr"]), g(fund["capex_loan_600"]["bank_loan_inr"]),
           g(fund["emi_600_capex_loan_inr"]), g(fund["working_capital_loan_600_inr"]), g(fund["emi_600_working_capital_bank_inr"])))
    A_("")
    A_("Largest tower count Rs 20 lakh funds with 6 months of fixed costs and the remaining commitment kept aside: %s towers (full NVPH site); "
       "%s with a lean site; %s with microgreens and trading capital as well." % (fund["max_towers_full_spec"], fund["max_towers_lean_spec"],
                                                                               fund["max_towers_full_spec_with_side_lines"]))
    A_("")
    rows = [[ph["phase"], ph["start"], ph["towers"], g(ph["capex_inr"]), ph["funding"], ph["what"], ph["gate_to_next"]] for ph in R["phase_plan"]]
    A_(tbl(["Phase", "When", "Towers", "Capex (INR)", "Funding", "What", "Gate to the next phase"], rows, num_from=2, text_cols=(4, 5, 6)))
    A_("")
    # ------------------------------------------------------------------ 16
    A_("## 16. Sensitivity: EBITDA per month before the commitment (base)")
    A_("")
    sens = R["sensitivity"]
    cases = []
    for k in ("t600", "phase2", "phase1", "t200_owner_costs"):
        for x in sens[k] or []:
            if x["case"] not in cases:
                cases.append(x["case"])
    rows = []
    for c in cases:
        row = [c]
        for k in ("phase1", "phase2", "t200_owner_costs", "t600"):
            m = [x for x in (sens[k] or []) if x["case"] == c]
            row.append(g(m[0]["ebitda_before_commitment_inr"]) if m else "-")
        rows.append(row)
    A_(tbl(["Case", "Phase 1 (%d towers, research)" % n1, "Phase 2 (%d towers, research)" % n2, "200 towers, your costs", "600 towers, research"], rows))
    A_("")
    A_("In the 'your costs' column, power, water, helpers, caretaker and guard are your fixed figures, so cases that change those lines do not move it. "
       "Sell-through = share of harvest sold at the target price (HoReCa + D2C); the rest goes to bulk buyers and traders up to their limits, then waste.")
    A_("")
    # ------------------------------------------------------------------ 17
    A_("## 17. Break-even and size scan")
    A_("")
    own_key = [k for k in be["cases"]["Optimistic"] if k.startswith("owner_run")][0]
    hired_key = [k for k in be["cases"]["Optimistic"] if k.startswith("paid_grower")][0]
    rows = [[case, v[own_key] or "none", v[hired_key] or "none up to 1,500"] for case, v in be["cases"].items()]
    A_(tbl(["Case (demand-limited, month-12 demand)", "Break-even towers, 1-150", "Break-even towers, 151-1,500 (5-tower steps)"], rows))
    A_("")
    rows = [[case, v[own_key] or "none", v[hired_key] or "none up to 1,500"] for case, v in be["cases_every_kg_sold"].items()]
    A_("Only if every kg sold (not realistic above about 560 towers):")
    A_("")
    A_(tbl(["Case (every kg sold)", "Break-even towers, 1-150", "Break-even towers, 151-1,500"], rows))
    A_("")
    A_("Each extra tower adds about Rs %s a month while the caretaker does the work (up to about %.0f towers) and about Rs %s when helpers are paid. "
       "Month-12 target-price demand %.0f kg/week absorbs about %.0f towers (about %.0f with bulk buyers)." % (
           g(be["profit_per_extra_tower_caretaker_does_the_work_inr_per_month"]), be["caretaker_covers_towers"],
           g(be["profit_per_extra_tower_paid_helpers_inr_per_month"]), be["month12_target_price_demand_kg_per_week"],
           be["towers_month12_target_demand_can_absorb"], be["towers_month12_target_plus_bulk_can_absorb"]))
    A_("")
    rows = [[s["towers"], g(s["capex_inr"]), g(s["harvest_kg_per_month"]), g(s["ebitda_if_all_sold_inr"]), g(s["ebitda_demand_limited_inr"]),
             pc(s["share_sold_at_target_price"]), g(s["profit_after_depreciation_inr"])] for s in R["scan"]]
    A_(tbl(["Towers", "Capex", "Harvest kg/month", "EBITDA if all sold", "EBITDA at month-12 demand", "Sold at target price", "Profit after depreciation"], rows, num_from=0))
    A_("")
    # ------------------------------------------------------------------ 18
    A_("## 18. Quick-cash side lines")
    A_("")
    rows = []
    for s in SCENARIOS:
        for m in R["side"]["microgreens"][s]:
            rows.append([s, m["trays_per_week"], f1(m["kg_sold_per_week"]), f1(m["demand_month3_kg_per_week"]), g(m["revenue_inr"]), g(m["variable_inr"]),
                         g(m["labour_inr"]), g(m["fixed_inr"]), g(m["profit_inr"]), g(m["profit_per_40d_inr"]), g(m["capex_inr"]), "%.0f" % m["first_cash_days"]])
    A_(tbl(["Scenario", "Trays/week", "kg sold/week", "Demand by month 3 kg/week", "Revenue/month", "Variable", "Labour (own worker)", "Fixed",
            "Profit/month", "Profit/40 days", "Capex", "Days to first cash"], rows, num_from=1))
    A_("")
    rows = []
    for s in SCENARIOS:
        for t in R["side"]["trading"][s]:
            rows.append([s, t["sales_month"], f1(t["accounts"]), g(t["sales_inr"]), g(t["gross_profit_inr"]), g(t["net_profit_inr"]),
                         g(t["working_capital_inr"]), "%.0f" % t["first_cash_days"]])
    A_(tbl(["Scenario", "Sales month", "Accounts", "Sales/month", "Gross margin/month", "Net profit/month (after bad debt)", "Working capital", "Days to first cash"], rows, num_from=1))
    A_("")
    # ------------------------------------------------------------------ 19
    A_("## 19. Business-model comparison")
    A_("")
    rows = [[b["model"], g(b["capital_needed_inr"]), "%.0f" % b["time_to_first_cash_days"], g(b["monthly_profit_base_inr"]),
             "%s to %s" % (g(b["monthly_profit_conservative_inr"]), g(b["monthly_profit_optimistic_inr"])),
             "-" if b["annual_return_on_capital"] is None else pc(b["annual_return_on_capital"]), b["main_risk"]] for b in R["business_models"]]
    A_(tbl(["Model", "Capital needed", "Days to first cash", "Monthly profit (base)", "Range (cons. to opt.)", "Annual return on capital", "Main risk"], rows, text_cols=(6,)))
    A_("")
    # ------------------------------------------------------------------ 20
    A_("## 20. Every pain point (merged from the 16 research topics and both reviews; most serious first)")
    A_("")
    sev_order = {"critical": 0, "major": 1, "minor": 2}
    pps = sorted(R["pain_points"], key=lambda x: sev_order[x["severity"]])
    rows = [[p_["severity"], p_["category"], p_["pain"], p_["evidence"], p_["fix"]] for p_ in pps]
    A_(tbl(["Severity", "Category", "Pain", "Evidence", "Fix"], rows, text_cols=(1, 2, 3, 4)))
    A_("")
    # ------------------------------------------------------------------ 21
    A_("## 21. Research results by topic (key numbers; low / base / high)")
    A_("")
    for t in R["research_findings"]:
        A_("### %s" % t["key"])
        A_("")
        A_(t["topic"])
        A_("")
        rows = [[x["name"], x["low"], x["base"], x["high"], x["unit"], (x["source"] or "")[:160]] for x in t["key_numbers"]]
        if rows:
            A_(tbl(["Item", "Low", "Base", "High", "Unit", "Source"], rows, text_cols=(4, 5)))
            A_("")
        A_("Sources (first of %d): %s" % (t["sources_total"], "; ".join(s[:120] for s in t["sources"][:4])))
        A_("")
    # ------------------------------------------------------------------ 22
    A_("## 22. Review decisions")
    A_("")
    rows = [[d["id"], d["reviewer"], d["severity"], d["issue"], d["decision"], d["reason"]] for d in REVIEW_DECISIONS]
    A_(tbl(["ID", "Reviewer", "Severity", "Issue", "Decision", "Reason"], rows, text_cols=(1, 2, 3, 4, 5)))
    A_("")
    A_("Not modelled or rejected:")
    A_("")
    for x in REJECTED_OR_NOT_MODELLED:
        A_("- " + x)
    A_("")
    # ------------------------------------------------------------------ 23
    A_("## 23. Self-checks and hand checks")
    A_("")
    for c in R["self_checks"]:
        A_("- %s: %s" % (c["check"], "passed" if c["passed"] else "FAILED"))
    hc = R["hand_check"]
    c = hc["crop"]
    st = c["steps"]
    A_("- Crop check (%s, base): %.2f harvests per 40 days x 80 g x 0.9 x 90 sites x 0.9 occupancy = %.2f kg per tower per 40 days. Gross Rs %.1f/kg + "
       "D2C fee Rs %.1f/kg - unsold Rs %.1f/kg - packaging Rs %.1f/kg - delivery Rs %.1f/kg - commissions Rs %.1f/kg, times kg, minus consumables "
       "Rs %.0f = Rs %.0f per tower per 40 days. Model: Rs %.0f (difference Rs %.2f)." % (
           c["crop"], st["harvests_per_40d"], c["kg_per_tower_per_40d_hand"], st["gross_price_per_kg"], st["fee_per_kg"], st["unsold_per_kg"],
           st["pack_per_kg"], st["delivery_per_kg"], st["commission_bad_debt_per_kg"], st["consumables_per_tower"],
           c["contribution_per_tower_per_40d_hand_inr"], c["contribution_per_tower_per_40d_model_inr"], c["difference_inr"]))
    m = hc["month"]
    A_("- Month check (%s, recommended plan): operating cash flow - capex - commitment - loan payments + loan draws = Rs %s; model balance change Rs %s. "
       "EBITDA rebuilt from its parts Rs %s; model Rs %s." % (m["month"], g(m["balance_change_rebuilt_inr"]), g(m["balance_change_model_inr"]),
                                                            g(m["ebitda_rebuilt_inr"]), g(m["ebitda_model_inr"])))
    A_("")
    # ------------------------------------------------------------------ 24
    A_("## 24. Where the research disagreed, and the choice made")
    A_("")
    for x in ASSUMPTION_CONFLICTS:
        A_("- " + x)
    A_("")
    return "\n".join(L)


def _clean(o):
    """Drop internal keys (leading underscore) before writing JSON."""
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items() if not str(k).startswith("_")}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    return o


def to_json(R):
    out = {
        "meta": {"model": "Floruvi tower-farm feasibility model v2", "research_date": RESEARCH_DATE, "currency": "INR",
                 "months": [m["label"] + " = " + m["name"] for m in calendar()],
                 "per_40_days_rule": "per month x 40 / 30.4", "scenario_rule": ASSUMPTIONS["scenario_extremity"]["source"],
                 "ebitda_definition": "Cash profit before working capital (trading stock, unpaid invoices), loan payments and depreciation.",
                 "cost_bases": COST_BASIS_NAMES, "phase1_towers": R["n1"], "phase1_spec": R["spec1"], "phase2_towers": R["n2"],
                 "max_fundable_towers": R["n_rule"], "phase2_in_base_plan": R["include_phase2"],
                 "v1_files": ["farm_model_v1.py", "model_output_v1.json", "model_tables_v1.md"]},
        "key_numbers": R["key_numbers"],
        "crop_table": R["rank"],
        "recommended_mix": {"towers_by_phase": R["alloc"], "towers_beyond_market_cap": R["beyond"],
                            "rule": {"group_targets": MIX_GROUP_TARGETS, "max_share_in_group": MIX_MAX_SHARE_IN_GROUP, "source": MIX_SOURCE},
                            "season_calendar": "Nov-Feb all lettuces, kale, pak choi, arugula, English spinach, strawberry trial; Mar-May Batavia and basil; Jun-Oct mildew-resistant lettuce, kale, mint, chard with night fans."},
        "channels": R["channels"],
        "capex": R["capex"], "monthly_costs": R["opex"], "profit_scenarios": R["profit"],
        "cashflow_months": R["plans"], "funding": R["funding"], "phase_plan": R["phase_plan"],
        "sensitivity": R["sensitivity"], "breakeven": R["break_even"], "size_scan": R["scan"],
        "side_lines": R["side"], "business_models": R["business_models"],
        "owner_costs": R["owner_costs"], "owner_cost_checks": R["owner_cost_checks"],
        "scale_plan_test": R["scale_plan_test"], "realistic_scale_path": R["realistic_scale_path"],
        "pain_points": R["pain_points"], "research_findings": R["research_findings"],
        "review_decisions": REVIEW_DECISIONS, "not_modelled_or_rejected": REJECTED_OR_NOT_MODELLED,
        "self_checks": R["self_checks"], "hand_check": R["hand_check"],
        "demand_month12_kg_per_week": R["demand_m12"], "assumption_conflicts": ASSUMPTION_CONFLICTS,
    }
    out = rnd(_clean(out))
    out["assumptions"] = ASSUMPTIONS
    out["owner_decisions"] = {"monthly_costs_inr": OWNER_COSTS, "note": OWNER_COSTS_NOTE, "unmentioned_items": OWNER_UNMENTIONED_ITEMS}
    out["crops_input"] = CROPS
    out["season_factors_normalised"] = {k: [round(x, 3) for x in v] for k, v in SEASON.items()}
    out["season_source"] = SEASON_SOURCE
    out["asset_lives_years"] = DEP_LIFE
    out["tariffs"] = TARIFFS
    out["harvest_kg_per_hour"] = {"values": HARVEST_KG_PER_HOUR, "source": HARVEST_KG_PER_HOUR_SOURCE}
    out["delivery_ranking_reference"] = RANKING_REF
    return out


def main():
    R = build_results()
    md = render_md(R)
    js = to_json(R)
    with open(OUT_MD, "w", encoding="utf-8") as fh:
        fh.write(md + "\n")
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        json.dump(js, fh, ensure_ascii=False, indent=1)
    print("Wrote", OUT_JSON)
    print("Wrote", OUT_MD)
    print("Phase 1: %d towers (%s); max fundable %s; Phase 2 %d towers" % (R["n1"], R["spec1"], R["n_rule"], R["n2"]))
    print("600-tower capex base Rs %s; EBITDA base Rs %s/month" % (g(R["capex"]["t600"]["summary"]["total_inr"]),
                                                                g(R["profit"]["t600"]["base"]["ebitda_before_commitment_inr"])))
    for c in R["self_checks"]:
        print("self-check:", c["check"], "->", "passed" if c["passed"] else "FAILED")


if __name__ == "__main__":
    main()
