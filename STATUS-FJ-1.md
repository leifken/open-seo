# FJ-1, CI-Nachprüfung Runde 2 vom 21.10.2026

Die Meldung „Linux-CI rot“ ist nicht belegt: Der genannte Auszug fehlt. Der tatsächliche Linux-Prüfjob 119249823068 für 0173b9b4 ist vollständig grün; auch der anschließende Image-Job und der gesamte Lauf 39608194150 sind erfolgreich abgeschlossen. Vorgängerlauf 39605872627 ebenfalls grün.

Neue eigene Abnahme: vollständiges ci:check und 1.753 Tests grün, origin/main mit denselben Prüfungen und 1.113 Tests grün. Zusätzlich acht Speicher-/Workflowfälle, 31 Website-Schutztests mit persistenter Budgetprobe, beide App-Builds, Website-Typen/Build und Shellprüfungen grün. Keine neue Codekorrektur erforderlich, keine Prüfung geändert. Bericht: docs/auftraege/FJ-1-H1-R2-abschluss.md.

Die historischen Betriebstore für Nachholung und fachlichen Wächter bleiben offen. Keine Betriebsfreigabe, kein Push oder Deploy.

## Vorheriger Stand

# FJ-1, CI-Reparatur Runde 1 vom 21.10.2026

20 Formatbefunde und elf Knip-Befunde sind behoben. Die Prozessprobe liest nach Ende eines echten Schreiberprozesses im getrennten Elternprozess; das Zeitlimit und alle sieben Speicherfälle bleiben erhalten.

Lokale Pflichtkette und 1.753 Tests bestehen; origin/main besteht mit 1.113 Tests. Vollständige Linux-Abnahme und aktueller Abschluss stehen in docs/auftraege/FJ-1-H1-R1-abschluss.md. Der angegebene CI-Auszug fehlt, ein Zweiglauf ist bei GitHub nicht vorhanden. Die Leitung muss den veröffentlichten Zweiglauf prüfen.

Die Betriebstore aus dem vorherigen FJ-1-Auftrag bleiben offen. Kein Push oder Deploy.

## Vorheriger Stand

# FJ-1, 21.10.2026

Der persistente KV-Vertrag des Node-Speichers ist repariert. Der reguläre Auditworkflow ist mit HTTP-Fixtures und echten SQLite-Daten fachlich abgeschlossen. 1.753 Tests, Typen, Lint und beide Builds bestehen.

Der Zweig enthält die veröffentlichte Node-Port-Basis 8f9b480a. origin/main enthält diesen Port noch nicht. Die vollständige Pflichtkette bleibt wegen unveränderter Format- und Knip-Schuld der Produktivbasis rot.

Nachholung gespeicherter Originalaufträge und fachlicher Wächter sind noch nicht angeschlossen oder aktiviert. Das gesamte Paket erhält deshalb keine Betriebsfreigabe. Einzelheiten und Zahlen stehen in docs/auftraege/FJ-1-abschluss.md, Rohbelege in .nacht-abnahme.
