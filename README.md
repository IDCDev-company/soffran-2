# VV Gold Saffron Bio

Site prezentare și formular de comandă pentru șofran premium certificat BIO.

## Comenzi pe Gmail (Formspree)

Comenzile plasate pe site sunt trimise pe email prin [Formspree](https://formspree.io). Pași pentru a primi comenzile pe Gmail (ex. info@vvgoldsaffron.com):

1. **Cont Formspree**  
   Creează un cont gratuit pe [formspree.io](https://formspree.io) (Login cu Google pentru același Gmail).

2. **Form nou**  
   Din dashboard: **New form** → nume (ex. „VV Gold Saffron – Comenzi”).

3. **Email de primire**  
   La „Email to receive submissions” adaugă adresa Gmail unde vrei să primești comenzile (ex. `info@vvgoldsaffron.com`) și salvează.

4. **Form ID în site**  
   După crearea formularului, Formspree îți dă un URL de tip:
   `https://formspree.io/f/xxxxxxxx`  
   Copiază **doar** partea `xxxxxxxx` (Form ID).

5. **Actualizare în cod**  
   În `script.js`, la începutul fișierului, înlocuiește `YOUR_FORM_ID` cu acest ID:

   ```js
   const ORDER_EMAIL_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ```

   (Pune ID-ul tău real în loc de `xxxxxxxx`.)

După publicarea site-ului, la fiecare comandă finalizată vei primi pe Gmail un email cu: cantitate, preț, nume, email, telefon, adresă. Răspunsul tău la acel email va merge direct la adresa clientului (Reply-To este setat la email-ul clientului).

## Rulare locală

Deschide `index.html` în browser sau folosește un server local (ex. `npx serve .`).
