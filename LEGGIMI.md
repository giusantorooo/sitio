# giusantoro.com — come metterlo online

Quattro passi. Non serve scrivere codice. Non serve installare niente.
Se qualcosa non torna, **fermati e scrivimi** invece di improvvisare.

---

## 1 · GitHub — crea il repository

1. Vai su **github.com** → tasto verde **New** (o `+` in alto a destra → *New repository*).
2. **Repository name:** `sitio` — scritto esattamente così, minuscolo.
3. Lascia **Public**.
4. **Non** spuntare "Add a README file".
5. **Create repository**.

## 2 · Carica i file

1. Nella pagina del repository appena creato, clicca **uploading an existing file**.
2. Apri la cartella `giusantoro` sul tuo computer.
3. **Selezione tutto quello che c'è DENTRO** (le cartelle `admin`, `content`, `css`, `img`, `js` e i file `.html`) e trascinalo nella finestra di GitHub.
   ⚠️ Trascina il *contenuto* della cartella, non la cartella stessa.
4. In basso, **Commit changes**.

## 3 · Cloudflare — pubblica

1. Vai su **dash.cloudflare.com**.
2. Menu a sinistra: **Workers & Pages** → **Create** → scheda **Pages** → **Connect to Git**.
3. Autorizza GitHub e scegli il repository **sitio**.
4. Nella schermata di configurazione, **questi tre campi sono importanti**:
   - **Framework preset:** `None`
   - **Build command:** *lascialo VUOTO*
   - **Build output directory:** `/`
5. **Save and Deploy**.

Dopo un minuto ti dà un indirizzo tipo `sitio-xyz.pages.dev`. **Quello è il tuo sito, online.**

## 4 · Il pannello

1. Vai su `TUO-INDIRIZZO.pages.dev/admin/`
2. Clicca **Sign In with Token**.
3. Ti dà un link per generare il token su GitHub. Aprilo — le autorizzazioni sono già selezionate.
   - Dai al token accesso **solo al repository `sitio`**.
   - Permesso: **Contents → Read and write**.
   - Scadenza: un anno.
4. Copia il token, incollalo, entra.

Sei dentro. Da qui carichi foto e scrivi le schede, e il sito si aggiorna da solo.

⚠️ **Il token è come una password: non incollarlo mai in chat, né a me né a nessuno.**

---

## Se qualcosa non va

**Il sito è online ma vuoto / bianco**
→ Il file `admin/config.yml`, prima riga utile, dice `repo: giusantorooo/sitio`.
Se il tuo username GitHub **non** è `giusantoro`, cambia quella riga con il tuo.

**Il pannello dice che non trova il repository**
→ Stessa cosa: controlla che `repo:` corrisponda a `tuo-username/sitio`.

**Le foto non si vedono**
→ Devono essere caricate **dal pannello**, non da GitHub a mano.

---

## Il dominio (dopo, non adesso)

Quando il sito ti convince:
Cloudflare Pages → il tuo progetto → **Custom domains** → aggiungi `giusantoro.com`,
e poi punta il dominio da Wix seguendo le istruzioni che ti dà Cloudflare.

**Non farlo finché il sito nuovo non ti piace.** Wix intanto resta in piedi.

---

## Costi

- GitHub: 0 €
- Cloudflare Pages: 0 €
- Dominio: ~11 €/anno (oggi ne paghi 38 a Wix)

**Totale: circa 11 € l'anno.**
