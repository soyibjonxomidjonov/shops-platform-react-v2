# Environment Variables

## .env.local fayli (loyiha papkasida)

```env
NEXT_PUBLIC_API_URL=http://13.53.218.203/api/v1
```

## Domen ulanganida

`.env.local` faylini oching va o'zgartiring:

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

Keyin serverni restart qiling:
```bash
npm run build
npm start
```

Faqat shu 1 qatorni o'zgartirsangiz — hamma narsa yangi domenga o'tadi!
