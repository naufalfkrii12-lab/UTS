/* Data dummy (pengganti database). Format: Array of Object (JSON). */

const dataKatalogBuku = [
  { kode: "BK-001", judul: "Dasar-Dasar Pemrograman Web", penulis: "Rina Wijaya", kategori: "Teknologi", harga: 85000, stok: 24, gambar: "img/buku1.png" },
  { kode: "BK-002", judul: "CSS untuk Antarmuka Modern", penulis: "Dimas Prakoso", kategori: "Desain", harga: 92000, stok: 15, gambar: "img/buku2.png" },
  { kode: "BK-003", judul: "JavaScript dari Nol", penulis: "Sari Anggraini", kategori: "Teknologi", harga: 98000, stok: 8, gambar: "img/buku3.png" },
  { kode: "BK-004", judul: "Strategi Bisnis Toko Online", penulis: "Hendra Gunawan", kategori: "Bisnis", harga: 75000, stok: 30, gambar: "img/buku4.png" },
  { kode: "BK-005", judul: "Senja di Kota Tua", penulis: "Laras Maheswari", kategori: "Fiksi", harga: 68000, stok: 42, gambar: "img/buku5.png" },
  { kode: "BK-006", judul: "Pengantar Astronomi", penulis: "Bayu Nugraha", kategori: "Sains", harga: 110000, stok: 6, gambar: "img/buku6.png" },
  { kode: "BK-007", judul: "Basis Data Praktis", penulis: "Fitri Handayani", kategori: "Teknologi", harga: 89000, stok: 19, gambar: "img/buku7.png" },
  { kode: "BK-008", judul: "Desain Antarmuka Pengguna", penulis: "Kevin Pratama", kategori: "Desain", harga: 105000, stok: 12, gambar: "img/buku8.png" }
];

const dataPengguna = [
  { nama: "Admin Toko", email: "admin@tokobuku.id", password: "admin123" },
  { nama: "Budi Santoso", email: "budi@tokobuku.id", password: "budi123" }
];

const dataEkspedisi = [
  { nama: "JNE", ongkir: 18000 },
  { nama: "J&T Express", ongkir: 15000 },
  { nama: "SiCepat", ongkir: 14000 },
  { nama: "Pos Indonesia", ongkir: 12000 }
];

/* status: 0 Pesanan diterima, 1 Dikemas, 2 Dalam pengiriman, 3 Transit, 4 Terkirim */
const langkahPengiriman = ["Pesanan diterima", "Dikemas", "Dalam pengiriman", "Transit", "Terkirim"];

const dataTracking = [
  { no: "DO-2026-0001", nama: "Andi Pratama", status: 4, ekspedisi: "JNE", tanggalKirim: "2026-10-12", jenisPaket: "Reguler", total: 203000 },
  { no: "DO-2026-0002", nama: "Siti Rahma", status: 3, ekspedisi: "J&T Express", tanggalKirim: "2026-10-28", jenisPaket: "Express", total: 297000 },
  { no: "DO-2026-0003", nama: "Joko Widodo Putra", status: 2, ekspedisi: "SiCepat", tanggalKirim: "2026-11-01", jenisPaket: "Reguler", total: 134000 },
  { no: "DO-2026-0004", nama: "Maya Lestari", status: 1, ekspedisi: "Pos Indonesia", tanggalKirim: "2026-11-02", jenisPaket: "Reguler", total: 92000 }
];
