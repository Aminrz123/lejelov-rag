# Tre eksempler på spørgsmål og svar

Her viser jeg tre spørgsmål, jeg har stillet Lejerådgiveren i chatten (workflow 05).
For hvert spørgsmål viser jeg, hvilke værktøjer agenten kaldte, hvad den fik tilbage,
hvad den svarede, og min vurdering af svaret.

- **Eksempel 1** virker som det skal.
- **Eksempel 2** viser en fejl: agenten gættede, da værktøjet fejlede.
- **Eksempel 3** viser en begrænsning: agenten fulgte ikke alle henvisninger og gav et for unuanceret svar.

Jeg har sammenlignet de paragraffer, agenten citerer, med lovteksten i
[data/lejeloven.pdf](../data/lejeloven.pdf).

Screenshots ligger i [`screenshots/`](../screenshots/), med én mappe pr. eksempel.

---

## Eksempel 1: Udlejerens pligter

**Spørgsmål:**
> hej hvilke pligter har en udlejer

**Tool calls:**

| # | Værktøj | Input |
|---|---------|-------|
| 1 | `vektorsoegning` | Ikke med på screenshottet |
| 2 | `grafsoegning` | Ikke med på screenshottet |

Loggen på screenshottet viser rækkefølgen: Hukommelse → Claude Haiku → `vektorsoegning`
→ `grafsoegning` → Claude Haiku → Hukommelse. Agenten brugte altså først vektorsøgning til
at finde relevante stykker og derefter grafsøgning, før den skrev svaret.

**Agentens svar (uddrag):**
> Udlejeren har blandt andet pligt til at vedligeholde ejendommen og det lejede, sørge
> for renholdelse og belysning, og sørge for god orden i ejendommen.
>
> - **Vedligeholdelse (§ 112, stk. 2):** Udlejeren skal holde ejendommen og det lejede
>   forsvarligt ved lige. …
> - **Renhold og belysning (§ 112, stk. 2):** …
> - **God orden i ejendommen (§ 152, stk. 1):** …

Screenshot: [eksempel_1/chat_og_log.png](../screenshots/eksempel_1/chat_og_log.png)

**Kontrol – det står der i loven:**
- **§ 112, stk. 2:** "Udlejeren skal holde ejendommen og det lejede forsvarligt ved lige,
  herunder vedligeholde alle indretninger til afløb og til forsyning med el, gas, vand,
  varme og kulde, og sørge for renholdelse og sædvanlig belysning af ejendommen …"
- **§ 152, stk. 1:** "Udlejeren skal sørge for, at der hersker god orden i ejendommen …"

**Vurdering: godt**
- Agenten svarer på spørgsmålet, selvom det er skrevet uformelt ("hej hvilke pligter").
- Alle tre pligter passer med lovteksten, og de rigtige paragraffer og stykker er angivet.
- Svaret følger formatet fra instruktionerne: kort svar først, derefter en forklaring
  med paragraffer.
- Udlejeren har flere pligter i loven end de tre, agenten nævner. Svaret giver altså et
  godt overblik, men ikke en komplet liste.

---

## Eksempel 2: Værktøjet fejler, og agenten gætter (fejl)

**Spørgsmål:**
> Må lejer videreudleje (fremleje) sin lejebolig til en anden?

**Tool calls:**

| # | Værktøj | Input | Resultat |
|---|---------|-------|----------|
| 1 | `vektorsoegning` | `query`: "Må lejer videreudleje (fremleje) sin lejebolig til en anden?" | Fejl: "Workflow does not exist" |

Værktøjet fejlede, fordi jeg endnu ikke havde valgt workflow 03 i tool-noden i n8n.
Agenten fik derfor **ingen** lovtekst tilbage.

Inputtet hedder `query` her, fordi det er sådan, det står i loggen fra dengang. På det
tidspunkt var værktøjets inputfelt ikke sat op endnu. Nu hedder feltet `spoergsmaal`, som
beskrevet i [agent/tools.txt](../agent/tools.txt).

Screenshot: [eksempel_2/tool_fejler.png](../screenshots/eksempel_2/tool_fejler.png)

**Agentens svar (uddrag):**
> Jeg kan desværre ikke få adgang til lovteksten i øjeblikket, fordi søgeværktøjet
> returnerer en fejl ("Workflow does not exist"). […]
>
> Prøv gerne igen om lidt. Imens kan jeg give dig en generel retning: i dansk lejeret
> kaldes videreudleveje for fremleje, og det kræver som udgangspunkt udlejerens
> samtykke. […]
>
> **Kilder:** Ingen. Jeg kunne ikke hente paragraffer fra lejeloven på grund af en
> teknisk fejl.

**Vurdering: fejl**
- **Godt:** Agenten siger ærligt, at værktøjet fejlede, skriver "Kilder: Ingen" og
  henviser til huslejenævnet og en lejerforening.
- **Fejl:** Den giver alligevel en "generel retning" ud fra sin egen viden, og den er
  misvisende. Ifølge § 157, stk. 1 har lejeren **ret** til at fremleje op til halvdelen af
  beboelsesrummene, og ifølge § 158 kan lejeren i nogle tilfælde fremleje hele lejligheden.
  Det bryder reglen i instruktionerne om kun at svare ud fra lovteksten.
- **Rettelse:** Jeg tilføjede en ny guardrail: "Hvis et værktøj fejler, må du IKKE svare
  ud fra din egen viden – heller ikke med en "generel retning"."

**Følgefejl: hukommelsen**
Efter jeg havde rettet værktøjerne, stillede jeg et nyt spørgsmål i samme samtale
("Hvilke pligter har udlejeren?"). Agenten kaldte ikke et eneste værktøj. Loggen viser
kun "Hukommelse" og "Claude Haiku". Agenten kunne se i hukommelsen, at værktøjerne havde
fejlet tidligere, og gik ud fra, at de stadig ikke virkede.

Screenshot: [eksempel_2/ingen_tool_kald.png](../screenshots/eksempel_2/ingen_tool_kald.png)

Det rettede jeg med en ny regel ("Du skal ALTID kalde mindst ét værktøj …") og ved at
genstarte n8n, så hukommelsen blev tømt. Se
[docs/udviklingsprompts.txt](udviklingsprompts.txt).

---

## Eksempel 3: Fremleje (begrænsning)

**Spørgsmål:**
> kan jeg videreulejee min lejebolig er det lovligt

**Tool calls:**

Loggen viser rækkefølgen: Claude Haiku → `vektorsoegning` → Claude Haiku → `grafsoegning`
→ `grafsoegning` → Claude Haiku.

| # | Værktøj | Input | Hvad den fik tilbage |
|---|---------|-------|----------------------|
| 1 | `vektorsoegning` | Agentens egen omskrivning af spørgsmålet om at videreudleje (fremleje) lejeboligen. Teksten er delvist skjult på screenshottet. | 5 stykker: § 160, stk. 1 (0,849), § 163, stk. 3 (0,843), § 160, stk. 2 (0,840), § 157, stk. 1 (0,838), § 150, stk. 2 (0,832) |
| 2 | `grafsoegning` | `soegetype`: "paragraf", `vaerdi`: "157" | Hele § 157 med 3 stykker, emner (Lejerens brug og husorden, Fremleje og bytte), rettigheder, pligter, frister og begrebet "Beboermaksimum". Henviser til § 14. **Henvist til fra: § 150, § 158, § 159, § 168** |
| 3 | `grafsoegning` | `soegetype`: "paragraf", `vaerdi`: "150" | Hele § 150 med 2 stykker, emner, rettigheder og pligter. **Henviser til: § 157** |

Screenshots:
- [eksempel_3/chat_og_log.png](../screenshots/eksempel_3/chat_og_log.png)
- [eksempel_3/vektorsoegning.png](../screenshots/eksempel_3/vektorsoegning.png)
- [eksempel_3/grafsoegning_157.png](../screenshots/eksempel_3/grafsoegning_157.png)
- [eksempel_3/grafsoegning_150.png](../screenshots/eksempel_3/grafsoegning_150.png)

**Agentens svar (uddrag):**
> **Kort svar:** Du må fremleje dele af din lejebolig uden udlejerens samtykke, men kun op
> til halvdelen af beboelsesrummene, og du må ikke fremleje hele boligen uden udlejerens
> samtykke. Fremlejeaftalen skal være skriftlig.
>
> **Reglerne:**
> - **Hovedreglen:** Som lejer må du ikke uden udlejerens samtykke overlade brugen af den
>   lejede bolig eller dele af den til andre end medlemmer af din husstand (lejeloven
>   § 150, stk. 2).
> - **Undtagelsen – delvis fremleje:** Lejeren af en beboelseslejlighed har ret til at
>   fremleje op til halvdelen af lejlighedens beboelsesrum til beboelse. […] (§ 157, stk. 1).
> - **Beboermaksimum:** […] (§ 157, stk. 2).
> - **Skriftlighed og frist:** Fremlejeaftalen skal indgås skriftligt, og du skal sende
>   udlejeren en kopi af aftalen, inden fremlejeperiodens begyndelse (§ 157, stk. 3).
> - **Ægtefælle:** Du må ikke fremleje uden ægtefællens samtykke, hvis det vil betyde, at
>   boligen ikke længere kan tjene som fælles bolig […] (§ 160, stk. 1).
>
> **Det betyder i praksis:** Du må gerne leje et eller flere værelser ud til beboelse, men
> ikke hele lejligheden uden udlejerens samtykke. […]
>
> Bemærk, at lovteksten er den oprindelige lov fra 2022, og senere ændringer er ikke
> indarbejdet. […]
>
> **Kilder:** Lejeloven § 150, stk. 2 · Lejeloven § 157, stk. 1, 2 og 3 · Lejeloven § 160,
> stk. 1 · https://www.retsinformation.dk/eli/lta/2022/341

**Kontrol – det står der i loven:**
- **§ 150, stk. 2:** Lejeren må ikke uden udlejerens samtykke overlade det lejede til
  andre end sin husstand, "jf. dog §§ 157 og 158".
- **§ 157, stk. 1-3:** Ret til at fremleje op til halvdelen af beboelsesrummene, regler om
  beboermaksimum, og fremlejeaftalen skal være skriftlig med kopi til udlejeren.
- **§ 158, stk. 1:** Lejeren har ret til at fremleje **hele** lejligheden i op til 2 år, når
  fraværet er midlertidigt og skyldes fx sygdom, forretningsrejse, studieophold eller
  midlertidig forflyttelse. Efter stk. 2 kan udlejeren dog modsætte sig, fx hvis
  ejendommen har færre end 13 beboelseslejligheder.
- **§ 160, stk. 1:** Lejeren må ikke fremleje uden ægtefællens samtykke, hvis boligen så
  ikke længere kan bruges som fælles bolig.

**Vurdering: godt struktureret, men ikke helt korrekt**
- **Godt:** Agenten forstod spørgsmålet trods stavefejlen ("videreulejee"), fordi
  vektorsøgningen søger på betydning og ikke på præcise ord. Den brugte begge værktøjer:
  vektorsøgning til at finde paragrafferne og grafsøgning til at hente hele § 157 og § 150.
  Alt, hvad den skriver om § 150, § 157 og § 160, passer med lovteksten, og kilderne er
  angivet.
- **Fejl:** Agenten skriver, at man "ikke må fremleje hele boligen uden udlejerens
  samtykke". Det er for unuanceret. § 158 giver lejeren **ret** til at fremleje hele
  lejligheden i op til 2 år ved midlertidigt fravær. Agenten nævner slet ikke § 158, og den
  siger heller ikke, at den mangler noget. En lejer, der skal på studieophold, ville få et
  forkert svar.
- **Hvorfor gik den glip af § 158?** Screenshots af værktøjskaldene viser tre årsager:
  1. **Vektorsøgningen fandt den ikke.** § 158 var ikke blandt de 5 fund. Til gengæld kom
     § 163, stk. 3 med, selvom den handler om overtagelse af erhvervslejemål. Scorerne
     ligger tæt (0,832-0,849), så små forskelle i ordvalget afgør, hvad der kommer med.
  2. **Grafen viste en henvisning, men agenten fulgte den ikke.** Grafsøgningen på § 157
     svarede "Henvist til fra: § 150, § 158, § 159, § 168". Agenten fik altså at vide, at
     § 158 hænger sammen med § 157, men slog den ikke op. Instruktionerne siger, at den
     typisk skal slå "de 1-2 mest relevante paragraffer" op, og det gjorde den.
  3. **Min opdelingskode mangler en henvisning.** § 150, stk. 2 henviser til "§§ 157 og 158",
     men koden fanger kun § 157. Derfor svarede grafsøgningen på § 150 kun
     "Henviser til: § 157".
- **Mulig forbedring:** Skriv i instruktionerne, at agenten skal slå paragraffer op, som
  grafen viser som henvisninger til eller fra den paragraf, svaret bygger på. Lad
  vektorsøgningen returnere flere end 5 stykker. Og ret opdelingskoden, så den også fanger
  henvisninger skrevet med "og" og komma.
