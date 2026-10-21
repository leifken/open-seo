# FJ-1-H2, Abschluss vom 21.10.2026

Ursache der Rotmeldung belegt: Die Steuerung sucht pruefen.yml, das bisher nur als Unterworkflow von image.yml läuft; gh run list antwortet HTTP 404 statt mit einem roten Test.
Gegenbeleg: image.yml hat drei erfolgreiche Zweigläufe, zuletzt 39609295369 für 72220413; erneute reine Testreparatur wäre unbegründet.
Anderer Heilweg: eigener Push-Auslöser für rankmeister/\*\* und manueller Einstieg in pruefen.yml; vorhandene Prüfschritte, Image-Gate und übrige Einstiege erhalten.
Pflichtabnahme: ci:check einschließlich Format, Knip, beiden Typprüfungen, Oxlint 0/0 und Pluginsynchronität grün; Gesamtsuite 249 Dateien/1.753 Tests grün.
Frisch geholtes origin/main c469a48a: Merge bereits enthalten, gleiche Pflichtkette und 133 Dateien/1.113 Tests grün; keine neuen roten Testnamen.
Zusätzlich: acht echte Speicher-/Workflowfälle, sieben Zweig-Fixtures, actionlint, drei Shellskripte, Compose, Worker-Build beidseits und Node-Build grün.
Website: Typen, Build und 31 Schutztests samt persistenter Budgetprobe grün; Linux/Node 22 ohne Netz bestätigt alten get-TypeError, Fix und Prozessneustart.
Regelabgleich: benachbarte ENTSCHEIDUNGEN.md fehlt; zentrale Leitungsfassung verwendet. Jüngerer Heilauftrag ersetzt die alte Planungssperre; Kostenverbot bleibt. Fehlerbuch ergänzt.
Leitung vor Ausrollen: Workflowänderung ausdrücklich prüfen, Zweig pushen und eigenständigen pruefen.yml-Lauf am exakten neuen Commit abwarten; echte GitHub-Registrierung lokal ohne Push nicht nachweisbar.
Risiken: Zweige erhalten zusätzlich zum Image-Unterworkflow einen separaten Prüflauf. Gespeicherte Nachholung und fachlicher Wächter aus FJ-1 bleiben offene Betriebstore, keine vollständige Betriebsfreigabe.
Migrationen: nein. Pluginversion unverändert; keine neue Oberfläche und keine Bildschirmfotos erforderlich. Prüfkopien ohne Umgebungsdateien außerhalb des Projekts.
Belege: .nacht-abnahme/fj-1-h2/ mit Originalantworten, Vorher-/Nachherprobe und sämtlichen Rohläufen. Hostplatz anfangs 23 GiB, zuletzt 31 GiB; ausschließlich eigene Prüfkopien bereinigt.
Nur lokaler Commit auf rankmeister/fj-1; kein Push, Merge auf main, Deploy, Produktivdatenzugriff oder bezahlter Modellaufruf.
