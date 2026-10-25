# BrainFit Kids – Projektplan

Sürüm 2 · 25 Ekim 2026 · @Zafer

**BrainFit Kids – Mental Arithmetik**, 5–12 yaş arası çocuklar için
Almanca, oyunlaştırılmış bir PWA. İki ana alanı var:

1. **Rechnen (Mental-Arithmetik):** Soroban abaküsü ve zihinden hesaplama
   (Anzan) sıfırdan ileri seviyeye. Abakuskids ve MathKids oyunlarının
   tüm aşamaları, YouTube ders videoları ve dijital abaküs tek bir
   öğrenme yolunda.
2. **Denken (Gehirn-Training):** Hafıza, dikkat, mantık, uzamsal düşünme,
   hız ve esneklik için zeka gelişim oyunları. Her yaş ve seviyede farklı
   oyunlar açılır.

Rechnen'de her çocuk aynı müfredatı, aynı sırayla ve aynı ayarlarla
izler; yaşa göre zorluk yoktur. Zeka oyunlarında ise zorluk çocuğun
yaşına göre otomatik başlar ve oynadıkça çocuğun performansına göre
kendiliğinden ayarlanır. Çocuğun gelişimi veli ve admin panellerinde iki
alan için ayrı ayrı takip edilir.

## Hedef ve kapsam

Çocuk abaküse hiç dokunmamış olarak başlar ve sonunda 2 basamaklı
sayılarla 10–12 adımlık zincirleri abaküssüz, zihinden ve hızlı çözer.
Aynı zamanda her gün kısa zeka oyunlarıyla hafızasını, dikkatini ve
mantık becerisini çalıştırır.

| Konu           | Karar                                                                                                             |
|----------------|-------------------------------------------------------------------------------------------------------------------|
| Hedef kitle    | 5–12 yaş (zeka oyunları için 4 yaş kademesi, aşağıda); okuma becerisi zayıf çocuklar için her talimat sesli de okunur                |
| Ana tema       | Mental-Arithmetik eğitim platformu **ve** zeka gelişim uygulaması; ikisi tek günlük plan içinde birleşir          |
| Dil            | Önce Almanca (Avusturya). Tüm metinler tek bir dil dosyasında; Türkçe/İngilizce sonradan eklenebilir              |
| Rechnen içeriği | Big Friends, Little Friends, Best Friends; toplama ve çıkarma; abaküslü ve zihinden (Anzan)                     |
| Denken içeriği | 6 zeka alanında 18 oyun; sorular sabit liste değil, her seviye için otomatik üretilir                             |
| Kaynaklar      | Abakuskids (48 aşama, 490 soru), MathKids (96 aşama, 1.440 soru, 33 hatası düzeltilmiş), 48 YouTube ders videosu |
| Zorluk         | Rechnen: herkes için aynı, yaşa göre değişmez. Denken: yaşa göre başlangıç + kısa seviye testi + oynadıkça otomatik ayar |
| Cihazlar       | Tablet öncelikli (yatay), telefon ve bilgisayarda da çalışır; çevrimdışı alıştırma yapılabilir                    |
| Kullanım şekli | Kursa ek ev ödevi ve kendi kendine öğrenme; eğitmen online derste dijital abaküsü kullanmaya devam eder           |

Kapsam dışı (ilk sürüm): çarpma ve bölme, sesli dikte (Hörrechnen),
canlı ders modülü, çok oyunculu canlı düello. Bunlar 2. sürüm için not
edildi.

## Yaş kademeleri ve otomatik zorluk (sadece Denken)

Bu bölüm yalnızca zeka gelişim oyunları için geçerlidir. Rechnen'de yaşa
göre zorluk yoktur: her çocuk Dünya 1'den başlar, sıra, Blitz hızı,
zincir uzunluğu ve ünite açma eşiği (%80) herkes için aynıdır.

### Dört yaş kademesi

Her çocuk doğum yılına göre bir kademeye girer. Kademe, zeka
oyunlarında başlangıç seviyesini ve hangi oyunların açık olduğunu
belirler.

| Kademe | Yaş   | Adı (Almanca)    | Zeka oyunlarında                                                              |
|--------|-------|------------------|-------------------------------------------------------------------------------|
| A      | 5–6   | Perlen-Küken     | 8 görsel oyun, okuma gerekmez; kısa turlar (1–2 dk); başlangıç seviyesi 1–3   |
| B      | 7–8   | Perlen-Entdecker | 15 oyun, temel seviyeler; başlangıç seviyesi 3–6                              |
| C      | 9–10  | Perlen-Profi     | 18 oyunun hepsi, orta seviyeler; başlangıç seviyesi 6–10                      |
| D      | 11–12 | Perlen-Meister   | 18 oyunun hepsi, ileri seviyeler ve süre modu; başlangıç seviyesi 9–13        |

Kademe bir sınır değil, bir başlangıç noktasıdır: iyi giden 7 yaşındaki
bir çocuk C kademesinin oyunlarına ilerleyebilir, zorlanan 11 yaşındaki
bir çocuk daha kolay seviyelerden çalışabilir.

### Otomatik zorluk nasıl çalışır

1. **Yaş:** Veli veya admin hesabı açarken sadece **doğum yılı** girilir
   (tam tarih gerekmez). Bu, kademeyi ve başlangıç seviyesini belirler.
2. **Seviye testi (Einstufung):** İlk girişte 3–4 dakikalık oyun gibi
   bir test: 3 kısa zeka oyunu (Gedächtnis, Logik, Konzentration).
   Sonuç zeka oyunlarının başlangıç seviyesini kademe içinde yukarı veya
   aşağı kaydırır. Çocuk bunu test olarak değil, "Perli'yle tanışma"
   olarak görür. Rechnen için seviye testi yoktur.
3. **Oynadıkça ayar:** Her oyunun 1–20 arası kendi seviyesi vardır.
   Hedef, çocuğun soruların yaklaşık **%75–85'ini** doğru yapmasıdır
   (ne sıkıcı ne bunaltıcı).
   - Bir turda %90 üzeri doğru ve hızlıysa: bir sonraki tur bir seviye zor.
   - %60 altındaysa: bir seviye kolay ve Perli bir ipucu gösterir.
   - Arada ise: aynı seviye, ama yeni sorular.
   - Aynı oturumda en fazla 2 seviye yükselir, böylece şans eseri zıplama olmaz.
4. **Elle değiştirme:** Veli ve admin bir zeka oyununun seviyesini
   kilitleyebilir veya değiştirebilir.
5. **Yaş günü:** Çocuk bir yaş büyüdüğünde kademe otomatik değişir,
   ilerleme korunur; yeni kademede açılan oyunlar bir "Überraschung"
   olarak gösterilir.

Tüm bu hesaplama uygulamanın içinde, çevrimdışı da çalışır; sonuçlar
internet gelince sunucuya gönderilir.

Rechnen'de eğitmenin elindeki tek ayar, bir sınıf veya çocuk için
üniteleri açmak ve kilitlemektir (ör. "bu hafta sadece +7 çalışsın").
Bu, yaşa göre değil eğitmenin kararıyla yapılır.

## Denken: zeka gelişim oyunları

### Altı zeka alanı

| Alan (Almanca)                  | Neyi çalıştırır                                       | Rechnen ile bağlantısı                                |
|---------------------------------|-------------------------------------------------------|-------------------------------------------------------|
| Gedächtnis (Hafıza)             | Kısa süreli ve çalışma belleği                        | Anzan'da boncukları akılda tutmak                      |
| Konzentration (Dikkat)          | Odaklanma, dikkat dağıtıcıları görmezden gelme        | Uzun zincirlerde hata yapmamak                         |
| Logik (Mantık)                  | Örüntü bulma, çıkarım, problem çözme                  | Kuralları (Big/Little Friends) anlamak                 |
| Raumdenken (Uzamsal düşünme)    | Şekilleri zihinde döndürme, yer ve yön                | Abaküsü zihinde canlandırmak                           |
| Tempo (İşlem hızı)              | Hızlı görme ve karar verme                            | Blitz-Training                                        |
| Flexibilität (Esneklik)         | Kurallar arasında geçiş, dürtüyü durdurma             | Toplama ve çıkarma kurallarını karıştırmadan uygulamak |

### 18 oyun ve seviyeye göre farklılaşma

Her alanda 3 oyun var. Oyunlar yaş kademesine göre sırayla açılır; her
oyunun içinde de seviye yükseldikçe kurallar ve görünüm değişir, yani
çocuk her seviyede "yeni" bir şey görür. Tüm oyunlar kendi tasarımımız
olur ve boncuk/Perli dünyasında geçer.

| Alan          | Oyun (Almanca adı)   | Ne yapılır                                                  | Açıldığı kademe | Seviye yükseldikçe                                                      |
|---------------|----------------------|-------------------------------------------------------------|-----------------|--------------------------------------------------------------------------|
| Gedächtnis    | Perlen-Memory        | Kapalı kartlarda eş boncuk resimlerini bul                  | A               | 6 → 24 kart; renk, sonra şekil, sonra sayı eşleri; süre modu (D)          |
|               | Perlen-Kette         | Yanıp sönen boncuk dizisini aynı sırayla tekrarla           | A               | 3 → 9 boncuk; ters sıra (C); iki renkli dizi (D)                          |
|               | Blitz-Abakus         | Abaküs resmi kısa görünür, gösterdiği sayıyı söyle          | B               | 1 → 4 sütun; görünme süresi 2 sn → 0,3 sn                                 |
| Konzentration | Perlen-Jagd          | Kalabalık resimde hedef boncukları bul                      | A               | Daha çok çeldirici; hareketli boncuklar; iki hedef aynı anda              |
|               | Fehler-Detektiv      | İki resim arasındaki farkları bul                           | A               | 3 → 7 fark; farklar küçülür; süre                                         |
|               | Stopp-Perle          | Yeşil boncukta dokun, kırmızıda dokunma                     | B               | Hız artar; kural ortada değişir ("şimdi tersi!")                          |
| Logik         | Muster-Meister       | Diziyi tamamla (renk, şekil, sayı örüntüsü)                 | A               | 2'li örüntü → 4'lü; sayı dizileri (+2, ×2); iki kural birlikte            |
|               | Perlen-Sudoku        | Her satır ve sütunda her boncuk bir kez                     | B               | 4×4 → 6×6 → 9×9; boncuk yerine sayı (C)                                   |
|               | Waage-Rätsel         | Terazi dengesinden hangi boncuğun ağır olduğunu bul         | C               | 2 → 4 terazi; sayılarla denklem gibi (D)                                  |
| Raumdenken    | Perlen-Tangram       | Parçalarla verilen şekli oluştur                            | A               | 3 → 7 parça; döndürme gerekli; gölge şekil (D)                            |
|               | Spiegel-Perlen       | Boncuk desenini aynanın öbür tarafına çiz                   | B               | Dikey ayna → yatay → çapraz; büyüyen ızgara                               |
|               | Würfel-Welt          | Küp yapısında kaç küp var, döndürülmüş hali hangisi         | C               | Daha büyük yapılar; küp açınımları (D)                                    |
| Tempo         | Schnell-Sortierer    | Boncukları renge veya sayıya göre hızla iki kutuya ayır     | A               | 2 → 4 kutu; kural büyüklük/tek-çift olur                                  |
|               | Symbol-Blitz         | Üstteki işaretle aynı olanı en hızlı bul                    | B               | Daha çok seçenek; benzer şekiller                                         |
|               | Zahlen-Rennen        | Sayıları küçükten büyüğe hızla dokun                        | B               | 1–9 → 1–25; karışık yerleşim; ters sıra                                   |
| Flexibilität  | Regel-Wechsel        | Boncukları bazen renge, bazen şekle göre ayır               | B               | Kural değişimi sıklaşır; üç kural                                         |
|               | Farb-Wort            | Yazının rengini söyle, kelimeyi değil                        | C (okuma gerekli) | Hız artar; ters kural                                                  |
|               | Labyrinth-Planer     | Labirentte en kısa yolu önceden planla                      | A               | Daha büyük labirent; anahtar ve kapı; tek hamle hakkı (D)                 |

A kademesinde 8 oyun, B'de 15 oyun, C ve D'de 18 oyunun hepsi açıktır.

### Günlük plan: iki alan birlikte

Çocuk Weltkarte'yi açtığında bir **Tagesplan** görür (~15–20 dk):

1. **Aufwärmen (2–3 dk):** Bir zeka oyunu, çocuğun en zayıf alanından.
2. **Rechnen (10–12 dk):** Sıradaki ünitenin istasyonu; herkes için aynı.
3. **Denk-Pause (3–5 dk):** İki farklı alandan iki kısa oyun.

Günlük plan bitince seri (Tagesserie) sayılır. Çocuk istediği zaman
Denk-Park'ta serbestçe oynayabilir, ama veli günlük süre sınırını koyar.

### Zeka gelişimini nasıl anlatıyoruz

Uygulama "IQ yükseltir" veya "zeka garantisi" gibi bir vaatte bulunmaz;
bilimsel olarak kanıtlı değildir ve AB/Avusturya reklam kuralları
açısından risklidir. Bunun yerine: "trainiert Konzentration, Gedächtnis
und logisches Denken" ve çocuğun kendi gelişimini gösteren ölçümler
(ör. "Perlen-Kette: 4 → 7 Perlen in 6 Wochen").

## Roller

Üç ayrı giriş var. Çocuklar e-posta ve şifre yerine sınıf kodu ve
resimli şifre ile girer; 5 yaşındaki bir çocuk bunu tek başına
yapabilir.

| Rol                       | Giriş                                                          | Yapabildikleri                                                                                                                                                                                                                                  |
|---------------------------|----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin (sen ve eğitmenler) | E-posta + şifre                                                | Öğrenci, sınıf ve veli hesabı açar (doğum yılıyla); sınıflara ünite ve oyun açar/kilitler; zeka oyunlarının seviyesini elle değiştirir; tüm çocukların ilerlemesini, hata analizini ve zeka profilini görür; mağaza, rozet ve etkinlikleri yönetir; soru setlerini düzenler |
| Veli                      | E-posta + şifre (çocuğun davet koduyla bağlanır)               | Bir veya birden fazla çocuğunu görür; haftalık rapor, Rechnen ve Denken ilerlemesi, zeka profili; günlük hedef ve süre sınırı koyar; eğitmenin notlarını okur                                                                                   |
| Öğrenci                   | Sınıf kodu + kendi avatarına dokunma + 4 resimden oluşan şifre | Günlük planı oynar, dünya haritasında ilerler, Denk-Park'ta oynar, Perlen kazanır, mağazadan alışveriş yapar, avatarını giydirir, liderlik tablosunu ve rozetlerini görür                                                                      |

Eğitmen rolü ilk sürümde Admin içinde yer alır. Birden fazla eğitmen
çalışacaksa "Lehrer" rolünü ayırmak kolay; sadece kendi sınıflarını
görür.

## Rechnen: müfredat

Öğrenme yolu 9 dünyadan ve 29 üniteden oluşuyor; her dünya bir kural
ailesi, her ünite tek bir kural. Sıra, iki oyunun ve videoların zaten
kullandığı sırayla birebir aynı. Yaşa göre zorluk yoktur: her çocuk
Dünya 1'den başlar ve aynı sorularla, aynı ayarlarla ilerler.

| Dünya                                | Üniteler                                                            | Abakuskids | MathKids | Kuşak   |
|--------------------------------------|---------------------------------------------------------------------|------------|----------|---------|
| 1 · Perlenland – Abakus kennenlernen | Erd- und Himmelsperlen, 1–9 einstellen, 10–99 ablesen (3)           | 1–3        | 1        | Weiß    |
| 2 · Big-Friends-Insel (+)            | +9, +8, +7, +6, +5, +4, +3, +2, +1, gemischt (5; kurallar ikişerli) | 4–12       | 2–12     | Gelb    |
| 3 · Little-Friends-Wald (+)          | +4/+3, +2/+1, gemischt (3)                                          | 13–18      | 13–18    | Orange  |
| 4 · Best-Friends-Berg (+)            | +6/+7, +8/+9, gemischt (3)                                          | 19–24      | 19–24    | Grün    |
| 5 · Big-Friends-Höhle (−)            | −9/−8, −7/−6, −5/−4, −3/−2, −1 und gemischt (5)                     | 25–36      | 25–35    | Blau    |
| 6 · Little-Friends-See (−)           | −4/−3, −2/−1, gemischt (3)                                          | 37–42      | 36–41    | Lila    |
| 7 · Best-Friends-Vulkan (−)          | −6/−7, −8/−9, gemischt (3)                                          | 43–48      | 42–48    | Rot     |
| 8 · Turbo-Stadt – Wiederholung       | Alle Regeln, längere Ketten (2)                                     | –          | 49–72    | Braun   |
| 9 · Anzan-Galaxie – Kopfrechnen      | 8–12 Zahlen ohne Abakus, Tempo (2)                                  | –          | 73–96    | Schwarz |

Her ünite sonunda ilgili YouTube videosu (Level 1 ve çıkarma
listelerindeki 48 video) bağlanır. Big Friends −6 ile −4 aynı videoya
gidiyor; bu düzeltilmeli.

Video linkleri ve MathKids'in 96 seviyesi (1.440 soru, 33 cevabı düzeltilmiş) MathKids oyunundan çıkarıldı: `content/videos.json`, `content/mathkids-levels.json`. Düzeltilen sorular dosyada `korrigiert` altında listeli.

### Bir ünitenin akışı

Her ünite 6 istasyondan oluşur ve 10–15 dakikada biter. İstasyonlar
sırayla açılır; bir istasyon 1–3 yıldızla tamamlanır, bir sonraki ünite
en az %80 doğrulukla açılır.

1. **Video ansehen:** Mevcut YouTube dersi uygulamanın içinde
   (listelenmemiş video) açılır. Video bitmeden "Weiter" görünmez.
2. **Entdecken:** Abaküs bileşeni kuralı adım adım canlandırır (örnek
   4 + 9: önce 1 Erdperle aşağı, sonra onlar sütununda 1 yukarı). Çocuk
   aynı hareketi kendisi yapar, abaküs kontrol eder.
3. **Üben mit Abakus:** Abakuskids'in ilgili aşama soruları. Çocuk
   ekrandaki abaküsle çözer; yanlış boncuk hareketinde ipucu çıkar.
4. **Blitz-Training:** MathKids'in ilgili aşaması: sayılar tek tek
   yanıp söner, hız MathKids'teki aşamanın hızıdır, süreye karşı 15 soru.
5. **Kopfrechnen:** Aynı kural, abaküs gizli; çocuk boncukları hayal
   ederek çözer.
6. **Boss-Kampf:** Ünite sonu testi. 10 karışık soru, 3 can. Kazanılırsa
   kupa, rozet ve haritada yeni yol.

Kurallar: Çocuk egzersizlerde "Fertig" veya "Weiter" düğmesine basmaz;
cevap otomatik kontrol edilir, doğruysa konfeti ve sonraki soru gelir.
Yanlış cevapta doğru çözüm abaküste gösterilir ve soru tur sonunda
tekrar sorulur.

## Oyunlaştırma

İki para birimi ve bir rütbe sistemi var: Perlen ile alışveriş yapılır,
Diamanten nadir ödüllerdir, XP ise çocuğun seviyesini belirler. Hiçbir
şey gerçek parayla satılmaz. Rechnen ve Denken aynı ödülleri verir.

| Öğe                    | Nasıl kazanılır                                                                        | Ne işe yarar                                   |
|------------------------|----------------------------------------------------------------------------------------|------------------------------------------------|
| Perlen (boncuk puan)   | Doğru cevap 1, yıldız başına 10, zeka oyunu turu 5–15, günlük görev 20–50              | Mağazada harcanır                              |
| Diamanten              | Boss yenmek, 7 günlük seri, haftalık lig ilk 3, bir zeka alanında yeni rekor           | Nadir ürünler, evcil hayvanlar, "Serie retten" |
| XP ve seviye           | Her tamamlanan istasyon ve zeka oyunu turu                                             | Seviye atladıkça yeni mağaza ürünleri açılır   |
| Kuşaklar (Abakus-Dojo) | Her Rechnen dünyasının bitimi: Weiß → Gelb → Orange → Grün → Blau → Lila → Rot → Braun → Schwarz | Avatar kuşağı taşır; yazdırılabilir sertifika |
| Denk-Sterne            | Her zeka alanında seviye 5, 10, 15, 20'ye ulaşmak (alan başına 4 yıldız, toplam 24)     | Gehirn-Profil'de görünür; özel avatar eşyaları |
| Rozetler (Abzeichen)   | Belirli başarılar                                                                      | Profilde koleksiyon                            |
| Kupalar (Pokale)       | Boss, turnuva ve haftalık lig                                                          | Kupa dolabı                                    |
| Tagesserie (seri)      | Günlük planı bitirmek                                                                  | Alev simgesi büyür; seri ödülleri              |
| Günlük görevler        | 3 görev/gün (ör. "5 Blitz-Fragen ohne Fehler", "Perlen-Kette mit 6 Perlen")           | Perlen ve XP                                   |

**Rozet örnekleri:** Erste Perle, Big-Friends-Profi, Blitzrechner (20
soru \< 3 sn), Fehlerfrei (bir tur %100), Frühaufsteher, 7-Tage-Feuer,
30-Tage-Feuer, Abakus-Meister, Anzan-Held, Schatzsammler (1.000 Perlen),
Gedächtnis-Genie (Perlen-Kette 8), Adlerauge (Fehler-Detektiv fehlerfrei),
Sudoku-Star (9×9 gelöst), Allrounder (her alanda en az 1 Denk-Stern).

**Mağaza:** Avatar figürleri (çocuk, robot, hayvan karakterleri),
kıyafetler (şapka, tişört, gözlük, pelerin), abaküs görünümleri (boncuk
renkleri, çerçeve), arka planlar, evcil hayvanlar (çocuğun yanında
dolanır), konfeti efektleri, çerçeveler ve unvanlar. Figürler kendi
tasarımımız olur; Minecraft/Mario gibi markalı karakterler kullanılmaz
(MathKids'te bunlar var).

**Liderlik tablosu:** Haftalık lig (Bronze, Silber, Gold, Diamant);
çocuk **kendi yaş kademesindeki** veya sınıfındaki 20 kişilik grupla
yarışır, böylece 5 yaşındaki bir çocuk 12 yaşındakiyle karşılaşmaz.
Sıralama haftalık Perlen'e göre yapılır; her pazartesi sıfırlanır. Sadece
takma ad ve avatar görünür, gerçek isim görünmez. Ayrıca sınıf tablosu ve
tüm zamanlar tablosu var; veli tabloyu kapatabilir.

## Gelişim takibi

Her cevap ve her oyun turu kaydedilir: soru veya oyun, seviye, verilen
cevap, doğruluk, tepki süresi ve (Rechnen'de) abaküsle mi zihinden mi
çözüldüğü. Raporların hepsi bu kayıtlardan hesaplanır.

| Ölçüm                                                 | Veli görür                     | Admin görür                 |
|-------------------------------------------------------|--------------------------------|-----------------------------|
| Rechnen: doğruluk (%) kural bazında                   | Evet, renkli ısı haritası      | Evet, sınıf karşılaştırmalı |
| Rechnen: ortalama çözme süresi (sn/soru)              | Evet, haftalık eğri            | Evet                        |
| Rechnen: abaküslü ve zihinden başarı farkı            | Evet                           | Evet                        |
| Rechnen: hata kalıpları (ör. +7 Big Friends'te sürekli yanlış) | Sade dille özet       | Ayrıntılı liste             |
| Denken: Gehirn-Profil (6 alanın seviyesi, örümcek ağı grafiği) | Evet                  | Evet, yaş kademesi ortalamasıyla |
| Denken: alan başına gelişim eğrisi (haftalık)         | Evet                           | Evet                        |
| Denken: güçlü ve geliştirilecek alanlar               | Sade dille öneri               | Ayrıntılı liste             |
| Çalışma süresi ve günleri (iki alan ayrı)             | Evet                           | Evet                        |
| Dünya, ünite, kuşak durumu                            | Evet                           | Evet                        |
| Son aktiflik, uzun süre giriş yapmayanlar             | Hayır                          | Evet, uyarı listesi         |

Gehirn-Profil'de çocuk yalnızca kendi geçmişiyle karşılaştırılır; veliye
"yaşıtlarının altında" gibi damgalayıcı ifadeler gösterilmez. Admin yaş
kademesi ortalamasını sadece eğitim amaçlı görür.

Veliye her pazar e-posta ile kısa haftalık rapor gider (isterse
kapatır). Admin panelinde sınıf görünümü, tek çocuk detayı, "zorlanan
çocuklar" listesi ve kursta tekrar edilmesi gereken kurallar görünür.
Eğitmen bir çocuğa not bırakabilir ve ona özel alıştırma seti veya oyun
atayabilir.

## Ekran listesi

Toplam 29 ekran: 19 öğrenci, 4 veli ve 6 admin ekranı. İlk 24 ekran
"BrainFit Kids – UI Design" sayfasında tasarlandı; ★ işaretli 5 ekran
yeni ve henüz tasarlanmadı. Değişen ekranlar ✎ ile işaretli.

| \#  | Rol     | Ekran (Almanca adı)   | Amacı                                                                    |
|-----|---------|-----------------------|--------------------------------------------------------------------------|
| 1   | Öğrenci | Start                 | Maskot, "Los geht's", rol seçimi                                         |
| 2   | Öğrenci | Anmelden              | Sınıf kodu → avatar seç → resimli şifre                                  |
| 3   | Öğrenci | ★ Einstufung          | İlk girişte "Perli'yle tanışma": zeka oyunları için 3 kısa oyun         |
| 4   | Öğrenci | Weltkarte ✎           | Ana sayfa: Tagesplan, 9 dünyalı yol, Denk-Park girişi, Perlen/seri       |
| 5   | Öğrenci | Einheit               | Ünitenin 6 istasyonu ve yıldızlar                                        |
| 6   | Öğrenci | Video                 | Ders videosu ve kural kartı                                              |
| 7   | Öğrenci | Entdecken             | Abaküs animasyonu ile kuralın adım adım gösterimi                        |
| 8   | Öğrenci | Üben mit Abakus       | Alt alta soru + etkileşimli abaküs + sayı tuşları                        |
| 9   | Öğrenci | Blitz-Training        | Yanıp sönen sayılar, hız göstergesi                                      |
| 10  | Öğrenci | Kopfrechnen           | Abaküs gizli, düşünce balonu                                             |
| 11  | Öğrenci | Boss-Kampf            | Canavara karşı can barı                                                  |
| 12  | Öğrenci | Ergebnis              | Yıldızlar, kazanılan Perlen ve XP, yeni rozet                            |
| 13  | Öğrenci | ★ Denk-Park           | 6 alan, açık ve kilitli oyunlar, her oyunun seviyesi                     |
| 14  | Öğrenci | ★ Denkspiel           | Ortak oyun çerçevesi: talimat (sesli), oyun alanı, süre, seviye göstergesi |
| 15  | Öğrenci | ★ Gehirn-Profil       | Çocuğun 6 alanı, Denk-Sterne, kendi rekorları                            |
| 16  | Öğrenci | Shop                  | Kategoriler, fiyatlar, kilitli ürünler                                   |
| 17  | Öğrenci | Garderobe             | Avatarı giydirme                                                         |
| 18  | Öğrenci | Rangliste ✎           | Haftalık lig (yaş kademesine göre), sınıf ve tüm zamanlar                |
| 19  | Öğrenci | Pokale & Abzeichen    | Kupa dolabı, rozet koleksiyonu, kuşaklar                                 |
| 20  | Veli    | Eltern-Login          | E-posta, davet kodu                                                      |
| 21  | Veli    | Eltern-Dashboard ✎    | Çocuk kartları, haftanın özeti (Rechnen + Denken)                        |
| 22  | Veli    | Lernbericht ✎         | Kural ısı haritası, hız eğrisi, Gehirn-Profil, öneriler                  |
| 23  | Veli    | Einstellungen ✎       | Günlük hedef, süre sınırı, doğum yılı, liderlik tablosu aç/kapa          |
| 24  | Admin   | Admin-Dashboard       | Aktif çocuklar, sınıf ilerlemesi, uyarılar                               |
| 25  | Admin   | Schüler & Klassen ✎   | Hesap açma (doğum yılıyla), sınıf kodu, veli daveti                      |
| 26  | Admin   | Schüler-Detail ✎      | Tek çocuğun tüm verisi, Gehirn-Profil, oyun seviyesini elle değiştirme, not |
| 27  | Admin   | Lerninhalte           | Dünya/ünite kilitleme, soru setleri, video linkleri                      |
| 28  | Admin   | ★ Denkspiele          | Oyunları kademe/sınıf için açma-kapama, zorluk ayarları                  |
| 29  | Admin   | Shop & Belohnungen    | Ürün, fiyat, rozet ve etkinlik yönetimi                                  |

Alt menü (NavBar) bir sekme kazanır: **Karte · Denk-Park · Shop ·
Garderobe · Pokale**; Rangliste, Pokale ekranının içine taşınır.

## Teknik mimari ve veri koruma

Uygulama tek bir PWA olarak kurulur; Unity oyunları gömülmez,
mekanikleri ve tüm soruları web'de yeniden yazılır.

| Katman                      | Seçim                                                                       | Neden                                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| Arayüz                      | React + Vite, PWA                                                           | Tablette hızlı, çevrimdışı çalışır, uygulama gibi yüklenir                            |
| Abaküs                      | Kendi SVG bileşenimiz (2–8 sütun)                                           | Sayı gösterme, animasyon, cevap kontrolü; oyundaki abaküsün görünümü                 |
| Zeka oyunları               | Ortak oyun çerçevesi + oyun başına küçük modül; sorular seviye parametreleriyle otomatik üretilir | Yeni oyun eklemek kolay; sınırsız soru; çevrimdışı çalışır             |
| Zorluk motoru (Denken)      | Uygulama içinde çalışan kural tabanlı ayarlayıcı (yaş kademesi + son turlar) | Anında tepki, internet gerekmez, sonuçlar sonra eşitlenir                             |
| Giriş, veritabanı, liderlik | Supabase (AB sunucusu, Frankfurt)                                           | MathKids zaten Supabase kullanıyor; rol bazlı erişim, canlı sıralama                  |
| Yayın                       | GitHub + Netlify                                                            | Alışık olduğun akış, terminal gerekmez                                                |
| İçerik                      | 1.930 soru JSON olarak (hatalar düzeltilmiş), oyun seviye tabloları, video linkleri, ses efektleri | Admin panelden düzenlenebilir                                  |

**Unity oyunları neden gömülmüyor:** MathKids 89 MB, Abakuskids 48 MB;
tablette yavaş açılır. Ayrıca oyunlar sonuçları dışarıya bildirmiyor,
yani gelişim takibi yapılamaz. Web'de yeniden yazmak aynı soruları,
kuralları ve sesleri korur.

**Veri koruma (DSGVO):** Çocuk hesabı veli onayıyla açılır; çocuktan
e-posta veya fotoğraf alınmaz; yaş için yalnızca doğum yılı saklanır;
Google Analytics ve reklam yok; liderlikte yalnızca takma ad; zeka
profili yalnızca veli ve eğitmen tarafından görülür ve başka amaçla
kullanılmaz; veli verileri indirip silebilir; sunucular AB'de.

## Yol haritası

Her aşama test edilip onaylanmadan bir sonrakine geçilmez.

| Aşama              | İçerik                                                                                                     | Test kriteri                                                                 | Durum              |
|--------------------|------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|--------------------|
| 0 · Tasarım        | Bu plan, 24 ekranın UI tasarımı, 5 yeni ekran (Einstufung, Denk-Park, Denkspiel, Gehirn-Profil, Admin-Denkspiele) | Sen onaylarsın                                                        | 24 ekran hazır, 5 ekran bekliyor |
| 1 · Çekirdek       | PWA iskeleti, abaküs bileşeni, Start; öğrenci girişi; Dünya 1'in ilk ünitesi (6 istasyon); yaş kademesi ve zorluk motoru; ilk 3 zeka oyunu (Perlen-Memory, Muster-Meister, Perlen-Kette) | 5 ve 10 yaşında birer çocuk üniteyi ve 3 oyunu tabletinde yardımsız bitirir; zeka oyunlarında zorluk ikisine farklı ayarlanır | Kodlandı, test bekliyor: Start, Anmelden, Weltkarte, Dünya 1 Ünite 1 (6 istasyon), zorluk motoru, Einstufung, Denk-Park, 4 oyun (Memory, Kette, Muster, Jagd). 47 video ünitelere bağlandı. Eksik: Abakuskids soruları, Supabase |
| 2 · Rechnen        | 29 ünitenin hepsi, 1.930 soru, videolar                                                                   | Her ünite oynanarak kontrol edilir; tüm cevaplar otomatik test edilir        | –                  |
| 3 · Denken         | 18 oyunun hepsi, 4 kademe ve 20 seviye tablosu, Einstufung, Denk-Park, Gehirn-Profil, Tagesplan           | Her oyunun her seviyesi otomatik üretim testinden geçer; 4 yaş grubundan çocuklar dener, %75–85 hedefi tutar | –         |
| 4 · Oyunlaştırma   | Perlen, XP, kuşaklar, Denk-Sterne, rozetler, kupalar, mağaza, garderob, yaş kademeli liderlik             | 1 hafta boyunca puanlar ve sıralama doğru hesaplanır                         | –                  |
| 5 · Paneller       | Veli ve admin panelleri, Gehirn-Profil raporu, seviyeyi elle değiştirme, haftalık rapor                   | Gerçek verilerle raporlar elle kontrol edilir                                | –                  |
| 6 · Pilot          | 2 sınıfla 2 haftalık deneme: biri 5–7 yaş, biri 9–12 yaş                                                  | Çocuk ve veli geri bildirimi; zeka oyunlarında zorluk ayarı iki grupta da doğru; hata listesi temizlenir | –       |
| 7 · Yayın          | Domain, veri koruma metinleri, yedekleme                                                                  | Yayın kontrol listesi tamam                                                  | –                  |

## Onayından önce netleşmesi gerekenler

- [x] Uygulamanın adı: **BrainFit Kids**, alt başlık **Mental Arithmetik**.
- [x] Yaş aralığı: **5–12**.
- [x] Ana tema: Mental-Arithmetik **ve** zeka gelişimi.
- [x] Yaşa göre otomatik zorluk **sadece zeka oyunlarında**; Rechnen herkes için aynı.
- [ ] Zeka oyunları: 18 oyunluk liste uygun mu, eklemek veya çıkarmak istediğin oyun var mı?
- [ ] Günlük plan: Rechnen ve Denken süresinin oranı (öneri: ~%60 Rechnen, ~%40 Denken) uygun mu?
- [ ] Zeka oyunları için seviye testi (Einstufung): şimdilik **atlanabilir** ("Später"); atlanırsa yaş kademesinin başlangıç seviyesi kullanılır. Zorunlu olsun mu?
- [ ] Doğum yılını kim girer: sadece admin mi, veli de mi?
- [ ] Denk-Park kursa kayıtlı olmayan çocuklara da açık mı olacak (ör. ücretsiz deneme)?
- [ ] Maskot: ders videolarındaki 3D öğretmen kız (sarı örgülü, mavi
  kazaklı) uygulamanın rehberi olsun mu, yoksa Perli mi kalsın?
- [ ] Hesaplar: sadece kursa kayıtlı çocuklar mı kullanacak (admin
  açar), yoksa velilerin kendi kaydolabildiği bir abonelik de olacak mı?
- [ ] Videolar: YouTube'da listelenmemiş olarak kalsın mı, yoksa kendi
  sunucunda mı durmalı (çocuklar YouTube önerilerini görmesin)?
- [ ] Unity oyunlarını web'de yeniden yazma önerisine katılıyor musun?
