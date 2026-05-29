# Word Arena

Android tablet için İngilizce öğrenme ve kapışma odaklı mobil oyun (Expo / React Native).

## Özellikler

| Özellik | Durum |
|--------|--------|
| Android tablet uyumu (geniş ekran, 2 sütunlu seçenekler) | ✅ |
| Giriş sınavı → başlangıç ligi | ✅ |
| 3+ maç sonrası lig önerisi | ✅ |
| Lig çarpanları: Bronz ×1, Gümüş ×5, Altın ×10, Elmas ×100 | ✅ |
| Kampanya modu (adım adım dersler) | ✅ örnek içerik |
| VS modu (9 tur, boşluk doldurma, ilk doğru kazanır) | ✅ bot rakip |
| Puan = skor farkı × lig çarpanı | ✅ |

## Kurulum

```bash
cd word-arena
npm install
npm run android   # Android emülatör veya USB ile bağlı cihaz
```

Tablet testi için Android Studio’da 10" tablet AVD oluşturun veya fiziksel tableti USB ile bağlayın.

## Proje yapısı

```
src/
  domain/          # Lig, puanlama, öneri mantığı
  game/vs/         # 9 turluk VS maç motoru
  game/campaign/   # Kampanya tipleri
  data/            # Soru ve ders içerikleri (JSON’a taşınabilir)
  screens/         # UI ekranları
  storage/         # AsyncStorage ile yerel profil
```

## İçerik (güvenli yol)

Yalnızca **Tatoeba CC0** (İngilizce cümleler) + **CEFR-J** (kelime seviyesi). Tureng veya scrape yok.

```bash
npm run build:content   # content-pack.json üretir (~800 VS sorusu)
```

Yasal iş: uygulamadaki **İçerik & lisanslar** ekranı yeterli (otomatik atıf).

Ham Tatoeba dosyaları `scripts/.cache/` altında kalır, repoya girmez.

## Sonraki adımlar (önerilen)

1. **Gerçek çok oyunculu VS** — Firebase / Supabase
2. **TR kelime ipuçları** — TUFS (CC BY, Credits’e bir satır) veya özgün metin
3. **Ses** — MVP sonrası
4. **Mağaza build** — `eas build --platform android`

## Lig kuralları (özet)

- VS kazanınca: `puan = |senin skorun − rakip| × lig çarpanı`
- Düşük ligde yüksek puan kasma engeli: Elmas’ta aynı fark Bronz’a göre 100 kat daha değerli
- Öneri: son 3 maçta %75+ galibiyet ve ortalama +2 fark → üst lig önerisi
