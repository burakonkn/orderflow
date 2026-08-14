# OrderFlow CLI (Faz 2 — TypeScript Rewrite)

Faz 1'deki JavaScript CLI'nin, strict TypeScript ve Zod runtime doğrulamasıyla yeniden yazılmış hali. Aynı komutlar, aynı iş kuralları — artık derleme zamanında da güvenceli.

Part of the [OrderFlow](../README.md) projesi: aynı domain, üç farklı araç setiyle üç kez inşa ediliyor.

## Gereksinimler

- Node.js 20+ (ESM modülleri kullanıyor)
- `tsx` (geliştirme bağımlılığı olarak kurulu) — Node'un yerleşik tip temizlemesi dosyalar arası `.js` uzantılı import'larda güvenilir çalışmadığı için, çalıştırmak için `tsx` kullanıyoruz. Tip kontrolü için hâlâ `tsc` kullanılıyor.

## Kurulum

```bash
cd cli-ts
npm install
```

Veri `data/*.json` dosyalarında saklanır (Faz 1'deki gibi). Her dosya geçerli bir JSON dizisi içermeli (`[]` ile başlar).

## Çalıştırma

```bash
npm run start -- <varlık> <işlem> [--flag=değer ...]
# ya da doğrudan:
npx tsx src/index.ts <varlık> <işlem> [--flag=değer ...]
```

Tip kontrolü (derleme yapmadan, sadece hataları görmek için):

```bash
npm run typecheck
```

## Kullanım

Komutlar Faz 1 ile birebir aynı, sadece `node index.js` yerine `npx tsx src/index.ts` kullanılıyor:

```bash
npx tsx src/index.ts product add --name="Laptop" --price=15000 --stock=10
npx tsx src/index.ts product list

npx tsx src/index.ts customer add --name="Ayse Yilmaz" --email="ayse@test.com" --city="Istanbul"
npx tsx src/index.ts customer list

npx tsx src/index.ts order add --customerId=1 --items="1:2,4:1"
npx tsx src/index.ts order list
npx tsx src/index.ts order status --id=1 --status=confirmed
npx tsx src/index.ts order cancel --id=1

npx tsx src/index.ts report summary
```

İş kuralları (atomik sipariş oluşturma, fiyat dondurma, e-posta benzersizliği, durum makinesi) Faz 1'deki ile birebir aynı — bkz. [cli-js README](../cli-js/README.md).

### Config Dosyası

Kök dizine (`cli-ts/`) bir `orderflow.config.json` koyarak varsayılan ayarları değiştirebilirsin:

```json
{
  "dataDir": "./data",
  "currency": "TRY",
  "dateFormat": "ISO"
}
```

Dosya yoksa ya da bazı alanlar eksikse, Zod şeması otomatik olarak varsayılan değerleri doldurur — program hiçbir zaman config eksikliğinden çökmez.

## Mimari

```
src/
  index.ts                    giriş noktası
  types.ts                    domain tipleri (Role, OrderStatus, CreateOrderInput, CommandResult<T>, rapor tipleri)
  validation/
    schemas.ts                 Zod şemaları + z.infer ile türetilen Product/Customer/Order tipleri
  config/
    config.ts                  orderflow.config.json okuma, Zod varsayılanlarıyla doğrulama (top-level await)
  repository/
    fileRepository.ts          generic FileRepository<T extends { id: number }>, Zod ile runtime doğrulama
    productRepository.ts
    customerRepository.ts
    orderRepository.ts
  services/
    productService.ts
    customerService.ts
    orderService.ts            atomik sipariş oluşturma, stok/fiyat mantığı, durum makinesi
    reportService.ts
  errors/
    appError.ts                 readonly code/details alanlarıyla kök sınıf
    validationError.ts
    businessRuleError.ts
    notFoundError.ts
  cli/
    arguments.ts                process.argv -> ParsedArguments
    commands.ts                 her handler CommandResult<T> döndürür, runCommand union'ı daraltır
data/                         JSON depolama
```

## Faz 1'den Farklar — Bu Projenin Gösterdikleri

- **`strict: true`**, tüm dosyalar sıfır `tsc` hatasıyla derleniyor, `any` kullanımı yok.
- **Tek doğruluk kaynağı:** domain tipleri elle yazılmıyor, Zod şemalarından `z.infer` ile türetiliyor — şema ve tip birbirinden asla sapamaz.
- **Generic class:** `FileRepository<T extends { id: number }>` — Faz 1'deki factory-function + closure deseninin yanına, class + generics ile kurulmuş bir alternatif.
- **Runtime + derleme zamanı doğrulamasının birlikte kullanımı:** TypeScript sadece derleme zamanında var; dosyadan okunan veri, CLI'den gelen ham string'ler gibi sınırlarda Zod/`typeof` ile hâlâ runtime kontrolü yapılıyor.
- **Discriminated union:** `CommandResult<T>` (`{ ok: true; data: T } | { ok: false; error: string; code: string }`), `if (result.ok)` ile daraltılıyor.
- **Type predicate:** `function isOrderStatus(value: string): value is OrderStatus` — ham bir CLI string'ini güvenli şekilde daraltmak için.
- **Bilinçli, gerekçeli `as` kullanımı:** sadece generic repository'de, kendi inşa ettiğimiz objelerin şeklini TypeScript'in kanıtlayamadığı (ama bizim kanıtlayabildiğimiz) yerlerde — körü körüne değil.
- **Config dosyası:** Zod varsayılanlarıyla, top-level `await` kullanılarak modül seviyesinde bir kere yükleniyor.

## Ertelenen (İsteğe Bağlı) Özellikler

PDF'in önerdiği bazı ek özellikler şimdilik ertelendi, ileride eklenebilir:
- CSV formatında toplu ürün import'u (`product import --file=...`)
- Rapor çıktısını CSV olarak dışa aktarma (`report summary --format=csv`)
