---
name: Tus-Cup
last_updated: 2026-07-01
---

# Tus-Cup Strategy

## Target problem

Penyelenggara turnamen game/olahraga mengelola data secara manual (spreadsheet/WA), sehingga bracket sering salah update dan memicu protes pemain, panitia kebanjiran pertanyaan skor berulang dari peserta dan penonton, dan hasil akhir diragukan karena tidak ada rekam jejak yang bisa diaudit.

## Our approach

Tus-cup bertaruh pada transparansi real-time — satu sumber data yang sama dilihat panitia, pemain, dan penonton secara bersamaan, didukung otomasi bracket dan audit trail sebagai mekanismenya, sehingga tidak ada versi berbeda yang bisa diperdebatkan.

## Who it's for

**Primary:** Panitia/admin turnamen - Mereka menyewa Tus-Cup untuk mengelola turnamen dari setup (bracket, peserta, jadwal) sampai berlangsung live (update skor real-time), supaya bracket dan penonton ter-update otomatis tanpa panitia harus menjawab pertanyaan manual satu-satu.

## Key metrics

- **Rasio pertanyaan manual** - jumlah pertanyaan skor/hasil yang masih masuk ke WA panitia per turnamen (target: turun ke nol)
- **Koreksi manual bracket** - jumlah kali panitia harus memperbaiki bracket yang salah otomatis-update per turnamen
- **Akses live view** - jumlah penonton/pemain yang mengakses live view per turnamen
- **Sengketa hasil** - jumlah sengketa/protes hasil per turnamen

## Tracks

### Live data engine

Otomasi bracket & update skor real-time - fondasi teknis supaya data selalu akurat dan konsisten begitu skor masuk.

_Why it serves the approach:_ Tanpa ini, transparansi real-time tidak mungkin karena selalu ada celah manual.

### Public transparency layer

Live view untuk penonton/pemain yang menampilkan data yang sama dengan yang dilihat panitia.

_Why it serves the approach:_ Ini wujud nyata dari "semua orang lihat data yang sama, di layar yang sama".

### Audit & trust

Pencatatan siapa-kapan-apa untuk setiap perubahan skor atau data turnamen.

_Why it serves the approach:_ Memberi bukti ketika ada yang meragukan hasil, menutup celah protes.
