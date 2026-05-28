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
3. Google Sign-In için OAuth consent screen yapılandırılmış olmalı

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `.env.local` | Client + Admin anahtarları (git’e gitmez) |
| `.env.example` | Şablon (boş) |

## Güvenlik

- Service account JSON’u **asla** repoya commit etme.
- Anahtar sohbette paylaşıldıysa Firebase Console’dan **yeni key** üret ve eskisini sil.

## Not

Her kullanıcı şu an aynı SQLite DB’yi paylaşır; kullanıcı başına veri ayrımı sonraki adım.
