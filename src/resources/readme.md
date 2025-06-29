*WORD GAME RULES*

Žodžių žaidimas yra labai paprastas.

	1. Žmogus kanale nustato žodį, kurį kiti kanalo dalyviai turi atspėti;
	2. Žodis yra vertinamas taškais, taškai gaunami žmogui panaudojus žodį žinutėje;
	3. Kiti žaidėjai gali atspėti žodį irgi jį panaudodami žinutėje;
	4. Dalyvis, atspėjęs žodį, gauna teisę nustatyti sekantį žaidimo žodį ir žaidimas tęsiasi nuo ta pačia tvarka.

Taisyklės žodžiams:

	1. Žodžiai privalo būti sudaryti tik iš raidžių, skaičiai negalimi;
	2. Žodžiai ignoruoja didžiąsias ir mažąsias raides;
	3. Žodžiai gali turėti lietuviškas raides (ir kitas Unicode raides) ir privalo sutapti tiek pelnant taškus, tiek aspėjant;
	4. Žodžiai yra atskiriami bet kokiu simboliu kuris nėra raidė (skyryba, tarpai ir pan.), *išskyrus skaičius* - skaičiai nėra traktuojami kaip ribos nors ir negali būti nustatomo žodžio dalis;

Komandos:

	• `/invite @Word game` - word game pakviečiamas į kanalą.
	• `/wg-brag` - leidžia pasigirti, kiek surinkai taškų neišduodant žodžio.
	• `/wg-check` - parodo kas dabar yra nustatęs žodį, o, jei tikrina pats žodžio savininkas, parodo jam žodį ir kiek taškų jis surinko.
	• `/wg-leaderboard` - parodo geriausius kanalo žaidėjus ir jų taškus.
	• `/wg-leave` - išmeta botą iš kanalo (reikalinga viešiems kanalams).
	• `/wg-readme` - parodo šią pagalbą.
	• `/wg-set-word` - nustato žodį, jei žaidėjas turi tokią teisę.

Komandos su parametrais:

▶ `/wg-leaderboard`

Komanda priima nebūtinus tris parametrus: laikotarpį, formatą ir apimtį.
Laikotarpis gali būti: _all_ arba _week_.
Formatas gali būti: _short_ arba _full_.
Apimtis gali būti: _channel_ arba _global_.

Šie parametrai nėra privalomi ir, jei nėra nurodyti, naudojami yra: _all_, _short_ ir _channel_.

Pavyzdžiai:

	• `/wg-leaderboard` = `/wg-leaderboard all short channel` - išspausdina geriausius žaidėjus kanale ir jų taškus per visą žaidimo istoriją;
	• `/wg-leaderboard week` = `/wg-leaderboard week short channel` - išspausdina geriausiu žaidėjus kanale ir jų taškus šią savaitę;
	• `/wg-leaderboard week full` = `/wg-leaderboard week full channel` - išspausdina geriausius žaidėjus kanale, jų taškus, žodžių kiekį, vidurkį per žodį, max taškų per žodį ir kiek žodžių buvo atspėta.
	• `/wg-leaderboard week full global` - išspausdina geriausius žaidėjus darbe, jų taškus, žodžių kiekį, vidurkį per žodį, max taškų per žodį ir kiek žodžių buvo atspėta.

▶ `/wg-set-word`

Komanda priima vieną parametrą t. y. žodį, kurį norimą nustatyti, pvz., `/wg-set-word žodis`.