interface LunarPhaseInfo {
  phase: string;
  illumination: number;
  emoji: string;
}

const DEG_TO_RAD = Math.PI / 180;

function sinD(deg: number): number {
  return Math.sin(deg * DEG_TO_RAD);
}

function cosD(deg: number): number {
  return Math.cos(deg * DEG_TO_RAD);
}

function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    d +
    B -
    1524.5
  );
}

function computePhaseJD(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  let JDE =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;

  const phase = k - Math.floor(k);
  const isNewOrFull = Math.abs(phase) < 0.01 || Math.abs(phase - 0.5) < 0.01;
  const isFirstQ = Math.abs(phase - 0.25) < 0.01;
  const isLastQ = Math.abs(phase - 0.75) < 0.01;

  let correction = 0;

  if (isNewOrFull) {
    if (Math.abs(phase) < 0.01) {
      correction =
        -0.4072 * sinD(Mp) +
        0.17241 * E * sinD(M) +
        0.01608 * sinD(2 * Mp) +
        0.01039 * sinD(2 * F) +
        0.00739 * E * sinD(Mp - M) +
        -0.00514 * E * sinD(Mp + M) +
        0.00208 * E2 * sinD(2 * M) +
        -0.00111 * sinD(Mp - 2 * F) +
        -0.00057 * sinD(Mp + 2 * F) +
        0.00056 * E * sinD(2 * Mp + M) +
        -0.00042 * sinD(3 * Mp) +
        0.00042 * E * sinD(M + 2 * F) +
        0.00038 * E * sinD(M - 2 * F) +
        -0.00024 * E * sinD(2 * Mp - M) +
        -0.00017 * sinD(Om) +
        -0.00007 * sinD(Mp + 2 * M) +
        0.00004 * sinD(2 * Mp - 2 * F) +
        0.00004 * sinD(3 * M) +
        0.00003 * sinD(Mp + M - 2 * F) +
        0.00003 * sinD(2 * Mp + 2 * F) +
        -0.00003 * sinD(Mp + M + 2 * F) +
        0.00003 * sinD(Mp - M + 2 * F) +
        -0.00002 * sinD(Mp - M - 2 * F) +
        -0.00002 * sinD(3 * Mp + M) +
        0.00002 * sinD(4 * Mp);
    } else {
      correction =
        -0.40614 * sinD(Mp) +
        0.17302 * E * sinD(M) +
        0.01614 * sinD(2 * Mp) +
        0.01043 * sinD(2 * F) +
        0.00734 * E * sinD(Mp - M) +
        -0.00515 * E * sinD(Mp + M) +
        0.00209 * E2 * sinD(2 * M) +
        -0.00111 * sinD(Mp - 2 * F) +
        -0.00057 * sinD(Mp + 2 * F) +
        0.00056 * E * sinD(2 * Mp + M) +
        -0.00042 * sinD(3 * Mp) +
        0.00042 * E * sinD(M + 2 * F) +
        0.00038 * E * sinD(M - 2 * F) +
        -0.00024 * E * sinD(2 * Mp - M) +
        -0.00017 * sinD(Om) +
        -0.00007 * sinD(Mp + 2 * M) +
        0.00004 * sinD(2 * Mp - 2 * F) +
        0.00004 * sinD(3 * M) +
        0.00003 * sinD(Mp + M - 2 * F) +
        0.00003 * sinD(2 * Mp + 2 * F) +
        -0.00003 * sinD(Mp + M + 2 * F) +
        0.00003 * sinD(Mp - M + 2 * F) +
        -0.00002 * sinD(Mp - M - 2 * F) +
        -0.00002 * sinD(3 * Mp + M) +
        0.00002 * sinD(4 * Mp);
    }
  } else if (isFirstQ || isLastQ) {
    correction =
      -0.62801 * sinD(Mp) +
      0.17172 * E * sinD(M) +
      -0.01183 * E * sinD(Mp + M) +
      0.00862 * sinD(2 * Mp) +
      0.00804 * sinD(2 * F) +
      0.00454 * E * sinD(Mp - M) +
      0.00204 * E2 * sinD(2 * M) +
      -0.0018 * sinD(Mp - 2 * F) +
      -0.0007 * sinD(Mp + 2 * F) +
      -0.0004 * sinD(3 * Mp) +
      -0.00034 * E * sinD(2 * Mp - M) +
      0.00032 * E * sinD(M + 2 * F) +
      0.00032 * E * sinD(M - 2 * F) +
      -0.00028 * E2 * sinD(Mp + 2 * M) +
      0.00027 * E * sinD(2 * Mp + M) +
      -0.00017 * sinD(Om) +
      -0.00005 * sinD(Mp - M - 2 * F) +
      0.00004 * sinD(2 * Mp + 2 * F) +
      -0.00004 * sinD(Mp + M + 2 * F) +
      0.00004 * sinD(Mp - 2 * M) +
      0.00003 * sinD(Mp + M - 2 * F) +
      0.00003 * sinD(3 * M) +
      0.00002 * sinD(2 * Mp - 2 * F) +
      0.00002 * sinD(Mp - M + 2 * F) +
      -0.00002 * sinD(3 * Mp + M);

    const W =
      0.00306 -
      0.00038 * E * cosD(M) +
      0.00026 * cosD(Mp) -
      0.00002 * cosD(Mp - M) +
      0.00002 * cosD(Mp + M) +
      0.00002 * cosD(2 * F);

    if (isFirstQ) {
      correction += W;
    } else {
      correction -= W;
    }
  }

  JDE += correction;

  const A1 = 299.77 + 132.8475848 * k - 0.009173 * T2;
  const A2 = 251.88 + 92.517 * k;
  const A3 = 251.83 + 360.3572 * k;
  const A4 = 349.42 + 450.37046 * k;
  const A5 = 84.66 + 966.197 * k;
  const A6 = 141.74 + 115.8755 * k;
  const A7 = 207.14 + 119.773 * k;
  const A8 = 154.84 + 926.2602 * k;
  const A9 = 34.52 + 1367.9222 * k;
  const A10 = 207.19 + 532.8963 * k;
  const A11 = 291.34 + 3.6577 * k;
  const A12 = 161.72 + 125.1025 * k;
  const A13 = 239.56 + 44.8824 * k;
  const A14 = 331.55 + 942.062 * k;

  const additional =
    0.000325 * sinD(A1) +
    0.000165 * sinD(A2) +
    0.000164 * sinD(A3) +
    0.000126 * sinD(A4) +
    0.00011 * sinD(A5) +
    0.000062 * sinD(A6) +
    0.00006 * sinD(A7) +
    0.000056 * sinD(A8) +
    0.000047 * sinD(A9) +
    0.000042 * sinD(A10) +
    0.00004 * sinD(A11) +
    0.000037 * sinD(A12) +
    0.000035 * sinD(A13) +
    0.000023 * sinD(A14);

  JDE += additional;

  return JDE;
}

function findPreviousNewMoonK(jd: number): number {
  const year = 2000 + (jd - 2451545.0) / 365.25;
  let k = Math.floor((year - 2000) * 12.3685);
  while (computePhaseJD(k + 1) <= jd) {
    k++;
  }
  while (computePhaseJD(k) > jd) {
    k--;
  }
  return k;
}

export function getLunarPhase(date: Date): LunarPhaseInfo {
  const jd = dateToJD(date);
  const k = findPreviousNewMoonK(jd);

  const jdNew = computePhaseJD(k);
  const jdFQ = computePhaseJD(k + 0.25);
  const jdFull = computePhaseJD(k + 0.5);
  const jdLQ = computePhaseJD(k + 0.75);
  const jdNextNew = computePhaseJD(k + 1);

  const age = jd - jdNew;
  const cycleLength = jdNextNew - jdNew;
  const fraction = age / cycleLength;
  const illumination =
    Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100) / 100;

  const mid1 = (jdNew + jdFQ) / 2;
  const mid2 = (jdFQ + jdFull) / 2;
  const mid3 = (jdFull + jdLQ) / 2;
  const mid4 = (jdLQ + jdNextNew) / 2;

  let phase: string;
  let emoji: string;

  if (jd < mid1) {
    phase = "new_moon"; emoji = "\uD83C\uDF11";
  } else if (jd < jdFQ) {
    phase = "waxing_crescent"; emoji = "\uD83C\uDF12";
  } else if (jd < mid2) {
    phase = "first_quarter"; emoji = "\uD83C\uDF13";
  } else if (jd < jdFull) {
    phase = "waxing_gibbous"; emoji = "\uD83C\uDF14";
  } else if (jd < mid3) {
    phase = "full_moon"; emoji = "\uD83C\uDF15";
  } else if (jd < jdLQ) {
    phase = "waning_gibbous"; emoji = "\uD83C\uDF16";
  } else if (jd < mid4) {
    phase = "last_quarter"; emoji = "\uD83C\uDF17";
  } else {
    phase = "waning_crescent"; emoji = "\uD83C\uDF18";
  }

  return { phase, illumination, emoji };
}

export function getMonthPhases(
  year: number,
  month: number
): Array<{ date: string; phase: string; illumination: number; emoji: string }> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const phaseInfo = getLunarPhase(date);
    phases.push({ date: dateStr, ...phaseInfo });
  }

  return phases;
}
