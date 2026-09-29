# Farm feasibility plan

Research date: 29 September 2026. Scope: a hydroponic farm near Bengaluru. The study covers the owner's tower plan (200 towers, then 600, then 6,000), the owner's cost figures, owner-made towers from moulds, shared pumps, and raft beds (DWC).

A 20-agent workflow built the study: 16 research agents, 1 modeling agent, 2 independent reviewers, and 1 final agent that fixed and rebuilt the model. Two more research agents covered tower moulding and pump clusters with other growing systems.

Read [Floruvi-farm-brief-v2.pdf](Floruvi-farm-brief-v2.pdf) first.

## Files

| File | Content |
| --- | --- |
| `Floruvi-farm-brief-v2.pdf` | Current brief (checked model). 11 pages plus a list of all 724 sources. |
| `archive/Floruvi-farm-brief-v1.1.pdf` | Superseded. Early numbers with owner-made towers and raft beds, before the model check. |
| `archive/Floruvi-tower-farm-brief-v1.pdf` | Superseded. First early brief. |
| `model/farm_model.py` | The checked model (Python 3, standard library). It reads `research.json` and writes `model_output.json` and `model_tables.md`. |
| `model/model_output.json`, `model/model_tables.md` | Model results as data and as tables. |
| `model/brief.md` | The final agent's text brief. |
| `model/owner_build_final.json` | Owner-made towers and raft beds on the checked model (from `scripts/owner_build_final.py`). |
| `model/research.json` | The research copy that the model reads. |
| `research/research_16_topics.json` | Exact outputs of the 16 research agents. |
| `research/moulding_research.json` | Tower moulding costs. |
| `research/systems_research.json` | Pump clusters and other growing systems. |
| `scripts/owner_build_final.py` | Runs owner-made towers and raft beds on the checked model. |
| `scripts/build_pdf_v2.py` | Builds the version 2 PDF. |

## Main results (base case)

- Towers lose money at legal wages and real water and power bills, at every size.
- 200 towers now, then 6,000 by March 2027, is not possible. Capital breaks at the first step.
- Owner-made towers cost the same as bought kits at 200 towers, because of the moulds. They save money above about 600 towers.
- Aerated raft beds were the best option found. The raft-bed numbers are estimates until a pilot measures them.
- No plan makes a cash profit by December 2026. The recommended start is microgreens, trading greens, and a small tower and raft-bed pilot.

## Rebuild

1. Run the model:

   ```bash
   cd docs/farm-plan/model && python3 farm_model.py
   ```

2. Run the owner build options:

   ```bash
   cd docs/farm-plan && python3 scripts/owner_build_final.py
   ```

3. Install the PDF libraries in a virtual environment:

   ```bash
   python3 -m venv /tmp/farm-plan-venv && /tmp/farm-plan-venv/bin/pip install -r docs/farm-plan/scripts/requirements.txt
   ```

4. Build the PDF:

   ```bash
   cd docs/farm-plan && /tmp/farm-plan-venv/bin/python scripts/build_pdf_v2.py
   ```

The PDF uses Georgia from macOS (`/System/Library/Fonts/Supplemental`) and DejaVu Sans from matplotlib.

## Update with pilot data

1. Change the values in the `ASSUMPTIONS` dictionary in `model/farm_model.py` to the measured values: grams per plant, losses, labour hours, prices, and share sold at the target price.
2. Run the four rebuild steps again.

## Limits

- Estimates: raft-bed yield, labour and power-cut tolerance (one research agent, not measured), the demand ramp, and prices (a one-day snapshot on 29 September 2026).
- The model is not reliable above about 600 to 1,000 towers.
- Check prices, tariffs, wages and rules again before you spend money.
