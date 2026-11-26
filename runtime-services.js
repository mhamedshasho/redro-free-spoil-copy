(() => {
  const TIME_KEY = "redro-clock-anchor-v1";
  const RESOURCE_KEY = "redro-icon-pack-v1";
  const RESOURCE_CACHE = "redro-resources-v1";
  const RESOURCE_CACHE_URL = new URL("./__redro_icon_pack_v1__", location.href).href;
  const RESOURCE_URL = "https://raw.githubusercontent.com/mhamedshasho/redro-free-spoil-copy/android-app-foundation/assets/icon-pack.json";
  const TIME_ENDPOINTS = [
    "https://worldtimeapi.org/api/timezone/Etc/UTC",
    "https://timeapi.io/api/Time/current/zone?timeZone=UTC"
  ];
  let anchor = readAnchor();
  let iconPack = readStoredPack();

  function readAnchor() {
    try {
      const value = JSON.parse(localStorage.getItem(TIME_KEY) || "null");
      if (value && Number.isFinite(value.serverEpoch) && Number.isFinite(value.localEpoch)) return value;
    } catch {}
    return null;
  }

  function persistAnchor(value) {
    anchor = value;
    try { localStorage.setItem(TIME_KEY, JSON.stringify(value)); } catch {}
  }

  function estimatedNow() {
    return Date.now();
  }

  function dateParts(epoch) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(epoch));
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return values.year + "-" + values.month + "-" + values.day;
  }

  function dateLabel() {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(new Date(estimatedNow())).toUpperCase();
  }

  async function requestJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Time API returned " + response.status);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function parseTime(payload) {
    const candidate = payload.unixtime
      ? Number(payload.unixtime) * 1000
      : payload.dateTime
        ? Date.parse(payload.dateTime)
        : payload.utc_datetime
          ? Date.parse(payload.utc_datetime)
          : NaN;
    if (!Number.isFinite(candidate) || candidate < 1577836800000 || candidate > 4102444800000) {
      throw new Error("Invalid time API response");
    }
    return candidate;
  }

  function syncTime() {
    updateClockStatus();
    return false;
  }

  function readStoredPack() {
    try {
      const value = JSON.parse(localStorage.getItem(RESOURCE_KEY) || "null");
      if (value && value.version === 1 && value.icons) return value;
    } catch {}
    return null;
  }

  async function readCachedPack() {
    if (iconPack) return iconPack;
    try {
      if ("caches" in window) {
        const cache = await caches.open(RESOURCE_CACHE);
        const response = await cache.match(RESOURCE_CACHE_URL);
        if (response) {
          iconPack = await response.json();
          if (iconPack?.version === 1 && iconPack?.icons) return iconPack;
        }
      }
    } catch (error) {
      console.warn("Redro resource cache could not be read.", error);
    }
    return null;
  }

  async function storePack(pack) {
    if (!pack || pack.version !== 1 || !pack.icons) throw new Error("Invalid icon pack");
    iconPack = pack;
    try { localStorage.setItem(RESOURCE_KEY, JSON.stringify(pack)); } catch {}
    if ("caches" in window) {
      const cache = await caches.open(RESOURCE_CACHE);
      await cache.put(RESOURCE_CACHE_URL, new Response(JSON.stringify(pack), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=31536000" }
      }));
    }
    window.dispatchEvent(new Event("redro-resources-updated"));
  }

  function iconFor(category) {
    return iconPack?.icons?.[category] || ({
      Vegetables: "🥦",
      Fruits: "🍎",
      Dairy: "🥛",
      "Meat & Fish": "🥩",
      Bakery: "🍞",
      Drinks: "🧃",
      Other: "🥫"
    }[category] || "🥫");
  }

  function language() {
    return document.getElementById("languageSelect")?.value || document.documentElement.lang || "en";
  }

  const labels = {
    en: {
      title: "Optional icon resources",
      description: "Download the small icon pack once and keep it on this device. Redro continues to work if you skip it or go offline.",
      download: "Download icons",
      skip: "Not now",
      settingsTitle: "Icons and resources",
      statusReady: "Icon pack saved on this device",
      statusMissing: "Icon pack has not been downloaded",
      statusPending: "Download will resume when internet is available",
      statusBusy: "Downloading icon resources…",
      statusFailed: "Download failed. Your inventory is still available.",
      button: "Download / update icon pack",
      consent: "Allow Redro to download and save the optional icon pack on this device?",
      synced: "Time synchronized from the internet",
      cached: "Using the last saved internet time",
      local: "Using device time until internet time is available"
    },
    ar: {
      title: "موارد الأيقونات الاختيارية",
      description: "نزّل حزمة الرموز الصغيرة مرة واحدة واحفظها على هذا الجهاز. سيبقى Redro يعمل إذا تخطّيت التنزيل أو انقطع الإنترنت.",
      download: "تنزيل الأيقونات",
      skip: "ليس الآن",
      settingsTitle: "الأيقونات والموارد",
      statusReady: "حزمة الأيقونات محفوظة على الجهاز",
      statusMissing: "لم يتم تنزيل حزمة الأيقونات",
      statusPending: "سيُستكمل التنزيل عند توفر الإنترنت",
      statusBusy: "جارٍ تنزيل موارد الأيقونات…",
      statusFailed: "فشل التنزيل. ما زال مخزونك متاحاً.",
      button: "تنزيل / تحديث حزمة الأيقونات",
      consent: "هل تسمح لـ Redro بتنزيل حزمة الأيقونات الاختيارية وحفظها على هذا الجهاز؟",
      synced: "تمت مزامنة الوقت من الإنترنت",
      cached: "يُستخدم آخر وقت محفوظ من الإنترنت",
      local: "يُستخدم وقت الجهاز حتى تتوفر مزامنة الإنترنت"
    },
    zh: {
      title: "可选图标资源",
      description: "只需下载一次小型图标包并保存在此设备上。跳过下载或离线时，Redro 仍可正常使用。",
      download: "下载图标",
      skip: "暂不",
      settingsTitle: "图标和资源",
      statusReady: "图标包已保存在此设备",
      statusMissing: "尚未下载图标包",
      statusPending: "联网后将继续下载",
      statusBusy: "正在下载图标资源…",
      statusFailed: "下载失败，库存仍可使用。",
      button: "下载 / 更新图标包",
      consent: "允许 Redro 下载并在此设备上保存可选图标包吗？",
      synced: "时间已从互联网同步",
      cached: "正在使用上次保存的网络时间",
      local: "网络时间不可用，暂时使用设备时间"
    },
    ja: {
      title: "オプションのアイコンリソース",
      description: "小さなアイコンパックを一度だけダウンロードして端末に保存します。スキップした場合やオフラインでもRedroは利用できます。",
      download: "アイコンをダウンロード",
      skip: "今はしない",
      settingsTitle: "アイコンとリソース",
      statusReady: "アイコンパックは端末に保存済みです",
      statusMissing: "アイコンパックは未ダウンロードです",
      statusPending: "インターネット接続時にダウンロードを再開します",
      statusBusy: "アイコンリソースをダウンロード中…",
      statusFailed: "ダウンロードに失敗しました。在庫機能は利用できます。",
      button: "アイコンパックをダウンロード / 更新",
      consent: "オプションのアイコンパックをダウンロードして端末に保存しますか？",
      synced: "インターネット時刻と同期しました",
      cached: "最後に保存したインターネット時刻を使用中",
      local: "インターネット時刻が利用できないため端末時刻を使用中"
    }
  };

  function t(key) {
    return (labels[language()] || labels.en)[key] || labels.en[key] || key;
  }

  function ensureSettings() {
    const dialog = document.getElementById("settingsDialog");
    if (!dialog || document.getElementById("redro-resource-settings")) return;
    const panel = document.createElement("section");
    panel.id = "redro-resource-settings";
    panel.className = "redro-resource-panel";
    panel.innerHTML = '<strong id="redro-resource-title"></strong><p id="redro-resource-status" aria-live="polite"></p><button type="button" class="secondary-button" id="redro-resource-download"></button><small id="redro-clock-status" aria-live="polite"></small>';
    const languageSelect = document.getElementById("languageSelect");
    languageSelect?.closest("label")?.after(panel);
    panel.querySelector("#redro-resource-download").addEventListener("click", () => downloadPack(true));
    renderSettings();
  }

  function renderSettings() {
    const title = document.getElementById("redro-resource-title");
    if (!title) return;
    title.textContent = t("settingsTitle");
    const status = document.getElementById("redro-resource-status");
    const consent = localStorage.getItem("redro-icon-consent-v1");
    status.textContent = iconPack
      ? t("statusReady")
      : consent === "granted"
        ? t("statusPending")
        : t("statusMissing");
    const button = document.getElementById("redro-resource-download");
    button.textContent = t("button");
    const fresh = anchor?.syncedAt && Date.now() - Date.parse(anchor.syncedAt) < 6 * 60 * 60 * 1000;
    document.getElementById("redro-clock-status").textContent = fresh ? t("synced") : anchor ? t("cached") : t("local");
  }

  async function downloadPack(manual = false) {
    const consent = localStorage.getItem("redro-icon-consent-v1");
    if (!manual && consent !== "granted") return;
    if (iconPack && !manual) {
      renderSettings();
      return;
    }
    const status = document.getElementById("redro-resource-status");
    if (status) status.textContent = t("statusBusy");
    try {
      if (!navigator.onLine) throw new Error("Offline");
      const response = await fetch(RESOURCE_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Resource server returned " + response.status);
      const pack = await response.json();
      await storePack(pack);
      localStorage.setItem("redro-icon-consent-v1", "granted");
      renderSettings();
    } catch (error) {
      console.warn("Redro icon resource download failed.", error);
      if (status) status.textContent = t("statusFailed");
      renderSettings();
      if (status) status.textContent = t("statusFailed");
    }
  }

  function showFirstRunPrompt() {
    if (localStorage.getItem("redro-icon-consent-v1")) return;
    const dialog = document.createElement("dialog");
    dialog.className = "app-dialog compact-dialog redro-resource-prompt";
    dialog.innerHTML = '<div class="dialog-header"><div><p class="eyebrow">REDRO</p><h2 id="redro-resource-prompt-title"></h2></div></div><p id="redro-resource-prompt-description"></p><div class="dialog-actions"><button type="button" class="secondary-button" id="redro-resource-skip"></button><button type="button" class="primary-button" id="redro-resource-allow"></button></div>';
    dialog.querySelector("#redro-resource-prompt-title").textContent = t("title");
    dialog.querySelector("#redro-resource-prompt-description").textContent = t("description") + " " + t("consent");
    dialog.querySelector("#redro-resource-skip").textContent = t("skip");
    dialog.querySelector("#redro-resource-allow").textContent = t("download");
    document.body.append(dialog);
    dialog.querySelector("#redro-resource-skip").addEventListener("click", () => {
      localStorage.setItem("redro-icon-consent-v1", "denied");
      dialog.close();
      dialog.remove();
      renderSettings();
    });
    dialog.querySelector("#redro-resource-allow").addEventListener("click", () => {
      localStorage.setItem("redro-icon-consent-v1", "granted");
      dialog.close();
      dialog.remove();
      downloadPack();
    });
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.showModal();
  }

  function updateClockStatus() {
    const status = document.getElementById("redro-clock-status");
    if (!status) return;
    status.textContent = anchor ? t("cached") : t("local");
  }

  window.RedroResources = { iconFor, download: () => downloadPack(true) };
  window.RedroClock = {
    now: estimatedNow,
    today: () => dateParts(estimatedNow()),
    dateLabel
  };

  ensureSettings();
  readCachedPack().then(pack => {
    if (pack) {
      iconPack = pack;
      renderSettings();
    }
  });
  if (!localStorage.getItem("redro-icon-consent-v1")) {
    setTimeout(showFirstRunPrompt, 700);
  }
  syncTime();
  document.getElementById("languageSelect")?.addEventListener("change", renderSettings);
  document.getElementById("settingsToggle")?.addEventListener("click", () => {
    ensureSettings();
    renderSettings();
  });
})();