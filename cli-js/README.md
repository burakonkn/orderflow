# OrderFlow CLI (Faz 1 — JavaScript)

Terminal üzerinden çalışan bir sipariş yönetim aracı. Framework yok, veritabanı yok — sadece Node.js core modülleri (`fs/promises`), saf JavaScript ve depolama olarak JSON dosyaları.

[OrderFlow](../README.md) projesinin bir parçası: aynı domain, üç farklı araç setiyle üç kez inşa ediliyor.

## Gereksinimler

- Node.js 20+ (`node:fs/promises`, ESM modülleri kullanıyor)

## Kurulum

```bash
cd cli-js
npm install
```

Veri `data/*.json` dosyalarında saklanır. Her dosya var olmalı ve geçerli bir JSON dizisi içermeli (boş başlamak için `[]`).

## Kullanım

```bash
node index.js <varlık> <işlem> [--flag=değer ...]
```

### Ürünler

```bash
node index.js product add --name="Laptop" --price=15000 --stock=10
node index.js product list
```

### Müşteriler

```bash
node index.js customer add --name="Ayse Yilmaz" --email="ayse@test.com" --city="Istanbul"
node index.js customer list
```

E-postalar benzersiz olmalı — var olan bir e-postayla ikinci bir müşteri eklemek reddedilir.

### Siparişler

```bash
node index.js order add --customer=1 --items="1:2,4:1"
node index.js order list
node index.js order status --id=1 --status=confirmed
node index.js order cancel --id=1
```

`--items` formatı: `urunId:adet`, birden fazla ürün için virgülle ayrılır.

Sipariş oluşturma **atomiktir** — herhangi bir ürün eksik ya da stokta yetersizse, siparişin tamamı reddedilir, hiçbir şey diske yazılmaz. Kalem fiyatları satın alma anında dondurulur, sonraki fiyat değişiklikleri var olan siparişleri etkilemez. Durum sadece ileri gidebilir (`pending → confirmed → shipped → delivered`); sadece `pending`/`confirmed` durumundaki siparişler iptal edilebilir, iptal stoğu geri iade eder.

### Raporlar

```bash
node index.js report summary
```

Toplam ciro, sipariş sayısı, ortalama sepet tutarı, en çok satan 5 ürün ve şehir bazında sipariş dağılımını yazdırır. İptal edilmiş siparişler tüm rapor hesaplamalarının dışında tutulur.

## Mimari

```
index.js                    giriş noktası: argv'yi ayrıştırır, komut handler'ına yönlendirir
src/
  cli/
    arguments.js             process.argv -> { positional, flags }
    commands.js               {varlık, işlem}'i handler'a yönlendirir, AppError'ı yakalar
  repository/
    fileRepository.js         generic JSON dosya CRUD'u (factory fonksiyon + closure)
    productRepository.js
    customerRepository.js
    orderRepository.js
  services/
    productService.js         doğrulama + iş kuralları (fiyat/stok)
    customerService.js        doğrulama + e-posta benzersizliği
    orderService.js           atomik sipariş oluşturma, stok/fiyat mantığı, durum makinesi
    reportService.js          ciro, en çok satanlar, şehir dağılımı (reduce/map/filter)
  errors/
    appError.js                kök sınıf
    validationError.js         biçimsel olarak bozuk girdi (400 karşılığı)
    businessRuleError.js       girdi geçerli ama kural ihlali (409 karşılığı)
    notFoundError.js           kayıt yok (404 karşılığı)
  utils/
    file.js                    fs/promises + JSON.parse/stringify sarmalayıcısı
data/                         JSON depolama (products.json, customers.json, orders.json)
```

**Katmanlama kuralı:** repository'ler iş kurallarını hiç bilmez (sadece JSON okur/yazar); servisler CLI'yi hiç bilmez (sadece düz obje alır, tipli hata fırlatır); CLI katmanı sadece `argv`'yi ayrıştırıp sonucu yazdırmayı bilir. Bu ayrım, sonraki fazlardaki TypeScript rewrite ve REST API'nin, dış katmanları değiştirirken aynı iş kurallarını paylaşabilmesini sağlıyor.

## Bu Projenin Gösterdikleri

- Baştan sona `async/await`, senkron dosya işlemi yok
- Tüm katmanlarda tutarlı kullanılan özel bir hata hiyerarşisi (`AppError` ve üç alt sınıfı)
- Atomik yazma işlemleri (hepsi ya da hiçbiri prensibiyle sipariş oluşturma) ve korumalı bir stok güncelleme sırası (JSON dosyasında oku-değiştir-yaz yarış koşulunu önlemek için `Promise.all` yerine sıralı `await`)
- Sadece ileri gidebilen bir sipariş durum makinesi
- Rapor agregasyonu için fonksiyonel dizi metodları (`map`, `filter`, `reduce`, `flatMap`)
