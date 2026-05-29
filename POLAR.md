# Polar — QuoteFlow Pro

Tek plan: **Pro** — aylık **$14.99** / yıllık **$99.99**

## Polar Dashboard

1. [polar.sh](https://polar.sh) → Organization oluştur
2. **Products** → Yeni ürün: `QuoteFlow Pro`
3. İki fiyat ekle:
   - Recurring **monthly** — $14.99 USD
   - Recurring **yearly** — $99.99 USD
4. Product ID'lerini kopyala

## Vercel / `.env.local`

```bash
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=...
POLAR_SERVER=sandbox          # production'da: production
POLAR_PRODUCT_MONTHLY_ID=     # Polar product UUID (monthly price)
POLAR_PRODUCT_YEARLY_ID=      # Polar product UUID (yearly price)
NEXT_PUBLIC_APP_URL=https://flowwer-wine.vercel.app
```

## Webhook

URL: `https://YOUR-DOMAIN/api/webhook/polar`

Events: `subscription.*`, `order.paid`, `checkout.updated`

## Akış

1. Kullanıcı giriş yapar → kurulum adımlarını tamamlar
2. Kurulum bitince `/subscribe` — Pro ödeme ekranı
3. Polar checkout → webhook → Firestore `users/{uid}/billing/subscription`
4. Aktif abonelik olmadan uygulama sayfaları kilitli (kurulum sayfaları açık)

## Test

Sandbox modunda Polar'da test kartı ile ödeme yap, webhook'un Vercel loglarında 200 döndüğünü kontrol et.
