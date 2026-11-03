"use strict";

/* ===== Helper umum ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const rupiah = (n) => "Rp" + Number(n).toLocaleString("id-ID");
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const simpan = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const ambil = (k, def) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch { return def; }
};
const getKatalog = () => ambil("katalog", dataKatalogBuku.map((b) => ({ ...b })));
const getUsers = () => [...dataPengguna, ...ambil("penggunaBaru", [])];
const getTransaksi = () => [...ambil("riwayat", []), ...dataTracking];
const getSesi = () => { try { return JSON.parse(sessionStorage.getItem("sesi")); } catch { return null; } };

/* Tampilkan / hapus pesan error di bawah input. Return true jika valid. */
function cek(input, pesan) {
  const err = input.closest(".field").querySelector(".error");
  err.textContent = pesan || "";
  input.setAttribute("aria-invalid", pesan ? "true" : "false");
  return !pesan;
}

/* Buka/tutup modal box (<dialog>) */
document.addEventListener("click", (e) => {
  const buka = e.target.closest("[data-open]");
  if (buka) $("#" + buka.dataset.open).showModal();
  if (e.target.closest("[data-close]")) e.target.closest("dialog").close();
  if (e.target.tagName === "DIALOG") e.target.close(); // klik area gelap
});

/* ===== Proteksi halaman & header ===== */
const halaman = document.body.dataset.page;
if (halaman !== "login") {
  const sesi = getSesi();
  if (!sesi) location.replace("index.html");
  else {
    $("#namaUser").textContent = sesi.nama;
    $("#btnLogout").addEventListener("click", () => {
      if (confirm("Yakin ingin keluar?")) { sessionStorage.removeItem("sesi"); location.href = "index.html"; }
    });
  }
}

/* ===== LOGIN ===== */
function initLogin() {
  $("#formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    const em = $("#email"), pw = $("#password");
    const v = em.value.trim();
    const okE = cek(em, !v ? "Email wajib diisi." : !emailRe.test(v) ? "Format email tidak valid." : "");
    const okP = cek(pw, !pw.value ? "Password wajib diisi." : "");
    if (!okE || !okP) return;

    const u = getUsers().find((x) => x.email.toLowerCase() === v.toLowerCase() && x.password === pw.value);
    if (!u) { alert("Email/password yang Anda masukkan salah"); return; }
    sessionStorage.setItem("sesi", JSON.stringify({ nama: u.nama, email: u.email }));
    location.href = "dashboard.html";
  });

  $("#formLupa").addEventListener("submit", (e) => {
    e.preventDefault();
    const em = $("#emailLupa"), v = em.value.trim();
    const ada = getUsers().some((x) => x.email.toLowerCase() === v.toLowerCase());
    const ok = cek(em, !v ? "Email wajib diisi." : !emailRe.test(v) ? "Format email tidak valid." : !ada ? "Email belum terdaftar." : "");
    if (!ok) return;
    alert("Tautan reset password telah dikirim ke " + v + " (simulasi).");
    e.target.reset(); $("#dlgLupa").close();
  });

  $("#formDaftar").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = $("#dNama"), em = $("#dEmail"), p1 = $("#dPass"), p2 = $("#dPass2");
    const v = em.value.trim();
    const r = [
      cek(n, n.value.trim().length < 3 ? "Nama minimal 3 karakter." : ""),
      cek(em, !emailRe.test(v) ? "Format email tidak valid." : getUsers().some((x) => x.email.toLowerCase() === v.toLowerCase()) ? "Email sudah terdaftar." : ""),
      cek(p1, p1.value.length < 6 ? "Password minimal 6 karakter." : ""),
      cek(p2, p2.value !== p1.value ? "Password tidak sama." : "")
    ];
    if (r.includes(false)) return;
    const baru = ambil("penggunaBaru", []);
    baru.push({ nama: n.value.trim(), email: v, password: p1.value });
    simpan("penggunaBaru", baru);
    alert("Akun berhasil dibuat. Silakan login.");
    $("#email").value = v;
    e.target.reset(); $("#dlgDaftar").close();
  });
}

/* ===== DASHBOARD ===== */
function initDashboard() {
  const jam = new Date().getHours();
  const sapa = jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam";
  $("#greeting").textContent = sapa;
  $("#heroNama").textContent = getSesi().nama;
  const tampil = () => {
    $("#jam").textContent = new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });
  };
  tampil(); setInterval(tampil, 30000);
}

/* ===== STOK / KATALOG ===== */
function initStok() {
  const katalog = getKatalog();
  const tbody = $("#tbodyStok");

  function buatBaris(b, idx) {
    const tr = document.createElement("tr");
    const sel = (teks, cls) => { const td = document.createElement("td"); td.textContent = teks; if (cls) td.className = cls; return td; };

    tr.appendChild(sel(b.kode));
    const tdImg = document.createElement("td");
    const img = document.createElement("img");
    img.src = b.gambar; img.alt = "Sampul " + b.judul; img.className = "cover";
    img.onerror = () => { img.style.visibility = "hidden"; };
    tdImg.appendChild(img); tr.appendChild(tdImg);
    tr.appendChild(sel(b.judul));
    tr.appendChild(sel(b.penulis));
    tr.appendChild(sel(b.kategori));
    tr.appendChild(sel(rupiah(b.harga), "num"));
    const tdStok = sel(b.stok, "num");
    if (b.stok < 10) { tdStok.classList.add("low"); tdStok.title = "Stok menipis"; }
    tr.appendChild(tdStok);

    const tdAksi = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "btn btn-danger btn-sm"; btn.textContent = "Hapus";
    btn.addEventListener("click", () => {
      if (!confirm('Hapus "' + b.judul + '" dari katalog?')) return;
      katalog.splice(katalog.indexOf(b), 1);
      simpan("katalog", katalog); render();
    });
    tdAksi.appendChild(btn); tr.appendChild(tdAksi);
    return tr;
  }

  function render() {
    const q = $("#cari").value.trim().toLowerCase();
    tbody.replaceChildren();
    const tampil = katalog.filter((b) => (b.judul + " " + b.penulis).toLowerCase().includes(q));
    tampil.forEach((b) => tbody.appendChild(buatBaris(b)));
    if (!tampil.length) {
      const tr = document.createElement("tr"), td = document.createElement("td");
      td.colSpan = 8; td.className = "empty"; td.textContent = "Tidak ada buku yang cocok. Ubah kata kunci atau tambah stok baru.";
      tr.appendChild(td); tbody.appendChild(tr);
    }
    $("#jumlahBuku").textContent = katalog.length + " judul";
  }

  $("#cari").addEventListener("input", render);

  $("#formStok").addEventListener("submit", (e) => {
    e.preventDefault();
    const j = $("#sJudul"), p = $("#sPenulis"), k = $("#sKategori"), h = $("#sHarga"), s = $("#sStok");
    const r = [
      cek(j, j.value.trim().length < 3 ? "Judul minimal 3 karakter." : ""),
      cek(p, !p.value.trim() ? "Nama penulis wajib diisi." : ""),
      cek(k, !k.value ? "Pilih kategori." : ""),
      cek(h, !(Number(h.value) >= 1000) ? "Harga minimal Rp1.000." : ""),
      cek(s, !(Number.isInteger(Number(s.value)) && Number(s.value) >= 1) ? "Stok harus bilangan bulat ≥ 1." : "")
    ];
    if (r.includes(false)) { alert("Data belum lengkap. Periksa kolom yang ditandai."); return; }

    const nomor = katalog.reduce((m, b) => Math.max(m, parseInt(b.kode.split("-")[1], 10) || 0), 0) + 1;
    const baru = {
      kode: "BK-" + String(nomor).padStart(3, "0"), judul: j.value.trim(), penulis: p.value.trim(),
      kategori: k.value, harga: Number(h.value), stok: Number(s.value), gambar: "img/buku" + (((nomor - 1) % 8) + 1) + ".png"
    };
    katalog.push(baru);
    simpan("katalog", katalog);
    $("#cari").value = ""; render();      // tampilkan semua, termasuk baris baru
    e.target.reset();
    alert('Buku "' + baru.judul + '" ditambahkan dengan kode ' + baru.kode + ".");
  });

  render();
}

/* ===== PEMESANAN / CHECKOUT ===== */
function initCheckout() {
  const katalog = getKatalog();
  const cart = [];   // { kode, judul, harga, qty }
  const selBuku = $("#pilihBuku"), selEks = $("#ekspedisi");

  selBuku.innerHTML = '<option value="">Pilih buku</option>' +
    katalog.filter((b) => b.stok > 0).map((b) => `<option value="${b.kode}">${b.judul} (stok ${b.stok})</option>`).join("");
  selEks.innerHTML = '<option value="">Pilih ekspedisi</option>' +
    dataEkspedisi.map((x) => `<option value="${x.nama}">${x.nama} (${rupiah(x.ongkir)})</option>`).join("");

  const ongkir = () => {
    const x = dataEkspedisi.find((e) => e.nama === selEks.value);
    return (x ? x.ongkir : 0) + ($("#paket").value === "Express" ? 10000 : 0);
  };
  const subtotal = () => cart.reduce((s, i) => s + i.harga * i.qty, 0);

  function hitung() {
    const sub = subtotal(), ok = cart.length ? ongkir() : 0;
    $("#sumSub").textContent = rupiah(sub);
    $("#sumOngkir").textContent = rupiah(ok);
    $("#sumTotal").textContent = rupiah(sub + ok);
  }

  function renderCart() {
    const tbody = $("#tbodyCart");
    tbody.replaceChildren();
    if (!cart.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">Keranjang kosong. Pilih buku lalu tekan Tambah.</td></tr>';
    }
    cart.forEach((item, i) => {
      const tr = document.createElement("tr");
      const stokMax = katalog.find((b) => b.kode === item.kode).stok;
      tr.innerHTML = `<td></td><td class="num">${rupiah(item.harga)}</td>
        <td><input type="number" class="qty" min="1" max="${stokMax}" value="${item.qty}" aria-label="Jumlah ${item.judul}"></td>
        <td class="num">${rupiah(item.harga * item.qty)}</td>
        <td><button type="button" class="btn btn-danger btn-sm">Hapus</button></td>`;
      tr.firstElementChild.textContent = item.judul;
      tr.querySelector(".qty").addEventListener("change", (e) => {
        const q = parseInt(e.target.value, 10);
        if (!(q >= 1) || q > stokMax) { alert("Jumlah harus antara 1 dan " + stokMax + " (stok tersedia)."); }
        else item.qty = q;
        renderCart();
      });
      tr.querySelector("button").addEventListener("click", () => { cart.splice(i, 1); renderCart(); });
      tbody.appendChild(tr);
    });
    hitung();
  }

  $("#btnTambah").addEventListener("click", () => {
    const err = $("#errItem"), qty = parseInt($("#jumlah").value, 10);
    const b = katalog.find((x) => x.kode === selBuku.value);
    err.textContent = "";
    if (!b) { err.textContent = "Pilih buku terlebih dahulu."; return; }
    if (!(qty >= 1)) { err.textContent = "Jumlah minimal 1."; return; }
    const ada = cart.find((i) => i.kode === b.kode);
    const total = (ada ? ada.qty : 0) + qty;
    if (total > b.stok) { err.textContent = "Stok " + b.judul + " hanya " + b.stok + "."; return; }
    if (ada) ada.qty = total; else cart.push({ kode: b.kode, judul: b.judul, harga: b.harga, qty });
    selBuku.value = ""; $("#jumlah").value = 1;
    renderCart();
  });

  selEks.addEventListener("change", hitung);
  $("#paket").addEventListener("change", hitung);

  $("#formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = { nama: $("#nama"), email: $("#emailP"), telp: $("#telp"), eks: selEks, paket: $("#paket"), bayar: $("#bayar"), alamat: $("#alamat") };
    const r = [
      cek(f.nama, f.nama.value.trim().length < 3 ? "Nama minimal 3 karakter." : ""),
      cek(f.email, !emailRe.test(f.email.value.trim()) ? "Format email tidak valid." : ""),
      cek(f.telp, !/^(\+62|0)\d{8,13}$/.test(f.telp.value.trim()) ? "Nomor telepon tidak valid (contoh 08123456789)." : ""),
      cek(f.eks, !f.eks.value ? "Pilih ekspedisi." : ""),
      cek(f.paket, !f.paket.value ? "Pilih jenis paket." : ""),
      cek(f.bayar, !f.bayar.value ? "Pilih metode pembayaran." : ""),
      cek(f.alamat, f.alamat.value.trim().length < 10 ? "Alamat minimal 10 karakter." : "")
    ];
    if (!cart.length) { $("#errItem").textContent = "Tambahkan minimal satu buku ke keranjang."; r.push(false); }
    if (r.includes(false)) { alert("Pesanan belum bisa dibuat. Periksa kolom yang ditandai."); return; }

    const transaksi = ambil("riwayat", []);
    const no = "DO-" + new Date().getFullYear() + "-" + String(1000 + Math.floor(Math.random() * 9000));
    const total = subtotal() + ongkir();
    transaksi.unshift({
      no, nama: f.nama.value.trim(), status: 1, ekspedisi: f.eks.value,
      tanggalKirim: new Date().toISOString().slice(0, 10), jenisPaket: f.paket.value, total,
      pembayaran: f.bayar.value, items: cart.map((i) => ({ ...i }))
    });
    simpan("riwayat", transaksi);

    cart.forEach((i) => { katalog.find((b) => b.kode === i.kode).stok -= i.qty; });   // kurangi stok
    simpan("katalog", katalog);

    $("#noDO").textContent = no;
    $("#linkTrack").href = "tracking.html?do=" + encodeURIComponent(no);
    $("#dlgSukses").showModal();
    $("#dlgSukses").addEventListener("close", () => location.reload(), { once: true });
  });

  renderCart();
}

/* ===== TRACKING ===== */
function initTracking() {
  const form = $("#formTrack"), input = $("#noDo");

  function tampilkan(t) {
    $("#hasil").hidden = false;
    $("#hNo").textContent = t.no;
    $("#hNama").textContent = t.nama;
    $("#hStatus").textContent = langkahPengiriman[t.status];
    $("#hStatus").dataset.s = t.status;
    $("#hEkspedisi").textContent = t.ekspedisi;
    $("#hTanggal").textContent = new Date(t.tanggalKirim).toLocaleDateString("id-ID", { dateStyle: "long" });
    $("#hPaket").textContent = t.jenisPaket;
    $("#hTotal").textContent = rupiah(t.total);
    const persen = (t.status / (langkahPengiriman.length - 1)) * 100;
    $("#bar").style.width = persen + "%";
    $(".progress").setAttribute("aria-valuenow", Math.round(persen));
    $("#langkah").replaceChildren(...langkahPengiriman.map((l, i) => {
      const li = document.createElement("li");
      li.textContent = l;
      li.className = i < t.status ? "done" : i === t.status ? "now" : "";
      return li;
    }));
  }

  function cari(no) {
    const t = getTransaksi().find((x) => x.no.toLowerCase() === no.toLowerCase());
    if (!t) {
      $("#hasil").hidden = true;
      cek(input, "Nomor DO tidak ditemukan. Periksa kembali, contoh: DO-2026-0001.");
      alert("Nomor Delivery Order " + no + " tidak ditemukan.");
      return;
    }
    cek(input, ""); tampilkan(t);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!cek(input, !v ? "Nomor Delivery Order wajib diisi." : "")) return;
    cari(v);
  });

  const q = new URLSearchParams(location.search).get("do");
  if (q) { input.value = q; cari(q); }
}

/* ===== RIWAYAT ===== */
function initRiwayat() {
  const data = getTransaksi();
  $("#stJumlah").textContent = data.length;
  $("#stTotal").textContent = rupiah(data.reduce((s, t) => s + t.total, 0));
  $("#stKirim").textContent = data.filter((t) => t.status > 0 && t.status < 4).length;

  const tbody = $("#tbodyRw");
  data.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td></td><td></td><td></td><td></td><td class="num"></td><td><span class="badge badge-status" data-s="${t.status}"></span></td><td><a class="btn btn-ghost btn-sm">Lacak</a></td>`;
    const c = tr.children;
    c[0].textContent = t.no;
    c[1].textContent = new Date(t.tanggalKirim).toLocaleDateString("id-ID", { dateStyle: "medium" });
    c[2].textContent = t.nama; c[3].textContent = t.ekspedisi; c[4].textContent = rupiah(t.total);
    c[5].firstChild.textContent = langkahPengiriman[t.status];
    c[6].firstChild.href = "tracking.html?do=" + encodeURIComponent(t.no);
    tbody.appendChild(tr);
  });
}

/* ===== Router sederhana per halaman ===== */
({ login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking, riwayat: initRiwayat })[halaman]?.();
