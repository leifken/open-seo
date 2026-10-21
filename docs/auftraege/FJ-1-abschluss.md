# FJ-1 Abschluss, Heilung 1 vom 21.10.2026

KV-Kernreparatur umgesetzt und geprüft; vollständiges Paketgrün und Betriebsfreigabe bleiben offen.
Ursache: neun bereitgestellte Fehler auf acht Domains; NodeDoStorage fehlen get/put, echter Auditworkflow reproduziert den TypeError.
Basis: origin/main c469a48a konfliktfrei abgeglichen; notwendiger veröffentlichter Node-Port 8f9b480a mit 343 vorhandenen Commits übernommen, nur auf rankmeister/fj-1.
Fix: additive persistente SQLite-KV-Tabelle, atomarer Upsert, strukturierte Kopien; SQL- und Alarmdaten erhalten.
Gegenprobe: alter Shim 7 Speicherfälle plus 1 vollständiger Workflow rot; Fix alle 8 grün, einschließlich Prozessneustart, Parallelität und 429-Wiederaufnahme.
Gesamtsuiten: origin/main 1.113/1.113, Produktivbasis 1.745/1.745, Reparatur 1.753/1.753; keine neuen roten Tests.
Typen App und BadSEO, Lint 0/0, Node- und Worker-Build, ShellCheck, Bash-Syntax, Compose und Plugin-Synchronität bestanden.
ci:check bleibt rot: dieselben 20 Formatbefunde und separat dieselben 2 Dateien/4 Exporte/5 Typen bei Knip wie auf 8f9b480a; origin/main ci:check grün. Keine Prüfung abgeschwächt.
Linux ohne Netzwerk: alter Originalfehler bestätigt; Fix übernimmt dieselbe Altdatei, erhält SQL/Alarm, übersteht Prozessneustart und bereinigt regulär, 2/2 positive Proben. Migrationen: keine Drizzle-Migration; interne SQLite-KV-Tabelle automatisch additiv. Keine neue Oberfläche, deshalb keine Bildschirmfotos.
Regelabgleich: ENTSCHEIDUNGEN.md neben ARBEITSPLAN fehlt; zentrale Ersatzfassung gelesen. Ältere Kostenfreigaben durch aktuelles Verbot eingeschränkt; frühere Planungssperre durch Heilauftrag ersetzt.
Leitung vor Ausrollen: Live-Zweig/Basisübernahme samt vorhandener Kontrollregeln prüfen, Format-/Knip-Schuld klären, Fix veröffentlichen und gespeicherte Aufträge einmalig über Rechte-, Budget- und Kapazitätsprüfung nachholen.
Offen: Anschluss des fachlichen Wächters und dauerhafte Nachholsteuerung mit drei unterschiedlichen Wegen, Leitungsmeldung und Tageserfolg; nur bestehende Crawl-Wiederaufnahme geprüft, kein vollständiger BullMQ/Postgres/Redis-Lauf.
Belege: .nacht-abnahme/ABNAHME.md und comparison.json; zentrale Übergabe und Fehlerbuch ergänzt. Keine bezahlten Aufrufe, Produktivzugriffe, Pushes oder Deploys; Host zuletzt unter 25 GiB frei.
