# FJ-1, CI-Reparatur Runde 1 vom 21.10.2026

20 Formatbefunde und elf Knip-Befunde sind behoben. Die Prozessprobe liest nach Ende eines echten Schreiberprozesses im getrennten Elternprozess; das Zeitlimit und alle sieben Speicherfälle bleiben erhalten.

Lokale Pflichtkette und 1.753 Tests bestehen; origin/main besteht mit 1.113 Tests. Vollständige Linux-Abnahme und aktueller Abschluss stehen in docs/auftraege/FJ-1-H1-R1-abschluss.md. Der angegebene CI-Auszug fehlt, ein Zweiglauf ist bei GitHub nicht vorhanden. Die Leitung muss den veröffentlichten Zweiglauf prüfen.

Die Betriebstore aus dem vorherigen FJ-1-Auftrag bleiben offen. Kein Push oder Deploy.

## Vorheriger Stand

# FJ-1, 21.10.2026

Der persistente KV-Vertrag des Node-Speichers ist repariert. Der reguläre Auditworkflow ist mit HTTP-Fixtures und echten SQLite-Daten fachlich abgeschlossen. 1.753 Tests, Typen, Lint und beide Builds bestehen.

Der Zweig enthält die veröffentlichte Node-Port-Basis 8f9b480a. origin/main enthält diesen Port noch nicht. Die vollständige Pflichtkette bleibt wegen unveränderter Format- und Knip-Schuld der Produktivbasis rot.

Nachholung gespeicherter Originalaufträge und fachlicher Wächter sind noch nicht angeschlossen oder aktiviert. Das gesamte Paket erhält deshalb keine Betriebsfreigabe. Einzelheiten und Zahlen stehen in docs/auftraege/FJ-1-abschluss.md, Rohbelege in .nacht-abnahme.
