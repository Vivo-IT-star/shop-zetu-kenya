function formatTimestamp(ms) {
  const date = new Date(ms);

  return date.toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Utility to get Nairobi time as ISO string
const getNairobiTime = () => {
  const now = new Date();
  // Force conversion to Nairobi timezone
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
};

/**
 * Convert ms timestamp -> human readable UTC and Nairobi strings.
 * Example output:
 *  { utc:    "Thu Sep 11 2025 11:30:10.535 UTC",
 *    nairobi:"Thu Sep 11 2025 14:30:10.535 EAT" }
 */
// export function formatMsToUTCAndNairobi(ms) {
//   const n = typeof ms === 'string' ? Number(ms) : ms;
//   if (!Number.isFinite(n)) throw new Error('Invalid ms timestamp');

//   const date = new Date(n);

//   const pad2 = v => String(v).padStart(2, '0');
//   const pad3 = v => String(v).padStart(3, '0');
//   const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
//   const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

//   // --- UTC ---
//   const utcWeekday = weekdays[date.getUTCDay()];
//   const utcMonth   = months[date.getUTCMonth()];
//   const utcDay     = pad2(date.getUTCDate());
//   const utcYear    = date.getUTCFullYear();
//   const utcHour    = pad2(date.getUTCHours());
//   const utcMinute  = pad2(date.getUTCMinutes());
//   const utcSecond  = pad2(date.getUTCSeconds());
//   const ms3        = pad3(date.getUTCMilliseconds());

//   const utc = `${utcWeekday} ${utcMonth} ${utcDay} ${utcYear} ${utcHour}:${utcMinute}:${utcSecond}.${ms3} UTC`;

//   // --- Nairobi ---
//   const nairobiDate = new Date(n + 3 * 60 * 60 * 1000);
//   const naiWeekday = weekdays[nairobiDate.getUTCDay()];
//   const naiMonth   = months[nairobiDate.getUTCMonth()];
//   const naiDay     = pad2(nairobiDate.getUTCDate());
//   const naiYear    = nairobiDate.getUTCFullYear();
//   const naiHour    = pad2(nairobiDate.getUTCHours());
//   const naiMinute  = pad2(nairobiDate.getUTCMinutes());
//   const naiSecond  = pad2(nairobiDate.getUTCSeconds());

//   const nairobi = `${naiWeekday} ${naiMonth} ${naiDay} ${naiYear} ${naiHour}:${naiMinute}:${naiSecond}.${ms3} EAT`;

//   return { utc, nairobi };
// }

// // ✅ Correct usage
// const ts = 1757590210535;
// const timestamp = formatMsToUTCAndNairobi(ts); // returns { utc, nairobi }

// //console.log(timestamp);        // { utc: "...", nairobi: "..." }
// console.log("Nairobi Time", timestamp.nairobi); // "Thu Sep 11 2025 14:30:10.535 EAT"
// console.log("UTC Time", timestamp.utc);       // "Thu Sep 11 2025 11:30:10.535 UTC"


// console.log(getNairobiTime()); // Outputs current Nairobi time in ISO format

// console.log(formatTimestamp(
// 1757590210535)); // Outputs formatted timestamp


// utils/formatTimeStamp.js

function formatMsToUTCAndNairobi(ms) {
  const n = typeof ms === 'string' ? Number(ms) : ms;
  if (!Number.isFinite(n)) throw new Error('Invalid ms timestamp');

  const date = new Date(n);

  const pad2 = v => String(v).padStart(2, '0');
  const pad3 = v => String(v).padStart(3, '0');
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // --- UTC ---
  const utcWeekday = weekdays[date.getUTCDay()];
  const utcMonth   = months[date.getUTCMonth()];
  const utcDay     = pad2(date.getUTCDate());
  const utcYear    = date.getUTCFullYear();
  const utcHour    = pad2(date.getUTCHours());
  const utcMinute  = pad2(date.getUTCMinutes());
  const utcSecond  = pad2(date.getUTCSeconds());
  const ms3        = pad3(date.getUTCMilliseconds());

  const utc = `${utcWeekday} ${utcMonth} ${utcDay} ${utcYear} ${utcHour}:${utcMinute}:${utcSecond}.${ms3} UTC`;

  // --- Nairobi (UTC + 3) ---
  const nairobiDate = new Date(n + 3 * 60 * 60 * 1000);
  const naiWeekday = weekdays[nairobiDate.getUTCDay()];
  const naiMonth   = months[nairobiDate.getUTCMonth()];
  const naiDay     = pad2(nairobiDate.getUTCDate());
  const naiYear    = nairobiDate.getFullYear();
  const naiHour    = pad2(nairobiDate.getUTCHours());
  const naiMinute  = pad2(nairobiDate.getUTCMinutes());
  const naiSecond  = pad2(nairobiDate.getUTCSeconds());

  const nairobi = `${naiWeekday} ${naiMonth} ${naiDay} ${naiYear} ${naiHour}:${naiMinute}:${naiSecond}.${ms3} EAT`;

  return { utc, nairobi };
}


// const ts = 1757590210535
// const timestamp = formatMsToUTCAndNairobi(ts);
// console.log("Nairobi Time", timestamp.nairobi);
// console.log("UTC Time", timestamp.utc);
const {nairobi, utc} = formatMsToUTCAndNairobi(1757574763889);
console.log("Nairobi Time", nairobi);

export { formatMsToUTCAndNairobi };



