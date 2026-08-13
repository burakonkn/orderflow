# OrderFlow

Ürün, müşteri ve sipariş yönetimi yapan küçük bir e-ticaret backend'i — aynı domain, üç farklı araç setiyle, üç kez inşa ediliyor.

Bu üç ayrı proje değil. Tek bir proje, üç fazda evriliyor:

1. **JavaScript CLI** (`cli-js/`) — framework'süz, veritabanısız, sadece Node core modülleri ve saf JavaScript ile çalışan bir terminal aracı. ✅ Tamamlandı.
2. **TypeScript Rewrite** (`cli-ts/`) — aynı CLI'nin, strict tip sistemi, generic'ler ve runtime doğrulamayla yeniden yazılmış hali. 🔜 Sırada.
3. **Node.js REST API** (`api/`) — aynı iş kurallarının, kimlik doğrulama, gerçek bir veritabanı ve testlerle HTTP üzerinden servis edilen hali. 🔜 Planlanıyor.

## Neden Tek Domain, Üç Kez

Aynı problemi farklı araçlarla yeniden inşa etmek, *araçların* değiştiğini ama *kuralların* değişmediğini gösterir. Stok doğrulaması, sipariş durum geçişleri, sipariş anında fiyat dondurma — bu iş kuralları üç fazda da aynı kalıyor. Değişen şey verinin nasıl saklandığı (JSON dosyaları → tiplenmiş nesneler → PostgreSQL) ve nasıl sunulduğu (terminal komutları → tiplenmiş CLI → HTTP endpoint'leri).

## Domain

| Varlık | Kurallar |
|---|---|
| Product | Fiyat > 0, stok >= 0 |
| Customer | E-posta benzersiz olmalı |
| Order | Atomik olarak oluşturulur — bir kalem bile stokta yoksa hiçbir şey oluşturulmaz. Kalem fiyatları sipariş anında dondurulur. Durum sadece ileri gider (`pending → confirmed → shipped → delivered`); sadece `pending`/`confirmed` durumundaki siparişler iptal edilebilir, iptal stoğu geri iade eder. |

## Fazlar

- [`cli-js/`](./cli-js) — Faz 1, JavaScript CLI. Kurulum ve komut listesi için kendi README'sine bak.
- `cli-ts/` — Faz 2, henüz başlanmadı.
- `api/` — Faz 3, henüz başlanmadı.
