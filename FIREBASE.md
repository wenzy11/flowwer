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
