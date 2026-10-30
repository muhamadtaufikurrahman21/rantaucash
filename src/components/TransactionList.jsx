
import { useState } from "react";
import { Search, Trash2, Pencil } from "lucide-react";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

function TransactionList({
  transaksi,
  hapusTransaksi,
  bukaModal,
  editTransaksi,
}) {
  const [pencarian, setPencarian] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState("Semua");

  const daftarBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const daftarTahun = [
    ...new Set(
      transaksi
        .map((item) => new Date(item.tanggal).getFullYear())
        .filter((tahun) => Number.isFinite(tahun))
    ),
  ].sort((a, b) => b - a);

  const kategoriList = [
    "Semua",
    ...new Set(transaksi.map((item) => item.kategori)),
  ];

  const hasilFilter = transaksi.filter((item) => {
    const cocokNama = item.nama
      .toLowerCase()
      .includes(pencarian.toLowerCase());

    const cocokKategori =
      filterKategori === "Semua" ||
      item.kategori === filterKategori;

    const tanggal = new Date(item.tanggal);

    const cocokBulan =
      filterBulan === "Semua" ||
      tanggal.getMonth() === Number(filterBulan);

    const cocokTahun =
      filterTahun === "Semua" ||
      tanggal.getFullYear() === Number(filterTahun);

    return (
      cocokNama &&
      cocokKategori &&
      cocokBulan &&
      cocokTahun
    );
  });

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">

      {/* HEADER RIWAYAT TRANSAKSI */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Riwayat Transaksi
        </h3>

        <button
          type="button"
          onClick={bukaModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer transition-colors"
        >
          + Tambah Transaksi
        </button>
      </div>

      {/* SEARCH DAN FILTER KATEGORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* PENCARIAN */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Cari transaksi..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* FILTER KATEGORI */}
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {kategoriList.map((kategori) => (
            <option key={kategori} value={kategori}>
              {kategori === "Semua"
                ? "Semua Kategori"
                : kategori}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER BULAN DAN TAHUN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        {/* FILTER BULAN */}
        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="Semua">Semua Bulan</option>

          {daftarBulan.map((bulan, index) => (
            <option key={bulan} value={String(index)}>
              {bulan}
            </option>
          ))}
        </select>

        {/* FILTER TAHUN */}
        <select
          value={filterTahun}
          onChange={(e) => setFilterTahun(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="Semua">Semua Tahun</option>

          {daftarTahun.map((tahun) => (
            <option key={tahun} value={String(tahun)}>
              {tahun}
            </option>
          ))}
        </select>
      </div>

      {/* DAFTAR TRANSAKSI */}
      {hasilFilter.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Tidak ada transaksi yang ditemukan.
        </div>
      ) : (
        <div className="space-y-3">
          {hasilFilter.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >

              {/* INFORMASI TRANSAKSI */}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white break-words">
                  {item.nama}
                </p>

                <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
                  {item.kategori} •{" "}
                  {new Date(item.tanggal).toLocaleDateString("id-ID")}
                </p>
              </div>

              {/* NOMINAL DAN TOMBOL AKSI */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <p
                  className={`font-bold text-right break-words ${
                    item.jenis === "pemasukan"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {item.jenis === "pemasukan" ? "+" : "-"}
                  {formatRupiah(item.nominal)}
                </p>

                {/* TOMBOL EDIT */}
                <button
                  type="button"
                  onClick={() => editTransaksi(item)}
                  aria-label={`Edit ${item.nama}`}
                  title="Edit transaksi"
                  className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer p-1 transition-colors"
                >
                  <Pencil size={18} />
                </button>

                {/* TOMBOL HAPUS */}
                <button
                  type="button"
                  onClick={() => hapusTransaksi(item.id)}
                  aria-label={`Hapus ${item.nama}`}
                  title="Hapus transaksi"
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer p-1 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
