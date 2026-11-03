# Grafmodel

Her beskriver jeg, hvordan grafen i Neo4j er bygget op, og hvorfor jeg har valgt den sådan.

## Hvordan jeg fandt frem til modellen

Jeg brugte Claude til at foreslå node- og relationstyper. Jeg gav den kapiteltitlerne,
mellemoverskrifterne og nogle eksempler på paragraffer fra lejeloven og spurgte, hvilke
typer der ville give mening, hvis en agent skal kunne svare på spørgsmål som:

- Hvilke regler handler om depositum?
- Hvilke frister gælder, når man flytter?
- Hvilke pligter har udlejeren?

Forslaget indeholdt mange typer: lejer, udlejer, rettigheder, pligter, frister, varsler,
emner, kategorier, begreber og forskellige myndigheder som huslejenævnet og boligretten.

## Hvad jeg ændrede (normalisering)

Der var for mange typer, og flere af dem overlappede, så jeg har ryddet op:

- **Lejer, udlejer, huslejenævn, boligret og kommune** blev samlet i én type, `Part`.
  Det er alle "parter" i loven, så det giver ikke mening at have fem forskellige nodetyper.
- **Rettigheder og pligter** blev lavet om til relationer i stedet for noder
  (`GIVER_RET` og `PAALAEGGER_PLIGT`). Så kan man direkte spørge "hvad pålægger loven udlejeren?".
- **Frist og varsel** blev samlet til `Frist`, fordi et varsel bare er en frist.
- **Emne og kategori** blev samlet til `Emne`. Jeg har lavet en fast liste med 21 emner,
  så AI'en ikke kan finde på nye. Ellers kunne man ende med både "depositum" og "indskud"
  som to forskellige emner.
- Jeg har skrevet relationsnavnene **uden æ, ø og å** (fx `PAALAEGGER_PLIGT`), så man ikke
  skal bruge backticks i Cypher.

## Den færdige model

Grafen har to dele.

**Strukturen** kommer direkte fra lovteksten. Den laves med almindelig kode uden AI:

```
(Lov) -HAR_KAPITEL-> (Kapitel) -HAR_PARAGRAF-> (Paragraf) -HAR_STYKKE-> (Stykke)
(Paragraf) -HENVISER_TIL-> (Paragraf)
```

**Viden** bliver udtrukket af AI'en fra hver paragraf:

```
(Paragraf) -HANDLER_OM-> (Emne)
(Paragraf) -GIVER_RET-> (Part)
(Paragraf) -PAALAEGGER_PLIGT-> (Part)
(Paragraf) -FASTSAETTER_FRIST-> (Frist)
(Paragraf) -DEFINERER-> (Begreb)
```

## Noder og properties

Format: **Node** : properties : unik på

- **Lov** : navn, nummer, kilde : navn
- **Kapitel** : nr, titel : nr
- **Paragraf** : nr, overskrift, kapitel, kilde : nr
- **Stykke** : id, tekst, embed_tekst, embedding, paragraf, stk, kapitel, kapitel_titel,
  overskrift, lov, kilde : id
- **Emne** : navn : navn
- **Part** : navn : navn
- **Frist** : id, beskrivelse, varighed : id
- **Begreb** : navn, definition : navn

Lidt om properties på `Stykke`:

- `tekst` er selve lovteksten for stykket.
- `embed_tekst` er den tekst, der bliver lavet til en vektor. Det er `tekst` med kapitel,
  overskrift og paragraf sat foran, så vektoren også fanger sammenhængen.
- `embedding` er vektoren fra bge-m3 (1024 tal). Den bruges af vektorindexet
  `stykke_embedding`.
- `paragraf`, `stk`, `kapitel`, `kapitel_titel` og `overskrift` er metadata, så
  vektorsøgningen kan vise, hvor i loven et fund kommer fra, uden at skulle slå op i grafen.
- `kilde` er linket til loven på Retsinformation.

`GIVER_RET` og `PAALAEGGER_PLIGT` har også en property, `beskrivelse`, der forklarer, hvad
retten eller pligten går ud på.

## Faste lister

**Parter:** Lejer, Udlejer, Huslejenævn, Boligret, Kommune, Beboerrepræsentation

**Emner:**

- Anvendelsesområde
- Lejeaftalen
- Husleje og lejefastsættelse
- Lejeforhøjelse og lejenedsættelse
- Depositum og forudbetalt leje
- Betaling af leje
- Forbrug (varme, vand, el)
- Indflytning
- Mangler
- Vedligeholdelse
- Forbedringer
- Lejerens brug og husorden
- Fremleje og bytte
- Opsigelse
- Ophævelse
- Fraflytning
- Beboerrepræsentation
- Huslejenævn og boligret
- Tilbudspligt
- Straf
- Fravigelighed
