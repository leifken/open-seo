# FJ-1-H1 Runde 1, Abschluss vom 21.10.2026

20 ursprüngliche Formatbefunde und elf Knip-Befunde beseitigt; 18 Dateien ausschließlich mit Prettier geändert, temporäre Hilfsskripte außerhalb des Projekts archiviert.
Ungenutzte Theme-Funktionen und Exporte entfernt; ausgeliefertes Theme-Initialisierungsskript bytegleich, keine neue Oberfläche.
Neustartprobe stabilisiert: echter Schreiberprozess endet vor dem Lesen im getrennten Elternprozess; sieben Speicherfälle und Fünf-Sekunden-Limit erhalten. Alter Shim bleibt in der Gegenprobe rot wegen fehlendem put.
Abnahme macOS: vollständiges ci:check grün, 249 Dateien/1.753 Tests grün, Speicher und echter Auditworkflow 8/8; origin/main c469a48a mit ci:check und 133 Dateien/1.113 Tests grün.
Abnahme Linux, Node 22/arm64 ohne externes Netz: vollständiges ci:check und 249 Dateien/1.753 Tests grün; keine neuen roten Testnamen.
Worker- und Node-Build auf beiden Systemen grün; Linux-Shellcheck, Variablenprüfung, Website-Typen/Build, 31 Schutztests und persistente Budgetprobe mit 50 parallelen Reservierungen grün.
Vorlauf offen dokumentiert: Neustartprobe einmal bei 5.441 ms rot; minimales Linux-Abbild zunächst ohne python3, deshalb 22 Deployfälle rot, nach ergänzter Voraussetzung ganze Suite grün.
Beleglücke: angegebene FJ-1-H1-ci-rot.txt fehlt, GitHub liefert keinen Zweiglauf. Tatsächliche ursprüngliche Linux-CI-Ursache deshalb nicht behauptet; lokale Pflichtfehler und Timeout eigenständig belegt.
Regelabgleich: ENTSCHEIDUNGEN.md neben dem Arbeitsplan fehlt; Leitungsfassung am Wurzelpfad desselben Arbeitsbaums gelesen, jüngere Selbstheilungs-/Leitungsregeln berücksichtigt. Kein Widerspruch für diese Reparatur.
Leitung vor Ausrollen: echten Zweiglauf nach eigenem Push samt Node-Port-Basis prüfen; Nachholsteuerung und fachlicher Wächter aus FJ-1 bleiben offene Betriebstore, keine Betriebsfreigabe.
Migrationen: nein. Pluginversion unverändert; keine neuen Werkzeuge oder Skill-Anweisungen, keine Prüfregel abgeschwächt und kein Test abgeschaltet.
Belege: .nacht-abnahme/fj-1-h1-r1/ABNAHME.md und Rohprotokolle; Fehlerbuch ergänzt. Nur eigene temporäre Prüfmittel bereinigt, Host bleibt unter 25 GiB frei.
Kein Push, Merge oder Deploy, keine Produktivdatenänderung oder bezahlter Aufruf; Commit ausschließlich auf rankmeister/fj-1.
