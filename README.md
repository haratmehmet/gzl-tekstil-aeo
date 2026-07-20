# GZLAEO Project Infrastructure

Bu proje, modern bir web uygulamasının altyapı standartlarını kurmak amacıyla aşağıdaki teknolojilerle hazırlanmıştır:

- **Framework**: Next.js 16 (App Router)
- **UI/UX**: React, Tailwind CSS, shadcn/ui
- **Veritabanı & ORM**: PostgreSQL, Prisma ORM, Adminer

---

## 🛠️ İlk Kurulum ve Çalıştırma Adımları

Projeyi bilgisayarınızda ilk kez çalıştırmak için aşağıdaki adımları sırasıyla uygulayın:

### 1. Çevre Değişkenleri Yapılandırması
Öncelikle veritabanı bağlantı bilgilerini içeren çevre değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

### 2. Docker Servislerinin Başlatılması
Veritabanı (PostgreSQL) ve veritabanı yönetim arayüzünü (Adminer) arka planda başlatmak için:
```bash
docker compose up -d
```
*   **PostgreSQL**: `localhost:5433` (Kullanıcı/Şifre: `postgres` / `postgres`, DB: `gzlaeo_db`)
*   **Adminer**: `http://localhost:8081` (Giriş için Server alanına `db` yazın, kullanıcı ve şifre `postgres` olarak girin)

### 3. Bağımlılıkların Yüklenmesi
Projedeki paket bağımlılıklarını kurmak için:
```bash
npm install
```

### 4. Prisma Client Üretimi
Prisma şemasını okuyup TypeScript tiplerini ve Client'ı oluşturmak için:
```bash
npx prisma generate
```

### 5. Veritabanı Migrasyonlarının Uygulanması
Prisma şemasını veritabanına yansıtmak ve gerekli tabloları oluşturmak için:
```bash
npx prisma migrate dev
```

### 6. Geliştirme Sunucusunun Başlatılması
Next.js uygulamasını yerel olarak `3001` portunda başlatmak için:
```bash
npm run dev
```
Uygulamaya tarayıcınızdan **`http://localhost:3001`** adresinden erişebilirsiniz.

---

## 📂 Proje Klasör Yapısı (Feature-based)

Uygulamada temiz, sürdürülebilir ve modüler bir mimari için **Feature-based (Özellik tabanlı)** klasör düzeni uygulanmıştır:

```text
src/
├── app/                  # Next.js App Router (sayfalar, şablonlar, API rotaları)
├── components/           # Genel ve paylaşılan UI bileşenleri (shadcn/ui buraya kurulur)
│   └── ui/               # Alt seviye UI atomik bileşenleri (düğmeler, girdiler vb.)
├── features/             # İş mantığı özellikleri (Feature-based modules)
│   └── [feature-name]/   # Her bir iş özelliği için izole edilmiş klasör
│       ├── components/   # Yalnızca bu özelliğe özel bileşenler
│       ├── hooks/        # Bu özelliğe özel React hook'ları
│       ├── actions.ts    # Next.js Server Actions (sunucu eylemleri)
│       ├── types.ts      # TypeScript tip tanımları
│       └── index.ts      # Özelliğin dışa açılan tek API kapısı (Public API)
├── hooks/                # Genel ve paylaşılan React hook'ları
├── lib/                  # Üçüncü parti istemci yapılandırmaları (örn. prisma client, utils)
└── styles/               # Global stil dosyaları
```

---

## 🔒 Docker Konteyner Bilgileri

Konteyner isimleri sistem genelinde çakışmaları önlemek için `gzlaeo-` ön ekiyle tanımlanmıştır:
- **Veritabanı**: `gzlaeo-postgres` (PostgreSQL 17-alpine)
- **Yönetim**: `gzlaeo-adminer` (Adminer)
