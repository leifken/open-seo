# Lokale Daten mit echtem Standort (SEO-5)

Stand 21.09.2026, Auftrag SEO-5 der Zentrale (für FS-15 und FS-18). Beschreibt die MCP-Werkzeuge, mit denen der Motor Suchvolumen, Suchergebnisse und Kartenraster je Stadt, Kreis oder Bundesland abfragt. Alle Änderungen sind additiv: Bestehende Aufrufe ohne die neuen Parameter verhalten sich wie vorher, mit einer Ausnahme beim Kartenraster (Abschnitt 4, Standardweg jetzt Warteschlange).

## 1. Orte angeben

Jedes ortsbezogene Werkzeug nimmt einen Ort als **Name oder Code**:

| Eingabe                                    | Ergebnis                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| `"Münster"`                                | Stadt Münster, 1004707                                    |
| `"Kreis Coesfeld"`, `"Landkreis Coesfeld"` | Kreis Coesfeld, 9117095 (Typ `District`)                  |
| `"Coesfeld"`                               | Stadt Coesfeld, 1004606 (ein bloßer Name meint die Stadt) |
| `"Kreis Borken"`                           | Kreis Borken, 9117068                                     |
| `"Nordrhein-Westfalen"`, `"NRW"`           | Bundesland, 20235 (Typ `State`)                           |
| `"Münster, Niedersachsen"`                 | Münster in Niedersachsen, 9048583                         |
| `1004707` oder `"1004707"`                 | wird unverändert übernommen                               |

Regeln: Umlaute sind egal (Google führt „Munster“, „Dulmen“). Deutsche Namen, die Google englisch führt (Köln, München, Nürnberg, Hannover, alle Bundesländer), werden übersetzt. „Kreis“, „Landkreis“, „Region“, „Städteregion“ oder eine Endung „-kreis“ wählen den Kreis. Mehrdeutige Namen nehmen den ältesten Google-Eintrag (in der Regel die größte Stadt) und nennen die übrigen unter `alternatives`. Unbekannte Namen brechen den Aufruf ab, **bevor** etwas kostet, und schlagen ähnliche Orte vor. Das Land kommt aus dem Projekt (Standard `de`), abweichend über `countryCode`.

Quelle ist die Standortliste von DataForSEO (`GET /v3/serp/google/locations/de`, kostenlos, 14.547 Einträge, identisch mit der Google-Ads-Liste). Ohne Postleitzahlen, Flughäfen und Hochschulen bleiben rund 6.500 Orte. **Zwischenspeicher:** Redis 30 Tage (Schlüssel `kv:geo-locations:v1:de`), dazu 6 Stunden im Prozess. **Aktualisieren:** `resolve_locations` mit `refresh: true` (kostenlos).

## 2. Werkzeuge

### `resolve_locations` (neu, kostenlos)

- `locations`: 1 bis 50 Orte, `countryCode?`, `refresh?`
- Liefert je Ort `locationCode`, `locationName`, `locationType`, `alternatives` oder einen Fehler. Nur dann `isError`, wenn kein Ort aufgelöst wurde.

### `get_keyword_volume_by_location` (neu)

- `keywords`: 1 bis 1.000 (je höchstens 80 Zeichen, 10 Wörter), `locations`: 1 bis 10 Orte, `countryCode?`, `languageCode?` (Standard: Projektsprache), `includeMonthlyTrends?`, `estimateOnly?`
- Quelle: Google Ads `keywords_data/google_ads/search_volume/live`, eine Anfrage je Ort. Liefert je Ort und Begriff `search_volume`, `cpc`, `competition`, `competition_index`, Gebote, optional `monthly_searches`. Keine Keyword-Schwierigkeit, keine Suchabsicht (dafür weiter `get_keyword_metrics` auf Landesebene).
- Fehler eines Ortes brechen den Rest nicht ab; `isError` nur, wenn alle Orte scheitern.
- Google Ads begrenzt DataForSEO-Konten auf etwa 12 Anfragen je Minute. Das Werkzeug fragt höchstens zwei Orte gleichzeitig ab; der Motor sollte große Mengen über mehrere Minuten verteilen.

### `get_serp_results` (erweitert)

- Je Abfrage neu: `location` (Ortsname oder Code), `countryCode?`. Hat Vorrang vor `locationCode`; die Sprache ist dann die Projektsprache.
- Ergebnis je Abfrage neu: `location` (Code, Name, Typ). `localPack` hat neu `cid`, damit der Motor denselben Betrieb in Raster und Profil wiederfindet.

### `get_local_serp_results` (erweitert)

- Neu `location` (Ortsname oder Code) und `countryCode?` als Alternative zu `near`. Genau eines von beiden angeben (bisher war `near` Pflicht, alte Aufrufe laufen unverändert).

### `get_local_rank_grid` (erweitert, siehe Abschnitt 4)

In allen ortsbezogenen Antworten steht in `meta` zusätzlich `locationCodes` (Liste der verwendeten Codes) und `locations` (Eingabe, Code, Name, Typ). Die echten Kosten stehen wie seit SEO-4 in `meta.costUsd` und `meta.costBreakdown`.

## 3. Kosten je Aufruf

| Aufruf                                      | Kosten (USD) | Herkunft                                                 |
| ------------------------------------------- | ------------ | -------------------------------------------------------- |
| `resolve_locations`                         | 0            | Standortliste ist kostenlos                              |
| Suchvolumen, 1 Ort, bis 1.000 Begriffe      | 0,09         | gemessen 21.09.2026 (Münster und Kreis Coesfeld je 0,09) |
| Suchvolumen, 3 Orte                         | 0,27         | 3 × 0,09                                                 |
| SERP je Ort, Tiefe 10                       | 0,002        | Listenpreis Live                                         |
| SERP je Ort, Tiefe 20 (Standard)            | 0,0035       | 0,002 + 0,0015 für Seite 2                               |
| Maps-SERP je Ort (`get_local_serp_results`) | 0,002        | Listenpreis Live, bis 100 Treffer                        |
| Raster 3×3, Warteschlange hoch              | 0,0108       | 9 × 0,0012 (gemessen)                                    |
| Raster 5×5, Warteschlange hoch              | 0,03         | 25 × 0,0012                                              |
| Raster 5×5, Warteschlange normal            | 0,015        | 25 × 0,0006 (Listenpreis)                                |
| Raster 5×5, live                            | 0,05         | 25 × 0,002                                               |
| Raster 7×7, Warteschlange hoch              | 0,0588       | 49 × 0,0012                                              |

Vorab schätzen: `get_keyword_volume_by_location` und `get_local_rank_grid` mit `estimateOnly: true` (kostenlos). Beim Raster verhindert `maxCostUsd` einen Lauf über Budget, ohne dass etwas berechnet wird.

## 4. Kartenraster für den Motor (FS-18)

**Aufruf:**

```json
{
  "projectId": "…",
  "keyword": "steuerberater",
  "target": { "cid": "7490381589319248868" },
  "center": { "latitude": 51.9625, "longitude": 7.6256 },
  "gridSize": 5,
  "radiusKm": 5,
  "maxCostUsd": 0.05
}
```

- `gridSize` 3 bis 7 (bisher nur 3 oder 5). Ungerade Größen legen einen Punkt genau auf die Mitte.
- Fläche über `radiusKm` (Mitte bis äußerste Reihe) **oder** `spacingKm` (Abstand zweier Punkte, Standard 2). Beides zugleich ist ein Fehler.
- `mode`: `queue` (neu, **Standard**) oder `live` (bisheriges Verhalten). `priority` im Warteschlangenweg: `high` (Standard) oder `normal`.
- `target` möglichst über `cid` (aus `get_local_serp_results`, `get_business_profile` oder `localPack`), Name nur als Notbehelf.

**Ablauf Warteschlange:** Alle Punkte gehen in **einem** `serp/google/maps/task_post` an DataForSEO (ein Aufruf, ohne Wiederholung bei 5xx, weil jeder Task Geld kostet). Danach holt das Werkzeug die Ergebnisse bis zu etwa 45 Sekunden lang ab (10 Abfragen im Abstand von 5 Sekunden, Abholen ist kostenlos). Hohe Priorität war im Test nach unter 5 Sekunden fertig.

**Antwort:**

- `status`: `completed`, `processing` (einzelne Punkte noch offen) oder `estimate`.
- `grid[]` je Punkt: `row`, `col`, Koordinaten, `rank` (Position des Ziels, `null` = nicht unter den ersten 20), `resultsCount`, `topResult`, **`top3`** (Rang, Titel, cid), `error` oder `pending`.
- `summary`: gefunden an wie vielen Punkten, Durchschnittsrang, Top-3- und Top-10-Anzahl, `pointsPending`.
- `settings` (Größe, Abstand, Radius, Zoom, Weg, Priorität), `estimate` (Punkte, Preis je Punkt, Schätzung), `tasks` (Task-IDs je Punkt).

**Fortsetzen:** Bei `status: "processing"` denselben Aufruf mit `resumeTasks` = `structuredContent.tasks` wiederholen. Es wird nichts neu gebucht; DataForSEO hält die Ergebnisse 30 Tage. Offene Punkte stehen im Text als `?`.

**Empfehlung für den Motor:** 5×5 mit `radiusKm` 5 bis 10 je nach Einzugsgebiet, hohe Priorität, `maxCostUsd` 0,05. Monatlich ein Lauf je Begriff und Betrieb kostet damit 0,03 USD. Timeout des MCP-Aufrufs mindestens 60 Sekunden (`LANGSAM_MS` im Motor steht bei 120 Sekunden).

## 5. Offene Punkte

- Die Listenpreise für normale Warteschlange und Live-Maps sind nicht nachgemessen; `meta.costUsd` zeigt den echten Betrag.
- Ein Live-Beleg über MCP nach dem Deploy steht aus (Prüfaufruf je Werkzeug, zusammen unter 0,50 USD).
- Postleitzahlen sind bewusst nicht auflösbar (Code 20235 ist zugleich eine Hamburger PLZ und der Code von NRW).
