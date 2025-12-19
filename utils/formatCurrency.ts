export const formatCurrency = (amount: number): string => {
  const value = Number(amount);
  if (isNaN(value)) {
    return "Rp 0,00";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDisplayNumber = (value: string | number): string => {
  if (!value && value !== 0) return "";

  // Ambil hanya angka saja
  const numberString = value.toString().replace(/\D/g, "");

  // Format jadi ribuan dengan titik
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Mengembalikan format string ribuan ke angka murni (number)
 * Contoh: "10.000" -> 10000
 */
export const parseRawNumber = (displayValue: string): number => {
  if (!displayValue) return 0;
  // Hapus semua karakter yang bukan angka
  return parseInt(displayValue.replace(/\D/g, ""), 10) || 0;
};
