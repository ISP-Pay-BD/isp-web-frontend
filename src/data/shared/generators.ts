/**
 * Shared generators for realistic Bangladesh ISP dummy data.
 */

export function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length]!;
}

export const BD_FIRST_NAMES = [
  'Rahim', 'Karim', 'Jamal', 'Salam', 'Nadia', 'Farhana', 'Imran', 'Sadia', 'Tanvir', 'Mitu',
  'Shohag', 'Rubel', 'Sumaiya', 'Arif', 'Priya', 'Hasan', 'Tania', 'Rakib', 'Nusrat', 'Faisal',
  'Mehedi', 'Shamim', 'Laila', 'Omar', 'Ayesha', 'Biplob', 'Mim', 'Sabbir', 'Jannat', 'Parvez',
] as const;

export const BD_LAST_NAMES = [
  'Uddin', 'Ahmed', 'Hossain', 'Islam', 'Begum', 'Khan', 'Chowdhury', 'Akter', 'Rahman', 'Ali',
  'Khatun', 'Sarkar', 'Miah', 'Das', 'Barua', 'Talukder', 'Sultana', 'Mahmud', 'Parvin', 'Haque',
] as const;

export const DHAKA_AREAS = [
  'Uttara', 'Mirpur', 'Dhanmondi', 'Mohammadpur', 'Banani', 'Gulshan', 'Bashundhara', 'Motijheel',
  'Farmgate', 'Tejgaon', 'Wari', 'Old Dhaka', 'Khilgaon', 'Rampura', 'Badda',
] as const;

export const BD_ISPS = [
  'FastNet BD', 'NetLink CTG', 'SkyConnect', 'CityNet Sylhet', 'LinkWave Rajshahi',
  'FiberOne BD', 'SpeedNet Khulna', 'WaveISP Barishal', 'ConnectBD Rangpur', 'NetZone Mymensingh',
] as const;

export function bdPhone(seed: number): string {
  const prefixes = ['017', '018', '019', '016', '015', '013'];
  const prefix = pick(prefixes, seed);
  return `${prefix}${String(10000000 + seed).slice(-8)}`;
}

export function invoiceNo(year: number, seq: number): string {
  return `INV-${year}-${String(seq).padStart(5, '0')}`;
}

export function trxId(method: string, seq: number): string {
  const prefix = method === 'bkash' ? 'BKS' : method === 'nagad' ? 'NGD' : 'TRX';
  return `${prefix}${String(100000000 + seq)}`;
}

export function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function isoDateTime(date: string, hour = 10, min = 0): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

/** Chart data for last N days */
export function dailyChart(days: number, baseCollection: number, baseNew: number) {
  const out: { date: string; collection: number; newCustomers: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(2026, 8, 2);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const variance = (i * 137) % 8000;
    out.push({
      date,
      collection: baseCollection + variance - 4000,
      newCustomers: baseNew + ((i * 7) % 5),
    });
  }
  return out;
}
