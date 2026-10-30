
import { useState, useEffect } from "react";
import TransactionList from "./components/TransactionList";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  X,
  Moon,
  Sun,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

function App() {
  // STATE TRANSAKSI
  const [transaksi, setTransaksi] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rantaucash")) || [];
    } catch {
      return [];
    }
  });

  // STATE PROFIL
  const [namaPengguna, setNamaPengguna] = useState(
    () => localStorage.getItem("rantaucash-nama") || ""
  );
  const [inputNamaPengguna, setInputNamaPengguna] = useState("");
  const [profilOpen, setProfilOpen] = useState(false);

  // STATE DARK MODE
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("rantaucash-theme") === "dark"
  );

  // STATE MODAL TRANSAKSI
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [jenis, setJenis] = useState("pengeluaran");
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("Makan");

  // STATE BUDGET
  const [budget, setBudget] = useState(() => {
    const tersimpan = Number(
      localStorage.getItem("rantaucash-budget")
    );

    return Number.isFinite(tersimpan) && tersimpan >= 0
      ? tersimpan
      : 1000000;
  });

  const [inputBudget, setInputBudget] = useState(String(budget));

  // SIMPAN DATA
  useEffect(() => {
    localStorage.setItem("rantaucash", JSON.stringify(transaksi));
  }, [transaksi]);

  useEffect(() => {
    localStorage.setItem(
      "rantaucash-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("rantaucash-budget", String(budget));
  }, [budget]);

  // PERHITUNGAN KEUANGAN
  const pemasukan = transaksi
    .filter((item) => item.jenis === "pemasukan")
    .reduce((total, item) => total + item.nominal, 0);

  const pengeluaran = transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((total, item) => total + item.nominal, 0);

  const saldo = pemasukan - pengeluaran;

  // SAPAAN OTOMATIS
  const sekarang = new Date();
  const jam = sekarang.getHours();

  const sapaan =
    jam >= 4 && jam < 11
      ? "Selamat pagi"
      : jam >= 11 && jam < 15
      ? "Selamat siang"
      : jam >= 15 && jam < 18
      ? "Selamat sore"
      : "Selamat malam";

  // PENGELUARAN BULAN INI
  const pengeluaranBulanan = transaksi.filter((item) => {
    const tanggal = new Date(item.tanggal);

    return (
      item.jenis === "pengeluaran" &&
      tanggal.getMonth() === sekarang.getMonth() &&
      tanggal.getFullYear() === sekarang.getFullYear()
    );
  });

  const totalPengeluaranBulanan = pengeluaranBulanan.reduce(
    (total, item) => total + item.nominal,
    0
  );

  const persentaseBudget =
    budget > 0 ? (totalPengeluaranBulanan / budget) * 100 : 0;

  // DATA GRAFIK
  const dataGrafik = Object.entries(
    pengeluaranBulanan.reduce((hasil, item) => {
      hasil[item.kategori] =
        (hasil[item.kategori] || 0) + item.nominal;
      return hasil;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const warnaGrafik = [
    "#059669",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
  ];

  // SIMPAN BUDGET
  const simpanBudget = (e) => {
    e.preventDefault();

    const nilai = Number(inputBudget);

    if (!Number.isFinite(nilai) || nilai <= 0) {
      alert("Masukkan budget lebih dari Rp0!");
      return;
    }

    setBudget(nilai);
  };

  // BUKA MODAL TAMBAH
  const bukaTambahTransaksi = () => {
    setEditingId(null);
    setJenis("pengeluaran");
    setNama("");
    setNominal("");
    setKategori("Makan");
    setModalOpen(true);
  };

  // BUKA MODAL EDIT
  const bukaEditTransaksi = (item) => {
    setEditingId(item.id);
    setJenis(item.jenis);
    setNama(item.nama);
    setNominal(String(item.nominal));
    setKategori(
      item.jenis === "pemasukan" ? "Makan" : item.kategori
    );
    setModalOpen(true);
  };

  // TAMBAH / EDIT TRANSAKSI
  const tambahTransaksi = (e) => {
    e.preventDefault();

    const jumlah = Number(nominal);

    if (
      !nama.trim() ||
      !Number.isSafeInteger(jumlah) ||
      jumlah <= 0
    ) {
      alert("Isi nama dan nominal transaksi dengan benar!");
      return;
    }

    if (editingId !== null) {
      setTransaksi((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                nama: nama.trim(),
                nominal: jumlah,
                jenis,
                kategori:
                  jenis === "pemasukan" ? "Pemasukan" : kategori,
              }
            : item
        )
      );
    } else {
      const dataBaru = {
        id: crypto.randomUUID(),
        nama: nama.trim(),
        nominal: jumlah,
        jenis,
        kategori:
          jenis === "pemasukan" ? "Pemasukan" : kategori,
        tanggal: new Date().toISOString(),
      };

      setTransaksi((prev) => [dataBaru, ...prev]);
    }

    setEditingId(null);
    setNama("");
    setNominal("");
    setKategori("Makan");
    setModalOpen(false);
  };

  // SIMPAN NAMA PERTAMA KALI
  const simpanNamaPengguna = (e) => {
    e.preventDefault();

    const namaBaru = inputNamaPengguna.trim();

    if (!namaBaru) {
      alert("Nama tidak boleh kosong!");
      return;
    }

    localStorage.setItem("rantaucash-nama", namaBaru);
    setNamaPengguna(namaBaru);
  };

  // EDIT PROFIL
  const bukaEditProfil = () => {
    setInputNamaPengguna(namaPengguna);
    setProfilOpen(true);
  };

  const simpanEditProfil = (e) => {
    e.preventDefault();

    const namaBaru = inputNamaPengguna.trim();

    if (!namaBaru) {
      alert("Nama tidak boleh kosong!");
      return;
    }

    localStorage.setItem("rantaucash-nama", namaBaru);
    setNamaPengguna(namaBaru);
    setProfilOpen(false);
  };

  // HAPUS TRANSAKSI
  const hapusTransaksi = (id) => {
    if (window.confirm("Yakin mau hapus transaksi ini?")) {
      setTransaksi((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6">
          <h1 className="text-2xl font-bold text-emerald-600 mb-10">
            RantauCash.
          </h1>

          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl font-semibold">
            <LayoutDashboard size={20} />
            Dashboard
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Smart Money Tracker
            <br />
            for Students
          </p>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 p-5 md:p-10">

          {/* Header Mobile */}
          <div className="flex md:hidden items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-emerald-600">
              RantauCash.
            </h1>

            <span className="text-xs text-slate-400">
              Smart Money Tracker
            </span>
          </div>

          {/* TOMBOL DARK MODE */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white break-words">
              {sapaan}, {namaPengguna}! 👋
            </h2>

            <button
              type="button"
              onClick={bukaEditProfil}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2 cursor-pointer"
            >
              ✏️ Edit Profil
            </button>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Pantau keuangan rantau lu di sini 💸
            </p>
          </div>

          {/* KARTU KEUANGAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* SALDO */}
            <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm">
              <Wallet className="mb-5" size={28} />

              <p className="text-emerald-100">
                Total Saldo
              </p>

              <h3 className="text-2xl sm:text-3xl">
                {formatRupiah(saldo)}
              </h3>
            </div>

            {/* PEMASUKAN */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <TrendingUp
                className="text-emerald-600 mb-5"
                size={28}
              />

              <p className="text-slate-500 dark:text-slate-400">
                Total Pemasukan
              </p>

              <h3 className="text-2xl sm:text-3xl">
                {formatRupiah(pemasukan)}
              </h3>
            </div>

            {/* PENGELUARAN */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <TrendingDown
                className="text-red-500 mb-5"
                size={28}
              />

              <p className="text-slate-500 dark:text-slate-400">
                Total Pengeluaran
              </p>

              <h3 className="text-2xl sm:text-3xl">
                {formatRupiah(pengeluaran)}
              </h3>
            </div>
          </div>

          {/* GRAFIK DAN BUDGET */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

            {/* GRAFIK PENGELUARAN */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Grafik Pengeluaran
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Berdasarkan kategori bulan ini
              </p>

              {dataGrafik.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-400">
                  Belum ada pengeluaran bulan ini.
                </div>
              ) : (
                <div className="h-64 sm:h-72 mt-4 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataGrafik}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {dataGrafik.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              warnaGrafik[
                                index % warnaGrafik.length
                              ]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          formatRupiah(value)
                        }
                      />

                      <Legend
                        wrapperStyle={{
                          color: darkMode ? "#e2e8f0" : "#475569",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* BUDGET BULANAN */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">

              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Budget Bulanan
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Atur batas pengeluaran bulan ini
              </p>

              <div className="mt-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pengeluaran bulan ini
                </p>

                <h4 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 break-words">
                  {formatRupiah(totalPengeluaranBulanan)}
                </h4>

                {/* PERSENTASE BUDGET */}
                <div className="flex justify-between text-sm mt-6 mb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Budget terpakai
                  </span>

                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {persentaseBudget.toFixed(1)}%
                  </span>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      persentaseBudget >= 100
                        ? "bg-red-500"
                        : persentaseBudget >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        persentaseBudget,
                        100
                      )}%`,
                    }}
                  />
                </div>

                {/* STATUS BUDGET */}
                <div className="mt-4">
                  {persentaseBudget >= 100 ? (
                    <p className="text-red-500 dark:text-red-400 font-medium text-sm">
                      Budget lu sudah habis atau terlampaui!
                    </p>
                  ) : persentaseBudget >= 80 ? (
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-sm">
                      Hati-hati, pengeluaran hampir mencapai batas!
                    </p>
                  ) : (
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                      Pengeluaran masih dalam batas aman.
                    </p>
                  )}
                </div>

                {/* SISA BUDGET */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-5">
                  Sisa budget:{" "}
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatRupiah(
                      budget - totalPengeluaranBulanan
                    )}
                  </span>
                </p>

                {/* FORM BUDGET */}
                <form
                  onSubmit={simpanBudget}
                  className="mt-5"
                >
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Atur Budget (Rp)
                  </label>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={inputBudget}
                      onChange={(e) =>
                        setInputBudget(e.target.value)
                      }
                      placeholder="1500000"
                      className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3 w-full min-w-0 outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIWAYAT TRANSAKSI */}
          <TransactionList
            transaksi={transaksi}
            hapusTransaksi={hapusTransaksi}
            bukaModal={bukaTambahTransaksi}
            editTransaksi={bukaEditTransaksi}
          />
        </main>
      </div>

      {/* MODAL EDIT PROFIL */}
      {profilOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-md shadow-xl">

            <h3 className="text-xl font-bold mb-4">
              Edit Profil
            </h3>

            <form onSubmit={simpanEditProfil}>
              <label className="block text-sm font-medium mb-2">
                Nama Pengguna
              </label>

              <input
                type="text"
                value={inputNamaPengguna}
                onChange={(e) =>
                  setInputNamaPengguna(e.target.value)
                }
                maxLength={40}
                required
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3 mb-5"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfilOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl py-3 cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 cursor-pointer"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP NAMA PENGGUNA */}
      {!namaPengguna && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nama-title"
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl p-8 w-full max-w-md shadow-xl"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">👋</div>

              <h2
                id="nama-title"
                className="text-2xl font-bold text-slate-800 dark:text-white"
              >
                Selamat Datang di RantauCash!
              </h2>

              <p className="text-slate-500 dark:text-slate-400 mt-3">
                Kenalan dulu yuk! Siapa nama lu?
              </p>
            </div>

            <form onSubmit={simpanNamaPengguna}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Nama Pengguna
              </label>

              <input
                type="text"
                value={inputNamaPengguna}
                onChange={(e) =>
                  setInputNamaPengguna(e.target.value)
                }
                placeholder="Contoh: Taufik"
                maxLength={40}
                required
                autoFocus
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3 mb-5"
              />

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold cursor-pointer"
              >
                Mulai Sekarang 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT TRANSAKSI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          >

            <div className="flex justify-between items-center mb-6">
              <h3
                id="modal-title"
                className="text-xl font-bold"
              >
                {editingId !== null
                  ? "Edit Transaksi"
                  : "Tambah Transaksi"}
              </h3>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={tambahTransaksi}
              className="space-y-4"
            >
              {/* JENIS TRANSAKSI */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Transaksi
                </label>

                <select
                  value={jenis}
                  onChange={(e) =>
                    setJenis(e.target.value)
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3"
                >
                  <option value="pengeluaran">
                    Pengeluaran
                  </option>
                  <option value="pemasukan">
                    Pemasukan
                  </option>
                </select>
              </div>

              {/* NAMA TRANSAKSI */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Transaksi
                </label>

                <input
                  type="text"
                  value={nama}
                  onChange={(e) =>
                    setNama(e.target.value)
                  }
                  placeholder="Contoh: Makan ayam geprek"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3"
                />
              </div>

              {/* NOMINAL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nominal (Rp)
                </label>

                <input
                  type="number"
                  value={nominal}
                  onChange={(e) =>
                    setNominal(e.target.value)
                  }
                  placeholder="Contoh: 15000"
                  min="1"
                  step="1"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3"
                />
              </div>

              {/* KATEGORI */}
              {jenis === "pengeluaran" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori
                  </label>

                  <select
                    value={kategori}
                    onChange={(e) =>
                      setKategori(e.target.value)
                    }
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3"
                  >
                    <option>Makan</option>
                    <option>Transportasi</option>
                    <option>Kos</option>
                    <option>Laundry</option>
                    <option>Nongkrong</option>
                    <option>Kuliah</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              )}

              {/* SIMPAN TRANSAKSI */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold cursor-pointer"
              >
                {editingId !== null
                  ? "Simpan Perubahan"
                  : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
