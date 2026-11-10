// src/data/mockOperator.js
// Data mock untuk halaman Operator. Nanti diganti API ExpressJS.

import { mockObat } from "./mockData";

// ============================================================
// 1. DATA MOCK
// ============================================================

export const mockBatchObat = [
  {
    id: 1,
    obatId: 1,
    kodeObat: "OBT-001",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240101",
    expiry: "2027-03-15",
    stok: 5000,
    stokAwalTahun: 1020,
    satuan: "Tablet",
    pabrik: "Kimia Farma",
    sumberAnggaran: "APBD Provinsi",
    hargaSatuan: 250,
    status: "normal",
  },
  {
    id: 2,
    obatId: 1,
    kodeObat: "OBT-001",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240205",
    expiry: "2026-12-20",
    stok: 2000,
    stokAwalTahun: 2500,
    satuan: "Tablet",
    pabrik: "Kimia Farma",
    sumberAnggaran: "APBD Provinsi",
    hargaSatuan: 250,
    status: "normal",
  },
  {
    id: 3,
    obatId: 2,
    kodeObat: "OBT-002",
    namaObat: "Amoksisilin 500mg",
    noBatch: "B240150",
    expiry: "2027-06-30",
    stok: 3000,
    stokAwalTahun: 0,
    satuan: "Kapsul",
    pabrik: "Kalbe Farma",
    sumberAnggaran: "DAK Fisik",
    hargaSatuan: 500,
    status: "normal",
  },
  {
    id: 4,
    obatId: 2,
    kodeObat: "OBT-002",
    namaObat: "Amoksisilin 500mg",
    noBatch: "B240310",
    expiry: "2026-11-15",
    stok: 800,
    stokAwalTahun: 750,
    satuan: "Kapsul",
    pabrik: "Kalbe Farma",
    sumberAnggaran: "DAK Fisik",
    hargaSatuan: 500,
    status: "normal",
  },
  {
    id: 5,
    obatId: 3,
    kodeObat: "OBT-003",
    namaObat: "Oralit 200ml",
    noBatch: "B240220",
    expiry: "2027-02-10",
    stok: 1500,
    stokAwalTahun: 220,
    satuan: "Sachet",
    pabrik: "Indofarma",
    sumberAnggaran: "APBD Provinsi",
    hargaSatuan: 800,
    status: "normal",
  },
  {
    id: 6,
    obatId: 4,
    kodeObat: "OBT-004",
    namaObat: "Rifampisin 450mg",
    noBatch: "B240401",
    expiry: "2027-01-05",
    stok: 600,
    stokAwalTahun: 0,
    satuan: "Tablet",
    pabrik: "Sanbe Farma",
    sumberAnggaran: "APBN Kemenkes",
    hargaSatuan: 1200,
    status: "normal",
  },
  {
    id: 7,
    obatId: 4,
    kodeObat: "OBT-004",
    namaObat: "Rifampisin 450mg",
    noBatch: "B240102",
    expiry: "2026-10-25",
    stok: 200,
    stokAwalTahun: 0,
    satuan: "Tablet",
    pabrik: "Sanbe Farma",
    sumberAnggaran: "APBN Kemenkes",
    hargaSatuan: 1200,
    status: "expired",
  },
  {
    id: 8,
    obatId: 5,
    kodeObat: "OBT-005",
    namaObat: "Artemeter-Lumefantrine",
    noBatch: "B240305",
    expiry: "2026-09-15",
    stok: 150,
    stokAwalTahun: 150,
    satuan: "Tablet",
    pabrik: "Kimia Farma",
    sumberAnggaran: "APBN Kemenkes",
    hargaSatuan: 1500,
    status: "expired",
  },
];

export const mockPenerimaan = [
  {
    id: 1,
    noSPB: "SPB/2026/001",
    noSBBK: "SBBK-KEMKES-001",
    tanggal: "2026-10-20",
    asal: "Kemenkes RI",
    sumberAnggaran: "APBN Kemenkes",
    status: "selesai",
    petugas: "marsela",
    totalItem: 3,
    items: [
      {
        obatId: 1,
        namaObat: "Parasetamol 500mg",
        noBatch: "B240101",
        expiry: "2027-03-15",
        jumlahDokumen: 5000,
        jumlahDiterima: 5000,
        hargaSatuan: 250,
        pabrik: "Kimia Farma",
      },
      {
        obatId: 2,
        namaObat: "Amoksisilin 500mg",
        noBatch: "B240150",
        expiry: "2027-06-30",
        jumlahDokumen: 3000,
        jumlahDiterima: 3000,
        hargaSatuan: 500,
        pabrik: "Kalbe Farma",
      },
      {
        obatId: 4,
        namaObat: "Rifampisin 450mg",
        noBatch: "B240401",
        expiry: "2027-01-05",
        jumlahDokumen: 600,
        jumlahDiterima: 600,
        hargaSatuan: 1200,
        pabrik: "Sanbe Farma",
      },
    ],
  },
  {
    id: 2,
    noSPB: "SPB/2026/002",
    noSBBK: "SBBK-KEMKES-002",
    tanggal: "2026-10-18",
    asal: "Kemenkes RI",
    sumberAnggaran: "APBN Kemenkes",
    status: "discrepancy",
    petugas: "marsela",
    totalItem: 2,
    catatan:
      "Kelebihan 100 tablet Parasetamol dari Kemenkes. Menunggu keputusan SBBK baru.",
    items: [
      {
        obatId: 1,
        namaObat: "Parasetamol 500mg",
        noBatch: "B240205",
        expiry: "2026-12-20",
        jumlahDokumen: 2000,
        jumlahDiterima: 2100,
        hargaSatuan: 250,
        pabrik: "Kimia Farma",
      },
      {
        obatId: 3,
        namaObat: "Oralit 200ml",
        noBatch: "B240220",
        expiry: "2027-02-10",
        jumlahDokumen: 1500,
        jumlahDiterima: 1500,
        hargaSatuan: 800,
        pabrik: "Indofarma",
      },
    ],
  },
  {
    id: 3,
    noSPB: "SPB/2026/003",
    noSBBK: "SBBK-KEMKES-003",
    tanggal: "2026-10-15",
    asal: "Kemenkes RI",
    sumberAnggaran: "APBN Kemenkes",
    status: "parsial",
    petugas: "staf.program",
    totalItem: 1,
    catatan: "Kurang 200 tablet Rifampisin. Sisanya akan dikirim menyusul.",
    items: [
      {
        obatId: 4,
        namaObat: "Rifampisin 450mg",
        noBatch: "B240102",
        expiry: "2026-10-25",
        jumlahDokumen: 400,
        jumlahDiterima: 200,
        hargaSatuan: 1200,
        pabrik: "Sanbe Farma",
      },
    ],
  },
  {
    id: 4,
    noSPB: "SPB/2026/004",
    noSBBK: "SBBK-KEMKES-004",
    tanggal: "2026-10-12",
    asal: "Kemenkes RI",
    sumberAnggaran: "APBN Kemenkes",
    status: "pending",
    petugas: "marsela",
    totalItem: 1,
    catatan: "Menunggu verifikasi fisik.",
    items: [
      {
        obatId: 5,
        namaObat: "Artemeter-Lumefantrine",
        noBatch: "B240305",
        expiry: "2026-09-15",
        jumlahDokumen: 150,
        jumlahDiterima: 0,
        hargaSatuan: 1500,
        pabrik: "Kimia Farma",
      },
    ],
  },
];

export const mockSBBK = [
  {
    id: 1,
    nomor: "SBBK-2026-0012",
    tanggal: "2026-10-20",
    ifk: "IFK Kota Manado",
    permintaanId: 1,
    permintaanNomor: "PRM/MND/2026/001",
    status: "terbit",
    cetakUlangKe: 0,
    items: [
      {
        batchId: 2,
        obatId: 1,
        namaObat: "Parasetamol 500mg",
        noBatch: "B240205",
        expiry: "2026-12-20",
        jumlah: 500,
        satuan: "Tablet",
      },
      {
        batchId: 5,
        obatId: 3,
        namaObat: "Oralit 200ml",
        noBatch: "B240220",
        expiry: "2027-02-10",
        jumlah: 200,
        satuan: "Sachet",
      },
    ],
  },
  {
    id: 3,
    nomor: "SBBK-2026-0010",
    tanggal: "2026-10-15",
    ifk: "IFK Kota Bitung",
    permintaanId: 3,
    permintaanNomor: "PRM/BTG/2026/001",
    status: "terbit",
    cetakUlangKe: 2,
    items: [
      {
        batchId: 1,
        obatId: 1,
        namaObat: "Parasetamol 500mg",
        noBatch: "B240101",
        expiry: "2027-03-15",
        jumlah: 1000,
        satuan: "Tablet",
      },
    ],
  },
];
export const mockStockOpname = [
  {
    id: 1,
    nomor: "SO-2026-10-001",
    periode: "Oktober 2026",
    tanggal: "2026-10-31",
    status: "selesai",
    totalItem: 8,
    totalItemSelisih: 2,
    totalVariance: -40,
    items: [
      {
        batchId: 1,
        kodeObat: "OBT-001",
        namaObat: "Parasetamol 500mg",
        noBatch: "B240101",
        satuan: "Tablet",
        stokSistem: 5000,
        stokFisik: 4980,
        selisih: -20,
        kategoriAlasan: "Rusak",
        alasan: "Rusak saat penyimpanan",
      },
      {
        batchId: 2,
        kodeObat: "OBT-001",
        namaObat: "Parasetamol 500mg",
        noBatch: "B240205",
        satuan: "Tablet",
        stokSistem: 2000,
        stokFisik: 2000,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
      {
        batchId: 3,
        kodeObat: "OBT-002",
        namaObat: "Amoksisilin 500mg",
        noBatch: "B240150",
        satuan: "Kapsul",
        stokSistem: 3000,
        stokFisik: 3000,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
      {
        batchId: 4,
        kodeObat: "OBT-002",
        namaObat: "Amoksisilin 500mg",
        noBatch: "B240310",
        satuan: "Kapsul",
        stokSistem: 800,
        stokFisik: 800,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
      {
        batchId: 5,
        kodeObat: "OBT-003",
        namaObat: "Oralit 200ml",
        noBatch: "B240220",
        satuan: "Sachet",
        stokSistem: 1500,
        stokFisik: 1480,
        selisih: -20,
        kategoriAlasan: "Selisih Hitung",
        alasan: "Selisih hitung saat recount",
      },
      {
        batchId: 6,
        kodeObat: "OBT-004",
        namaObat: "Rifampisin 450mg",
        noBatch: "B240401",
        satuan: "Tablet",
        stokSistem: 600,
        stokFisik: 600,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
      {
        batchId: 7,
        kodeObat: "OBT-004",
        namaObat: "Rifampisin 450mg",
        noBatch: "B240102",
        satuan: "Tablet",
        stokSistem: 200,
        stokFisik: 200,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
      {
        batchId: 8,
        kodeObat: "OBT-005",
        namaObat: "Artemeter-Lumefantrine",
        noBatch: "B240305",
        satuan: "Tablet",
        stokSistem: 150,
        stokFisik: 150,
        selisih: 0,
        kategoriAlasan: "-",
        alasan: "-",
      },
    ],
  },
  {
    id: 2,
    nomor: "SO-2026-09-001",
    periode: "September 2026",
    tanggal: "2026-09-30",
    status: "selesai",
    totalItem: 6,
    totalItemSelisih: 0,
    totalVariance: 0,
    items: [],
  },
];

export const mockAdjustment = [
  {
    id: 1,
    tanggal: "2026-10-31",
    obatId: 1,
    namaObat: "Parasetamol 500mg",
    noBatch: "B240101",
    jenis: "kurang",
    jumlah: 20,
    kategoriAlasan: "Rusak",
    alasan: "Rusak saat penyimpanan",
    referensi: "SO-2026-10-001",
  },
  {
    id: 2,
    tanggal: "2026-10-31",
    obatId: 3,
    namaObat: "Oralit 200ml",
    noBatch: "B240220",
    jenis: "kurang",
    jumlah: 20,
    kategoriAlasan: "Selisih Hitung",
    alasan: "Selisih hitung saat recount",
    referensi: "SO-2026-10-001",
  },
  {
    id: 3,
    tanggal: "2026-10-15",
    obatId: 2,
    namaObat: "Amoksisilin 500mg",
    noBatch: "B240310",
    jenis: "tambah",
    jumlah: 50,
    kategoriAlasan: "Salah Input",
    alasan: "Koreksi salah input penerimaan",
    referensi: "ADJ-2026-003",
  },
];

export const kategoriAlasanOpname = [
  { value: "Rusak", label: "Rusak (pecah, retak, penyimpanan)" },
  { value: "Kedaluwarsa", label: "Kedaluwarsa" },
  { value: "Selisih Hitung", label: "Selisih Hitung" },
  { value: "Salah Input", label: "Salah Input Penerimaan/Pengeluaran" },
  { value: "Retur", label: "Retur dari IFK" },
  { value: "Lainnya", label: "Lainnya" },
];

// ============================================================
// Helper SBBK (draft & terbit di localStorage)
// ============================================================
export const getAllSBBK = () => {
  const local = JSON.parse(localStorage.getItem("sbbkList") || "[]");
  return [...mockSBBK, ...local].sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
};

export const saveSBBK = (sbbk) => {
  const stored = JSON.parse(localStorage.getItem("sbbkList") || "[]");
  const idx = stored.findIndex((s) => s.id === sbbk.id);
  if (idx >= 0) stored[idx] = sbbk;
  else stored.unshift(sbbk);
  localStorage.setItem("sbbkList", JSON.stringify(stored));
};

export const deleteSBBK = (id) => {
  const stored = JSON.parse(localStorage.getItem("sbbkList") || "[]");
  localStorage.setItem(
    "sbbkList",
    JSON.stringify(stored.filter((s) => s.id !== id)),
  );
};

export const getSBBKById = (id) => {
  return getAllSBBK().find((s) => s.id === Number(id));
};

export const hasSBBKForPermintaan = (permintaanId) => {
  return getAllSBBK().some((s) => s.permintaanId === Number(permintaanId));
};

export const mockRiwayatTransaksi = [
  {
    id: 1,
    tanggal: "2026-10-31 14:20:00",
    jenis: "Adjustment",
    referensi: "SO-Okt-2026",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240101",
    masuk: 0,
    keluar: 20,
    petugas: "marsela",
    keterangan: "Rusak saat penyimpanan",
  },
  {
    id: 2,
    tanggal: "2026-10-31 14:20:00",
    jenis: "Adjustment",
    referensi: "SO-Okt-2026",
    namaObat: "Oralit 200ml",
    noBatch: "B240220",
    masuk: 0,
    keluar: 20,
    petugas: "marsela",
    keterangan: "Selisih hitung",
  },
  {
    id: 3,
    tanggal: "2026-10-20 10:15:00",
    jenis: "SBBK",
    referensi: "SBBK-2026-0012",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240205",
    masuk: 0,
    keluar: 500,
    petugas: "marsela",
    keterangan: "Distribusi ke IFK Kota Manado",
  },
  {
    id: 4,
    tanggal: "2026-10-20 10:15:00",
    jenis: "SBBK",
    referensi: "SBBK-2026-0012",
    namaObat: "Oralit 200ml",
    noBatch: "B240220",
    masuk: 0,
    keluar: 200,
    petugas: "marsela",
    keterangan: "Distribusi ke IFK Kota Manado",
  },
  {
    id: 5,
    tanggal: "2026-10-20 09:00:00",
    jenis: "Penerimaan",
    referensi: "SPB/2026/001",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240101",
    masuk: 5000,
    keluar: 0,
    petugas: "marsela",
    keterangan: "Dari Kemenkes RI",
  },
  {
    id: 6,
    tanggal: "2026-10-18 11:30:00",
    jenis: "Penerimaan",
    referensi: "SPB/2026/002",
    namaObat: "Oralit 200ml",
    noBatch: "B240220",
    masuk: 1500,
    keluar: 0,
    petugas: "marsela",
    keterangan: "Dari Kemenkes RI (discrepancy)",
  },
  {
    id: 9,
    tanggal: "2026-10-15 09:00:00",
    jenis: "SBBK",
    referensi: "SBBK-2026-0010",
    namaObat: "Parasetamol 500mg",
    noBatch: "B240101",
    masuk: 0,
    keluar: 1000,
    petugas: "marsela",
    keterangan: "Distribusi ke IFK Kota Bitung",
  },
  {
    id: 10,
    tanggal: "2026-10-15 10:30:00",
    jenis: "Penerimaan",
    referensi: "SPB/2026/003",
    namaObat: "Rifampisin 450mg",
    noBatch: "B240102",
    masuk: 200,
    keluar: 0,
    petugas: "marsela",
    keterangan: "Dari Kemenkes RI (parsial)",
  },
  {
    id: 11,
    tanggal: "2026-10-15 10:00:00",
    jenis: "Adjustment",
    referensi: "ADJ-2026-003",
    namaObat: "Amoksisilin 500mg",
    noBatch: "B240310",
    masuk: 50,
    keluar: 0,
    petugas: "marsela",
    keterangan: "Koreksi salah input penerimaan",
  },
];

// ============================================================
// 2. HELPER FUNCTIONS (hanya SATU deklarasi per fungsi)
// ============================================================

// Mendapatkan jenis & program dari kode obat
export const getObatInfo = (kodeObat) => {
  const obat = mockObat.find((o) => o.kode === kodeObat);
  return {
    jenis: obat?.jenis || "-",
    program: obat?.program || "-",
  };
};

// Label gabungan untuk display
export const getJenisProgramLabel = (jenis, program) => {
  if (jenis === "Program") return `Program: ${program}`;
  if (jenis === "Buffer") return "Buffer";
  return "-";
};

// Lookup harga satuan dari kombinasi obatId + noBatch
export const getHargaFromBatch = (obatId, noBatch) => {
  const b = mockBatchObat.find(
    (x) => x.obatId === obatId && x.noBatch === noBatch,
  );
  return b?.hargaSatuan || 0;
};

// Lookup jenis & program dari obatId
export const getJenisByObatId = (obatId) => {
  const o = mockObat.find((x) => x.id === obatId);
  return o
    ? { jenis: o.jenis, program: o.program }
    : { jenis: "-", program: "-" };
};

// Opsi dropdown jenis-program
export const jenisProgramOptions = [
  { value: "Buffer", label: "Buffer" },
  { value: "Program:TBC", label: "Program: TBC" },
  { value: "Program:Malaria", label: "Program: Malaria" },
  { value: "Program:HIV/AIDS", label: "Program: HIV/AIDS" },
  { value: "Program:Kusta", label: "Program: Kusta" },
  { value: "Program:Hepatitis", label: "Program: Hepatitis" },
];

// Cek apakah obat cocok dengan nilai filter jenis-program
export const matchesJenisValue = (obat, jenisValue) => {
  if (!jenisValue) return true;
  if (jenisValue === "Buffer") return obat.jenis === "Buffer";
  if (jenisValue.startsWith("Program:")) {
    const prog = jenisValue.split(":")[1];
    return obat.jenis === "Program" && obat.program === prog;
  }
  return true;
};
// Data permintaan kab/kota (mock awal; modul lengkap di Batch 2)
export const mockPermintaan = [
  {
    id: 1,
    nomorSurat: "PRM/MND/2026/001",
    tanggal: "2026-10-15",
    kabKota: "IFK Kota Manado",
    status: "pending",
    catatan: "Kebutuhan TW4 2026",
    items: [
      {
        obatId: 1,
        kodeObat: "OBT-001",
        namaObat: "Parasetamol 500mg",
        satuan: "Tablet",
        jumlahDiminta: 500,
      },
      {
        obatId: 3,
        kodeObat: "OBT-003",
        namaObat: "Oralit 200ml",
        satuan: "Sachet",
        jumlahDiminta: 300,
      },
    ],
  },
  {
    id: 2,
    nomorSurat: "PRM/MIN/2026/001",
    tanggal: "2026-10-10",
    kabKota: "IFK Kab. Minahasa",
    status: "pending",
    catatan: "Kebutuhan TW4 2026",
    items: [
      {
        obatId: 2,
        kodeObat: "OBT-002",
        namaObat: "Amoksisilin 500mg",
        satuan: "Kapsul",
        jumlahDiminta: 200,
      },
    ],
  },
  {
    id: 3,
    nomorSurat: "PRM/BTG/2026/001",
    tanggal: "2026-09-20",
    kabKota: "IFK Kota Bitung",
    status: "selesai",
    catatan: "Kebutuhan TW3 2026 (sudah terkirim)",
    items: [
      {
        obatId: 1,
        kodeObat: "OBT-001",
        namaObat: "Parasetamol 500mg",
        satuan: "Tablet",
        jumlahDiminta: 1000,
      },
    ],
  },
  {
    id: 4,
    nomorSurat: "PRM/MND/2026/002",
    tanggal: "2026-11-01",
    kabKota: "IFK Kota Manado",
    status: "pending",
    catatan:
      "Kebutuhan TW4 2026 — pasien TBC meningkat, permintaan melebihi stok tersedia",
    items: [
      {
        obatId: 4,
        kodeObat: "OBT-004",
        namaObat: "Rifampisin 450mg",
        satuan: "Tablet",
        jumlahDiminta: 1000,
      },
      {
        obatId: 3,
        kodeObat: "OBT-003",
        namaObat: "Oralit 200ml",
        satuan: "Sachet",
        jumlahDiminta: 2000,
      },
      {
        obatId: 1,
        kodeObat: "OBT-001",
        namaObat: "Parasetamol 500mg",
        satuan: "Tablet",
        jumlahDiminta: 3000,
      },
    ],
  },
];
// ============================================================
// Helper: hitung status & warna berdasarkan sisa hari
// Status bisnis hanya "normal" atau "expired".
// Warna (danger/warning/caution/safe) hanya panduan visual.
// ============================================================
export const getExpiryInfo = (batch) => {
  const d = Math.ceil((new Date(batch.expiry) - new Date()) / 86400000);
  if (d < 0) {
    return {
      status: "expired",
      days: d,
      label: `Kedaluwarsa ${Math.abs(d)} hari lalu`,
      color: "danger",
      badgeClass: "badge-danger",
    };
  }
  if (d <= 180) {
    return {
      status: "normal",
      days: d,
      label: `${d} hari lagi`,
      color: "danger",
      badgeClass: "badge-danger",
    };
  }
  if (d <= 240) {
    return {
      status: "normal",
      days: d,
      label: `${d} hari lagi`,
      color: "warning",
      badgeClass: "badge-warning",
    };
  }
  return {
    status: "normal",
    days: d,
    label: `${d} hari lagi`,
    color: "safe",
    badgeClass: "badge-success",
  };
};
