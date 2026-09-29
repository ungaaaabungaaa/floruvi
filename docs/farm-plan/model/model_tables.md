# Floruvi tower farm - feasibility model tables (v2)

Bengaluru, Karnataka. Research date 29 Sep 2026. Money is INR, whole rupees, GST included where the farm cannot claim it. Per 40 days = per month x 40 / 30.4. 'Base' is the value we would bet on for a semi-experienced grower; 'conservative' and 'optimistic' move every input halfway to its research low or high. EBITDA here means cash profit before working capital (trading stock and unpaid invoices), before loan payments and before depreciation. Three cost bases: **Your costs** = your 29 Sep figures exactly (items you did not mention at research values); **Legal-minimum cost** = your organisation (you grow, AI does the books) at the agriculture minimum wage and the real power and water bills; **Research cost** = research values (uniform minimum wage, agency guard and paid grower above 150 towers). Every input has a source note in model_output.json (assumptions).

## 1. Short answers

- **Verdict: do not build 200 towers now, and do not plan 6,000 by March 2027.** Start with microgreens, trading and a 10-tower test; grow only through measured gates.
- **200 towers at your cost figures:** EBITDA Rs 30,107 a month at month-12 demand (Rs 39,615 per 40 days; Rs -9,893 after the Rs 40,000 commitment). At legal-minimum cost: Rs -76,439. At research cost: Rs -1,82,943. Capex Rs 50.92 lakh needs a loan of about Rs 38.32 lakh; its EMI (Rs 63,506 a month) is larger than the profit even at your figures.
- **600 / 2,000 / 6,000 towers at your figures:** Rs 1,02,331 / Rs -7,21,184 / Rs -28,63,538 a month; at research cost Rs -4,68,168 / Rs -25,58,491 / Rs -79,94,184. Share sold at the target price: 62% / 16% / 5%.
- **200 -> 6,000 towers by March 2027: not possible.** First constraint to break: capital at 'Step 1: 200 towers ordered now (Oct 2026)'. Not possible. Capital breaks at the first step: 200 towers cost about Rs 50.92 lakh against about Rs 15.60 lakh of free cash (Rs 12.60 lakh after a Rs 3 lakh reserve), and even at your own cost figures the farm cannot carry the loan it would need. Then the market breaks (a new seller can place the output of about 278 towers by March 2027), then the Rs 2 crore AIF cap, land (owned land holds about 1,596 towers), hiring and build time (6,000 tower sets are about 12 months of one supplier). To finish by March, the 6,000 towers must be ordered before the first 200-tower harvest, so 'profit first' cannot be tested.
- **Cash profit by December 2026: no.** 200 towers ordered on 11 Oct give the first harvest on 2027-01-02; Dec 2026 EBITDA at your costs Rs -1,19,477. Recommended plan: Oct-Dec EBITDA Rs -1,04,503 (Dec Rs -23,771; Rs -63,771 after the commitment); first month with profit M5 (Feb 2027); after the commitment M12 (Sep 2027); lowest cash Rs 2,03,414 (M12).
- **Break-even (month-12 demand):** at your figures about 151 towers; at legal-minimum or research cost no size up to 1,500 breaks even; optimistic inputs: 34 towers (owner-run).
- **Your figures are realistic only at small sizes:** night security guard up to 0 towers; resident caretaker up to 0 towers; helpers and packers up to 138 towers; water (tanker, no borewell) up to 51 towers; repairs up to 0 towers; power up to 79 towers; trained grower (owner grows) up to 150 towers; accounting (ai agent) up to 385 towers; insurance up to 0 towers; marketing (ai agent) up to 0 towers.
- **Best tower crops (base contribution per tower per month):** Arugula (rocket) Rs 1,182 (cap about 27 towers); Lollo Rosso lettuce Rs 768 (cap about 82 towers); Mini romaine (Little Gem type) Rs 643 (cap about 72 towers); Green oakleaf lettuce Rs 593 (cap about 85 towers); Butterhead lettuce Rs 570 (cap about 56 towers). Mint, palak, coriander and strawberries earn about nothing or lose money.
- **Quick cash comes from side lines.** Phase 1 plan (10-tower test + microgreens 100 trays/week + trading at month-12 level): base Rs 13,801 a month (Rs 18,159 per 40 days); conservative Rs -79,247; optimistic Rs 1,44,806. Without microgreens the plan's lowest cash is Rs -15,152.

## 2. Your cost figures checked against research and law

| Figure | Yours (Rs/month) | Research at 200 towers (Rs/month) | Legal floor (Rs/month) | Realistic up to (towers) | Check | Realistic option |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Night security guard | 10,000 | 72,330 | 32,998 | 0 | Below the legal minimum at any size. A 12-hour post for 30 nights costs at least Rs 32,998 (agriculture schedule, direct hire, wage only; Rs 40,461 on the security schedule; Rs 51,420 at the uniform semi-skilled rate). A compliant agency post costs Rs 56,294-85,709. Rs 10,000 buys about 4.8 hours a night. | Up to 150 towers: no separate guard; the resident caretaker, CCTV, a siren and motion lights give night presence (labour research). Above 150 towers: a legal guard (Rs 33,000+ direct hire). |
| Resident caretaker | 15,000 | 26,612 | 18,699 | 0 | Below the legal minimum for 7-day resident work at any size: Rs 18,699 (agriculture rate) or Rs 26,612 (uniform Zone 3 rate). Rs 15,000 is legal only for a 6-day, 8-hour job at the agriculture rate (Rs 14,299). | Put your Rs 25,000 guard + caretaker budget into one legal caretaker (loaded about Rs 20,784 at the agriculture rate) up to 150 towers. |
| Helpers and packers | 40,000 | 66,275 | - | 138 | Rs 40,000 buys 1.65 helpers at the uniform wage with on-costs (Rs 24,213 each) or 2.47 at the agriculture minimum wage (Rs 16,164). With the caretaker's 0.8 FTE that runs about 138 towers (185 at the agriculture wage; about 132 in the first cycles, when hours are 40% higher). Need: 3.5 FTE at 200 towers, 10.6 at 600, 106 at 6,000 (49 h per 1,000 sites per 40 days). | Keep Rs 40,000 up to about 138 towers; record hours by task in the test. |
| Water (tanker, no borewell) | 10,000 | 41,229 | - | 51 | Rs 10,000 buys 80 m3 of tanker water (6.7 loads of 12 m3) at Rs 125/m3. RO rejects about half, and Mar-May use and Feb-May prices are about 1.5x. The tanker part of the bill stays within Rs 10,000 up to about 51 towers (102 if the water test shows no RO is needed; about 30 in April). 200 towers need about 259 m3 of raw water a month; 6,000 need about 21 tanker loads a day. | Test the water first; build roof-rain harvesting with a covered pond; ask BWSSB about Sanchari Cauvery tankers; apply to KGWA for a sited borewell before going past about 60 towers. |
| Repairs | 0 | 15,594 | - | 0 | Rs 0 works only for about the first 6 months (start-up spares; 6-month pump warranty). Then parts wear out: pumps (about 2-year life, Rs 400-900), timers (about 2 years), net cups (about 2 years), film (about every 3 years, Rs 130/m2). About Rs 78 per tower per month: Rs 15,594 at 200 towers. | Budget Rs 75 per tower per month from month 7 and a sinking fund for film, nets and batteries. |
| Power | 10,000 | 23,368 | - | 79 | At LT-5 (Rs 4.40/kWh + FPPCA + 9% tax + P&G surcharge, about Rs 5.42/kWh) Rs 10,000 buys about 1846 kWh before the fixed charge (Rs 200/kW/month). The bill stays within Rs 10,000 up to about 79 towers with 30 W kit pumps (151 with block pumps at 10 W per tower; 55 if pumps run 24 h in hot months). 200 towers use about 3925 kWh; 6,000 towers need HT supply (above 150 kW) at Rs 6.60/kWh + Rs 350/kVA. | Apply for LT-5 'Green House' on a 24x7 feeder; switch to one pump per block of 25-50 towers after the test. |
| Trained grower (owner grows) | 0 | - | - | 150 | Realistic up to about 150 towers (labour research); a stretch at 200 with written procedures; not realistic at 600 (paid grower Rs 24,407-45,000). 6,000 towers are 540,000 sites and need a manager and about 11 supervisors. You are also the only salesperson. | Stay the grower up to 150 towers; add a part-time sales/delivery person once accounts pass about 10; hire a paid mentor for 3-6 months (estimate Rs 10,000-30,000 a month). |
| Accounting (AI agent) | 0 | 2,582 | - | 385 | Self-filed books by an AI agent are fine while the farm is small. Not zero: the FSSAI central licence is Rs 7,500 a year (Rs 625 a month) for online sales. A CA is needed for loans (certificates Rs 3,000-15,000 each; project report up to Rs 35,400) and payroll filings from 10 employees (about 385 towers). | Keep AI bookkeeping; pay the FSSAI fee; budget a CA when you borrow. |
| Insurance | 0 | 1,899 | - | 0 | Legal to skip, but any farm above what own cash pays for (about 40-50 towers) needs a loan, and AIF/bank lenders, NHB and MIDH require insured assets. At 200 towers about Rs 49.50 lakh of structure and equipment would be uninsured against storm, fire and theft; cover costs about Rs 1,899 a month. No crop insurance exists for hydroponic greens. | Insure structures and equipment (fire, storm/flood, burglary) from the first loan; buy group accident cover for staff outside ESI. |
| Marketing (AI agent) | 0 | 9,000 | - | 0 | Digital content by an AI agent costs nothing, but samples, tastings and trips to buyers are cash: about Rs 5,000 + Rs 20 per tower a month (Rs 9,000 at 200 towers). The demand ramp assumes about one new account a week won in person. | Budget samples and travel; let the AI agent do content and bookkeeping. |

Items you did not mention stay at research values in the 'your costs' case: RO membranes, cartridges and antiscalant (inside 'water'); FSSAI central licence fee (inside 'accounting'); IPM and sanitation; Internet/SIM for CCTV and CCTV upkeep; Backup power running and generator rental; Crate losses at buyers; Water tests and meter calibration; Supervisors above 600 towers.

## 3. Profit per month and per 40 days: your costs vs legal-minimum vs research (base)

Steady state = annual average with season factors at sales-month-12 demand, reached about Sep 2027 if sales start now (side lines) or Dec 2027 if they start at the first tower harvest. Owner figures above 600 towers are scaled per 600-tower unit (assumption).

| Size | Cost basis | Capex | Revenue / month | Running costs / month | EBITDA / month | After commitment / month | EBITDA / 40 days | After commitment / 40 days | Loan EMI (after moratorium) | EBITDA - commitment - EMI | Sold at target price |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 1 test module (10 towers, test) | Your costs | 7,28,202 | 13,466 | 92,352 | -89,055 | -1,29,055 | -1,17,178 | -1,69,809 | 0 | -1,29,055 | 85% |
| Phase 1 test module (10 towers, test) | Legal-minimum cost | 7,28,202 | 13,466 | 38,823 | -35,526 | -75,526 | -46,745 | -99,377 | 0 | -75,526 | 85% |
| Phase 1 test module (10 towers, test) | Research cost | 7,28,202 | 13,466 | 51,524 | -48,227 | -88,227 | -63,456 | -1,16,088 | 0 | -88,227 | 85% |
| 200 towers | Your costs | 50,91,910 | 2,68,790 | 97,199 | 30,107 | -9,893 | 39,615 | -13,017 | 63,506 | -73,399 | 85% |
| 200 towers | Legal-minimum cost | 50,91,910 | 2,68,790 | 2,03,746 | -76,439 | -1,16,439 | -1,00,578 | -1,53,210 | 63,506 | -1,79,945 | 85% |
| 200 towers | Research cost | 50,91,910 | 2,68,790 | 3,10,249 | -1,82,943 | -2,22,943 | -2,40,714 | -2,93,346 | 63,506 | -2,86,448 | 85% |
| 600 towers | Your costs | 1,48,89,612 | 5,61,218 | 1,11,098 | 1,02,331 | 62,331 | 1,34,646 | 82,014 | 2,22,087 | -1,59,757 | 62% |
| 600 towers | Legal-minimum cost | 1,48,89,612 | 5,61,218 | 5,51,993 | -3,38,564 | -3,78,564 | -4,45,478 | -4,98,110 | 2,22,087 | -6,00,651 | 62% |
| 600 towers | Research cost | 1,48,89,612 | 5,61,218 | 6,81,597 | -4,68,168 | -5,08,168 | -6,16,011 | -6,68,642 | 2,22,087 | -7,30,256 | 62% |
| 2,000 towers | Your costs | 4,69,45,322 | 4,98,732 | 4,87,327 | -7,21,184 | -7,61,184 | -9,48,926 | -10,01,558 | 7,51,570 | -15,12,754 | 16% |
| 2,000 towers | Legal-minimum cost | 4,69,45,322 | 4,98,732 | 19,08,473 | -21,42,329 | -21,82,329 | -28,18,854 | -28,71,486 | 7,51,570 | -29,33,899 | 16% |
| 2,000 towers | Research cost | 4,69,45,322 | 4,98,732 | 23,24,635 | -25,58,491 | -25,98,491 | -33,66,436 | -34,19,067 | 7,51,570 | -33,50,061 | 16% |
| 6,000 towers | Your costs | 13,49,36,462 | 5,04,796 | 15,29,922 | -28,63,538 | -29,03,538 | -37,67,813 | -38,20,445 | 22,46,777 | -51,50,315 | 5% |
| 6,000 towers | Legal-minimum cost | 13,49,36,462 | 5,04,796 | 56,34,075 | -69,67,691 | -70,07,691 | -91,68,015 | -92,20,647 | 22,46,777 | -92,54,468 | 5% |
| 6,000 towers | Research cost | 13,49,36,462 | 5,04,796 | 66,60,568 | -79,94,184 | -80,34,184 | -1,05,18,663 | -1,05,71,295 | 22,46,777 | -1,02,80,961 | 5% |

Conservative and optimistic inputs (EBITDA per month before the commitment):

| Size | Your costs cons. | Your costs opt. | Legal-min cons. | Legal-min opt. | Research cons. | Research opt. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 1 test module (10 towers, test) | -98,199 | -78,332 | -51,778 | -21,114 | -67,224 | -27,424 |
| 200 towers | -78,587 | 1,72,555 | -2,85,995 | 1,14,076 | -4,21,110 | 48,707 |
| 600 towers | -1,49,854 | 4,17,243 | -8,97,761 | 1,23,522 | -10,69,068 | 66,909 |
| 2,000 towers | -11,10,874 | -2,11,050 | -35,46,240 | -11,49,910 | -41,00,016 | -13,28,030 |
| 6,000 towers | -36,66,616 | -18,70,533 | -1,08,54,945 | -44,83,514 | -1,22,52,092 | -49,01,798 |

Physical size (research basis):

| Size | Covered m2 | Sites | Connected kW | Largest site kW | FTE needed | Headcount | Tanker loads/day | Loads/day in April | Harvest kg/week | Target + bulk demand kg/week (month 12) | Price factor (large volume) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 1 test module (10 towers, test) | 19 | 1 | 4.3 | 4.3 | 0.2 | 1 | 0.0 | 0.0 | 11 | 600 | 1.00 |
| 200 towers | 380 | 1 | 12.9 | 12.9 | 3.5 | 6 | 0.7 | 0.9 | 223 | 600 | 1.00 |
| 600 towers | 1,140 | 1 | 31.0 | 31.0 | 10.6 | 13 | 2.1 | 2.8 | 641 | 600 | 0.93 |
| 2,000 towers | 3,800 | 3 | 94.4 | 47.2 | 35.4 | 43 | 7.1 | 9.4 | 2,447 | 600 | 0.70 |
| 6,000 towers | 11,400 | 3 | 275.6 | 203.3 | 106.1 | 122 | 21.3 | 28.4 | 7,715 | 600 | 0.70 |

Profit at earlier demand (EBITDA per month, base):

| Towers | Sales month | Target-price demand kg/week | Your costs | Legal-minimum cost | Research cost |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 200 | 3 | 95 | -45,127 | -1,51,673 | -2,58,177 |
| 200 | 6 | 210 | 27,157 | -79,389 | -1,85,892 |
| 200 | 12 | 400 | 30,107 | -76,439 | -1,82,943 |
| 600 | 3 | 95 | -1,56,914 | -5,97,809 | -7,27,413 |
| 600 | 6 | 210 | -45,004 | -4,85,899 | -6,15,503 |
| 600 | 12 | 400 | 1,02,331 | -3,38,564 | -4,68,168 |

Running-cost lines at 200 towers (Rs per month, base):

| Line | Your costs | Legal-minimum cost | Research cost |
| --- | ---: | ---: | ---: |
| Production helpers and packers (sized from hours per 1,000 sites) | 40,000 | 44,244 | 66,275 |
| Resident caretaker, 7 days (also night presence); one per site | 15,000 | 20,784 | 31,309 |
| Trained grower (above 150 towers) and supervisors (above 600 towers) | 0 | 0 | 37,416 |
| Night security guard, 12-h post with relief nights (above 150 towers; one per site) | 10,000 | 35,798 | 72,330 |
| Electricity (pumps, fans, RO, site loads; energy + fixed charge + tax; HT-2(a) at 150 kW+) | 10,000 | 23,368 | 23,368 |
| Backup power running (outages; generator rental on shutdown days) | 3,250 | 3,250 | 3,250 |
| Water (tanker purchase incl. Feb-May peak, or borewell upkeep) + RO consumables | 12,327 | 41,229 | 41,229 |
| Repairs: pumps, net cups, tubing, timers | 0 | 15,000 | 15,000 |
| Repairs: structure (1.5% a year) | 0 | 594 | 594 |
| IPM and sanitation (traps, biopesticides, H2O2, hypochlorite) | 1,710 | 1,710 | 1,710 |
| Internet/SIM for CCTV and CCTV upkeep | 1,000 | 1,000 | 1,000 |
| Insurance (fire, storm/flood, burglary; structure cover) | 0 | 1,899 | 1,899 |
| Accounting, CA and FSSAI renewal | 625 | 2,582 | 2,582 |
| Marketing, samples and sales travel | 0 | 9,000 | 9,000 |
| Crates lost at buyers (5-10% of stock a month) | 1,688 | 1,688 | 1,688 |
| Water and produce tests, meter calibration | 1,600 | 1,600 | 1,600 |
| **Total** | **97,199** | **2,03,746** | **3,10,249** |

## 4. 200 towers ordered now, month by month

| Run | First harvest | Dec 2026 EBITDA | Oct-Dec 2026 EBITDA | First month with profit | After commitment | After commitment and loan | Loan drawn | EMI after moratorium | Lowest cash | Cash at M18 |
| --- | --- | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
| 200 towers now, towers only (research) | 2027-01-02 | -2,61,673 | -4,50,877 | not in 18 months | not in 18 months | not in 18 months | 36,65,529 | 60,748 | -40,48,033 | -40,48,033 |
| 200 towers now, with side lines (research) | 2027-01-02 | -2,46,765 | -4,49,166 | not in 18 months | not in 18 months | not in 18 months | 39,02,256 | 64,672 | -35,04,357 | -35,04,357 |
| 200 towers now, towers only (owner) | 2027-01-02 | -1,19,477 | -2,20,165 | M9 (Jun 2027) | M12 (Sep 2027) | M12 (Sep 2027) | 35,77,013 | 59,281 | -6,23,699 | -6,23,699 |
| 200 towers now, with side lines (owner) | 2027-01-02 | -92,223 | -2,06,109 | M5 (Feb 2027) | M5 (Feb 2027) | M5 (Feb 2027) | 38,13,740 | 63,205 | -2,54,057 | 2,95,512 |
| 200 towers now, towers only (owner_realistic) | 2027-01-02 | -1,49,341 | -2,39,795 | not in 18 months | not in 18 months | not in 18 months | 35,66,779 | 59,112 | -22,28,810 | -22,28,810 |
| 200 towers now, with side lines (owner_realistic) | 2027-01-02 | -1,30,329 | -2,33,980 | M13 (Oct 2027) | M13 (Oct 2027) | not in 18 months | 38,03,506 | 63,035 | -15,60,302 | -15,60,302 |
| 200 towers now, fastest research timing (owner costs) | 2026-12-19 | -1,29,319 | -2,34,603 | M9 (Jun 2027) | M12 (Sep 2027) | M12 (Sep 2027) | 35,81,609 | 59,358 | -5,27,587 | -5,27,587 |

Month by month, 200 towers, your costs, towers only (demand clock starts at the first harvest):

| Month | Calendar | Towers | Harvest kg | Sold at target kg | Revenue | Costs | EBITDA | Commitment | Loan payment | After commitment and loan | Capex | Loan drawn | Cash |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| M1 | Oct 2026 | 0 | 0 | 0 | 0 | 8,751 | -8,751 | 40,000 | 0 | -48,751 | 25,45,955 | 8,94,707 | 3,00,000 |
| M2 | Nov 2026 | 200 | 0 | 0 | 0 | 91,937 | -91,937 | 40,000 | 4,415 | -1,36,351 | 25,45,955 | 26,82,307 | 3,00,000 |
| M3 | Dec 2026 | 200 | 0 | 0 | 0 | 1,19,477 | -1,19,477 | 40,000 | 18,238 | -1,77,715 | 0 | 0 | 1,22,285 |
| M4 | Jan 2027 | 200 | 418 | 115 | 46,835 | 1,69,658 | -1,22,823 | 40,000 | 18,238 | -1,81,061 | 0 | 0 | -66,910 |
| M5 | Feb 2027 | 200 | 889 | 220 | 91,540 | 1,66,359 | -74,819 | 40,000 | 16,473 | -1,31,292 | 0 | 0 | -2,05,665 |
| M6 | Mar 2027 | 200 | 667 | 421 | 1,41,375 | 1,95,682 | -54,307 | 40,000 | 18,238 | -1,12,545 | 0 | 0 | -3,31,254 |
| M7 | Apr 2027 | 200 | 731 | 557 | 1,90,356 | 2,08,092 | -17,736 | 40,000 | 17,650 | -75,386 | 0 | 0 | -4,29,486 |
| M8 | May 2027 | 200 | 755 | 642 | 2,11,139 | 2,21,080 | -9,941 | 40,000 | 18,238 | -68,179 | 0 | 0 | -4,97,521 |
| M9 | Jun 2027 | 200 | 934 | 794 | 2,58,783 | 2,33,149 | 25,634 | 40,000 | 17,650 | -32,016 | 0 | 0 | -5,41,760 |
| M10 | Jul 2027 | 200 | 965 | 821 | 2,67,409 | 2,40,920 | 26,488 | 40,000 | 18,238 | -31,750 | 0 | 0 | -5,75,628 |
| M11 | Aug 2027 | 200 | 965 | 821 | 2,67,409 | 2,40,920 | 26,488 | 40,000 | 18,238 | -31,750 | 0 | 0 | -6,07,378 |
| M12 | Sep 2027 | 200 | 934 | 794 | 2,58,783 | 2,33,149 | 25,634 | 0 | 17,650 | 7,984 | 0 | 0 | -5,97,275 |
| M13 | Oct 2027 | 200 | 997 | 848 | 2,77,643 | 2,44,148 | 33,495 | 0 | 18,238 | 15,257 | 0 | 0 | -5,86,429 |
| M14 | Nov 2027 | 200 | 1,141 | 970 | 3,15,810 | 2,53,712 | 62,098 | 0 | 59,046 | 3,052 | 0 | 0 | -5,93,150 |
| M15 | Dec 2027 | 200 | 1,179 | 1,002 | 3,26,337 | 2,62,169 | 64,168 | 0 | 59,630 | 4,537 | 0 | 0 | -5,91,205 |
| M16 | Jan 2028 | 200 | 1,179 | 1,002 | 3,26,337 | 2,62,169 | 64,168 | 0 | 59,626 | 4,542 | 0 | 0 | -5,86,663 |
| M17 | Feb 2028 | 200 | 1,112 | 945 | 3,08,184 | 2,46,173 | 62,010 | 0 | 58,487 | 3,524 | 0 | 0 | -5,78,526 |
| M18 | Mar 2028 | 200 | 755 | 642 | 2,11,139 | 2,21,080 | -9,941 | 0 | 59,618 | -69,559 | 0 | 0 | -6,23,699 |

## 5. Can 200 -> 6,000 towers in 6 months work?

March 2027 is sales month 6 if selling starts now (side lines): target demand 210 kg/week + bulk 100 kg/week. Month 12: 400 + 200 kg/week.

| Step | Capex | Loan | Of which above the AIF cap | EMI | EBITDA your costs | EBITDA legal-min | EBITDA research | Harvest kg/week | Sold at target (Mar 2027) | Covered m2 | Largest site kW | Tanker loads/day (Apr) | Headcount | Build days (1 supplier) | Checks that fail |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Step 1: 200 towers ordered now (Oct 2026) | 50,91,910 | 38,31,910 | 0 | 63,506 | 30,107 | -76,439 | -1,82,943 | 223 | 83% | 380 | 12.9 | 0.9 | 6 | 52 | capital, loan_service |
| Step 2: 600 towers | 1,48,89,612 | 1,34,00,651 | 0 | 2,22,087 | 1,02,331 | -3,38,564 | -4,68,168 | 641 | 33% | 1,140 | 31.0 | 2.8 | 13 | 82 | capital, own_share, loan_service, market_mar2027, market_m12 |
| Step 3: owned land full (1,596 towers) | 3,74,29,086 | 3,36,86,178 | 1,36,86,178 | 5,89,863 | -5,38,098 | -16,62,700 | -19,80,220 | 1,915 | 11% | 3,032 | 47.2 | 7.5 | 35 | 104 | capital, own_share, loan_service, market_mar2027, aif_cap, market_m12, water |
| Step 4: 2,000 towers | 4,69,45,322 | 4,22,50,790 | 2,22,50,790 | 7,51,570 | -7,21,184 | -21,42,329 | -25,58,491 | 2,447 | 9% | 3,800 | 47.2 | 9.4 | 43 | 129 | capital, own_share, loan_service, market_mar2027, aif_cap, land, market_m12, water |
| Step 5: 6,000 towers by 31 Mar 2027 | 13,49,36,462 | 12,14,42,816 | 10,14,42,816 | 22,46,777 | -28,63,538 | -69,67,691 | -79,94,184 | 7,715 | 3% | 11,400 | 203.3 | 28.4 | 122 | 372 | capital, own_share, loan_service, market_mar2027, aif_cap, land, labour, build_time, market_m12, power, water |

Tests used at each step (numbers shown for step 1):

- capital: Own cash for capex (Rs 12.60 lakh after the commitment and a Rs 3 lakh reserve) covers the capex (Rs 50.92 lakh)
- own_share: Own money covers the 10% share of a 90% loan (Rs 12.60 lakh needed)
- loan_service: EBITDA at legal-minimum cost (Rs -76,439) is at least 1.3 x the loan EMI (Rs 63,506)
- aif_cap: Loan within the Rs 2 crore AIF cap (loan Rs 38.32 lakh)
- market_mar2027: Harvest (223 kg/week) within what a new seller can place in Mar 2027 (target + bulk 310 kg/week)
- market_m12: Harvest within month-12 demand (target + bulk 600 kg/week)
- land: Fits the usable owned land (up to 1,596 towers; 380 m2 covered needed)
- power: Every site stays below 150 kW, so LT supply is allowed (largest site 13 kW; total 13 kW)
- water: Tanker water at or below 3 loads a day (0.7 average, 0.9 in April; estimate of a reliable supply for one farm)
- labour: 6 staff can be hired and trained by Mar 2027 at about 8 a month
- build_time: Ready by 31 Mar 2027 if ordered on 11 Oct 2026 (build and supply 52 days; one supplier makes 500 sets a month)

**First constraint that breaks:** capital at 'Step 1: 200 towers ordered now (Oct 2026)' (Own cash for capex (Rs 12.60 lakh after the commitment and a Rs 3 lakh reserve) covers the capex (Rs 50.92 lakh)).

Month by month (200 now + 5,800 ordered 15 Dec 2026; loans drawn automatically; one supplier at 500 sets a month):

| Cost basis | 5,800 towers ready | Their first harvest | Capex in 18 months | Loans drawn | Cash first below zero | Lowest cash | Cash at M18 |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: |
| Research cost | 2027-12-03 | 2028-01-09 | 13,52,17,462 | 12,07,62,352 | M4 (Jan 2027) | -5,72,03,045 | -5,72,03,045 |
| Your costs | 2027-12-03 | 2028-01-09 | 13,52,17,462 | 12,06,73,837 | M4 (Jan 2027) | -3,47,49,991 | -3,47,49,991 |
| Legal-minimum cost | 2027-12-03 | 2028-01-09 | 13,52,17,462 | 12,06,63,602 | M4 (Jan 2027) | -5,15,67,119 | -5,15,67,119 |

## 6. Fastest realistic path (gated)

Towers are capped by the target-price + bulk demand a new seller reaches 6 months after each phase is ready (base demand ramp; one owner-salesperson), at the gate-pass yield. Gate-pass case = Your plan at legal-minimum cost + prices and yields both 30% above base (about Rs 1,318 of contribution per tower per month, twice the base) + block pumps (10 W per tower) + roof rain from the farm's own roof. Smaller gains do not carry the Phase 2 loan: prices +20% with block pumps and rain give debt cover 0.14; prices +20% and yields +20% give 0.77 (1.17 with a borewell).

- **Phase 0-1: side lines + 10-tower test** (2026-10-15 to 2027-03-31): Microgreens 50 trays a week (100 only after Gate A), trading through Floruvi, a 10-tower test module on the owned 60-cent plot; BESCOM LT-5 application, FSSAI, GSTIN, water tests, rain pond, KGWA borewell application. Gate: Gate A (end Dec 2026): >= 10 paying accounts; 60-95 kg/week of greens sold at target price for 4 weeks (bought-in greens count); microgreens >= Rs 700/kg and >= 15 kg/week; no invoice more than 14 days late. Research cost: Oct-Dec 2026 EBITDA Rs -1,04,503, first profit M5 (Feb 2027), lowest cash Rs 2,03,414. Legal-minimum cost: Oct-Dec Rs -63,733, first profit M4 (Jan 2027), lowest cash Rs 3,78,343.

| Phase | Ready | Towers | Towers demand allows | Capex added | Loans total | EMI total | EBITDA legal-min | EBITDA research | EBITDA gate-pass case | Debt cover (gate-pass) | Gate-pass after EMI and Rs 30,000 drawing | Contribution per tower (base) | Contribution needed for cover 1.3 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 2: 150 towers | 2027-10-01 | 150 | 510 | 33,96,271 | 30,56,644 | 50,657 | -36,291 | -61,729 | 75,103 | 1.48 | -5,554 | 637 | 1,318 |
| Phase 3: 300 towers | 2028-10-01 | 300 | 647 | 42,58,005 | 68,88,848 | 1,14,168 | -1,28,150 | -2,11,473 | 93,049 | 0.82 | -51,119 | 628 | 1,550 |
| Phase 4: 600 towers | 2029-10-01 | 600 | 784 | 65,96,910 | 1,28,26,068 | 2,12,565 | -2,58,062 | -3,87,666 | 97,093 | 0.46 | -1,45,472 | 490 | 1,381 |
| Phase 5: 1057 towers | 2031-10-01 | 1057 | 1057 | 1,09,83,368 | 2,27,11,099 | 3,82,645 | -6,41,829 | -8,77,107 | -1,74,691 | -0.46 | -5,87,337 | 406 | 1,484 |

- **Phase 2: 150 towers** - Build Aug-Sep 2027 (after the commitment ends); plant Oct-Nov 2027 Gate: Gate B passed (end Mar 2027): >= 80 g per site; loss <= 15%; >= 70% sold at target price for 4 weeks; <= 49 h per 1,000 sites per 40 days; contribution high enough for EBITDA >= 1.3 x EMI; target-price demand >= 150 kg/week; AIF sanction (30-120 days).
- **Phase 3: 300 towers** - Build Jul-Sep 2028; plant Oct 2028 Gate: 12 months of profit after loan payments; signed bulk contracts for half the added output; paid grower and legal guard hired; walk-in cold room.
- **Phase 4: 600 towers** - Build Jul-Sep 2029. Only with signed bulk contracts at known prices: at base demand the farm's own volume pushes prices down above 400 towers Gate: Proven borewell or Cauvery supply; a sales person or team; signed contracts for the added output; DSCR >= 1.3 on audited accounts.
- **Phase 5: 1057 towers** - Up to the owned-land limit (1,596 towers) only as far as demand allows Gate: Demand at the target price reaches the output; 2 years of audited profit; only then consider leased land.
- **6,000 towers** - A different business (wholesale): a 10-year lease on 3.5-4 acres, HT power, about 230 m3 of water a day, 80-120 staff, 7-8 t a week of signed contracts and Rs 13-15 crore. Gate: Review only after 2 years of audited profit at 1,000 towers or more.

## 7. Crop ranking: which crop earns the most per tower

Per 90-site tower, steady state, base, small farm selling inside the market (85% at target price: 66% HoReCa, 34% D2C; 11% bulk; 4% waste). Revenue = net sales (after unsold and rejected produce) + the Rs 99 D2C fee. Contribution = revenue - seeds/media/nutrients - packaging - delivery (HoReCa Rs 38/kg at low volume; D2C Rs 85 per drop) - commissions and bad debt. 'After crop labour' subtracts harvest and pack hours. Market cap = towers of this crop alone that Bengaluru buyers take from a new seller at month 12.

| Rank | Crop | Tower fit | Harvests per 40 d | Sellable kg per tower per 40 d | Blended price Rs/kg | Revenue incl. D2C fee per tower per 40 d | Variable cost per tower per 40 d | Contribution per tower per 40 d | Contribution per tower per month | Month range (cons. to opt.) | After crop labour per month | Market cap (towers) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Arugula (rocket) | good | 2.45 | 6.25 | 354 | 2,411 | 855 | 1,556 | 1,182 | 510 to 2,072 | 679 | 27.4 |
| 2 | Lollo Rosso lettuce | good | 1.29 | 7.53 | 242 | 2,125 | 1,114 | 1,011 | 768 | 174 to 1,602 | 340 | 82.0 |
| 3 | Mini romaine (Little Gem type) | good | 1.21 | 7.07 | 226 | 1,890 | 1,044 | 846 | 643 | 113 to 1,308 | 226 | 72.8 |
| 4 | Green oakleaf lettuce | good | 1.29 | 8.47 | 189 | 1,979 | 1,198 | 780 | 593 | 34 to 1,341 | 140 | 85.0 |
| 5 | Butterhead lettuce | fair | 1.21 | 7.34 | 204 | 1,818 | 1,068 | 750 | 570 | 62 to 1,291 | 147 | 56.0 |
| 6 | Batavia (summer crisp) lettuce | good | 1.11 | 8.28 | 176 | 1,840 | 1,127 | 713 | 542 | 26 to 1,268 | 94 | 49.7 |
| 7 | Italian (Genovese) basil | good | 1.98 | 3.53 | 279 | 1,117 | 572 | 545 | 414 | 71 to 1,006 | 28 | 97.2 |
| 8 | Pak choi (bok choy) | good | 1.21 | 5.18 | 179 | 1,166 | 706 | 460 | 350 | 9 to 855 | -18 | 33.1 |
| 9 | Curly kale | fair | 2.77 | 3.56 | 233 | 978 | 556 | 422 | 321 | 18 to 720 | -143 | 96.4 |
| 10 | Swiss chard | good | 3.17 | 5.08 | 173 | 1,115 | 702 | 413 | 314 | -17 to 717 | -249 | 11.2 |
| 11 | Thai basil | good | 1.58 | 2.54 | 310 | 877 | 475 | 402 | 305 | 26 to 799 | -38 | 22.5 |
| 12 | Flat-leaf parsley | good | 1.32 | 2.36 | 218 | 615 | 452 | 163 | 124 | -75 to 498 | -211 | 24.3 |
| 13 | English / baby spinach (Nov-Feb only) | poor | 1.54 | 1.02 | 208 | 256 | 184 | 72 | 55 | -32 to 174 | -50 | 37.4 |
| 14 | Mint | good | 1.85 | 3.38 | 97 | 507 | 545 | -38 | -29 | -187 to 211 | -408 | 25.4 |
| 15 | Palak (Indian spinach) | good | 2.35 | 3.77 | 71 | 474 | 524 | -50 | -38 | -176 to 122 | -435 | 45.4 |
| 16 | Coriander | fair | 1.14 | 2.59 | 77 | 341 | 434 | -94 | -71 | -179 to 72 | -416 | 44.1 |
| 17 | Strawberries (plant Oct-Nov, pick Dec-Apr) | fair | 0.11 | 1.13 | 254 | 331 | 429 | -98 | -74 | -213 to 150 | -341 | 10.0 |

Spinach is Nov-Feb only; strawberry values are year averages (pick Dec-Apr, replant yearly).

If all 600 towers grew one crop:

| Crop | Output kg/month (600 towers, in season) | Market cap kg/month | Output / cap | Contribution if every kg sold (Rs/month) |
| --- | ---: | ---: | ---: | ---: |
| Arugula (rocket) | 2,849 | 130 | 21.9x | 7,09,379 |
| Lollo Rosso lettuce | 3,431 | 469 | 7.3x | 4,61,021 |
| Mini romaine (Little Gem type) | 3,224 | 391 | 8.2x | 3,85,757 |
| Green oakleaf lettuce | 3,860 | 547 | 7.1x | 3,55,712 |
| Butterhead lettuce | 3,349 | 313 | 10.7x | 3,42,178 |
| Batavia (summer crisp) lettuce | 3,776 | 313 | 12.1x | 3,24,958 |
| Italian (Genovese) basil | 1,609 | 261 | 6.2x | 2,48,376 |
| Pak choi (bok choy) | 2,364 | 130 | 18.1x | 2,09,918 |
| Curly kale | 1,622 | 261 | 6.2x | 1,92,398 |
| Swiss chard | 2,317 | 43 | 53.4x | 1,88,430 |
| Thai basil | 1,159 | 43 | 26.7x | 1,83,111 |
| Flat-leaf parsley | 1,075 | 43 | 24.7x | 74,296 |
| English / baby spinach (Nov-Feb only) | 1,392 | 87 | 16.0x | 32,701 |
| Mint | 1,541 | 65 | 23.7x | -17,210 |
| Palak (Indian spinach) | 1,721 | 130 | 13.2x | -23,017 |
| Coriander | 1,182 | 87 | 13.6x | -42,666 |
| Strawberries (plant Oct-Nov, pick Dec-Apr) | 516 | 9 | 60.0x | -44,684 |

## 8. Sales channels and prices

| Channel | Share of harvest, small farm | Share of harvest, 600 towers (month-12 demand) | Days to cash (base) |
| --- | ---: | ---: | ---: |
| HoReCa direct (restaurants, cafes, hotels) | 56% | 41% | 15 |
| Floruvi direct-to-consumer (boxes, website, WhatsApp) | 29% | 21% | 2 |
| Quick commerce / modern retail / distributor (bulk buyers) | 11% | 27% | 30 |
| Wholesale / trader (surplus dump) | 0% | 7% | 1 |
| Unsold or wasted | 4% | 4% | - |

| Crop (Rs per kg, base) | HoReCa | D2C | Bulk buyer | Trader | Blended (sold kg) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Arugula (rocket) | 220 | 700 | 132 | 52 | 354 |
| Lollo Rosso lettuce | 200 | 370 | 120 | 36 | 242 |
| Mini romaine (Little Gem type) | 184 | 350 | 110 | 40 | 226 |
| Green oakleaf lettuce | 160 | 280 | 96 | 34 | 189 |
| Butterhead lettuce | 160 | 330 | 96 | 34 | 204 |
| Batavia (summer crisp) lettuce | 150 | 260 | 90 | 36 | 176 |
| Italian (Genovese) basil | 150 | 600 | 90 | 32 | 279 |
| Pak choi (bok choy) | 136 | 300 | 82 | 28 | 179 |
| Curly kale | 150 | 450 | 90 | 36 | 233 |
| Swiss chard | 150 | 250 | 90 | 28 | 173 |
| Thai basil | 200 | 596 | 120 | 48 | 310 |
| Flat-leaf parsley | 150 | 400 | 90 | 36 | 218 |
| English / baby spinach (Nov-Feb only) | 180 | 300 | 108 | 32 | 208 |
| Mint | 80 | 150 | 48 | 14 | 97 |
| Palak (Indian spinach) | 62 | 100 | 37 | 9 | 71 |
| Coriander | 72 | 100 | 43 | 16 | 77 |
| Strawberries (plant Oct-Nov, pick Dec-Apr) | 250 | 300 | 150 | 60 | 254 |

## 9. Recommended crop mix

| Crop | Phase 1 (10 towers) | Phase 2 (150 towers) | 600 towers |
| --- | ---: | ---: | ---: |
| Lollo Rosso lettuce | 3 | 36 | 82 |
| Green oakleaf lettuce | 0 | 18 | 85 |
| Mini romaine (Little Gem type) | 3 | 36 | 72 |
| Butterhead lettuce | 0 | 0 | 56 |
| Batavia (summer crisp) lettuce | 0 | 0 | 49 |
| Arugula (rocket) | 1 | 15 | 27 |
| Italian (Genovese) basil | 1 | 15 | 79 |
| Thai basil | 0 | 0 | 22 |
| Flat-leaf parsley | 0 | 0 | 24 |
| Curly kale | 1 | 15 | 60 |
| Swiss chard | 0 | 0 | 11 |
| Pak choi (bok choy) | 1 | 15 | 33 |
| Total | 10 | 150 | 600 |

Rule: Demand research mix: about 60% mixed lettuces, 10-15% basil, 10% kale, 15-20% rocket, pak choi and herbs. Within a group the model fills the best crops by contribution first, within market caps; at most 40% of the lettuce group and 50% of the other group in one crop. Poor-fit and season-only crops stay out of the year-round mix. Season calendar (climate research): Nov-Feb all lettuces, kale, pak choi, arugula, English spinach and a strawberry trial; Mar-May move lettuce sites to Batavia and basil (lettuce -40%, pak choi -30-50%); Jun-Oct mildew-resistant lettuce, kale, mint, chard with night fans (basil -30%).

## 10. Capex, one time

| Item (INR, GST incl.) | Phase 1: 10 towers (test) | Largest fundable: 14 towers | Phase 2: 150 towers | 600 towers |
| --- | ---: | ---: | ---: | ---: |
| Tower kits, 80-96 sites (tower, 30-50 L tank, pump, net cups, timer), before GST | 1,00,000 | 1,40,000 | 15,00,000 | 60,00,000 |
| GST on tower kits (18%) | 18,000 | 25,200 | 2,70,000 | 10,80,000 |
| Freight Pune/Thane to Bengaluru | 3,500 | 4,900 | 52,500 | 2,10,000 |
| Site preparation under tanks and assembly | 5,000 | 7,000 | 75,000 | 3,00,000 |
| Start-up spares (pumps, timers, net cups) | 1,200 | 1,680 | 18,000 | 72,000 |
| Electrical distribution and safety (30 mA RCCB/ELCB, earthing, main panel, capacitors) | 26,000 | 48,400 | 1,30,000 | 4,00,000 |
| Protected structure (test: film-roof rain shelter; others: NVPH, 96 m2 minimum) | 17,100 | 1,34,400 | 3,99,000 | 13,11,000 |
| Circulation (HAF) fans | 5,000 | 5,000 | 15,000 | 50,000 |
| Levelling, weed mat, drainage, path, tank plinth | 15,065 | 37,960 | 63,475 | 1,78,900 |
| Nursery (98-cell trays, benches, insect-net area, misting) | 8,250 | 9,550 | 53,750 | 2,00,000 |
| pH/EC meters, calibration, mixing station, hand tools | 26,250 | 26,750 | 43,750 | 1,00,000 |
| RO plant (test: small unit) | 25,000 | 1,06,000 | 1,19,981 | 4,74,923 |
| Water storage tanks (2 days raw, 1 day RO, stock tanks) | 19,450 | 23,230 | 1,51,750 | 5,77,000 |
| Backup power (inverter + batteries up to 200 towers; 15 kVA DG above) | 30,000 | 54,980 | 2,00,500 | 4,70,000 |
| BESCOM normative line charge | 814 | 932 | 4,937 | 32,461 |
| BESCOM security deposit (refundable) | 8,506 | 8,868 | 21,190 | 61,960 |
| 3-phase smart meter | 9,000 | 9,000 | 9,000 | 9,000 |
| CCTV, 4G router, UPS, siren, security lights | 42,700 | 50,000 | 50,000 | 83,300 |
| Fence round the 60-cent plot + gate (barbed wire; chain-link above 200 towers) | 74,250 | 94,100 | 94,100 | 1,72,900 |
| Cold storage and pre-cooling (chest freezer; walk-in room above 200 towers) | 20,000 | 41,000 | 41,000 | 2,75,000 |
| Packing: crates, scales, label printer, tables (pack house above 200 towers) | 29,000 | 47,500 | 55,600 | 5,06,000 |
| Worker welfare: toilet, drinking water, first aid, snake-bite kit, extinguishers | 50,000 | 84,000 | 84,000 | 1,34,000 |
| Room for a resident caretaker | 1,00,000 | 1,00,000 | 1,00,000 | 1,00,000 |
| Registrations: FSSAI central licence, trademark, GST/Udyam help, trade licence | 12,000 | 19,000 | 19,000 | 19,000 |
| Water lab tests | 8,000 | 8,000 | 8,000 | 8,000 |
| First marketing: samples, ad test, print | 5,000 | 15,000 | 15,000 | 15,000 |
| Starting stock: seed, plug media, nutrient salts, acid, IPM kit | 3,690 | 5,166 | 55,350 | 2,21,400 |
| Contingency 10% | 65,427 | 1,10,547 | 3,64,864 | 13,47,968 |
| Fogger line | - | 6,720 | 19,950 | 79,800 |
| Distribution transformer + line (if the local one is full; above 20 kW; one per 100 kVA) | - | - | - | 4,00,000 |
| **Total (base)** | **7,28,202** | **12,24,883** | **40,34,697** | **1,48,89,612** |
| Total at research low | 4,75,414 | 7,11,923 | 24,59,141 | 89,47,505 |
| Total at research high | 11,14,642 | 20,21,052 | 64,56,355 | 2,24,24,056 |
| Refundable deposit inside the total | 8,506 | 8,868 | 21,190 | 61,960 |

Your tower quote: Rs 5,000-12,000 buys only the kit. Installed cost per tower before the structure (kit + 18% GST + freight + assembly + spares + electrical + 10% contingency) is about Rs 14,707. Not in the totals: borewell Rs 4,50,000; EV three-wheeler Rs 4,20,000; GS1 barcodes Rs 50,200. No subsidy is counted. Step costs above 600 towers (sites, generators, cold rooms, HT supply) are in sections 3 and 5.

## 11. Monthly running costs at steady state (research cost)

| Item (INR per month) | Phase 1: 10 | Largest fundable: 14 | Phase 2: 150 | 600 towers |
| --- | ---: | ---: | ---: | ---: |
| Production helpers and packers (sized from hours per 1,000 sites) | 0 | 0 | 44,863 | 2,53,657 |
| Resident caretaker, 7 days (also night presence); one per site | 31,309 | 31,309 | 31,309 | 32,589 |
| Trained grower (above 150 towers) and supervisors (above 600 towers) | 0 | 0 | 0 | 38,955 |
| Night security guard, 12-h post with relief nights (above 150 towers; one per site) | 0 | 0 | 0 | 72,330 |
| Electricity (pumps, fans, RO, site loads; energy + fixed charge + tax; HT-2(a) at 150 kW+) | 2,771 | 3,183 | 17,844 | 67,560 |
| Backup power running (outages; generator rental on shutdown days) | 3,250 | 3,250 | 3,250 | 5,700 |
| Water (tanker purchase incl. Feb-May peak, or borewell upkeep) + RO consumables | 2,061 | 2,886 | 30,922 | 1,23,688 |
| Repairs: pumps, net cups, tubing, timers | 750 | 1,050 | 11,250 | 45,000 |
| Repairs: structure (1.5% a year) | 21 | 168 | 499 | 1,639 |
| IPM and sanitation (traps, biopesticides, H2O2, hypochlorite) | 86 | 432 | 1,282 | 5,130 |
| Internet/SIM for CCTV and CCTV upkeep | 1,000 | 1,000 | 1,000 | 1,000 |
| Insurance (fire, storm/flood, burglary; structure cover) | 218 | 470 | 1,525 | 5,504 |
| Accounting, CA and FSSAI renewal | 2,582 | 2,582 | 2,582 | 5,182 |
| Marketing, samples and sales travel | 5,200 | 5,280 | 8,000 | 17,000 |
| Crates lost at buyers (5-10% of stock a month) | 675 | 675 | 1,282 | 5,062 |
| Water and produce tests, meter calibration | 1,600 | 1,600 | 1,600 | 1,600 |
| **Running costs total (base)** | **51,524** | **53,885** | **1,57,209** | **6,81,597** |
| Running costs at research low | 26,602 | 27,377 | 58,868 | 2,64,641 |
| Running costs at research high | 80,521 | 87,977 | 3,77,722 | 16,06,910 |
| Existing commitment (Oct 2026-Aug 2027 only) | 40,000 | 40,000 | 40,000 | 40,000 |
| Depreciation (non-cash) | 8,405 | 14,030 | 55,653 | 2,05,099 |
| Staff: helper FTE / headcount | 0.00 / 1 | 0.00 / 1 | 1.85 / 3 | 9.81 / 13 |
| Electricity kWh per month | 310 | 386 | 2,973 | 11,534 |
| Raw water m3 per month (tanker, annual average) | 12.9 | 18.1 | 193.9 | 775.7 |

## 12. Profit per month and per 40 days (research cost)

| Size | Scenario | Revenue / month | EBITDA / month | After commitment / month | After depreciation / month | EBITDA / 40 days | After commitment / 40 days | Sold at target price |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Phase 1: 10 towers (test) | conservative | 8,993 | -67,224 | -1,07,224 | -77,448 | -88,453 | -1,41,084 | 82% |
| Phase 1: 10 towers (test) | base | 13,466 | -48,227 | -88,227 | -56,632 | -63,456 | -1,16,088 | 85% |
| Phase 1: 10 towers (test) | optimistic | 20,101 | -27,424 | -67,424 | -34,478 | -36,084 | -88,715 | 86% |
| Phase 1 plan: towers + microgreens + trading | conservative | 58,852 | -79,247 | -1,19,247 | -95,612 | -1,04,272 | -1,56,904 | 82% |
| Phase 1 plan: towers + microgreens + trading | base | 1,25,164 | 13,801 | -26,199 | 713 | 18,159 | -34,472 | 85% |
| Phase 1 plan: towers + microgreens + trading | optimistic | 2,34,599 | 1,44,806 | 1,04,806 | 1,34,177 | 1,90,534 | 1,37,903 | 86% |
| Largest fundable: 14 towers | conservative | 13,306 | -70,187 | -1,10,187 | -88,220 | -92,352 | -1,44,983 | 82% |
| Largest fundable: 14 towers | base | 19,854 | -46,794 | -86,794 | -60,824 | -61,571 | -1,14,202 | 85% |
| Largest fundable: 14 towers | optimistic | 29,491 | -21,990 | -61,990 | -33,262 | -28,934 | -81,565 | 86% |
| Phase 2: 150 towers | conservative | 1,34,592 | -2,30,983 | -2,70,983 | -3,00,457 | -3,03,925 | -3,56,556 | 82% |
| Phase 2: 150 towers | base | 2,01,593 | -61,729 | -1,01,729 | -1,17,382 | -81,222 | -1,33,854 | 85% |
| Phase 2: 150 towers | optimistic | 3,01,398 | 97,218 | 57,218 | 52,296 | 1,27,919 | 75,287 | 87% |
| 600 towers | conservative | 3,61,499 | -10,69,068 | -11,09,068 | -13,22,090 | -14,06,669 | -14,59,300 | 60% |
| 600 towers | base | 5,61,218 | -4,68,168 | -5,08,168 | -6,73,267 | -6,16,011 | -6,68,642 | 62% |
| 600 towers | optimistic | 8,32,746 | 66,909 | 26,909 | -97,771 | 88,038 | 35,407 | 59% |

## 13. Cash flow, months 1-18: recommended plan (research cost)

10-tower test module ordered 2026-10-11, structure ready 2026-10-25, power live 2026-10-19, first transplant 2026-11-01, first harvest 2026-12-02. Microgreens from week 2 (50 trays/week; 100 from Jan 2027 only after Gate A). Trading from week 3. Cash starts at Rs 20,00,000.

| Month | Calendar | Tower harvest kg | Tower revenue | Microgreens revenue | Trading net profit | Variable and direct costs | Farm running costs | EBITDA | Commitment | EBITDA after commitment | Operating cash flow | Capex | Cash balance |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| M1 | Oct 2026 | 0 | 0 | 14,486 | 1,275 | 16,992 | 49,424 | -50,655 | 40,000 | -90,655 | -73,455 | 9,01,202 | 9,85,342 |
| M2 | Nov 2026 | 0 | 0 | 36,326 | 4,875 | 22,378 | 48,899 | -30,076 | 40,000 | -70,076 | -56,676 | 0 | 8,88,666 |
| M3 | Dec 2026 | 20 | 5,589 | 41,451 | 7,750 | 26,590 | 51,971 | -23,771 | 40,000 | -63,771 | -51,563 | 0 | 7,97,103 |
| M4 | Jan 2027 | 47 | 13,495 | 82,903 | 10,850 | 48,315 | 62,376 | -3,442 | 40,000 | -43,442 | -35,981 | 1,08,000 | 6,13,122 |
| M5 | Feb 2027 | 46 | 13,227 | 74,880 | 12,600 | 43,515 | 56,034 | 1,158 | 40,000 | -38,842 | -29,170 | 0 | 5,43,952 |
| M6 | Mar 2027 | 37 | 10,577 | 82,903 | 17,050 | 46,823 | 63,221 | 486 | 40,000 | -39,514 | -29,233 | 0 | 4,74,719 |
| M7 | Apr 2027 | 36 | 10,236 | 80,229 | 18,750 | 45,312 | 61,182 | 2,720 | 40,000 | -37,280 | -19,997 | 0 | 4,14,722 |
| M8 | May 2027 | 37 | 10,577 | 82,903 | 21,700 | 46,823 | 63,221 | 5,136 | 40,000 | -34,864 | -17,747 | 0 | 3,56,975 |
| M9 | Jun 2027 | 46 | 12,965 | 80,229 | 23,250 | 46,166 | 59,328 | 10,949 | 40,000 | -29,051 | -12,465 | 0 | 3,04,511 |
| M10 | Jul 2027 | 47 | 13,397 | 82,903 | 26,350 | 47,705 | 61,306 | 13,639 | 40,000 | -26,361 | -9,267 | 0 | 2,55,244 |
| M11 | Aug 2027 | 47 | 13,397 | 82,903 | 28,675 | 47,705 | 61,306 | 15,964 | 40,000 | -24,036 | -6,836 | 0 | 2,08,408 |
| M12 | Sep 2027 | 46 | 12,965 | 80,229 | 30,000 | 46,166 | 59,328 | 17,699 | 0 | 17,699 | -4,994 | 0 | 2,03,414 |
| M13 | Oct 2027 | 49 | 13,909 | 82,903 | 32,162 | 47,845 | 61,306 | 19,824 | 0 | 19,824 | 8,203 | 0 | 2,11,617 |
| M14 | Nov 2027 | 56 | 15,823 | 80,229 | 32,250 | 47,035 | 59,328 | 21,939 | 0 | 21,939 | 10,047 | 0 | 2,21,664 |
| M15 | Dec 2027 | 58 | 16,350 | 82,903 | 34,488 | 48,603 | 61,306 | 23,832 | 0 | 23,832 | 12,302 | 0 | 2,33,966 |
| M16 | Jan 2028 | 58 | 16,350 | 82,903 | 35,650 | 48,603 | 61,306 | 24,995 | 0 | 24,995 | 13,595 | 0 | 2,47,561 |
| M17 | Feb 2028 | 54 | 15,440 | 77,554 | 34,438 | 45,507 | 58,035 | 23,890 | 0 | 23,890 | 12,722 | 0 | 2,60,283 |
| M18 | Mar 2028 | 37 | 10,577 | 82,903 | 37,975 | 46,823 | 63,221 | 21,411 | 0 | 21,411 | 11,236 | 0 | 2,71,519 |

## 14. All plans compared (base unless stated)

| Plan | Capex in 18 months | Oct-Dec 2026 EBITDA | First month with profit | After commitment | Cash first below zero | Lowest cash | Cash at M18 | EBITDA over 18 months | Operating cash flow over 18 months |
| --- | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
| Recommended plan | 10,09,202 | -1,04,503 | M5 (Feb 2027) | M12 (Sep 2027) | never | 2,03,414 | 2,71,519 | 95,699 | -2,79,279 |
| Recommended plan at your plan's legal-minimum cost | 10,09,202 | -63,733 | M4 (Jan 2027) | M12 (Sep 2027) | never | 3,78,343 | 5,51,692 | 3,75,872 | 895 |
| Recommended plan without microgreens | 7,38,202 | -1,40,501 | not in 18 months | not in 18 months | M18 (Mar 2028) | -15,152 | -15,152 | -4,61,972 | -8,36,950 |
| Recommended plan without trading | 9,99,202 | -1,18,449 | not in 18 months | not in 18 months | never | 2,34,759 | 2,34,759 | -3,23,461 | -3,26,039 |
| Recommended plan + Phase 2 (150 towers, AIF loan) from Sep 2027 - base inputs | 44,05,473 | -1,04,503 | M5 (Feb 2027) | M12 (Sep 2027) | M13 (Oct 2027) | -4,12,684 | -4,12,684 | -1,28,721 | -5,39,646 |
| Recommended plan + Phase 2 (150 towers, AIF loan) from Sep 2027 - optimistic inputs | 34,96,616 | 27,512 | M2 (Nov 2026) | M4 (Jan 2027) | never | 10,01,623 | 24,30,113 | 25,24,806 | 20,16,360 |
| Phase 1 towers only (largest fundable size) | 12,24,883 | -1,10,929 | not in 18 months | not in 18 months | M9 (Jun 2027) | -4,98,145 | -4,98,145 | -8,29,484 | -8,33,262 |
| 600 towers now (owner's plan) | 1,48,89,612 | -2,92,011 | not in 18 months | not in 18 months | M1 (Oct 2026) | -2,28,13,438 | -2,28,13,438 | -93,46,348 | -94,83,826 |
| Recommended plan - conservative inputs | 12,87,729 | -1,90,748 | not in 18 months | not in 18 months | M6 (Mar 2027) | -14,28,135 | -14,28,135 | -13,66,066 | -17,00,406 |
| Recommended plan - optimistic inputs | 8,14,277 | 27,512 | M2 (Nov 2026) | M4 (Jan 2027) | never | 10,01,623 | 23,27,631 | 20,60,255 | 15,81,908 |

## 15. Funding and phase plan

| 600 towers | Capex | Reserve (6 months costs + commitment) | Capital needed | Gap vs Rs 20 lakh |
| --- | ---: | ---: | ---: | ---: |
| low | 89,47,505 | 20,27,844 | 1,09,75,349 | 89,75,349 |
| base | 1,48,89,612 | 45,29,585 | 1,94,19,197 | 1,74,19,197 |
| high | 2,24,24,056 | 1,00,81,460 | 3,25,05,516 | 3,05,05,516 |

AIF finances capex only: loan = min(90% of capex, capex - own cash), up to Rs 2 crore. The 6-month reserve is a bank/KCC working-capital loan at 10.7%. 600 towers: capex loan Rs 1,34,00,651 (AIF Rs 1,34,00,651, bank Rs 0), EMI Rs 2,22,087; working-capital loan Rs 43,18,546 at 10.7%, EMI Rs 81,538. The 600-tower farm loses money in base, so it cannot service these loans.

Largest tower count Rs 20 lakh funds with 6 months of fixed costs and the remaining commitment kept aside: 14 towers (full NVPH site); 28 with a lean site; 0 with microgreens and trading capital as well.

| Phase | When | Towers | Capex (INR) | Funding | What | Gate to the next phase |
| --- | --- | ---: | ---: | --- | --- | --- |
| Phase 1a: quick cash | Oct 2026 (M1) | 0 | 2,81,000 | Own cash | Microgreens 50 trays/week (100 from Jan 2027), trading/aggregation through Floruvi, registrations, water test, BESCOM LT-5 application. | Gate A (end Dec 2026): >= 10 paying accounts; 60-95 kg/week of greens sold at target price for 4 weeks; microgreens >= Rs 700/kg and >= 15 kg/week before the step to 100 trays; no invoice over 14 days late. Stop rules: stop microgreens below Rs 700/kg or 10 kg/week for 4 weeks; stop trading below 3% net margin or any invoice 30+ days late. |
| Phase 1b: tower test | Order Oct 2026 (M1); first harvest 2026-12-02 | 10 | 7,28,202 | Own cash | Test module (test spec): measure g per site, loss, price and hours per 1,000 sites for 2-3 cycles. | Gate B (end Mar 2027): >= 80 g per site; loss <= 15%; >= 70% sold at target price for 4 weeks; <= 49 h per 1,000 sites per 40 days; contribution high enough for EBITDA >= 1.3 x the Phase 2 EMI; reliable water (rain pond, borewell or Cauvery). End the test if contribution is below Rs 300 per tower per month. |
| Phase 2: owner-run farm | Order Sep 2027 (M12) only if Phase 1b passes the gates (base inputs lose money at this size) | 150 | 33,96,271 | AIF loan 90% (about 6% after subvention, 12-month moratorium) + own cash | NVPH on the owned 60-cent plot, owner as grower, resident caretaker, weekly orders signed before planting. | 12 months of profit; target-price demand above the Phase 3 output. |
| Phase 3: 300 towers | Not before Oct 2028 (estimate) | 300 | 42,58,005 | Profits + AIF loan (MIDH/NHB subsidy only with approval before building) | Hire a grower and a night guard; add a borewell and a walk-in cold room. | Demand at target price above 272 kg/week. |
| 600 towers | Only if the demand gate is met (not before 2029, estimate) | 600 | 1,48,89,612 | Loan about Rs 174.2 lakh at today's capital (AIF on capex, bank loan for the reserve) | Full plan. | Demand at target price above 545 kg/week; base month-12 demand is 400 kg/week. |

## 16. Sensitivity: EBITDA per month before the commitment (base)

| Case | Phase 1 (10 towers, research) | Phase 2 (150 towers, research) | 200 towers, your costs | 600 towers, research |
| --- | ---: | ---: | ---: | ---: |
| Base case | -48,227 | -61,729 | 30,107 | -4,68,168 |
| Price -20% | -50,292 | -92,445 | -10,848 | -5,53,561 |
| Price +20% | -46,161 | -31,013 | 71,062 | -3,82,776 |
| Yield -20% (head weights below the model's peak-season values) | -50,234 | -87,587 | -4,370 | -4,92,475 |
| Yield +20% | -46,219 | -35,871 | 64,584 | -4,66,268 |
| Sell-through 50% at target price | -50,873 | -92,957 | -11,531 | -5,13,267 |
| Sell-through 70% at target price | -49,361 | -75,113 | 12,262 | -4,36,961 |
| Sell-through 85% at target price | -48,227 | -61,729 | 30,107 | -3,87,666 |
| D2C delivery fee Rs 0 (free delivery like OnlyHydroponics above Rs 399) | -51,117 | -1,06,055 | -28,994 | -5,92,909 |
| D2C delivery fee Rs 40 | -49,949 | -88,146 | -5,115 | -5,42,509 |
| HoReCa delivery at Rs 14/kg at any volume (v1 value) | -47,589 | -51,951 | 43,144 | -4,40,652 |
| Power tariff LT-4(c) agricultural (if BESCOM allows) | -47,875 | -58,602 | 30,107 | -4,56,084 |
| Power tariff LT-3(a) commercial | -49,120 | -69,637 | 30,107 | -4,98,720 |
| Block pumps (10 W per tower instead of 30 W kit pumps) | -47,733 | -53,825 | 30,107 | -4,36,422 |
| Labour cost +20% | -54,489 | -76,964 | 30,107 | -5,47,674 |
| Agriculture minimum wage for helpers and caretaker | -39,259 | -40,055 | 30,107 | -3,86,753 |
| Labour 38 h per 1,000 sites per 40 days (v1 value) | -48,227 | -47,309 | 30,107 | -4,06,182 |
| Water: existing borewell instead of tanker | -49,005 | -36,648 | 30,107 | -3,59,970 |
| Water: tanker + rain from the farm's own roof | -47,906 | -56,922 | 30,107 | -4,48,941 |
| Add a compliant agency night guard | -1,20,557 | -1,34,059 | - | - |

In the 'your costs' column, power, water, helpers, caretaker and guard are your fixed figures, so cases that change those lines do not move it. Sell-through = share of harvest sold at the target price (HoReCa + D2C); the rest goes to bulk buyers and traders up to their limits, then waste.

## 17. Break-even and size scan

| Case (demand-limited, month-12 demand) | Break-even towers, 1-150 | Break-even towers, 151-1,500 (5-tower steps) |
| --- | ---: | ---: |
| Base (tanker water, uniform minimum wage) | none | none up to 1,500 |
| Base, including the Rs 40,000 commitment | none | none up to 1,500 |
| Base + existing borewell | none | none up to 1,500 |
| Base + agriculture minimum wage | none | none up to 1,500 |
| Base + borewell + agriculture minimum wage | none | none up to 1,500 |
| Base + prices 20% higher | none | none up to 1,500 |
| Base + yields 20% higher | none | none up to 1,500 |
| Conservative | none | none up to 1,500 |
| Optimistic | 34 | 151 |
| Your costs (owner figures exactly) | none | 151 |
| Your plan at legal-minimum cost | none | none up to 1,500 |

Only if every kg sold (not realistic above about 560 towers):

| Case (every kg sold) | Break-even towers, 1-150 | Break-even towers, 151-1,500 |
| --- | ---: | ---: |
| Base (tanker water, uniform minimum wage) | none | none up to 1,500 |
| Base + existing borewell | none | none up to 1,500 |
| Base + borewell + agriculture minimum wage | none | none up to 1,500 |
| Base + prices 20% higher | none | none up to 1,500 |
| Base + yields 20% higher | none | none up to 1,500 |
| Optimistic | 34 | 151 |

Each extra tower adds about Rs 112 a month while the caretaker does the work (up to about 45 towers) and about Rs -233 when helpers are paid. Month-12 target-price demand 400 kg/week absorbs about 422 towers (about 561 with bulk buyers).

| Towers | Capex | Harvest kg/month | EBITDA if all sold | EBITDA at month-12 demand | Sold at target price | Profit after depreciation |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 11,53,094 | 47 | -48,951 | -48,951 | 85% | -61,880 |
| 20 | 13,32,568 | 96 | -45,428 | -45,428 | 85% | -61,112 |
| 30 | 15,12,042 | 144 | -41,794 | -41,794 | 85% | -60,233 |
| 50 | 18,70,989 | 242 | -38,835 | -38,835 | 85% | -62,785 |
| 75 | 24,07,270 | 364 | -43,863 | -43,863 | 85% | -75,687 |
| 100 | 29,42,291 | 484 | -50,091 | -50,091 | 85% | -89,759 |
| 125 | 34,78,302 | 606 | -55,461 | -55,461 | 85% | -1,02,989 |
| 150 | 40,34,697 | 726 | -61,729 | -61,729 | 85% | -1,17,382 |
| 175 | 45,37,041 | 848 | -1,76,691 | -1,76,691 | 85% | -2,39,844 |
| 200 | 50,91,910 | 968 | -1,82,943 | -1,82,943 | 85% | -2,54,209 |
| 300 | 82,92,702 | 1,450 | -2,11,473 | -2,11,473 | 85% | -3,24,163 |
| 450 | 1,17,75,167 | 2,155 | -2,90,540 | -3,11,598 | 77% | -4,71,440 |
| 600 | 1,48,89,612 | 2,784 | -3,87,666 | -4,68,168 | 62% | -6,73,267 |

## 18. Quick-cash side lines

| Scenario | Trays/week | kg sold/week | Demand by month 3 kg/week | Revenue/month | Variable | Labour (own worker) | Fixed | Profit/month | Profit/40 days | Capex | Days to first cash |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| conservative | 50 | 7.5 | 14.0 | 27,616 | 23,126 | 12,976 | 3,500 | -11,985 | -15,770 | 2,13,000 | 26 |
| conservative | 100 | 15.0 | 14.0 | 55,233 | 46,251 | 25,952 | 4,500 | -21,471 | -28,251 | 3,53,500 | 26 |
| conservative | 200 | 29.9 | 14.0 | 1,10,466 | 92,503 | 51,904 | 6,500 | -40,441 | -53,212 | 6,75,500 | 26 |
| base | 50 | 9.4 | 20.0 | 40,649 | 18,023 | 12,106 | 3,500 | 7,020 | 9,237 | 1,63,000 | 19 |
| base | 100 | 18.7 | 20.0 | 81,298 | 36,046 | 24,213 | 4,500 | 16,540 | 21,763 | 2,71,000 | 19 |
| base | 200 | 37.4 | 20.0 | 1,62,597 | 72,091 | 48,425 | 6,500 | 35,580 | 46,816 | 5,19,000 | 19 |
| optimistic | 50 | 11.7 | 30.0 | 61,221 | 15,526 | 9,795 | 3,500 | 32,401 | 42,633 | 1,23,000 | 17 |
| optimistic | 100 | 23.5 | 30.0 | 1,22,443 | 31,051 | 19,589 | 4,500 | 67,302 | 88,555 | 2,07,000 | 17 |
| optimistic | 200 | 47.0 | 30.0 | 2,44,885 | 62,103 | 39,178 | 6,500 | 1,37,104 | 1,80,400 | 3,96,500 | 17 |

| Scenario | Sales month | Accounts | Sales/month | Gross margin/month | Net profit/month (after bad debt) | Working capital | Days to first cash |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| conservative | 1 | 2.0 | 23,886 | 4,061 | -358 | 17,914 | 22 |
| conservative | 3 | 7.0 | 83,600 | 14,212 | -1,254 | 62,700 | 22 |
| conservative | 6 | 16.0 | 1,91,086 | 32,485 | -2,866 | 1,43,314 | 22 |
| conservative | 12 | 30.0 | 3,58,286 | 60,909 | -5,374 | 2,68,714 | 22 |
| base | 1 | 3.0 | 45,600 | 10,032 | 2,280 | 22,800 | 14 |
| base | 3 | 10.0 | 1,52,000 | 33,440 | 7,600 | 76,000 | 14 |
| base | 6 | 22.0 | 3,34,400 | 73,568 | 16,720 | 1,67,200 | 14 |
| base | 12 | 40.0 | 6,08,000 | 1,33,760 | 30,400 | 3,04,000 | 14 |
| optimistic | 1 | 4.5 | 83,057 | 23,671 | 7,890 | 33,223 | 10 |
| optimistic | 3 | 14.0 | 2,58,400 | 73,644 | 24,548 | 1,03,360 | 10 |
| optimistic | 6 | 28.5 | 5,26,029 | 1,49,918 | 49,973 | 2,10,411 | 10 |
| optimistic | 12 | 52.5 | 9,69,000 | 2,76,165 | 92,055 | 3,87,600 | 10 |

## 19. Business-model comparison

| Model | Capital needed | Days to first cash | Monthly profit (base) | Range (cons. to opt.) | Annual return on capital | Main risk |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Tower greens/herbs: Phase 1 (10 towers, test) | 7,28,202 | 65 | -48,227 | -67,224 to -27,424 | -79% | Fixed site costs (caretaker, power) are larger than the output of a test module; it is for learning, not profit. |
| Tower greens/herbs: Phase 2 (150 towers) | 40,34,697 | 86 | -61,729 | -2,30,983 to 97,218 | -18% | Thin margin: needs >= 70% sold at target price and real yields at or above base; tanker water and minimum-wage rulings move it a lot. |
| Tower greens/herbs: 600 towers | 1,48,89,612 | 127 | -4,68,168 | -10,69,068 to 66,909 | -38% | Output is about 1.6 times the month-12 target-price demand (far more in the first months); capital gap of about Rs 1.7 crore; paid grower and guard. |
| Microgreens racks (100 trays/week) | 2,91,000 | 19 | 16,540 | -21,471 to 67,302 | 68% | Price: below about Rs 700/kg blended it loses money; demand about 20 kg/week by month 3; perishable. |
| Trading/aggregation through Floruvi (month-12 level) | 3,14,000 | 14 | 30,400 | -5,374 to 92,055 | 116% | Credit and spoilage: restaurants pay late; net margin only 0-15% after delivery and waste. |
| Merchant-export pilot (basil to Dubai, 200 kg/month) | 1,46,700 | 75 | -10,400 | -20,000 to 9,800 | -85% | Landed cost is above the GCC import price in base; payment and quality-claim risk; needs steady weekly volume. |

## 20. Every pain point (merged from the 16 research topics and both reviews; most serious first)

| Severity | Category | Pain | Evidence | Fix |
| --- | --- | --- | --- | --- |
| critical | Capital and loans | Your Rs 20 lakh cannot pay for 200 towers, let alone 600 or 6,000. | Capex: 200 towers Rs 50.92 lakh; 600 towers Rs 148.90 lakh; 6,000 towers Rs 13.5 crore. Usable cash after the Rs 4.4 lakh commitment and a Rs 3 lakh reserve: Rs 12.60 lakh (model; towers research). | Spend only on a 10-20 tower test and the side lines now (about Rs 10-11 lakh). |
| critical | Capital and loans | Even at your own cost figures the farm cannot repay the loan it would need. | 200 towers need a loan of about Rs 38.32 lakh; EMI about Rs 63,506 a month after a 12-month moratorium. EBITDA at your figures Rs 30,107; at legal-minimum cost Rs -76,439 (debt cover 0.47 and below; lenders want 1.3). | Borrow (AIF) only after measured test data show EBITDA of at least 1.3 x the EMI. |
| critical | Market and sales | A new seller cannot sell what large tower farms grow. | Month-12 target-price demand about 400 kg/week (base, one owner-salesperson). Share sold at target price: 600 towers 62%; 6,000 towers 5% (model; demand research). | Size towers to signed weekly orders; add towers only after 4 weeks at 70% or more sold at the target price. |
| critical | Market and sales | Restaurant prices in Bengaluru are low and already served by strong suppliers. | Hyperpure delivers lettuce at Rs 140-216/kg, basil Rs 150/kg, bok choy Rs 136/kg, palak Rs 62/kg; farm-gate lettuce Rs 35-70/kg; BigBasket lists 24 hydroponic lettuces; OnlyHydroponics has 60,000+ customers (prices, demand research). | Price near Hyperpure for HoReCa; sell premium packs and boxes direct; compete on freshness and reliability. |
| critical | Staff and labour law | Your guard and caretaker budgets are below the legal minimum wage. | Legal floor for a 12-h, 30-night guard about Rs 32,998 (agriculture schedule); 7-day caretaker Rs 18,699 (labour research). You budget Rs 10,000 and Rs 15,000. | Up to 150 towers use one legal resident caretaker + CCTV + siren (about Rs 20,784 with on-costs); hire a legal guard only above 150 towers. |
| critical | Water | No borewell: every litre is bought by tanker, at peak prices in the dry months. | Tanker Rs 125/m3 base, Rs 2,000-2,850 a load in Feb-May 2024; RO rejects about half; Rs 10,000 covers the tanker bill of about 51 towers (30 in April). 6,000 towers need about 21 loads a day (water research; model). | Test the water; build roof-rain storage; ask BWSSB about Cauvery tankers; apply to KGWA for a sited borewell. |
| critical | Timeline | No plan gives a cash profit by December 2026. | 200 towers ordered on 11 Oct: first harvest 2027-01-02; Dec 2026 EBITDA at your costs Rs -1,19,477. Recommended plan: Oct-Dec EBITDA Rs -1,04,503; first month with profit M5 (Feb 2027) (after the commitment: M12 (Sep 2027)) (model). | Reset the December goal to sales milestones (10+ paying accounts, 60-95 kg/week sold at target price). |
| critical | Scale plan | 200 -> 6,000 towers by March 2027 breaks every resource. | Not possible. Capital breaks at the first step: 200 towers cost about Rs 50.92 lakh against about Rs 15.60 lakh of free cash (Rs 12.60 lakh after a Rs 3 lakh reserve), and even at your own cost figures the farm cannot carry the loan it would need. Then the market breaks (a new seller can place the output of about 278 towers by March 2027), then the Rs 2 crore AIF cap, land (owned land holds about 1,596 towers), hiring and build time (6,000 tower sets are about 12 months of one supplier). To finish by March, the 6,000 towers must be ordered before the first 200-tower harvest, so 'profit first' cannot be tested. | Drop the 6,000-by-March target; follow the gated path. |
| major | Capital and loans | Subsidies and the AIF loan are slow and capped. | Every capital subsidy needs approval before building and pays 6-24 months later; NHB needs more than 4,000 m2 on one site and a 10-year title and pays 35%; AIF subvention covers up to Rs 2 crore per location, needs 10% own money and takes 30-120 days (finance research). | Count subsidies as a bonus; apply only for a pre-approved later phase. |
| major | Capital and loans | The Rs 40,000 monthly commitment competes for the same cash until August 2027. | 11 payments, about Rs 4.4 lakh (owner). Recommended plan: first month with profit after the commitment is M12 (Sep 2027). | Ring-fence Rs 4.4 lakh now; keep cash at or above the remaining commitment + Rs 3 lakh. |
| major | Capital and loans | A failed farm loan can put family land at risk. | Outside AIF/CGTMSE cover, banks ask to mortgage owned land for Rs 30-60 lakh loans (finance research). | Do not pledge family land for an unproven farm. |
| major | Market and sales | Well-funded fresh-produce companies lost money or shut. | Deep Rooted (Bengaluru) lost Rs 52 crore on Rs 34 crore revenue and shut in March 2025; Otipy, Clover, WayCool lost 55-74% of revenue (demand research). | Keep spending low; grow only against orders. |
| major | Market and sales | Floruvi's current list prices are far above the local market. | Floruvi list prices are 1.4-8.6 times Bengaluru shelf prices (iceberg Rs 1,120/kg vs Rs 130/kg); microgreens Rs 280 per 50 g vs Rs 79-99 (prices research). | Reprice to Bengaluru levels before pushing volume. |
| major | Market and sales | Home delivery profit depends on the Rs 99 fee. | At 200 towers, a Rs 0 fee changes EBITDA by Rs -59,101 a month (sensitivity, your costs); OnlyHydroponics delivers free above Rs 399 (market/operations review). | Test the fee with 20-30 paying customers; sell Rs 400-500 boxes; deliver on fixed days. |
| major | Market and sales | Buyers pay late and some never pay. | Restaurants 0-45 days, bulk buyers 30-45 days; bad debts 1-8%; only 3% of B2B produce listings offer credit (prices, demand research). | Take UPI in advance from new accounts; at most 7 days of credit; stop supply after 2 unpaid invoices. |
| major | Market and sales | Bulk channels need paperwork and time before the first order. | Quick commerce needs GSTIN, FSSAI, trademark, GS1 barcodes (Rs 50,200) and e-invoicing; first order 7-60 days; supplier gets 45-65% of shelf price (logistics research). | Start FSSAI, GSTIN, Udyam and trademark now; buy barcodes only after a buyer commits in writing. |
| major | Staff and labour law | Towers need more hands than expected. | 49 h per 1,000 sites per 40 days (+40% in the first cycles): 200 towers need 3.5 FTE, 600 towers 10.6, 6,000 towers 106. Rs 40,000 of helpers runs about 138 towers (labour research; numbers review). | Record hours by task in the test; sell bulk crates to cut packing hours. |
| major | Staff and labour law | Minimum wages may rise 42% for farm work. | Uniform notification of 22 May 2026: Rs 20,350 (Zone 3) vs agriculture Rs 14,299; the High Court refused interim relief (labour research). | Budget helpers at Rs 20,350; watch the Division Bench ruling. |
| major | Water | Local groundwater is too salty and hard for recirculating towers without RO. | Median EC about 1,480 uS/cm, Na 80 mg/L, Cl 273 mg/L, HCO3 343 mg/L; hydroponic limits Na < 50, Cl < 70 (water research). | Install RO only if the lab test fails; never use a salt softener. |
| major | Water | A new borewell can fail and needs permission. | Rs 2.3-7 lakh for 1,000-1,500 ft; 10-80% failure risk (base 40%); KGWA permission up to 60 days in a notified area (water research). | Use a hydrogeologist; put water assets only on owned land. |
| major | Power | Power costs more than Rs 10,000 beyond about 80 towers, and outages kill roots. | LT-5 about Rs 5.42/kWh + Rs 200/kW; Rs 10,000 runs about 79 towers (151 with block pumps). Outages about 15 h a month; planned shutdowns 4-8 h; roots dry in 30-60 min on hot afternoons (power research). | Get LT-5 'Green House' on a 24x7 feeder in writing; inverter + generator rental; power-fail alarms; block pumps after the test. |
| major | Power | Wrong tariff or feeder can wreck the numbers. | LT-3 commercial costs about 44% more than LT-5; farm (IP) feeders give only about 7 h of 3-phase power a day; loads of 150 kW+ need HT supply (tariff clause 9) (power research; tariff book). | Apply in week 1 of October on the owned plot; never run towers on an IP-set connection. |
| major | Operations and crops | Tower yields are low and uncertain. | Tower trials: 95 g (ideal indoor), 61-79 g (tropical greenhouse), 53 g (Indian indoor); bottom tier 43% lighter; the model's 80 g base is a year average (lettuce research). Yield -20% changes 150-tower EBITDA by Rs -25,858 a month. | Weigh every harvest by tower tier during the test; decide on measured grams per site. |
| major | Operations and crops | Root disease can wipe out a reservoir, and learning losses are high. | Pythium spreads through recirculating water and no fungicide is registered; first-cycle losses 20-40%; Bowery Farming shut after a pathogen outbreak (climate, finance research). | Many small independent reservoirs; sanitise between cycles; quarantine seedlings; keep solution at 25 C or less. |
| major | Operations and crops | Bengaluru's hot and wet seasons cut yields. | Mar-May: lettuce -40% (range 25-60%), tanks 26-31 C; Jun-Oct: basil -30% from downy mildew, low light (climate research). | Switch to Batavia and basil in Mar-May; shade and insulate tanks; night fans in the monsoon; add capacity only for Oct-Nov. |
| major | Operations and crops | Cheap tower kits hide gaps and scams. | Rs 5,000-12,000 buys only the kit; installed cost about Rs 14,707 per tower before the structure; IndiaMART prices for similar towers range Rs 10,500-2.2 lakh; unstabilised plastic can lose 70% of its strength in a year; pump warranty often 6 months (towers research). | Buy 2-5 samples from 2 suppliers; demand datasheets and warranties; refuse buy-back or guaranteed-income offers. |
| major | Land and site | Owned land holds about 1,600 towers; the free plot is a trap. | Usable owned land about 3,035 m2 = about 1,596 towers at 1.9 m2 each; the large plot is rent-free for 1 year only; NHB/MIDH need 10 years of title or use (towers, finance research). | Put every permanent asset on the owned 60-cent plot; nothing permanent on the 1-year plot without a 10-year lease. |
| major | Timeline | Grid connection, loans and channels each add months. | Rural LT connection 15-120 days; AIF sanction 30-120 days; FSSAI central licence up to 60 days; quick commerce first order 7-60 days (power, finance, logistics research). | Apply for LT-5, FSSAI, GSTIN and Udyam in week 1. |
| major | Side lines and export | The quick-cash side lines rest on estimates. | Microgreens lose money below about Rs 700/kg blended and need about 20 kg/week of orders by month 3; trading keeps only about 5% of sales after bad debt. Without microgreens the recommended plan's lowest cash is Rs -15,152 (model; strawberry_micro, demand research). | Start at 50 trays a week; step up only after 4 weeks at 15 kg/week and Rs 700/kg; trade only for advance payment. |
| major | Owner and people | One person cannot grow, sell, deliver and collect for a large farm. | The demand ramp assumes one owner-salesperson reaching 40 accounts and 300 boxes by month 12; the owner can grow up to about 150 towers (labour research; demand research). | Add a part-time sales/delivery person once accounts pass 10; hire a paid mentor for 3-6 months. |
| major | Owner and people | No case pays the family yet. | All profits are before any owner salary; a Rs 30,000 drawing needs EBITDA above the loan EMI + Rs 30,000 (market/operations review). | Judge each phase on profit after loan payments and an owner drawing. |
| minor | Market and sales | Tower heads are smaller than shop heads. | Tower lettuce 80-100 g (trials 53-95 g) vs 125-250 g heads on shelves (lettuce research). | Sell by weight, as mixed-leaf and live-root packs; test alternate-site planting for bigger heads. |
| minor | Staff and labour law | Payroll rules start at small headcounts. | ESI from 10 employees, EPF from 20, gratuity from 10; agency guards can count (labour research). | Track headcount; pay by bank transfer; keep wage registers. |
| minor | Operations and crops | Seed and supplies can run out. | Several Rijk Zwaan, Enza, Namdhari and Tokita packs were out of stock (consumables research). | Order seed 2-3 cycles ahead from 2 suppliers. |
| minor | Compliance and tax | Some rules cost money even for a small farm. | FSSAI central licence Rs 7,500 a year for online sales; input GST (5-18%) cannot be reclaimed on exempt produce; tower produce may be taxed as business income; a pack house needs building permission (finance research). | Get a written CA opinion; keep books from day one. |
| minor | Side lines and export | Export will not bring cash soon. | First paid shipment about 75 days away (35-150); basil to Dubai earns about Rs 52/kg less than selling it in Bengaluru; mint, coriander and lettuce lose Rs 30-240/kg by air (export research). | Finish IEC/RCMC/FSSAI; export only premium herbs, 100% advance, from Q2 2027. |
| minor | Side lines and export | Strawberries in towers are a small trial at best. | About 150 g per plant per season in towers (60 g in a US tower trial); fruit only Dec-Apr; pollination needed (strawberry research). | At most a 5-10 tower trial planted in Oct-Nov. |
| minor | Model limits | Several inputs are estimates or one-day snapshots. | Prices are a 29 Sep 2026 snapshot; demand ramp, loss rates, step costs above 600 towers, generator rental and hiring speed are estimates; land lease above 1,600 towers is not costed; some supplier pages were blocked (research notes). | Replace estimates with test-module records every week. |

## 21. Research results by topic (key numbers; low / base / high)

### towers

Hydroponic tower hardware and capex: installed cost per 90-site tower, footprint, nursery, tools, lifespans, DIY option and supplier red flags (Bengaluru, 2026)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Tower kit, 80-96 sites, complete (ex-GST) | 8000 | 10000 | 13500 | INR per tower | IndiaMART: Shivraj Agro Tech 96-planter ₹9,500 and ₹11,500, 88-plant ₹10,500, 80-planter ₹10,500 (price excludes taxes); Aadya Hydro 80-plant ₹11,500 (aajjo); D |
| Installed cost per 90-site tower (no structure) | 10150 | 14040 | 20930 | INR per tower | calculation: the items above, GST 18%, contingency 0/5/10% |
| All-in capex, 600 towers | 68.5 | 104.8 | 165.5 | INR lakh | calculation: towers plus structure, nursery, tools, water/RO, backup power and pack house (items below) |
| Towers affordable from ₹20 lakh (bought towers) | 50 | 64 | 71 | towers | calculation: ₹20 lakh minus ₹4.4 lakh commitment, ₹3-5 lakh working capital and ₹2.5-3.5 lakh support items, divided by ₹14,040 |
| Usable area, 60-cent plot (2,428 m2 gross) | 1700 | 1821 | 1942 | m2 | estimate: 70-80% usable |
| Pump life | 1 | 2 | 3 | years | Green Warrior: 6-month pump warranty; Tower Garden premium pump: 5-year limited warranty |
| Tower body life | 3 | 5 | 8 | years | Green Warrior: 2-year tower warranty; Palmetto: UV-stabilised PP lasts up to 5 years outdoors, and unstabilised PP loses up to 70% of its strength in 12 months  |

Sources (first of 51): https://www.indiamart.com/proddetail/aeroponic-vertical-farming-with-tower-farm-2853449219612.html; https://www.indiamart.com/proddetail/aeroponics-grow-tower-26866084888.html; https://www.indiamart.com/proddetail/vertical-growing-tower-aeroponics-system-22695404512.html; https://www.indiamart.com/proddetail/aeroponics-grow-tower-25619349088.html

### structure

Protected structures for a vertical-tower hydroponic farm near Bengaluru (shade-net house, NVPH and fan-and-pad): 2025-26 costs, official norms, lifespan, fencing and site preparation

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| NVPH installed cost, about 1,000 m2 (600-tower size) | 950 | 1150 | 1400 | Rs/m2 floor, GST incl. | MIDH Operational Guidelines 2025 Annex V (norm Rs 1,000-1,050/m2); IndiaMART Bengaluru polyhouse listings Rs 725-950/m2 (GST often extra; Malur Rs 725); agrifar |
| NVPH installed cost, 150-290 m2 module (100-150 towers) | 1100 | 1400 | 1800 | Rs/m2 floor, GST incl. | MIDH 2025 slab Rs 1,200/m2 (up to 500 m2) + 15-20% market premium (Agriplast); IndiaMART Bengaluru 200 m2 climate-controlled unit Rs 2,000/m2 shows small-size p |
| Flat-roof net house with UV-film roof (budget rain shelter) | 700 | 900 | 1100 | Rs/m2 floor, GST incl. | IndiaMART Bengaluru flat-roof naturally ventilated polyhouse Rs 850/m2 (Rudra Enterprises, GST likely extra); Haryana Horticulture 2022 poly-net-house norm Rs 7 |
| UV film replacement interval (200-micron) | 2.5 | 3 | 5 | years | Telangana technical spec: 3-year pro-rata film warranty; inhydro.in and agrodome.in 3-5 years |
| Subsidy share of admissible cost | 0 | 50 | 90 | % of norm-based cost | MIDH 2025: 50% up to 2,500 m2 per beneficiary. Karnataka horticulture portal (older page, 4,000 m2 ceiling) lists polyhouse aid Rs 798-1,094/m2 and shade-net ai |
| Time from order to ready structure | 25 | 45 | 90 | days | Telangana MIDH 2025-26: protected structures to be finished in 60-90 days (+30-day extension); small self-funded modules faster (estimate) |

Sources (first of 31): https://nhb.gov.in/writereaddata/082825102800MIDH%20Guideline%202025.pdf (MIDH Operational Guidelines 2025, dated 31.12.; https://nhb.gov.in/pdf/Cost%20Norms.pdf (NHB cost norms under MIDH, XII Plan); https://shm.tg.nic.in/Download/MIDH%20-%20Implementation%20Guidelines%20-%202025-26.pdf (Telangana MIDH 2025-26: net-hou; https://horticulture.tg.nic.in/polyhouse/Downloads/Technical%20Specification.pdf (warranty: 5 years structure, 3 years f

### climate

Bengaluru climate, crop calendar, nutrient-solution temperature and cooling for a 600-tower (54,000-site) hydroponic farm on about 1,000 m2 - agronomist view

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Lettuce sellable head weight in towers (year average) | 65 | 100 | 140 | g/site/harvest | estimate: light budget at 54 plants/m2 floor, light-use efficiency 8-10 g fresh weight/mol (Cornell implies about 14 with CO2 enrichment); Cornell 150 g flat-sy |
| Tower per-plant yield penalty vs horizontal hydroponics | 20 | 31 | 43 | % | Touliatos, Dodd & McAinsh 2016, Food and Energy Security (https://pmc.ncbi.nlm.nih.gov/articles/PMC5001193/): 95 g vs 138 g per plant; bottom layer 43% below to |
| Solution temperature in a shaded above-ground tank, Mar-May daily mean | 26 | 28 | 31 | deg C | estimate: IMD daily mean air Mar 26.8, Apr 28.1, May 27.5, plus pump and greenhouse heat gain |
| Crop loss rate, first 6 months (Oct 2026-Mar 2027) | 15 | 25 | 40 | % of planted sites | estimate: Oct-Nov monsoon (Oct 186 mm, 5.6 sun h/day, about 90% morning RH) plus learning curve; Pythium can destroy a crop sharing one reservoir (UKY CCD-CP-63 |
| Crop loss rate after month 6 (steady state) | 8 | 12 | 20 | % of planted sites | estimate: with written procedures and crops matched to the season |
| Lettuce yield drop in Mar-May vs Nov-Feb | 25 | 40 | 60 | % | estimate: most lettuce grows poorly above 24 C and heat drives bolting (Wikipedia Lettuce; Cornell set point 24 C day); uncontrolled summer root zone at 24.7-31 |
| Basil yield drop in Jun-Oct (downy mildew) | 15 | 30 | 90 | % | Cohen & Ben-Naim 2016 PLoS One: 90-96% of leaves infected without night fans vs 0.5-1.7% with them; estimate for fans + resistant varieties |

Sources (first of 43): https://en.wikipedia.org/wiki/Template:Bengaluru_Weather_box (IMD 1991-2020 normals; NOAA 1971-1990 sunshine); https://en.wikipedia.org/wiki/Bangalore; https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_SFC_PAR_TOT,T2M,T2M_MAX,T; https://www.uasbangalore.edu.in/wp-content/uploads/2026/05/April-2026.E.pdf

### power

Electricity tariff, connection, load and backup power for a 600- or 150-tower hydroponic farm near Bengaluru (BESCOM, FY2026-27)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| BESCOM LT-5 industrial energy charge (schedule names 'Green House', floriculture, tissue culture, cold storage), FY2026-27 | 4.2 | 4.4 | 4.4 | Rs/kWh | KERC Tariff Charges Approved for Control Period (Order 27.03.2025) https://kerc.karnataka.gov.in/uploads/85821743074692.pdf; LT-5 applicability text in KERC Ele |
| All-in electricity cost, LT-5 (likely category) | 5.6 | 6.1 | 7.3 | Rs/kWh | Calculation from the lines above (script: scratchpad/power/calc2.py) |
| Monthly electricity bill, 150 towers, LT-5 (likely) | 4800 | 16900 | 40100 | Rs/month | Calculation (scratchpad/power/calc2.py) |
| Monthly electricity bill, 600 towers, LT-5 (likely) | 14800 | 62800 | 153100 | Rs/month | Calculation with FY27 tariff (scratchpad/power/calc2.py) |
| Time to get a new LT connection (rural) | 15 | 45 | 120 | days | MoP Electricity (Rights of Consumers) Amendment Rules, 22.02.2024: 15 days rural; up to 90 days if mains or a substation must be extended https://www.pib.gov.in |
| Power outages on a rural non-agricultural feeder | 3 | 15 | 40 | h/month | Estimate: no official feeder data found. KERC 2025 order directs compensation to LT/HT industrial consumers for outages above 60 min/month in FY27. |
| Safe daytime pump stop for tower crops (hot months) | 15 | 40 | 90 | minutes | Estimate: plant physiology and grower practice |

Sources (first of 27): https://kerc.karnataka.gov.in/uploads/85821743074692.pdf (KERC: Tariff Charges Approved for FY2025-26 to FY2027-28, orde; https://kerc.karnataka.gov.in/uploads/97271743074381.pdf (KERC press note, Tariff Order 27.03.2025: P&G surcharge 36 pai; https://kerc.karnataka.gov.in/143/tariff-order-2025/en (KERC Tariff Order 2025 document index); https://kerc.karnataka.gov.in/uploads/98041743075668.pdf (KERC order 27.03.2025 amending the P&G surcharge order of 18.0

### water

Water supply, quality and cost for a vertical-tower hydroponic farm near Bengaluru (600 towers / 54,000 sites and 150 towers / 13,500 sites)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Total water use, 600 towers (54,000 sites) | 167 | 343 | 666 | m3/month | Model from the per-site items above + staff use of 0.18-0.45 m3/day |
| Groundwater EC (salinity), Bengaluru area | 400 | 1480 | 2300 | µS/cm | CGWB Aquifer Mapping, Bengaluru South 2022-23 (EC 80-2,300); Shankar & Balasubramanya 2009 (90 borewells, median 1,480) |
| RO recovery (permeate share of intake) | 65 | 50 | 40 | % | IndiaMART RO plant listings (max recovery 50-55%), updated 28 Sep 2026 |
| Private tanker, 12,000 L load | 1000 | 1500 | 2500 | INR per load | TNM Mar 2024 (govt cap); Daily Jagran 26 Mar 2025 (Rs 1,500-1,700); Deccan Herald 2024 (up to Rs 2,850) |
| New borewell, complete (drilling, casing, pump, cable, pipe) | 230000 | 450000 | 700000 | INR | studiomatrx (Jul 2026): 1,000 ft Rs 2.3-4.5 lakh, slab rates Rs 65-220/ft; Krishna Borewell: Bangalore Rs 2-10 lakh; Citizen Matters Apr 2025 (KGWA fees) |
| Chance a new borewell is dry or fails within about 5 years | 10 | 40 | 80 | % | Deccan Herald 2024 (6,900 of 13,900 government bores dry); DH (hydrogeologist: 80% fail due to unscientific siting); DH (BWSSB 90% success with geologists) |
| Monthly water cost, 150 towers: (b) tanker only | 5766 | 22563 | 89211 | INR/month | Model (tanker price × raw volume + RO running cost) |
| Rain share of RO-grade demand, 150 towers (1,000 m2 roof, 50 m3 store) | 44 | 62 | 67 | % | Daily water-balance model |

Sources (first of 32): https://www.thenewsminute.com/karnataka/bengaluru-district-administration-introduces-fixed-rates-for-water-tankers; https://www.thedailyjagran.com/india/bengaluru-water-crisis-bangalore-water-tanker-prices-increase-amid-emptying-borewel; https://www.thedailyjagran.com/india/karnataka-govt-launches-first-gpsenabled-water-tankers-in-bengaluru-know-price-deta; https://newsfirstprime.com/bengaluru/cauvery-pipes-state-tankers-loosen-bengalurus-tanker-mafia-grip-11836253

### consumables

Seeds, growing media, nutrients and IPM consumables for a 600-tower (54,000-site) hydroponic farm near Bengaluru, 2025-2026, INR, GST included

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Consumables per lettuce site per 40 days (1 crop) | 1.1 | 3.6 | 14 | INR per site per 40 days | Derived from the lines above |
| Nutrient solution cost, leafy greens (EC about 1.8-2.0) | 90 | 170 | 670 | INR per 1,000 L incl. GST | Derived from the salt lines. Costing recipe per 1,000 L: calcium nitrate 0.84 kg, potassium nitrate 0.40 kg, MKP 0.20 kg, MgSO4 0.46 kg, Fe-EDTA 21 g, trace mix |
| Lettuce seed, pelleted hybrid (Rijk Zwaan 5,000-pill packs) | 0.4 | 1.15 | 1.87 | INR per seed | Desikheti RZ 5,000 packs: Patagonia 2,015; Kristine 4,240; Mondai/Maximus 4,770; Levistro 5,675; Locarno/Concorde 7,050; Rex 7,950 (https://www.desikheti.com/co |
| IPM and sanitation total (about 1,000 m2) | 1200 | 4500 | 13500 | INR per month per 1,000 m2 | Derived from the trap, neem, Bt, Beauveria, H2O2 and hypochlorite lines. Estimates added: gloves and boot covers Rs 800; beneficial insects Rs 2,500 in the high |
| First consumables stock for 54,000 sites (one-time) | 120000 | 400000 | 1050000 | INR | Derived from the lines above |

Sources (first of 65): https://www.desikheti.com/collections/buy-lettuce-seeds-online-at-best-price/products.json; https://www.desikheti.com/collections/rijk-zwaan-lettuce-seeds-buy-online/products.json; https://www.desikheti.com/collections/enza-zaden/products.json; https://www.bighaat.com/collections/rijk-zwaan

### labour

Labour, minimum wages, security guard and CCTV costs for a 600-tower (and 150-tower) hydroponic farm near Bengaluru, 2026

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Min wage: Employment in Agriculture & Related Works (Karnataka, 1 Apr 2026-31 Mar 2027) | 14299.16 | 14299.16 | 14299.16 | INR/month (26 days x 8 h) | Karnataka Labour Commissioner, MW & VDA 2026-27, Notif. KAE 228 LWA 2018: https://karmikaspandana.karnataka.gov.in/uploads/media_to_upload1774347727.pdf |
| Uniform min wage, unskilled, incl. VDA (22 May 2026, KA 411 LWA 2023) | 20350.16 | 20350.16 | 22282.1 | INR/month (26 days) | Basic Rs 19,319.36 (Z3) / 21,251.30 (Z2) / 23,376.43 (Z1): https://ascent-hr.com/notification/minimum-wages-basic-revision-karnataka-220526/ and Deccan Herald 2 |
| Agency night guard, 12-h shift, 30 nights: fully compliant cost | 56294 | 72330 | 85709 | INR/month per post | Calculated: daily min wage x 60 (4 h/night overtime at 2x plus 4 relief nights), + EPF 13% (capped), ESI 3.25% if wage <= Rs 21k, bonus 8.33%, leave 5%, uniform |
| Resident caretaker, 7 days a week (4 rest days paid at 2x) | 18699 | 26612 | 29138 | INR/month plus free quarters | Calculated from the agriculture rate (Rs 14,299.16) and the uniform unskilled Zone 3 / Zone 2 rates. Rest-day and overtime work at 2x per the 22 May notificatio |
| Labour hours per 1,000 plant sites per cycle (all tasks) | 22 | 38 | 58.5 | hours/1,000 sites/cycle | UKY CCD-CP-63: ~180 h per turn for 5,900 heads = ~30.5 h/1,000 (https://ccd.uky.edu/sites/default/files/2024-11/ccd-cp-063_hydroponic-lettuce.pdf). Freight Farm |
| Headcount: 600 towers (54,000 sites, ~1,350 harvests/day) | 6 | 11 | 17 | persons | Calculated: sites x hours/1,000/cycle / 40 days x 7 / 48 h per week x 1.10 absence = 4.8 / 8.2 / 12.7 production FTE |
| Market wage: trained hydroponic grower/supervisor | 24407 | 32000 | 45000 | INR/month | estimate: skilled Zone 3 floor Rs 24,407. Bengaluru operations/supervisor postings on apna pay Rs 20-45k (shift supervisor Rs 20-26k, area manager Rs 35-45k). |

Sources (first of 47): https://karmikaspandana.karnataka.gov.in/64/minimum-wages-rates-for-the-year-2026-27/en; https://karmikaspandana.karnataka.gov.in/uploads/media_to_upload1774347727.pdf (Agriculture MW & VDA 2026-27); https://karmikaspandana.karnataka.gov.in/uploads/media_to_upload1744032984.pdf (Agriculture MW & VDA 2025-26); https://karmikaspandana.karnataka.gov.in/uploads/media_to_upload1774351875.pdf (Security Agency MW 2026-27)

### lettuce

Lettuce and salad greens in 90-site vertical towers near Bengaluru: cycle times, tower yields, losses, season limits, channel prices and revenue per site per 40 days

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Tower vs horizontal hydroponics: shoot fresh weight | 74 | 95 | 138 | g per plant | Touliatos et al. 2016, Food and Energy Security, PMC5001193 (Little Gem, indoor, 20 plants per tower) |
| Tropical greenhouse tower, green-leaf romaine at 30 DAT | 60.5 | 78.6 | 89.42 | g per plant | CIGR Journal 26(1) 2024, Philippines, vertical aeroponic tower with root-zone cooling |
| Indian indoor tower trial (Dapoli, 36 sites) | 53 | 53 | 53 | g per plant | Jain et al. 2025, Int. J. Research in Agronomy 8(7):126-129 (Dapoli, Maharashtra) |
| Sellable weight per site, loose-leaf lettuce in 90-site towers (base for this study) | 50 | 85 | 140 | g per site per harvest | estimate: from tower studies above, adjusted for 90-site density and Bengaluru climate |
| HoReCa price, romaine (Hyperpure) | 180 | 184 | 184 | INR per kg | hyperpure.com Bengaluru (Rs 184/kg, 250 g); other warehouse Rs 180/kg; 29 Sep 2026 |
| Retail shelf, hydroponic live-root heads (BigBasket) | 61 | 67 | 85 | INR per head (125-200 g) | bigbasket.com/ss/lettuce, read 29 Sep 2026 (default city cookie id 1, believed Bengaluru) |
| Seed-to-first-sale lead time | 33 | 48 | 71 | days | derived: nursery + tower days |

Sources (first of 32): https://pmc.ncbi.nlm.nih.gov/articles/PMC5001193/ (Touliatos et al. 2016, tower vs horizontal lettuce; verified 95 +/- 6; https://cigrjournal.org/index.php/Ejounral/article/view/8435 (CIGR J. 2024, Philippines tower romaine 60.5-78.6 g at 30 ; https://www.agronomyjournals.com/archives/2025/vol8issue7S/PartB/S-8-7-20-352.pdf (Jain et al. 2025, Dapoli tower, 1.9 k; https://pmc.ncbi.nlm.nih.gov/articles/PMC10322904/ (ICAR-IARI iceberg vertical NFT, 3-week nursery, 45 DAT, 275.5-393 g;

### herbs

Culinary herbs in 90-site vertical towers near Bengaluru: tower fit, yields per site, losses, prices by sales channel, and ranking by revenue per site per 40 days

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Genovese basil: sellable yield at steady state | 17 | 49 | 123 | g/site/40 days | ZipGrow Quick Crops Guide 2020 (basil 7–10 oz/ft/harvest, regrowth 2–3 wk), https://zipgrow.com/quickcropsguide/ ; scaled to a 90-site tower; estimate |
| Basil HoReCa price, Bengaluru | 120 | 150 | 200 | INR/kg | Hyperpure Bengaluru 'Basil Leaves, 100 gm' ₹15 (29 Sep 2026) https://www.hyperpure.com/ind/bengaluru/exotic-vegetable ; BigBasket Italian basil 100 g ₹12 / 1 kg |
| Basil premium retail price, Bengaluru | 550 | 750 | 1100 | INR/kg | OnlyHydroponics BLR ₹75/100 g, ₹149/250 g https://www.blr.onlyhydroponics.in/products/hydroponic-basil ; Healthy Buddha ₹55/50 g; Trikaya ₹89/100 g (out of stoc |
| Revenue per site per 40 days: basil at HoReCa price | 2.1 | 7.3 | 24.5 | INR/site/40 days | calculation: yield × price (scratchpad herbs/herb_calc.py) |
| Basil downy mildew: crop loss in a monsoon outbreak | 0 | 15 | 100 | % of basil crop | Cornell: can cause complete crop loss; suppression needs canopy RH below 85% https://www.vegetables.cornell.edu/pest-management/disease-factsheets/basil-downy-m |
| Suggested herb sites at start (backed by orders) | 1000 | 2500 | 5000 | sites | estimate: 2,000 basil sites ≈ 98 kg per 40 days (≈2.4 kg/day); all 54,000 sites ≈ 66 kg/day |

Sources (first of 24): Floruvi repo retail benchmarks: /Users/syedabdulmuqeeth/Developer/SandBox/floruvi.farm/docs/pricing-benchmarks.csv; Hyperpure Bengaluru (HoReCa) exotic vegetables, 29 Sep 2026: https://www.hyperpure.com/ind/bengaluru/exotic-vegetable; Hyperpure Bengaluru leafy vegetables (coriander, mint, dill): https://www.hyperpure.com/ind/bengaluru/leafy-vegetables-1; Hyperpure Bengaluru thyme 100 g: https://www.hyperpure.com/ind/bengaluru/thyme-100-gm

### greens

Kale, Swiss chard, Asian greens and Indian greens in 90-site vertical towers near Bengaluru: agronomy, losses, channel prices and revenue per site per 40 days (research date 29 Sep 2026)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Curly kale: sellable yield per site per 40 days (steady state) | 16 | 44 | 79 | g/site/40 d | estimate: model (first pick 38 d after transplant, pick every 10 d for 100 d, 18 g/pick, 12% loss). Anchors: PMC12992682 (kale in towers 18.7-22.3 g/plant at 30 |
| Pak choi: sellable yield per site per 40 days | 25 | 64 | 127 | g/site/40 d | estimate: single harvest 32 d after transplant, 60 g baby head when all 90 sites are planted, 12% loss. Anchors: ZipGrow guide (5-6 wk in tower, full harvest);  |
| Hyperpure B2B price, curly kale, Bengaluru | 140 | 144 | 160 | INR/kg | https://www.hyperpure.com/ind/bengaluru/search/kale (Kale Curly 250 g Rs 36, 29 Sep 2026) |
| Hyperpure B2B price, bok choy, Bengaluru | 134 | 136 | 150 | INR/kg | https://www.hyperpure.com/ind/bengaluru/exotic-vegetable (Bok Choy 500 g Rs 68, 29 Sep 2026) |
| Farmers' market modal price: palak/spinach, amaranth, methi (Sep 2026) | 20 | 27 | 35 | INR/kg | Agmarknet data via https://www.kisandeals.com/mandiprices/AMARANTHUS/KARNATAKA/ALL (and SPINACH, METHI(LEAVES) pages), 25 Sep 2026 |
| Per-plant yield penalty: vertical tower vs horizontal system | 0.23 | 0.31 | 0.42 | fraction | https://pmc.ncbi.nlm.nih.gov/articles/PMC12992682/ (kale -23% and -42%); https://pmc.ncbi.nlm.nih.gov/articles/PMC5001193/ (lettuce 95 g vs 138 g, -31%) |

Sources (first of 51): https://www.hyperpure.com/ind/bengaluru/search/kale; https://www.hyperpure.com/ind/bengaluru/exotic-vegetable; https://www.hyperpure.com/ind/bengaluru/leafy-vegetables-1; https://www.hyperpure.com/ind/bengaluru/indian-vegetables-1

### strawberry_micro

Strawberries in vertical towers and microgreens as a quick-cash line for Floruvi, Bengaluru (2026 data, INR)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Strawberry marketable yield per tower plant per season | 60 | 150 | 330 | g/plant/season | Hutchinson et al. 2025 Front Plant Sci (tower max about 60 g marketable); Sahana 2020 and Nithin 2020 IJCMAS (Karnataka polyhouse, Winter Dawn, 229-366 g); Menz |
| Microgreen sellable yield per 10x20 inch tray (weighted mix) | 134 | 208 | 300 | g/tray | Di Gioia et al. 2023 Front Plant Sci (radish 2,259, sunflower 1,657, broccoli 1,461, mustard 1,082, amaranth 897 g/m2); Poudel et al. 2023 (pea about 2,800 g/m2 |
| Microgreen blended realised price (model) | 700 | 1000 | 1400 | Rs/kg | Calculation from channel mix (HoReCa, D2C retail, live trays) |
| Microgreen break-even blended price | 680 | 700 | 730 | Rs/kg | Calculation at base yields, costs, labour and fixed costs |
| Microgreen monthly cash profit at 100 trays/week | -26100 | 24500 | 117300 | Rs/month | Calculation: 433 trays/month, 1 worker, fixed costs Rs 4,500 |
| Microgreen volume a new seller can sell in Bengaluru by month 3 | 8 | 20 | 40 | kg/week | Estimate: 8-15 cafe/restaurant accounts at 0.5-1.5 kg/week plus 30-80 D2C buyers. The market already has NayaGreens, Nutriofarms, Trikaya and BigBasket fresho |

Sources (first of 41): https://doi.org/10.3389/fpls.2023.1220691; https://doi.org/10.3389/fpls.2023.1177844; https://doi.org/10.3389/fpls.2025.1469430; https://doi.org/10.1080/14620316.2024.2449026

### prices

Bengaluru produce price sheet by sales channel (2025–2026): wholesale/aggregator, HoReCa, modern retail/quick commerce, direct-to-consumer

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| HoReCa price: Hyperpure Bengaluru loose-leaf / romaine / lollo rosso lettuce | 140 | 192 | 216 | ₹/kg | hyperpure.com/ind/bengaluru/lettuce-green-curly-leafy-250-gm, /lettuce-romain-250-gm, /lettuce-loloroso-red-250-gm (read 29 Sep 2026) |
| Farm-gate / trader asking price: soil lettuce near Bengaluru | 35 | 50 | 65 | ₹/kg | TradeIndia listings: Star Vegetables and O M R Exports (Bengaluru), RKG Greenfarm (Ooty); tradeindia.com/manufacturers/romaine-lettuce.html |
| Farm-gate / B2B asking price: hydroponic or greenhouse lettuce | 80 | 110 | 140 | ₹/kg | TradeIndia: IRLES Hydro Fresh, Bidar, Karnataka (lollo rosso ₹90, green lettuce ₹110); Tfarm ₹80–100; Tarkari ₹100–120; GROWLOC ₹140 |
| Shelf price: BigBasket hydroponic live-root lettuce head (125–200 g) | 61 | 67 | 85 | ₹/head | bigbasket.com/ss/lettuce/ (logged-out default, city id 1 = Bengaluru), read 29 Sep 2026 |
| Floruvi list price ÷ Bengaluru shelf price | 1.4 | 2.3 | 8.6 | ratio | calculation: docs/pricing-benchmarks.csv vs BigBasket shelf prices |
| Payment term: HoReCa direct | 0 | 15 | 45 | days of credit | estimate; Hyperpure's web app includes pay-later / credit-line payment modules, so restaurants are used to buying on credit |

Sources (first of 29): https://www.hyperpure.com/ind/bengaluru/exotic-vegetable; https://www.hyperpure.com/ind/bengaluru/leafy-vegetables-1; https://www.hyperpure.com/ind/bengaluru/lettuce-rocket-argula-250-gm; https://www.hyperpure.com/ind/bengaluru/lettuce-loloroso-red-250-gm

### demand

Bengaluru demand, competition and sales ramp for a 600-tower hydroponic farm (Floruvi), checked 29 Sep 2026

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Volume a new grower can sell at the target price: month 3 | 30 | 95 | 175 | kg/week | calculation (same method) |
| Volume a new grower can sell at the target price: month 12 | 180 | 400 | 655 | kg/week | calculation (same method) |
| Active business accounts: month 12 | 20 | 40 | 65 | accounts | estimate; for comparison, Deep Rooted (a funded team with 100 acres of greenhouses) reached 120+ restaurants before it shut (Entrackr) |
| Bengaluru lettuce market, all channels | 15 | 25 | 40 | tonnes/week | estimate: about 3,000 outlets × about 4 kg of lettuce a week, plus burger and sandwich chains, plus shops and apps |
| Share of harvest sold at the target price: 600 towers, month 6 | 6 | 16 | 27 | % of harvest | model: production reaches 400, 1,000 and then 1,275 kg/week in months 1–3 |
| Loss as % of revenue at funded Indian fresh-produce companies | 16 | 62 | 152 | % of revenue | Entrackr: Ninjacart FY25 ₹256 crore loss on ₹1,634 crore; Clover Ventures (Bengaluru) FY22 ₹27.45 crore on ₹44.34 crore; WayCool FY23 ₹686 crore on ₹1,251 crore |

Sources (first of 42): Method note: the web-search allowance for this session (200 of 200 searches) was used up before this task began. All evi; https://www.hyperpure.com/ind/bengaluru/exotic-vegetable; https://www.hyperpure.com/ind/bengaluru/lettuce-rocket-argula-250-gm; https://www.hyperpure.com/ind/bengaluru/search/kale

### logistics

Packaging, cold chain, delivery and channel onboarding for the Floruvi tower farm, Bengaluru (checked 29 September 2026)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Borzo multi-drop B2C loop (12-15 drops, 15-40 km from the farm) | 54 | 62 | 86 | INR per drop | Calculated from the Borzo Bengaluru tariff. The pricing formula is assumed, and Borzo says route difficulty changes the price |
| Porter three-wheeler daily HoReCa loop (8-10 drops, about 50-60 km) | 900 | 1300 | 1900 | INR per day | Estimate: Porter ₹205 base fare + ₹15-25/km + waiting time |
| B2C delivered cost per drop, own two-wheeler | 51 | 85 | 127 | INR per drop | Calculated from the route cost above at 25, 15 and 10 drops a day × 26 days |
| HoReCa delivered cost per kg, own EV three-wheeler | 5.6 | 14 | 28 | INR per kg | Calculation: ₹36,300/month (driver ₹24k + ₹2k statutory, EMI ₹6,864, charging about ₹930 at 0.1 kWh/km × ₹5.5, insurance ₹1,250, maintenance ₹800) ÷ 250, 100 or |
| Walk-in cold room, 8×8×8 ft (about 2 t, +2 to +8 °C), installed | 180000 | 260000 | 380000 | INR, GST included | TradeIndia listings: Green Air Trading, Bengaluru, 10×10×10 ft, 1-3 t, ₹1.5 lakh (https://www.tradeindia.com/products/vegetable-storage-cold-room-c10427168.html |
| Quick-commerce onboarding (Blinkit, Zepto, Instamart) | 7 | 30 | 60 | days to first purchase order | docs/22-growth-channels-research.md, checked 27 September 2026: https://seller.blinkit.com/faq, https://seller.blinkit.com/fees-commission, https://brands.zepto |

Sources (first of 64): https://borzodelivery.com/in/tariffs (Bengaluru region set through https://borzodelivery.com/in/bangalore), fetched 29 S; https://borzodelivery.com/in/for_small_business; https://borzodelivery.com/in/business-api/doc; https://porter.in/trucks/bangalore

### export

Fresh-produce export from Bengaluru (BLR) to the UAE and GCC for Floruvi hydroponic herbs and leafy greens: steps, costs, prices, timeline, payment risk, merchant export, and a 90-day pilot (checked 29 Sep 2026)

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| Time from 30 Sep 2026 to first paid export shipment | 35 | 75 | 150 | days | estimate: registrations 1–3 weeks, FSSAI up to 60 days, buyer search 2–12 weeks, tests 1–2 weeks |
| Landed cost CPT Dubai, Floruvi basil, 200 kg lot | 301 | 579 | 1399 | INR per sellable kg | model built from the items above; product valued at a domestic Rs 150/250/350 per kg |
| Export margin over domestic sale, basil (200 kg lot) | -148 | -52 | 150 | INR per kg | model: base landed cost vs CIF USD 4.5/5.5/7.6 |
| Export margin, leaf lettuce by air (200 kg lot) | -186 | -123 | -33 | INR per kg | model vs EU-origin CIF USD 4.87–6.46 |
| FSSAI Central licence, Trader/Merchant – Exporter | 7500 | 7500 | 7500 | INR per year | FoSCoS Kind of Business eligibility, revised 2 Apr 2026 |
| APEDA RCMC (e-RCMC on DGFT portal) | 5900 | 5900 | 5900 | INR per 5 years incl. 18% GST | APEDA circular, Registration_Procedure.pdf (apeda.gov.in, 2026-06 upload) |

Sources (first of 37): https://apeda.gov.in/sites/default/files/documents/2026-06/Registration_Procedure.pdf; https://apeda.gov.in/RCMC; https://www.dgft.gov.in/CP/index.jsp?opt=e-rcmc; https://content.dgft.gov.in/Website/dgftprod/62923d1c-9384-4416-abab-7d9cf488c156/2K_Updated.pdf (via repo docs/22 S91)

### finance_risk

Subsidies, finance, legal and tax rules, and failure modes for a 600-tower hydroponic farm near Bengaluru (Floruvi), checked 29 Sep 2026

| Item | Low | Base | High | Unit | Source |
| --- | ---: | ---: | ---: | --- | --- |
| AIF effective borrower interest rate | 5.5 | 6 | 9 | % p.a. | SBI Agriculture Segment Interest Structure as on 15-09-2026 (AIF loan: 9.00% fixed up to Rs 2 crore); AIF FAQ (9% cap on rate of interest) |
| Non-AIF bank term loan rate (polyhouse/horticulture) | 9 | 10.7 | 12.3 | % p.a. | SBI Agriculture Segment Interest Structure 15-09-2026; SBI MCLR w.e.f. 15-09-2026 (1-year 8.70%); RBI policy repo 5.25% |
| NHB and NHM minimum protected area per beneficiary | 4000 | 4000 | 4000 | m2 | MoA&FW (MIDH) letter dated 12-08-2025; NHB Operational Guideline Jan 2025 ('areas exceeding 4000 sq m') |
| Time from application to subsidy cash: MIDH/NHM (state) | 4 | 9 | 18 | months | estimate from the Karnataka MIDH 2025-26 process (FRUITS/HASIRU selection within district targets, work order, build, inspection) and the Telangana 2-instalment |
| Deployable capital after commitments and reserve | 800000 | 1060000 | 1260000 | INR | Computed: Rs 20 lakh - Rs 4.4 lakh (11 x Rs 40,000 to Aug 2027) - reserve of Rs 7.6 / 5 / 3 lakh |
| Crop loss from a root-disease outbreak (per affected system) | 20 | 50 | 100 | % of plants on the affected reservoir | University of Kentucky CCD-CP-63 Hydroponic Lettuce (complete loss possible; no registered fungicides); low and base = estimate |

Sources (first of 29): https://nhb.gov.in/writereaddata/MIDH_Guidelines.pdf (MIDH Operational Guidelines, April 2025); https://nhb.gov.in/online_application_nhb_scheme_2020_21.aspx?&menu.Menu=30124 (NHB scheme guidelines page: Public Circu; https://agriinfra.dac.gov.in/Content/DocAttachment/FINALSchemeGuidelinesAIF.pdf (AIF Revised Scheme Guidelines, Sept 202; https://agriinfra.dac.gov.in/Home/FAQs

## 22. Review decisions

| ID | Reviewer | Severity | Issue | Decision | Reason |
| --- | --- | --- | --- | --- | --- |
| A1 | numbers audit | critical | Owner-case profit comes from illegal or physically impossible figures. | accept | Evidence holds (legal floors, physical bills). Added a 'your plan at legal-minimum cost' column beside your figures at every size, plus break points per figure. |
| A2 | numbers audit | critical | 200-tower owner result is a month-12 steady state that ignores funding. | accept | Month-by-month runs of 200 towers now at each cost basis with an automatic AIF loan; demand month shown; EBITDA - commitment - EMI line. |
| A3 | numbers audit | critical | Rs 10,000 night guard is below the legal minimum. | accept | Labour research: 60 day-wages at Rs 549.97 = Rs 33,000 for a 12-h post. Legal-minimum case uses it above 150 towers; no separate guard up to 150. |
| A4 | numbers audit | critical | Model not valid above about 1,000 towers. | accept | Added step costs: sites, generators per 12 kW of backup, cold rooms and pack houses per 600 towers, fences by perimeter, HT supply at 150 kW+ (HT-2(a), verified in the tariff book), HT-type metering 50-150 kW, supervisors, EPF/gratuity, lined ponds, RO units, supplier-limited build time. Land lease is not costed (rent unknown) and is flagged. |
| A5 | numbers audit | major | Production labour understated by about 27-29%. | accept | Research rates are per turn; the model's own harvest speeds imply 49 h. Base now 49 h (32/75). |
| A6 | numbers audit | major | Rs 40,000 of helpers runs only about 150-190 towers. | accept | Check now in the model: about 138 towers (uniform wage), 185 (agriculture wage), 132 in the first cycles. |
| A7 | numbers audit | major | Rs 10,000 power runs only about 79 towers. | accept | Model check: 79 towers with kit pumps, 151 with block pumps. |
| A8 | numbers audit | major | Rs 10,000 tanker water supplies only about 70 towers with RO. | accept | With the accepted hot-month factors the model gives about 51 towers (102 without RO; 30 in April). |
| A9 | numbers audit | major | 'No repairs' ignores about Rs 78 per tower per month. | accept | Legal-minimum case: Rs 0 for 6 months after the build, then research values (Rs 75/tower + structure 1.5%/year). |
| A10 | numbers audit | major | Rs 15,000 caretaker is legal only for 6 days x 8 h. | accept | Legal-minimum case uses Rs 18,699 (7 days, agriculture rate). |
| A11 | numbers audit | major | Overrides deleted RO consumables and the FSSAI fee. | accept | Owner case keeps both at research values; all unmentioned items are listed. |
| A12 | numbers audit | major | Rs 0 insurance, accounting and marketing is not fully possible. | accept | Owner column keeps your zeros; legal-minimum case adds insurance and a CA when a loan is used, FSSAI, and samples/travel. |
| A13 | numbers audit | major | HoReCa delivery Rs 14/kg used far below 100 kg/day. | accept | Rs 38/kg up to 40 kg/day, linear to Rs 14 at 100 kg/day; trading volume shares the route in plans with trading. |
| A14 | numbers audit | major | Water use and tanker price flat all year. | accept | Water use x1.5 in Mar-May, tanker price x1.5 in Feb-May (annual tanker bill +35%). |
| A15 | numbers audit | major | Break-even stated on an 'every kg sold' basis. | accept | Break-even is now demand-limited; the every-kg-sold table is labelled as such. |
| A16 | numbers audit | major | Peak-season head weights above the best published tower result. | partial | Kept 80 g as the annual value because the lettuce research (80-100 g, adjusted for Bengaluru) and climate research (100 g year average) state year-round figures. Added the conflict note and a 'yield -20%' case beside base in every summary. |
| A17 | numbers audit | minor | Caretaker credited with a full shift, night presence and microgreens. | accept | Credit 0.8 FTE; extra work is paid as helper time. |
| A18 | numbers audit | minor | EBITDA labelled 'cash profit' although working capital makes cash flow negative. | accept | Labelled 'EBITDA (before working capital)'; operating cash flow shown beside it. |
| A19 | numbers audit | minor | 600-tower EMI applies the AIF rate to the whole gap. | accept | AIF on capex only (min(90% of capex, capex - own cash)); reserve at the bank rate. |
| A20 | numbers audit | minor | Rain case uses a 2,000 m2 roof the model does not have. | accept | Rain share = own roof area x rain x runoff / demand, capped at 62%. |
| A21 | numbers audit | minor | Registrations low value cannot pay the FSSAI central licence. | accept | Low raised to Rs 12,000. |
| A22 | numbers audit | minor | Crop ranking revenue includes unsold produce. | accept | Revenue shown as net sales; contribution unchanged by this presentation fix. |
| A23 | numbers audit | minor | First harvest assumes power and seedlings are ready. | accept | Transplant = latest of structure ready + assembly, grid connection live, sowing + nursery days. |
| A24 | numbers audit | minor | EPF and gratuity missing. | accept | EPF 13% of min(wage, Rs 15,000) at 20+ staff; gratuity 4.81% at 10+. |
| A25 | numbers audit | minor | Owner as grower unrealistic above about 150 towers. | accept | Legal-minimum case: owner grows up to 150 (stretch 200); paid grower above; supervisors above 600. |
| A26 | numbers audit | minor | Recommended plan's profit rests on estimates (microgreens, trading). | accept | Dependency stated; runs without microgreens and without trading; gate before the microgreens step-up. |
| R1 | market/operations | critical | Capital breaks before the first step. | accept | Model: 200 towers Rs 50.9 lakh vs Rs 12.6 lakh usable; EMI above EBITDA even at your figures. |
| R2 | market/operations | critical | 200 -> 6,000 towers by March 2027 is not possible. | accept | Step-by-step test added; every resource breaks; gated path added. |
| R3 | market/operations | critical | Output far above demand; prices held fixed at large volumes. | accept | Price cut above 400 towers (full 30% at about 1,200 towers); path towers capped by demand. |
| R4 | market/operations | critical | Owner figures make 200 towers look profitable. | accept | Three cost bases side by side. |
| R5 | market/operations | critical | No plan makes a cash profit by December 2026. | accept | Confirmed by the month-by-month runs; December goal reset to sales milestones. |
| R6 | market/operations | major | Guard and caretaker below minimum wage at any size. | accept | See A3 and A10. |
| R7 | market/operations | major | Rs 10,000 water supports about 64 towers. | accept | See A8. |
| R8 | market/operations | major | Rs 10,000 power supports about 79 towers; HT above 150 kW. | accept | HT-2(a) Rs 350/kVA + Rs 6.60/kWh confirmed in the BESCOM 2026-28 tariff book; applied per site at 150 kW+. |
| R9 | market/operations | major | Rs 40,000 helpers run about 140-190 towers. | accept | See A5 and A6. |
| R10 | market/operations | major | Repairs, insurance, fees and samples cannot be zero. | accept | See A9, A11 and A12. |
| R11 | market/operations | major | Owner is grower, manager and the only salesperson. | accept | Kept as advice and pain point (sales help at 10+ accounts, paid grower above 150-200, mentor); not costed in base because the size is an estimate. |
| R12 | market/operations | major | D2C profit depends on the Rs 99 fee and month-12 route density. | accept | Fee cases Rs 0/40 added; thin-route drop cost from the Borzo tariff when above Rs 85. |
| R13 | market/operations | major | Tower heads are small; 200-tower mix over-supplies crops early. | partial | Advice accepted (sell by weight, alternate sites, chef approval). Per-crop monthly caps not added: the whole-farm demand cap binds first at those sizes and those plans are already rejected. |
| R14 | market/operations | major | Grid, AIF and channel set-up can each add 1-4 months. | accept | Grid connection in the timing; AIF 30-120 days in the path; bulk buyers only from sales month 3. |
| R15 | market/operations | major | Backup power undersized. | accept | Generator rental on shutdown days up to 200 towers; generators sized to 50% of pump load above. |
| R16 | market/operations | major | Scale-up lands in the worst season. | accept | Path adds capacity only for Oct-Nov planting. |
| R17 | market/operations | major | Owned land holds about 1,500-1,600 towers; rent-free plot is a trap. | accept | Model: 1,596 towers on owned land; leased block beyond. |
| R18 | market/operations | major | Grower skill, tower design at scale, hardware quality. | accept | Pain points and gates. |
| R19 | market/operations | major | Results above about 600 towers not reliable. | partial | Step costs and HT tariff added. Output is not cut in the owner column when paid staff are too few; instead the checks show how many towers your staff budget can run. |
| R20 | market/operations | major | Phase 1 has no stop-loss. | accept | Stop rules written into the plan. |
| R21 | market/operations | minor | Microgreens demand/price optimistic; a room must exist. | accept | Start at 50 trays; step up only after 15 kg/week at Rs 700/kg for 4 weeks. |
| R22 | market/operations | minor | Trading earns little; export cannot pay within 90 days. | accept | Advance payment; no export cash before Q2 2027. |
| R23 | market/operations | minor | Steady-state tables read as near-term profit. | accept | Earliest dates and month-by-month results printed next to steady values. |
| R24 | market/operations | minor | No case pays the owner; replacement spending skipped. | accept | Owner drawing (Rs 30,000) and profit after depreciation shown in the path. |

Not modelled or rejected:

- A16 (partial): lettuce head weight kept at 80 g as a year-round value (lettuce and climate research both state year-round figures); a yield -20% case is shown instead.
- R13 (partial): per-crop monthly market caps not added; the whole-farm demand cap binds first and those large plans are already rejected.
- R19 (partial): owner-column output is not cut when the owner's staff budget is too small; the checks report how many towers that budget can run.
- Numbers audit option 'cap outputs at 1,000 towers': step costs were added instead, so 2,000 and 6,000 towers are costed (estimates beyond 600 towers).
- Land lease cost above about 1,600 towers not added: the rent is unknown (no research value); leaving it out flatters large farms, which lose money anyway.
- Running-cost contingency not added to base: base is the value to bet on; the conservative case and research ranges carry the buffer.
- Theft and animal-damage allowance not added: no research value for its size; listed as a pain point.

## 23. Self-checks and hand checks

- Capex lines add up to the capex total (every capex call; asserted in capex_summary): passed
- Monthly cost lines add up to the running-cost total (every steady state and the four cost tables): passed
- Revenue - variable costs - running costs = EBITDA (every steady state and profit table): passed
- Per 40 days = per month x 40 / 30.4 (every profit table): passed
- Cash balance rolls forward from Rs 20 lakh month by month (18 plans): passed
- The Rs 40,000 commitment is paid in M1-M11 (Oct 2026-Aug 2027) only (18 plans): passed
- Hand check of the Lollo Rosso crop line matches the model: passed
- Crop check (Lollo Rosso lettuce, base): 1.29 harvests per 40 days x 80 g x 0.9 x 90 sites x 0.9 occupancy = 7.53 kg per tower per 40 days. Gross Rs 242.0/kg + D2C fee Rs 61.0/kg - unsold Rs 20.6/kg - packaging Rs 17.7/kg - delivery Rs 76.8/kg - commissions Rs 5.3/kg, times kg, minus consumables Rs 364 = Rs 1011 per tower per 40 days. Model: Rs 1011 (difference Rs 0.00).
- Month check (M8, recommended plan): operating cash flow - capex - commitment - loan payments + loan draws = Rs -57,747; model balance change Rs -57,747. EBITDA rebuilt from its parts Rs 5,136; model Rs 5,136.

## 24. Where the research disagreed, and the choice made

- Lettuce head weight: the demand agent used 140 g per plant; the lettuce agent used 80-100 g for 90-site towers (tower trials 53-95 g). Base uses the lettuce agent (80 g Lollo Rosso, 90 g green oakleaf) because 90 sites per tower limit light.
- Kale yield: climate agent 45 g per cut, greens agent 18 g per pick (tower trial -23 to -42%). Base uses the greens agent (lower).
- Covered area per tower: 1.4 m2 + 18% (structure) vs 1.8 m2 + nursery and packing (towers). Base 1.9 m2 all-in (Tower Farms about 1.9; Agrotonomy 1.5-2).
- Structure: towers agent priced a shade-net house (Rs 710/m2); structure and climate agents require a rain-proof NVPH for the Jun-Nov monsoon. Base uses NVPH.
- Helper wage: agriculture minimum wage Rs 14,299 vs uniform notification Rs 20,350 (under High Court challenge). Base uses Rs 20,350 (conservative); low uses Rs 14,299.
- Night guard: market agency quotes Rs 30-45k skip overtime; the compliant cost is Rs 56-86k. Base uses Rs 72,330 above 150 towers; up to 150 towers a resident caretaker gives night presence.
- Microgreens profit: the specialist used Rs 16,000 per worker (agriculture wage + 12%); this model uses the same loaded helper cost as the farm (Rs 24,213). Standalone microgreens profit is therefore lower than the specialist's figure.
- Bulk-buyer price: 55-65% of the HoReCa price (demand) vs 60-75% of the shelf price (prices). Base uses 60% of the HoReCa price because bulk buyers such as Hyperpure buy bulk crates.
- Water: no borewell is confirmed. Base buys tanker water (Rs 125/m3 before RO losses). An existing borewell is a sensitivity case and changes the result a lot.
- Consumables: the consumables agent assumed pelleted Rijk Zwaan lettuce seed (about Rs 1.4 per site). Cheaper open-pollinated seed would lower costs but raise bolting and losses.
- Strawberries: consumables agent Rs 8.5 per site per 40 days (180-day stay) vs strawberry agent Rs 3.0 (year). Base Rs 3.9 per site per 40 days spread over the 365-day replant cycle.
- Price benchmarks: Floruvi list prices are research retail x 1.40 and are 1.4-8.6 times Bengaluru shelf prices. The model uses Bengaluru market prices, not Floruvi list prices.
- Peak head weight (numbers review): normalising season factors lifts Nov-Feb lettuce to 98-113 g, above the best published tower result (95 g, ideal indoor, 20 plants) and far above the Dapoli 36-site tower (53 g). The towers research warns full-size heads may need alternate sites (50-70% of nominal). The model keeps 80 g as the year-round value (lettuce research 80-100 g adjusted for Bengaluru; climate research 100 g year average) and shows 'yield -20%' beside base; the test module must measure it.
- Labour (numbers review): the labour research gives task hours per crop turn; v1 divided them by 40 days (38 h). v2 uses 49 h per 1,000 sites per 40 days, which matches the model's own harvest speeds.
- HoReCa delivery (numbers review): the logistics research's Rs 14/kg needs about 100 kg/day; v2 uses Rs 38/kg at 40 kg/day or less.
- Owner cost figures vs research (29 Sep 2026): kept exactly in the 'your costs' case; the legal-minimum case keeps your organisation but raises wages to the legal floor and uses real power and water bills.

