# CAD Görüntüleyici — DXF + GPS (Android)

Telefon için DXF görüntüleyici: imar/çizim renk ayrımı, canlı GPS + navigasyon oku,
trafo/direk/box arama, gömülü B_CAD & T_ROMANS fontları, WhatsApp'tan gelen .dxf'i açma.

APK'yı **PC'ye hiçbir şey kurmadan**, GitHub'da otomatik derlersin.

## APK nasıl üretilir (GitHub)

1. GitHub'da yeni bir depo (repository) oluştur. İstersen **Private** olsun.
2. Bu klasördeki tüm dosyaları depoya yükle:
   - Web arayüzü: **"Add file → Upload files"** ile klasörü sürükle-bırak,
   - veya bilgisayarında git ile:
     ```
     git init
     git add .
     git commit -m "ilk"
     git branch -M main
     git remote add origin https://github.com/KULLANICI/DEPO.git
     git push -u origin main
     ```
3. Push biter bitmez **Actions** sekmesinde "APK Derle" işi otomatik başlar
   (~5–10 dk). Elle başlatmak istersen: Actions → APK Derle → **Run workflow**.
4. Bitince APK iki yerde hazır olur:
   - **Releases** bölümünde "CAD Görüntüleyici (derleme N)" → `app-debug.apk` indir.
   - veya Actions → ilgili çalışma → **Artifacts** → `cad-goruntuleyici-apk`.
5. `app-debug.apk`'yı telefonlara kur (Ayarlar'da "bilinmeyen kaynaklara izin" açık olmalı).

## Güncelleme
`www/index.html`'i değiştirip tekrar push et → yeni APK otomatik üretilir.

## Ne otomatik yapılıyor
GitHub'daki iş şunları kendi yapar: Node/Java/Android SDK kurar, Capacitor Android
projesini oluşturur, `setup-android.js` ile **GPS izinlerini**, **WhatsApp/dosya-açma
kayıtlarını** ve **MainActivity**'yi yerleştirir, sonra APK'yı derleyip yayınlar.
Elle dosya düzenlemek yok.

## Notlar
- Uygulama ikonu ve açılış ekranı `assets/` içindeki görsellerden otomatik üretilir (özel "BY" pinli ikon). İkonu değiştirmek istersen `assets/icon.png` (1024x1024) dosyasını değiştirip push et.
- Paket adı `capacitor.config.json` içindeki `appId` (varsayılan `com.harita.cadviewer`).
- Fontlar `www/index.html` içine gömülü — ayrı kurulum yok.
- DWG doğrudan açılmaz; çizimi önce **DXF**'e çevir.
- Bu APK imzasız "debug" sürümdür; elden kurmak için yeterli (mağaza için değil).
