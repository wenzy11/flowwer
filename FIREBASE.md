# Firebase — QuoteFlow (`quoteflow-b9910`)

`.env.local` projede yapılandırıldı. Giriş için:

```bash
npm run dev
```

- Kayıt: `/tr/auth/signup`
- Giriş: `/tr/auth/login` (e-posta veya Google)

## Firebase Console kontrol listesi

1. **Authentication** → Sign-in method:
   - Email/Password → **Enabled**
   - Google → **Enabled**
2. **Authentication** → Settings → **Authorized domains**:
   - `localhost` ekli olmalı (geliştirme için)
   - Tarayıcıda **`http://localhost:3000`** kullanın (`127.0.0.1` varsayılan olarak yetkili değildir; kullanacaksanız Console’a `127.0.0.1` ekleyin)
3. Google Sign-In için OAuth consent screen yapılandırılmış olmalı

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `.env.local` | Client + Admin anahtarları (git’e gitmez) |
| `.env.example` | Şablon (boş) |

## Güvenlik

- Service account JSON’u **asla** repoya commit etme.
- Anahtar sohbette paylaşıldıysa Firebase Console’dan **yeni key** üret ve eskisini sil.

## Firestore indeksleri

İlk sorguda “requires an index” hatası alırsanız:

1. Hata mesajındaki linke tıklayıp indeksi oluşturun (birkaç dakika sürebilir), **veya**
2. `firestore.indexes.json` dosyasını Firebase CLI ile deploy edin: `firebase deploy --only firestore:indexes`

Uygulama çoğu listeyi indeks olmadan da çalıştıracak şekilde sıralamayı bellek içinde yapar; yine de production için indeksleri oluşturmanız önerilir.

## Vercel (production)

Local çalışıp Vercel’de “Something went wrong” görüyorsanız, genelde **sunucu tarafı Firebase Admin** veya **yetkili domain** eksiktir.

### 1. Vercel Environment Variables

Project → Settings → Environment Variables — **Production + Preview** için hepsini ekleyin:

| Değişken | Not |
|----------|-----|
| `NEXT_PUBLIC_FIREBASE_*` (6 adet) | `.env.local` ile aynı — **satır sonu/newline olmadan** yapıştırın |
| `FIREBASE_ADMIN_PROJECT_ID` | Service account |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Tek satır, `\n` ile satır sonları (tırnak **olmadan** yapıştırın) |

**Alternatif (önerilen):** Tüm service account JSON’unu tek değişkende:

- `FIREBASE_SERVICE_ACCOUNT_JSON` = indirdiğiniz `.json` dosyasının **tam içeriği** (tek satır da olabilir)

Bu durumda `FIREBASE_ADMIN_*` üçlüsü gerekmez.

**Sık hata:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` sonunda gizli satır sonu varsa girişte `Illegal url for new iframe` ve URL’de `%0A` görürsünüz. Vercel’de değeri silip tekrar yapıştırın: `quoteflow-b9910.firebaseapp.com` (Enter’a basmayın, sadece yapıştırıp kaydedin).

Deploy sonrası kontrol: `https://SIZIN-VERCEL-URL/api/auth/health`  
`{"ok":true,"adminInit":"ok"}` dönmeli.

### 2. Firebase Authorized domains

Authentication → Settings → Authorized domains:

- `flowwer-wine.vercel.app` (production)
- `*.vercel.app` eklenemez — her preview URL’yi ayrı eklemeniz veya production domain kullanmanız gerekir
- Özel domain varsa onu da ekleyin

### 3. Redeploy

Env değiştirdikten sonra Vercel’de **Redeploy** şart (sadece kaydetmek yetmez).

### 4. Google giriş (Vercel)

Production’da Google **popup yerine redirect** kullanılır (daha güvenilir). Girişten sonra aynı login sayfasına dönersiniz; oturum otomatik tamamlanır.

**Preview URL** kullanıyorsanız (`*-git-*.vercel.app`), o host’u da Firebase **Authorized domains**’e ekleyin; aksi halde `unauthorized-domain` hatası alırsınız.
