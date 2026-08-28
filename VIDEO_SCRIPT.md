# Two-Minute Demo Script

Hi, this is Parakh for Build What Moves India.

Parakh helps Indian businesses read counterparty evidence before money, goods,
or trust moves. The problem today is that checks are fragmented across filing
patterns, name variations, public records, screenshots, and portal results.

This demo is public and requires no login. It uses synthetic data only. It does
not access live government systems, private records, real GSTINs, PANs, Aadhaar
numbers, OTPs, payments, or production Parakh data.

I will choose a synthetic business scenario. The v4-style local engine accepts
the synthetic GSTIN-style identifier, loads local profile, filing, and
public-record fixtures, normalizes names, dates, periods, and parties, and then
opens a Parakh-style report page.

The report does not give a score or trust verdict. It uses only FLAG, CLEAR, and
NOTE observations. Each observation includes confidence, attribution, and source
provenance. The report also shows what Parakh could not find, so the product
does not pretend to know more than the evidence supports.

Now I can switch scenarios: a mostly clear business, delayed filings, name
mismatch, a public-record signal, and partial data. The partial-data case is
important because production systems should say less when the evidence is thin.

At scale, Parakh would require authorized APIs, consent-aware handling, audit
logs, rate limits, provenance, retention limits, security controls, and clear
human-readable limitations.
