/* =====================================================================
   CAD Görüntüleyici - Android otomatik kurulum
   Çalıştır:  node setup-android.js
   Yapar: paket adını bulur, MainActivity.java'yı yazar,
          AndroidManifest.xml'e GPS izinlerini ve WhatsApp/dosya-açma
          intent-filter'larını ekler. Tekrar çalıştırılabilir (idempotent).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const ok = s => console.log('  \u2713 ' + s);
const info = s => console.log('  - ' + s);

// 1) Paket adını (appId) bul
let appId = 'com.harita.cadviewer';
try {
  if (fs.existsSync('capacitor.config.json')) {
    appId = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8')).appId || appId;
  } else if (fs.existsSync('capacitor.config.ts')) {
    const m = fs.readFileSync('capacitor.config.ts', 'utf8').match(/appId:\s*['"]([^'"]+)['"]/);
    if (m) appId = m[1];
  }
} catch (e) {}
const pkgPath = appId.replace(/\./g, '/');
info('Paket adı: ' + appId);

if (!fs.existsSync(path.join('android', 'app', 'src', 'main'))) {
  console.error('\n  ! android/ klasörü yok. Önce şunu çalıştır:  npx cap add android\n');
  process.exit(1);
}

// 2) MainActivity.java
const MAIN_JAVA = `package ${appId};

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Base64;
import com.getcapacitor.BridgeActivity;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        Uri uri = null;
        String action = intent.getAction();
        if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        } else if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        }
        if (uri == null) return;
        try {
            InputStream is = getContentResolver().openInputStream(uri);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) > 0) bos.write(buf, 0, n);
            is.close();
            final String b64 = Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
            String name = uri.getLastPathSegment();
            if (name == null) name = "dosya.dxf";
            if (name.contains("/")) name = name.substring(name.lastIndexOf('/') + 1);
            final String nm = name.replace("'", "").replace("\\\\", "");
            injectWhenReady(nm, b64, 0);
        } catch (Exception e) { }
    }

    private void injectWhenReady(final String nm, final String b64, final int tries) {
        if (getBridge() == null || getBridge().getWebView() == null) {
            if (tries < 40) new Handler(getMainLooper()).postDelayed(
                () -> injectWhenReady(nm, b64, tries + 1), 400);
            return;
        }
        getBridge().getWebView().evaluateJavascript("typeof window.openIncoming", value -> {
            if (value != null && value.contains("function")) {
                getBridge().getWebView().evaluateJavascript(
                    "window.openIncoming('" + nm + "','" + b64 + "')", null);
            } else if (tries < 40) {
                new Handler(getMainLooper()).postDelayed(
                    () -> injectWhenReady(nm, b64, tries + 1), 400);
            }
        });
    }
}
`;
const javaDir = path.join('android', 'app', 'src', 'main', 'java', pkgPath);
fs.mkdirSync(javaDir, { recursive: true });
fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), MAIN_JAVA);
ok('MainActivity.java yazıldı (' + javaDir + ')');

// 3) AndroidManifest.xml
const manifestPath = path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
let xml = fs.readFileSync(manifestPath, 'utf8');

// 3a) İzinler
const perms = [
  'android.permission.INTERNET',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.READ_EXTERNAL_STORAGE'
];
let addP = '';
for (const p of perms) if (!xml.includes(p)) addP += `    <uses-permission android:name="${p}" />\n`;
if (addP) {
  xml = xml.replace(/(<manifest[^>]*>\s*\n)/, `$1${addP}`);
  ok('GPS ve dosya izinleri eklendi');
} else info('İzinler zaten var');

// 3b) Dosya-açma intent-filter'ları (WhatsApp / dosya yöneticisi)
if (xml.includes('CADVIEWER-INTENTS')) {
  info('Dosya-açma kayıtları zaten var');
} else {
  const INTENTS =
`
            <!-- CADVIEWER-INTENTS -->
            <intent-filter android:label="CAD Görüntüleyici ile aç">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="content" android:mimeType="*/*" android:host="*" android:pathPattern=".*\\\\.dxf" />
                <data android:scheme="file" android:mimeType="*/*" android:host="*" android:pathPattern=".*\\\\.dxf" />
            </intent-filter>
            <intent-filter android:label="CAD Görüntüleyici ile aç">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="content" android:mimeType="application/octet-stream" />
                <data android:scheme="content" android:mimeType="application/dxf" />
                <data android:scheme="content" android:mimeType="image/vnd.dxf" />
            </intent-filter>
            <intent-filter android:label="CAD Görüntüleyici ile aç">
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/octet-stream" />
                <data android:mimeType="application/dxf" />
            </intent-filter>
`;
  const before = xml;
  xml = xml.replace(/(<activity[^>]*MainActivity[\s\S]*?)(\n[ \t]*<\/activity>)/, `$1${INTENTS}$2`);
  if (xml === before) {
    console.error('  ! MainActivity <activity> bloğu bulunamadı, intent-filter eklenemedi.');
  } else {
    ok('WhatsApp/dosya-açma kayıtları eklendi');
  }
}

fs.writeFileSync(manifestPath, xml);
console.log('\n\u2714 Android kurulumu tamam. Sıradaki:  npx cap sync  →  Build APK\n');
