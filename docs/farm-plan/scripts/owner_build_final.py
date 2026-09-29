"""Owner build options on the CHECKED final model (../model/farm_model.py), using its own cost bases
('owner', 'owner_realistic', 'research') and its loan_terms(). Adds a lean legal variant: owner_realistic with no
separate night guard (the resident caretaker covers nights, as the final brief proposes up to 150 towers).

Options per 90-site unit:
  kit10k     research base kit (model default)
  bought17k  the owner's current towers, Rs 17,000 delivered with own pump
  own3k      owner-made body Rs 3,000 (+18% GST) + 10-tower cluster share Rs 2,970 (GST incl.), 10.5 W pump share,
             plus ring-only moulds, design and tests Rs 12.4 lakh one-time (moulding research)
  dwc        aerated raft beds: Rs 52.5 per site equipment, 5.6 m2 covered per 90 sites, heads x1.5,
             3.2 kWh aeration per 90 sites a month, 25% less labour (systems research; estimates)
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "model"))
import farm_model as m  # noqa: E402

GST = 1.18
TOOLING = {"base": 1244000, "conservative": 2470000, "optimistic": 592000}


def options(p):
    return {
        "kit10k": p,
        "bought17k": p.but(kit_price_ex_gst_inr=17000 / GST, gst_on_kits=0.18, freight_inr_per_tower=0.0),
        "own3k": p.but(kit_price_ex_gst_inr=3000 + 2970 / GST, gst_on_kits=0.18, freight_inr_per_tower=100.0,
                       spares_inr_per_tower=60.0, pump_w_per_tower=10.5, pump_duty=0.67),
        "dwc": p.but(kit_price_ex_gst_inr=90 * 52.5 / GST, gst_on_kits=0.18, freight_inr_per_tower=50.0,
                     spares_inr_per_tower=40.0, electrical_inr_per_tower=300.0, inverter_inr_per_tower=300.0,
                     pump_w_per_tower=4.4, pump_duty=1.0, fan_kwh_per_tower_month=5.3, area_m2_per_tower=5.6,
                     tower_parts_inr_per_tower_month=30.0, yield_multiplier=1.5 * p("yield_multiplier"),
                     labour_h_per_1000_sites_40d=0.75 * p("labour_h_per_1000_sites_40d")),
    }


VIEWS = {  # label -> flags
    "owner": {"cost_basis": "owner"},
    "legal": {"cost_basis": "owner_realistic"},
    "legal_lean": {"cost_basis": "owner_realistic", "guard": False},
    "research": {"cost_basis": "research"},
}


def run(N, opt, scen="base"):
    p0 = m.P(scen)
    p = options(p0)[opt]
    rank = m.crop_ranking(p)
    alloc, beyond = m.choose_mix(N, rank)
    out = {"towers": N, "option": opt, "scenario": scen, "views": {}}
    cs = None
    for v, flags in VIEWS.items():
        fl = dict(flags)
        if v == "legal_lean" and N > 200:
            fl.pop("guard")  # a separate night post is needed above about 200 units
        ss = m.steady_state(N, alloc, p, "m12", flags=fl)
        out["views"][v] = {"ebitda": ss["ebitda_before_commitment_inr"], "opex": ss["opex_inr"],
                           "opex_items": ss["opex_items_inr"]}
        if cs is None:
            cs = ss["capex_summary"]
            out["harvest_kg_week"] = ss["harvest_kg_per_week"]
            out["sold_at_target"] = ss["share_sold_at_target_price"]
            out["area_m2"] = cs["area_m2"]
            out["kwh"] = ss["opex_details"]["kwh"]
            out["fte_required"] = ss["opex_details"]["fte_required"]
    capex = cs["total_inr"] + (TOOLING[scen] if opt == "own3k" else 0.0)
    lt = m.loan_terms(capex, p0)
    out["capex"] = capex
    out["loan"] = lt.get("loan_inr", lt.get("total_loan_inr"))
    out["emi"] = lt["emi_inr"]
    out["loan_terms"] = lt
    return out


def main():
    res = []
    for opt in ("kit10k", "bought17k", "own3k", "dwc"):
        for N in (50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600):
            for scen in ("base", "conservative", "optimistic"):
                if scen != "base" and N not in (100, 200, 600):
                    continue
                res.append(run(N, opt, scen))
    json.dump(res, open(os.path.join(os.path.dirname(HERE), "model", "owner_build_final.json"), "w"), indent=1, default=float)
    print(f"{'option':9s} {'N':>4s} {'capex':>10s} {'kg/wk':>6s} {'sold':>5s} {'owner':>9s} {'legal':>9s} {'lean':>9s} {'research':>10s} {'loan':>10s} {'EMI':>7s}")
    for r in res:
        if r["scenario"] != "base":
            continue
        v = r["views"]
        print(f"{r['option']:9s} {r['towers']:>4d} {r['capex']:>10,.0f} {r['harvest_kg_week']:>6,.0f} {r['sold_at_target']:>5.0%} "
              f"{v['owner']['ebitda']:>9,.0f} {v['legal']['ebitda']:>9,.0f} {v['legal_lean']['ebitda']:>9,.0f} {v['research']['ebitda']:>10,.0f} "
              f"{(r['loan'] or 0):>10,.0f} {r['emi']:>7,.0f}")


if __name__ == "__main__":
    main()
