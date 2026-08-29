# V4 Engine Mapping

The demo models the production-shaped V4 sequence without its live provider
layer:

1. A clearly synthetic demo reference selects one local fixture.
2. `buildSyntheticV4Evidence` cleans the legal name, aliases, and legal form.
3. Synthetic filing rows are normalized into readable periods and statuses.
4. Synthetic public-record examples are compared to the normalized identity.
5. Strong or possible fixture matches can support an attributed observation;
   weak matches stay in the internal non-match trail.
6. The report presents only `FLAG`, `CLEAR`, and `NOTE`, alongside confidence,
   provenance, limitations, and unavailable evidence.

No stage calls a network, provider, database, authentication system, payment
system, or production Parakh service. The adaptation is intentionally smaller
than V4 because the demo has no authorized data source to execute against.
