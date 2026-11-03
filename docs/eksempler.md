# Tre eksempler på spørgsmål og svar

Her viser jeg tre spørgsmål, jeg har stillet Lejerådgiveren i chatten (workflow 05).
For hvert spørgsmål viser jeg, hvilke værktøjer agenten kaldte, hvad den fik tilbage,
hvad den svarede, og min vurdering af svaret.

- **Eksempel 1** virker som det skal.
- **Eksempel 2** viser en fejl: agenten gættede, da værktøjet fejlede.
- **Eksempel 3** viser en begrænsning: agenten fulgte ikke alle henvisninger.

Jeg har sammenlignet de paragraffer, agenten citerer, med lovteksten i
[data/lejeloven.pdf](../data/lejeloven.pdf).

Screenshots ligger i [`screenshot workflows/`](../screenshot%20workflows/).

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

Screenshot: `screenshot workflows/ai svar eksempel.png`

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

Screenshot: `screenshot workflows/eksempel 2 tool fejler.png`

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

Screenshot: `screenshot workflows/eksempel 2 ingen tool kald.png`

Det rettede jeg med en ny regel ("Du skal ALTID kalde mindst ét værktøj …") og ved at
genstarte n8n, så hukommelsen blev tømt. Se
[docs/udviklingsprompts.txt](udviklingsprompts.txt).

---

## Eksempel 3: Fremleje (begrænsning)

**Spørgsmål:**
> kan jeg videreulejee min lejebolig er det lovligt

**Tool calls:**

Mit screenshot af dette eksempel viser kun chatten og ikke loggen, så jeg kan ikke vise
præcis, hvilke værktøjer agenten kaldte. Agenten skriver selv i svaret, at den ikke har
hentet § 158. Det tyder på, at den har slået de andre paragraffer op, men ikke § 158.

**Agentens svar (uddrag):**
> Det er lovligt at fremleje dele af din lejebolig, men kun inden for de rammer loven
> sætter. Du må fremleje op til halvdelen af beboelsesrummene, og de personer, der bor
> i lejligheden, må ikke overstige antallet af beboelsesrum.
>
> Reglen står i lejeloven § 157, stk. 1. […] Hvis du fremlejer uden for denne ramme,
> skal du have udlejerens samtykke, jf. § 150, stk. 2 […]
>
> Hvis du er gift eller har en ægtefælle, gælder der også en særregel […] jf. § 160, stk. 1.
>
> Jeg har ikke hentet § 158, som kan indeholde yderligere regler om fremleje, så tjek
> den selv eller spørg huslejenævnet, før du går i gang. Lovteksten er den oprindelige
> lov fra 2022, og senere ændringer er ikke indeholdt her.

Screenshot: `screenshot workflows/ai spg workflow 5.png`

**Kontrol – det står der i loven:**
- **§ 157, stk. 1:** Lejeren har ret til at fremleje op til halvdelen af beboelsesrummene,
  og antallet af beboere må ikke overstige antallet af beboelsesrum.
- **§ 150, stk. 2:** Lejeren må ikke uden udlejerens samtykke overlade det lejede til
  andre end sin husstand, "jf. dog §§ 157 og 158".
- **§ 160, stk. 1:** Lejeren må ikke fremleje uden ægtefællens samtykke, hvis boligen så
  ikke længere kan bruges som fælles bolig.

**Vurdering: delvist godt, men ufuldstændigt**
- **Godt:** Agenten forstod spørgsmålet trods stavefejlen ("videreulejee"), fordi
  vektorsøgningen søger på betydning og ikke på præcise ord. Alle tre paragraffer, den
  citerer, passer med lovteksten. Den siger selv, hvad den ikke har tjekket, og gør
  opmærksom på, at lovteksten er fra 2022.
- **Begrænsning:** Agenten nævner selv § 158, men hentede den ikke. Det er en vigtig
  paragraf. Ifølge § 158 har lejeren ret til at fremleje **hele** lejligheden i op til 2 år,
  når fraværet er midlertidigt og skyldes fx sygdom, studieophold eller midlertidig
  forflyttelse. Udlejeren kan dog modsætte sig, fx hvis ejendommen har færre end 13
  beboelseslejligheder. Den regel mangler i svaret.
- **Hvorfor:** Instruktionerne siger, at agenten typisk skal slå "de 1-2 mest relevante
  paragraffer" op i grafen. Det holder antallet af værktøjskald nede, men betyder, at
  agenten stopper, før den har fulgt alle henvisninger.
- **Derudover:** Min opdelingskode fanger ikke alle henvisninger. § 150, stk. 2 henviser
  til "§§ 157 og 158", men koden fanger kun § 157. Derfor er der ingen `HENVISER_TIL`-relation
  fra § 150 til § 158 i grafen, og grafsøgningen på § 150 peger ikke videre til § 158.
- **Mulig forbedring:** Skriv i instruktionerne, at agenten skal hente de paragraffer,
  den selv nævner som relevante, før den svarer. Og ret opdelingskoden, så den også
  fanger henvisninger skrevet med "og" og komma.
