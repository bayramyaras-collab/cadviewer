# CAD Görüntüleyici — DXF + GPS (Android)

APK'yı PC'ye hiçbir şey kurmadan GitHub'da otomatik derlersin.

## Dosyalar
- index.html            → uygulama (KÖK dizinde; workflow bunu www'ye kopyalar)
- setup-android.js       → izinler + largeHeap + WhatsApp dosya açma + ikon
- icons-data.json        → uygulama ikonu ("BY" pin) verisi
- capacitor.config.json, package.json
- .github/workflows/main.yml → GitHub derleme iş akışı

## Güncelleme (en kolay)
Sadece **index.html**'i değiştirmen yeterli — depo **KÖK** dizinine yükle
(Dosya ekle → Dosyaları yükle → index.html → Commit). Alt klasör YOK.
Push edince Releases'ta yeni APK çıkar.

## Notlar
- Büyük DXF'ler için largeHeap açık; yine de çok büyük dosyalar (60MB+) yavaş açılır.
- DWG doğrudan açılmaz; önce DXF'e çevir.
