# onchain-bot — auto deposit ke BatuApi (Celo mainnet)

Generate 100 wallet, sebar CELO dari satu funding wallet, lalu jalankan deposit
`0.001 CELO` per wallet ke kontrak game secara terjadwal (4×/hari = 400 tx/hari).

- Kontrak game: `0x618Cd4F7a020a9814B17B68fD9b2Dc5F3b5D06b6` (Celo 42220)
- Tiap deposit `0.001 CELO` → mint `1 API` ke wallet itu (rasio 1 CELO = 1000 API).

> ⚠️ **Risiko sybil.** 100 wallet baru menyetor ke kontrak yang sama 4×/hari
> berpola jelas sebagai farming. Dana & kontrak milikmu sendiri, jadi sah — tapi
> kalau ada program insentif/airdrop Celo, pola ini biasanya kena filter.

> 🔐 **Keamanan kunci.** `wallets.json` (100 private key) dan `.env`
> (private key funding) **tidak** di-commit (lihat `.gitignore`). Backup
> `wallets.json` di tempat aman — kalau hilang, dana di 100 wallet ikut hilang.

## Setup (sekali)

```powershell
cd C:\batu-api\onchain-bot
npm install
copy .env.example .env       # lalu isi FUNDING_PRIVATE_KEY di .env
npm run generate             # buat 100 wallet -> wallets.json
npm run distribute           # sebar CELO funding -> 100 wallet
```

### Soal "1 CELO per wallet"

100 CELO **tidak** cukup untuk `100 × 1.0 CELO` **plus gas** distribusi. Default
`AMOUNT_PER_WALLET=0.99` menyisakan ruang gas. Tiap wallet cuma butuh
`0.001 × 4 = 0.004 CELO/hari` + gas, jadi 0.99 cukup untuk ratusan hari.
Kalau funding-mu > 100 CELO, naikkan `AMOUNT_PER_WALLET` di `.env`.

`distribute.js` idempoten: kalau putus di tengah, jalankan lagi — wallet yang
sudah terdanai dilewati.

## Jalankan deposit (manual / tes)

```powershell
npm run deposit       # 100 wallet deposit 0.001 CELO sekali jalan
npm run balances      # ringkasan saldo CELO & API
```

Log per run tersimpan di `logs/deposit.log` (tx hash tiap wallet).

## Pasang cronjob (4×/hari)

Task Scheduler Windows, jam 00:00 / 06:00 / 12:00 / 18:00. **Run as Administrator:**

```powershell
powershell -ExecutionPolicy Bypass -File setup-cron.ps1
```

Ganti jadwal:

```powershell
powershell -ExecutionPolicy Bypass -File setup-cron.ps1 -Times "02:00","08:00","14:00","20:00"
```

Tes / hapus:

```powershell
Start-ScheduledTask -TaskName BatuApiDeposit              # jalankan sekarang
powershell -ExecutionPolicy Bypass -File setup-cron.ps1 -Remove
```

## File

| File | Fungsi |
|---|---|
| `generate-wallets.js` | buat N wallet → `wallets.json` (tolak timpa tanpa `--force`) |
| `distribute.js` | funding wallet → kirim CELO ke tiap wallet (idempoten) |
| `deposit-run.js` | **target cron** — tiap wallet deposit 0.001 CELO |
| `balances.js` | ringkasan saldo CELO + API |
| `setup-cron.ps1` | daftar/hapus Task Scheduler 4×/hari |
| `run-deposit.cmd` | wrapper yang dipanggil scheduler |

## Penarikan dana

Tidak ada script auto-withdraw. CELO yang sudah masuk game tertahan sebagai
backing API; tiap wallet bisa `withdraw(apiAmount)` (kelipatan 1000 API = 1 CELO)
untuk menariknya. API hasil deposit 0.001 (= 1 API) di bawah ambang withdraw,
jadi kalau mau tarik balik, akumulasikan ≥ 1000 API per wallet dulu.
