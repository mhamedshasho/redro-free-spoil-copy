/* Location-aware inventory UI inspired by the supplied reference. */
const STORAGE_LOCATIONS = ["Fridge", "Freezer", "Pantry"];
const STORAGE_ZONES = {
  Fridge: ["Top shelf", "Middle shelf", "Bottom shelf", "Crisper drawer", "Door shelf"],
  Freezer: ["Top shelf", "Middle shelf", "Bottom shelf", "Freezer drawer"],
  Pantry: ["Upper shelf", "Middle shelf", "Lower shelf", "Cupboard"]
};
const STORAGE_PREF_KEY = "redro-food-stock-location";
const ZONE_TRANSLATION_KEYS = {
  "Top shelf": "topShelf", "Middle shelf": "middleShelf", "Bottom shelf": "bottomShelf",
  "Crisper drawer": "crisperDrawer", "Door shelf": "doorShelf", "Freezer drawer": "freezerDrawer",
  "Upper shelf": "upperShelf", "Lower shelf": "lowerShelf", Cupboard: "cupboard"
};
const LOCATION_TRANSLATION_KEYS = {Fridge: "fridge", Freezer: "freezer", Pantry: "pantry"};
let activeLocation = "Fridge";
try {
  const storedLocation = localStorage.getItem(STORAGE_PREF_KEY);
  if (STORAGE_LOCATIONS.includes(storedLocation)) activeLocation = storedLocation;
} catch (error) {
  console.warn("Redro storage-location preference could not be read.", error);
}
function persistActiveLocation() {
  try { localStorage.setItem(STORAGE_PREF_KEY, activeLocation); }
  catch (error) { console.warn("Redro storage-location preference could not be saved.", error); }
}

const storageStrings = {
  en: {fridge:"Fridge",freezer:"Freezer",pantry:"Pantry",storageLocation:"Storage location",shelfArea:"Shelf / area",topShelf:"Top shelf",middleShelf:"Middle shelf",bottomShelf:"Bottom shelf",crisperDrawer:"Crisper drawer",doorShelf:"Door shelf",freezerDrawer:"Freezer drawer",upperShelf:"Upper shelf",lowerShelf:"Lower shelf",cupboard:"Cupboard",restock:"Restock",restockEyebrow:"EXPIRY CHECK",restockTitle:"Restock list",restockDescription:"Choose items to add to your shopping list.",nothingToRestock:"Nothing needs restocking right now.",expiredItems:"Expired",expiringSoonItems:"Expires soon",copySelected:"Copy selected",close:"Close",restockCopied:"Restock list copied",restockDownloaded:"Restock list downloaded",locationEmpty:"Nothing stored here yet.",itemCountLabel:"items",copyError:"Could not create the list. Please try again."},
  ar: {fridge:"الثلاجة",freezer:"المجمّد",pantry:"المخزن",storageLocation:"مكان التخزين",shelfArea:"الرف / المنطقة",topShelf:"الرف العلوي",middleShelf:"الرف الأوسط",bottomShelf:"الرف السفلي",crisperDrawer:"درج الخضروات",doorShelf:"رف الباب",freezerDrawer:"درج المجمّد",upperShelf:"الرف الأعلى",lowerShelf:"الرف الأسفل",cupboard:"الخزانة",restock:"إعادة التزويد",restockEyebrow:"مراجعة الصلاحية",restockTitle:"قائمة إعادة التزويد",restockDescription:"اختر المواد لإضافتها إلى قائمة التسوق.",nothingToRestock:"لا توجد مواد تحتاج إلى إعادة التزويد الآن.",expiredItems:"منتهية الصلاحية",expiringSoonItems:"تنتهي قريباً",copySelected:"نسخ المحدد",close:"إغلاق",restockCopied:"تم نسخ قائمة التسوق",restockDownloaded:"تم تنزيل قائمة التسوق",locationEmpty:"لا توجد مواد محفوظة هنا بعد.",itemCountLabel:"مواد",copyError:"تعذر إنشاء القائمة. حاول مرة أخرى."},
  zh: {fridge:"冰箱",freezer:"冷冻室",pantry:"食品柜",storageLocation:"存放位置",shelfArea:"货架 / 区域",topShelf:"上层",middleShelf:"中层",bottomShelf:"下层",crisperDrawer:"保鲜抽屉",doorShelf:"门架",freezerDrawer:"冷冻抽屉",upperShelf:"顶部货架",lowerShelf:"底部货架",cupboard:"橱柜",restock:"补货",restockEyebrow:"保质期检查",restockTitle:"补货清单",restockDescription:"选择要加入购物清单的物品。",nothingToRestock:"目前没有需要补货的物品。",expiredItems:"已过期",expiringSoonItems:"即将到期",copySelected:"复制所选项",close:"关闭",restockCopied:"补货清单已复制",restockDownloaded:"补货清单已下载",locationEmpty:"这里还没有存放物品。",itemCountLabel:"件物品",copyError:"无法创建清单，请重试。"},
  ja: {fridge:"冷蔵庫",freezer:"冷凍庫",pantry:"パントリー",storageLocation:"保存場所",shelfArea:"棚 / エリア",topShelf:"上段",middleShelf:"中段",bottomShelf:"下段",crisperDrawer:"野菜室",doorShelf:"ドアポケット",freezerDrawer:"冷凍室の引き出し",upperShelf:"上の棚",lowerShelf:"下の棚",cupboard:"戸棚",restock:"補充",restockEyebrow:"期限チェック",restockTitle:"補充リスト",restockDescription:"買い物リストに追加するアイテムを選択してください。",nothingToRestock:"今すぐ補充が必要なアイテムはありません。",expiredItems:"期限切れ",expiringSoonItems:"期限間近",copySelected:"選択項目をコピー",close:"閉じる",restockCopied:"補充リストをコピーしました",restockDownloaded:"補充リストをダウンロードしました",locationEmpty:"ここにはまだアイテムがありません。",itemCountLabel:"件",copyError:"リストを作成できませんでした。もう一度お試しください。"}
};
Object.assign(storageStrings.en, {unknownDateStatus:"Check date",editAction:"Edit",deleteAction:"Delete",groupLimit:"Backup has too many groups (maximum 100).",pngLimit:"PNG export supports up to 200 items; use PDF for larger inventories."});
Object.assign(storageStrings.ar, {unknownDateStatus:"تحقق من التاريخ",editAction:"تعديل",deleteAction:"حذف",groupLimit:"تحتوي النسخة الاحتياطية على مجموعات كثيرة (الحد الأقصى 100).",pngLimit:"يدعم تصدير PNG ما يصل إلى 200 مادة؛ استخدم PDF للمخزون الأكبر."});
Object.assign(storageStrings.zh, {unknownDateStatus:"检查日期",editAction:"编辑",deleteAction:"删除",groupLimit:"备份中的分组过多（最多 100 个）。",pngLimit:"PNG 导出最多支持 200 件物品；较大的库存请使用 PDF。"});
Object.assign(storageStrings.ja, {unknownDateStatus:"日付を確認",editAction:"編集",deleteAction:"削除",groupLimit:"バックアップのグループ数が上限の100を超えています。",pngLimit:"PNG書き出しは最大200件です。大量の在庫にはPDFをお使いください。"});
Object.entries(storageStrings).forEach(([language, strings]) => Object.assign(extraTranslations[language] || (extraTranslations[language] = {}), strings));

const originalBind = bind;
const originalRefresh = refresh;
const originalApplyPreferences = applyPreferences;

function storageLocationOf(item) {
  return STORAGE_LOCATIONS.includes(item?.storageLocation) ? item.storageLocation : "Fridge";
}
function zonesFor(location) {
  return STORAGE_ZONES[STORAGE_LOCATIONS.includes(location) ? location : "Fridge"];
}
function storageZoneOf(item) {
  const location = storageLocationOf(item);
  return zonesFor(location).includes(item?.storageZone) ? item.storageZone : zonesFor(location)[0];
}
function zoneLabel(zone) {
  return t(ZONE_TRANSLATION_KEYS[zone] || zone);
}
function locationLabel(location) {
  return t(LOCATION_TRANSLATION_KEYS[location] || location);
}
function foodSymbol(item) {
  if (item.image) return '<img src="' + escapeHtml(item.image) + '" alt="" loading="lazy">';
  const category = item.category || "Other";
  const symbols = {Vegetables:"🥦",Fruits:"🍎",Dairy:"🥛","Meat & Fish":"🥩",Bakery:"🍞",Drinks:"🧃",Other:"🥫"};
  return '<span aria-hidden="true">' + (symbols[category] || "🥫") + '</span>';
}
function renderStorageSelects(location = $("itemLocation")?.value || activeLocation, selectedZone = "") {
  const locationSelects = [$("itemLocation"), $("quickLocation")].filter(Boolean);
  locationSelects.forEach(select => {
    const previous = select.value;
    select.innerHTML = STORAGE_LOCATIONS.map(value => '<option value="' + value + '">' + escapeHtml(locationLabel(value)) + '</option>').join("");
    select.value = STORAGE_LOCATIONS.includes(previous) ? previous : (STORAGE_LOCATIONS.includes(location) ? location : activeLocation);
  });
  const zoneSelect = $("itemZone");
  if (zoneSelect) {
    const chosenLocation = STORAGE_LOCATIONS.includes(location) ? location : activeLocation;
    const preferred = selectedZone || zoneSelect.value;
    zoneSelect.innerHTML = zonesFor(chosenLocation).map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(zoneLabel(value)) + '</option>').join("");
    zoneSelect.value = zonesFor(chosenLocation).includes(preferred) ? preferred : zonesFor(chosenLocation)[0];
  }
  if ($("quickLocation")) $("quickLocation").setAttribute("aria-label", t("storageLocation"));
  if ($("itemLocationLabel")) $("itemLocationLabel").textContent = t("storageLocation");
  if ($("itemZoneLabel")) $("itemZoneLabel").textContent = t("shelfArea");
}
function renderStorageTabs() {
  const container = $("storageTabs");
  if (!container) return;
  container.innerHTML = STORAGE_LOCATIONS.map(location => {
    const count = items.filter(item => storageLocationOf(item) === location).length;
    const icon = location === "Fridge" ? "▣" : location === "Freezer" ? "❄" : "▤";
    return '<button type="button" class="storage-tab' + (activeLocation === location ? ' active' : '') + '" aria-pressed="' + (activeLocation === location) + '" data-location="' + location + '"><span class="storage-tab-icon" aria-hidden="true">' + icon + '</span><span class="storage-tab-label">' + escapeHtml(locationLabel(location)) + '</span><b>' + count + '</b></button>';
  }).join("");
  container.querySelectorAll("[data-location]").forEach(button => button.addEventListener("click", () => {
    activeLocation = button.dataset.location;
    persistActiveLocation();
    renderStorageTabs();
    render();
  }));
  container.setAttribute("aria-label", t("storageLocation"));
}
function renderRestockList() {
  const list = $("restockList");
  if (!list) return;
  const due = items.filter(item => ["soon", "expired"].includes(statusOf(item).key)).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  $("restockCount").textContent = String(due.length);
  $("restockToggle").setAttribute("aria-label", t("restock") + " (" + due.length + ")");
  $("restockEyebrow").textContent = t("restockEyebrow");
  $("restockTitle").textContent = t("restockTitle");
  $("restockDescription").textContent = t("restockDescription");
  $("restockEmpty").textContent = t("nothingToRestock");
  $("restockClose").textContent = t("close");
  $("copyRestock").textContent = t("copySelected");
  $("restockEmpty").hidden = due.length > 0;
  list.innerHTML = due.map(item => {
    const state = statusOf(item);
    return '<label class="restock-row"><input type="checkbox" data-restock-id="' + escapeHtml(item.id) + '" checked><span class="restock-copy"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.quantity + " " + item.unit + " · " + locationLabel(storageLocationOf(item))) + '</small></span><span class="restock-status status-' + state.key + '">' + escapeHtml(state.key === "expired" ? t("expiredItems") : state.label) + '</span></label>';
  }).join("");
  $("copyRestock").disabled = due.length === 0;
  list.querySelectorAll("input[type=checkbox]").forEach(input => input.addEventListener("change", updateRestockAction));
}
function updateRestockAction() {
  const selected = $("restockList")?.querySelectorAll("input[type=checkbox]:checked").length || 0;
  $("copyRestock").disabled = selected === 0;
}
async function copyRestockList() {
  const selectedIds = [...$("restockList").querySelectorAll("input[type=checkbox]:checked")].map(input => input.dataset.restockId);
  const selected = items.filter(item => selectedIds.includes(item.id));
  if (!selected.length) return;
  const content = selected.map(item => "[ ] " + item.name + " — " + item.quantity + " " + item.unit).join("\n");
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      showToast(t("restockCopied"));
    } else {
      downloadBlob(new Blob([content + "\n"], {type:"text/plain;charset=utf-8"}), "redro-restock-list-" + today() + ".txt");
      showToast(t("restockDownloaded"));
    }
  } catch (error) {
    console.error("Redro restock list export error:", error);
    try {
      downloadBlob(new Blob([content + "\n"], {type:"text/plain;charset=utf-8"}), "redro-restock-list-" + today() + ".txt");
      showToast(t("restockDownloaded"));
    } catch (downloadError) {
      showToast(t("copyError"));
    }
  }
}

render = function renderLocationAwareInventory() {
  const query = $("searchInput").value.trim().toLowerCase();
  const inLocation = items.filter(item => storageLocationOf(item) === activeLocation);
  const filtered = inLocation.filter(item => {
    const status = statusOf(item).key;
    const searchable = [item.name, item.notes, item.category, groupLabel(item.category || "Other"), item.storageZone, zoneLabel(storageZoneOf(item)), item.storageLocation, locationLabel(storageLocationOf(item))].join(" ").toLowerCase();
    return (activeFilter === "all" || status === activeFilter)
      && (activeGroup === "all" || (item.category || "Other") === activeGroup)
      && (!query || searchable.includes(query));
  }).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  $("totalCount").textContent = items.length;
  $("soonCount").textContent = items.filter(item => statusOf(item).key === "soon").length;
  $("expiredCount").textContent = items.filter(item => statusOf(item).key === "expired").length;
  if ($("filterAll")) $("filterAll").textContent = String(items.length);

  const zones = zonesFor(activeLocation);
  $("inventoryList").innerHTML = zones.map(zone => {
    const zoneItems = filtered.filter(item => storageZoneOf(item) === zone);
    if (!zoneItems.length) return "";
    const cards = zoneItems.map(item => {
      const status = statusOf(item);
      const category = groupLabel(item.category || "Other");
      return '<article class="item-card"><div class="item-symbol">' + foodSymbol(item) + '</div><div class="item-main"><div class="item-name">' + escapeHtml(item.name) + '</div><div class="item-meta"><span>' + escapeHtml(item.quantity) + ' ' + escapeHtml(item.unit) + '</span><span>' + escapeHtml(t("expiresPrefix")) + ' ' + escapeHtml(item.expiryDate) + '</span><span>' + escapeHtml(category) + '</span></div></div><span class="item-status status-' + status.key + '">' + escapeHtml(status.label) + '</span><div class="item-actions"><button type="button" class="mini-button" data-edit="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(t("editAction")) + ' ' + escapeHtml(item.name) + '" title="' + escapeHtml(t("editAction")) + '">✎</button><button type="button" class="mini-button" data-delete="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(t("deleteAction")) + ' ' + escapeHtml(item.name) + '" title="' + escapeHtml(t("deleteAction")) + '">×</button></div></article>';
    }).join("");
    return '<section class="zone-section"><div class="zone-heading"><h3>' + escapeHtml(zoneLabel(zone)) + '</h3><span>' + zoneItems.length + ' ' + escapeHtml(t("itemCountLabel")) + '</span></div><div class="zone-items">' + cards + '</div></section>';
  }).join("");

  const empty = filtered.length === 0;
  $("emptyState").classList.toggle("visible", empty);
  $("inventoryList").style.display = empty ? "none" : "block";
  const noLocationItems = inLocation.length === 0 && items.length > 0 && activeFilter === "all" && activeGroup === "all" && !query;
  $("emptyState").querySelector("h3").textContent = noLocationItems ? locationLabel(activeLocation) : t(items.length === 0 ? "emptyTitle" : "noMatch");
  $("emptyState").querySelector("p").textContent = noLocationItems ? t("locationEmpty") : t(items.length === 0 ? "emptyText" : "noMatchText");
  document.querySelectorAll(".filter-chip").forEach(button => button.classList.toggle("active", button.dataset.filter === activeFilter));
  renderStorageTabs();
  renderRestockList();
};

refresh = async function refreshLocationAwareInventory() {
  const latest = await getAll();
  items = latest.sort((a, b) => String(a.expiryDate || "").localeCompare(String(b.expiryDate || "")));
  render();
  renderGroups();
  return items;
};

openItem = function openLocationAwareItem(item) {
  renderCategorySelects();
  renderStorageSelects(item?.storageLocation || activeLocation, item?.storageZone || "");
  $("itemForm").reset();
  $("itemId").value = item?.id || "";
  $("itemId").dataset.expectedUpdatedAt = item?.updatedAt || "";
  $("formTitle").textContent = item ? t("editTitle") : t("addTitle");
  $("itemName").value = item?.name || "";
  $("itemQuantity").value = item?.quantity ?? "";
  $("itemUnit").value = item?.unit || "pcs";
  $("createdDate").value = item?.createdDate || today();
  $("expiryDate").value = item?.expiryDate || "";
  $("itemNotes").value = item?.notes || "";
  $("itemCategory").value = item?.category || "Other";
  $("itemLocation").value = item?.storageLocation || activeLocation;
  renderStorageSelects($("itemLocation").value, item?.storageZone || "");
  $("itemZone").value = storageZoneOf(item || {storageLocation:$("itemLocation").value});
  $("itemPhoto").value = "";
  $("itemPhoto").dataset.existing = item?.image || "";
  setPhotoPreview(item?.image || "");
  $("formError").textContent = "";
  $("itemDialog").showModal();
};

saveQuickItem = async function saveLocationAwareQuickItem(event) {
  event.preventDefault();
  const name = $("quickName").value.trim();
  const quantity = Number($("quickQuantity").value);
  const expiryDate = $("quickExpiry").value;
  const storageLocation = STORAGE_LOCATIONS.includes($("quickLocation").value) ? $("quickLocation").value : activeLocation;
  if (!name || !Number.isFinite(quantity) || quantity < 0 || !expiryDate) {
    $("quickName").focus();
    return;
  }
  const record = {id:makeId(),name,quantity,unit:$("quickUnit").value,category:$("quickCategory").value||"Other",storageLocation,storageZone:zonesFor(storageLocation)[0],createdDate:today(),expiryDate,notes:"",updatedAt:new Date().toISOString()};
  const button = $("quickSave");
  button.disabled = true;
  try {
    await transaction("readwrite", store => store.put(record));
    activeLocation = storageLocation;
    persistActiveLocation();
    await refresh();
    closeQuickAdd();
    activeFilter = "all"; activeGroup = "all"; $("searchInput").value = "";
    render(); renderGroups(); showToast(t("saved"));
  } catch (error) {
    console.error("Redro quick-save error:", error);
    showToast(t("dbError") + " (" + (error?.name || "Error") + ")");
  } finally {
    button.disabled = false;
  }
};

saveItem = async function saveLocationAwareItem(event) {
  event.preventDefault();
  const name = $("itemName").value.trim();
  const quantity = Number($("itemQuantity").value);
  const createdDate = $("createdDate").value;
  const expiryDate = $("expiryDate").value;
  const storageLocation = STORAGE_LOCATIONS.includes($("itemLocation").value) ? $("itemLocation").value : "Fridge";
  const storageZone = zonesFor(storageLocation).includes($("itemZone").value) ? $("itemZone").value : zonesFor(storageLocation)[0];
  if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || !expiryDate) {
    $("formError").textContent = t("invalid");
    return;
  }
  if (expiryDate < createdDate) {
    $("formError").textContent = t("dateError");
    return;
  }
  const id = $("itemId").value || makeId();
  const submit = $("itemForm").querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const selectedPhoto = $("itemPhoto").files[0];
    const image = selectedPhoto ? await readImageFile(selectedPhoto) : $("itemPhoto").dataset.existing || "";
    const record = {id,name,quantity,unit:$("itemUnit").value,category:$("itemCategory").value||"Other",storageLocation,storageZone,createdDate,expiryDate,notes:$("itemNotes").value.trim(),image,updatedAt:new Date().toISOString()};
    await transaction("readwrite", store => store.put(record));
    activeLocation = storageLocation;
    persistActiveLocation();
    await refresh();
    activeFilter = "all"; activeGroup = "all"; $("searchInput").value = "";
    $("itemDialog").close(); render(); renderGroups(); showToast(t("saved"));
  } catch (error) {
    console.error("Redro item-save error:", error);
    $("formError").textContent = t("dbError") + " (" + (error?.name || "Error") + ")";
  } finally {
    submit.disabled = false;
  }
};

validateBackup = function validateLocationAwareBackup(data) {
  if (!data || data.format !== "redro-food-stock-backup" || !Array.isArray(data.items) || data.items.length > 100000) throw new Error(t("invalidBackup"));
  const seen = new Set();
  const realDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z")) && new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
  return data.items.map(item => {
    if (!item || typeof item.name !== "string" || !item.name.trim() || typeof item.id !== "string" || !item.id || seen.has(item.id)
      || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 0 || !realDate(item.createdDate) || !realDate(item.expiryDate) || item.expiryDate < item.createdDate) throw new Error(t("invalidRecord"));
    seen.add(item.id);
    const storageLocation = STORAGE_LOCATIONS.includes(item.storageLocation) ? item.storageLocation : "Fridge";
    const storageZone = zonesFor(storageLocation).includes(item.storageZone) ? item.storageZone : zonesFor(storageLocation)[0];
    return {id:item.id,name:item.name.trim(),quantity:Number(item.quantity),unit:String(item.unit||"pcs"),category:String(item.category||"Other"),storageLocation,storageZone,createdDate:item.createdDate,expiryDate:item.expiryDate,notes:String(item.notes||""),image:typeof item.image==="string"&&item.image.startsWith("data:image/")&&item.image.length<=7*1024*1024?item.image:"",updatedAt:item.updatedAt||new Date().toISOString()};
  });
};

const originalOpenQuickAdd = openQuickAdd;
openQuickAdd = function openLocationAwareQuickAdd() {
  originalOpenQuickAdd();
  renderStorageSelects(activeLocation);
  $("quickLocation").value = activeLocation;
};
applyPreferences = function applyLocationAwarePreferences() {
  originalApplyPreferences();
  renderStorageSelects(activeLocation);
  renderStorageTabs();
  renderRestockList();
};
bind = function bindLocationAwareUI() {
  originalBind();
  renderStorageSelects(activeLocation);
  renderStorageTabs();
  renderRestockList();
  $("itemLocation").addEventListener("change", () => renderStorageSelects($("itemLocation").value));
  $("quickLocation").addEventListener("change", () => renderStorageSelects($("quickLocation").value));
  $("restockToggle").addEventListener("click", () => { renderRestockList(); $("restockDialog").showModal(); });
  $("copyRestock").addEventListener("click", copyRestockList);
};


/* Integrity protections layered around the original local-first data model. */
function persistNewRecord(record) {
  return transaction("readwrite", store => store.add(record));
}
function persistUpdatedRecord(record, expectedUpdatedAt) {
  return new Promise((resolve, reject) => {
    let tx;
    let conflict = null;
    let settled = false;
    try { tx = db.transaction(STORE, "readwrite"); }
    catch (error) { reject(error); return; }
    const finish = (ok, error) => {
      if (settled) return;
      settled = true;
      ok ? resolve() : reject(error || tx.error || new Error("Database transaction failed"));
    };
    tx.oncomplete = () => finish(true);
    tx.onabort = () => finish(false, conflict || tx.error || new Error("Database transaction aborted"));
    tx.onerror = () => {};
    const store = tx.objectStore(STORE);
    const request = store.get(record.id);
    request.onerror = () => { conflict = request.error; try { tx.abort(); } catch {} };
    request.onsuccess = () => {
      const current = request.result;
      if (!current) {
        conflict = new Error(t("recordRemoved"));
        try { tx.abort(); } catch {}
        return;
      }
      if ((current.updatedAt || "") !== (expectedUpdatedAt || "")) {
        conflict = new Error(t("recordChanged"));
        try { tx.abort(); } catch {}
        return;
      }
      store.put(record);
    };
  });
}
function persistDeletedRecord(id, expectedUpdatedAt) {
  return new Promise((resolve, reject) => {
    let tx;
    let conflict = null;
    let settled = false;
    try { tx = db.transaction(STORE, "readwrite"); }
    catch (error) { reject(error); return; }
    const finish = (ok, error) => {
      if (settled) return;
      settled = true;
      ok ? resolve() : reject(error || tx.error || new Error("Database transaction failed"));
    };
    tx.oncomplete = () => finish(true);
    tx.onabort = () => finish(false, conflict || tx.error || new Error("Database transaction aborted"));
    tx.onerror = () => {};
    const store = tx.objectStore(STORE);
    const request = store.get(id);
    request.onerror = () => { conflict = request.error; try { tx.abort(); } catch {} };
    request.onsuccess = () => {
      const current = request.result;
      if (!current) {
        conflict = new Error(t("recordRemoved"));
        try { tx.abort(); } catch {}
        return;
      }
      if ((current.updatedAt || "") !== (expectedUpdatedAt || "")) {
        conflict = new Error(t("recordChanged"));
        try { tx.abort(); } catch {}
        return;
      }
      store.delete(id);
    };
  });
}
const inventoryChannel = typeof BroadcastChannel === "function" ? new BroadcastChannel("redro-food-stock-sync") : null;
function announceInventoryChange() {
  inventoryChannel?.postMessage({type:"inventory-changed"});
  try { localStorage.setItem("redro-food-stock-sync", String(Date.now())); } catch {}
}
if (inventoryChannel) inventoryChannel.onmessage = event => {
  if (event.data?.type === "inventory-changed") refresh().catch(error => console.error("Redro cross-tab refresh failed:", error));
};
window.addEventListener("storage", event => {
  if (event.key === "redro-food-stock-sync" && !inventoryChannel) refresh().catch(error => console.error(error));
  if (event.key === "redro-food-stock-groups") {
    groups = loadStoredGroups();
    renderCategorySelects(); renderGroups(); render();
  }
});

normalizeGroups = function normalizeBoundedGroups(value, fallback = groups) {
  const source = Array.isArray(value) ? value : fallback;
  const clean = [...new Set(source.filter(item => typeof item === "string").map(item => item.trim()).filter(Boolean))];
  if (!clean.includes("Other")) clean.push("Other");
  if (clean.length > 100) throw new Error(t("groupLimit"));
  if (clean.some(group => group.length > 32)) throw new Error(t("groupLimit"));
  return clean;
};

validateBackup = function validateHardenedBackup(data) {
  if (!data || data.format !== "redro-food-stock-backup" || !Array.isArray(data.items) || data.items.length > 100000) throw new Error(t("invalidBackup"));
  const seen = new Set();
  const realDate = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const validImage = value => typeof value === "string"
    && value.length <= 7 * 1024 * 1024
    && /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
  const result = data.items.map(item => {
    if (!item || typeof item.name !== "string" || !item.name.trim() || item.name.length > 90
      || typeof item.id !== "string" || !item.id || item.id.length > 200 || seen.has(item.id)
      || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 0
      || !realDate(item.createdDate) || !realDate(item.expiryDate) || item.expiryDate < item.createdDate) throw new Error(t("invalidRecord"));
    const category = String(item.category || "Other").trim() || "Other";
    if (category.length > 32) throw new Error(t("groupLimit"));
    seen.add(item.id);
    const storageLocation = STORAGE_LOCATIONS.includes(item.storageLocation) ? item.storageLocation : "Fridge";
    const storageZone = zonesFor(storageLocation).includes(item.storageZone) ? item.storageZone : zonesFor(storageLocation)[0];
    return {id:item.id,name:item.name.trim(),quantity:Number(item.quantity),unit:String(item.unit||"pcs").slice(0,24),category,storageLocation,storageZone,createdDate:item.createdDate,expiryDate:item.expiryDate,notes:String(item.notes||"").slice(0,500),image:validImage(item.image)?item.image:"",updatedAt:typeof item.updatedAt==="string"?item.updatedAt:new Date().toISOString()};
  });
  const allGroups = [...(Array.isArray(data.groups) ? data.groups : []), ...result.map(item => item.category)];
  normalizeGroups(allGroups);
  return result;
};

importItems = async function importHardenedItems(mode) {
  if (!pendingImport) return;
  const merging = mode === "merge";
  const {items: backupItems, groups: backupGroups} = pendingImport;
  try {
    const existing = merging ? await getAll() : [];
    const existingIds = new Set(existing.map(item => item.id));
    const candidates = merging ? backupItems.filter(item => !existingIds.has(item.id)) : backupItems;
    const count = candidates.length;
    const accepted = confirm(merging
      ? "Add " + count + " new item(s)? Existing matching IDs will be skipped."
      : "Replace all current inventory with " + count + " backup item(s)?");
    if (!accepted) return;

    const groupSource = merging
      ? [...groups, ...(backupGroups || []), ...backupItems.map(item => item.category)]
      : [...(backupGroups || groups), ...backupItems.map(item => item.category)];
    const nextGroups = normalizeGroups(groupSource);
    let previousStoredGroups = null;
    try {
      previousStoredGroups = localStorage.getItem("redro-food-stock-groups");
      localStorage.setItem("redro-food-stock-groups", JSON.stringify(nextGroups));
    } catch (error) {
      throw new Error(t("groupsNotSaved"));
    }

    try {
      await new Promise((resolve, reject) => {
        let tx;
        try { tx = db.transaction(STORE, "readwrite"); }
        catch (error) { reject(error); return; }
        const store = tx.objectStore(STORE);
        tx.oncomplete = resolve;
        tx.onerror = () => {};
        tx.onabort = () => reject(tx.error || new Error("Import transaction aborted"));
        if (!merging) store.clear();
        if (!merging) candidates.forEach(item => store.put(item));
        else candidates.forEach(item => {
          const request = store.get(item.id);
          request.onsuccess = () => { if (!request.result) store.put(item); };
        });
      });
    } catch (error) {
      try {
        if (previousStoredGroups === null) localStorage.removeItem("redro-food-stock-groups");
        else localStorage.setItem("redro-food-stock-groups", previousStoredGroups);
      } catch (rollbackError) { console.error("Redro group rollback failed:", rollbackError); }
      throw error;
    }

    groups = nextGroups;
    pendingImport = null;
    $("importDialog").close();
    renderCategorySelects();
    await refresh();
    announceInventoryChange();
    showToast(t("imported"));
  } catch (error) {
    console.error("Redro import failed:", error);
    showToast(error.message || t("dbError"));
  }
};

saveQuickItem = async function saveLocationAwareQuickItemWithSync(event) {
  event.preventDefault();
  const name = $("quickName").value.trim();
  const quantity = Number($("quickQuantity").value);
  const expiryDate = $("quickExpiry").value;
  const storageLocation = STORAGE_LOCATIONS.includes($("quickLocation").value) ? $("quickLocation").value : activeLocation;
  if (!name || !Number.isFinite(quantity) || quantity < 0 || !expiryDate) { $("quickName").focus(); return; }
  const record = {id:makeId(),name,quantity,unit:$("quickUnit").value,category:$("quickCategory").value||"Other",storageLocation,storageZone:zonesFor(storageLocation)[0],createdDate:today(),expiryDate,notes:"",updatedAt:new Date().toISOString()};
  const button = $("quickSave"); button.disabled = true;
  try {
    await persistNewRecord(record);
    activeLocation = storageLocation; persistActiveLocation();
    announceInventoryChange();
    await refresh(); closeQuickAdd(); activeFilter = "all"; activeGroup = "all"; $("searchInput").value = "";
    render(); renderGroups(); showToast(t("saved"));
  } catch (error) {
    console.error("Redro quick-save error:", error);
    showToast(t("dbError") + " (" + (error?.name || "Error") + ")");
  } finally { button.disabled = false; }
};

saveItem = async function saveLocationAwareItemWithConflictCheck(event) {
  event.preventDefault();
  const name = $("itemName").value.trim();
  const quantity = Number($("itemQuantity").value);
  const createdDate = $("createdDate").value;
  const expiryDate = $("expiryDate").value;
  const storageLocation = STORAGE_LOCATIONS.includes($("itemLocation").value) ? $("itemLocation").value : "Fridge";
  const storageZone = zonesFor(storageLocation).includes($("itemZone").value) ? $("itemZone").value : zonesFor(storageLocation)[0];
  if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || !expiryDate) { $("formError").textContent = t("invalid"); return; }
  if (expiryDate < createdDate) { $("formError").textContent = t("dateError"); return; }
  const id = $("itemId").value || makeId();
  const expectedUpdatedAt = $("itemId").dataset.expectedUpdatedAt || "";
  const submit = $("itemForm").querySelector('button[type="submit"]'); submit.disabled = true;
  try {
    const selectedPhoto = $("itemPhoto").files[0];
    const image = selectedPhoto ? await readImageFile(selectedPhoto) : $("itemPhoto").dataset.existing || "";
    const record = {id,name,quantity,unit:$("itemUnit").value,category:$("itemCategory").value||"Other",storageLocation,storageZone,createdDate,expiryDate,notes:$("itemNotes").value.trim(),image,updatedAt:new Date().toISOString()};
    if ($("itemId").value) await persistUpdatedRecord(record, expectedUpdatedAt);
    else await persistNewRecord(record);
    activeLocation = storageLocation; persistActiveLocation(); announceInventoryChange();
    await refresh(); activeFilter = "all"; activeGroup = "all"; $("searchInput").value = "";
    $("itemDialog").close(); render(); renderGroups(); showToast(t("saved"));
  } catch (error) {
    console.error("Redro item-save error:", error);
    $("formError").textContent = error.message === t("recordChanged") || error.message === t("recordRemoved") ? error.message : t("dbError") + " (" + (error?.name || "Error") + ")";
    if (error.message === t("recordChanged") || error.message === t("recordRemoved")) await refresh().catch(() => {});
  } finally { submit.disabled = false; }
};

deleteItem = async function deleteLocationAwareItemWithConflictCheck(id) {
  const item = items.find(candidate => candidate.id === id);
  if (!item || !confirm(t("deleteConfirm") + " " + item.name)) return;
  try {
    await persistDeletedRecord(id, item.updatedAt || "");
    announceInventoryChange();
    await refresh(); showToast(t("deleted"));
  } catch (error) {
    console.error("Redro delete failed:", error);
    showToast(error.message === t("recordChanged") || error.message === t("recordRemoved") ? error.message : t("dbError"));
    await refresh().catch(refreshError => console.error(refreshError));
  }
};

exportPdf = function exportCompleteInventoryPdf() {
  const printArea = $("printInventory");
  if (!printArea) { window.print(); return; }
  const rows = items.slice().sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));
  const locationSections = STORAGE_LOCATIONS.map(location => {
    const locationRows = rows.filter(item => storageLocationOf(item) === location);
    if (!locationRows.length) return "";
    const zoneSections = zonesFor(location).map(zone => {
      const zoneRows = locationRows.filter(item => storageZoneOf(item) === zone);
      if (!zoneRows.length) return "";
      const cards = zoneRows.map(item => '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.quantity + " " + item.unit) + '</td><td>' + escapeHtml(groupLabel(item.category || "Other")) + '</td><td>' + escapeHtml(item.expiryDate) + '</td><td>' + escapeHtml(statusOf(item).label) + '</td></tr>').join("");
      return '<h3>' + escapeHtml(zoneLabel(zone)) + '</h3><table><thead><tr><th>Item</th><th>Quantity</th><th>Group</th><th>Expiry</th><th>Status</th></tr></thead><tbody>' + cards + '</tbody></table>';
    }).join("");
    return '<section class="print-location"><h2>' + escapeHtml(locationLabel(location)) + '</h2>' + zoneSections + '</section>';
  }).join("");
  printArea.innerHTML = '<header><h1>Redro Food Stock</h1><p>' + escapeHtml(new Date().toLocaleDateString()) + ' · ' + rows.length + ' items</p></header>' + (locationSections || '<p>No items in your inventory.</p>');
  const oldTitle = document.title;
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true; document.body.classList.remove("printing-all"); printArea.replaceChildren(); document.title = oldTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  document.title = "Redro Food Stock - Inventory";
  document.body.classList.add("printing-all");
  window.addEventListener("afterprint", cleanup, {once:true});
  try { window.print(); } catch (error) { cleanup(); showToast(t("dbError")); }
};

exportPng = function exportBoundedPng() {
  const rows = items.slice().sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));
  if (rows.length > 200) { showToast(t("pngLimit")); return; }
  const width = 1100, rowHeight = 76, header = 170, height = Math.max(350, header + rows.length * rowHeight + 40);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]));
  const content = rows.map((item,index) => {
    const y = header + index * rowHeight, state = statusOf(item);
    const color = state.key === "expired" ? "#bd4653" : state.key === "soon" ? "#a16a18" : "#218653";
    const storage = locationLabel(storageLocationOf(item)) + " · " + zoneLabel(storageZoneOf(item));
    return '<rect x="36" y="' + y + '" width="1028" height="62" rx="14" fill="' + (index%2 ? "#f0f6f1" : "#ffffff") + '" stroke="#dce8df"/><text x="62" y="' + (y+26) + '" font-size="21" font-weight="700" fill="#183b29">' + esc(item.name) + '</text><text x="62" y="' + (y+48) + '" font-size="13" fill="#64766b">' + esc(item.quantity + " " + item.unit + " · " + (item.category || "Other") + " · " + storage) + '</text><text x="760" y="' + (y+36) + '" font-size="16" fill="#43594b">' + esc(item.expiryDate) + '</text><text x="1030" y="' + (y+36) + '" text-anchor="end" font-size="15" font-weight="700" fill="' + color + '">' + esc(state.label) + '</text>';
  }).join("");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '"><rect width="100%" height="100%" fill="#f7faf7"/><text x="42" y="62" font-size="34" font-weight="700" fill="#183b29">Redro Food Stock</text><text x="42" y="98" font-size="17" fill="#64766b">' + esc(new Date().toLocaleDateString()) + " · " + rows.length + ' items</text><rect x="36" y="125" width="1028" height="36" rx="10" fill="#e4f0e7"/><text x="62" y="149" font-size="14" font-weight="700" fill="#315b40">Item</text><text x="760" y="149" font-size="14" font-weight="700" fill="#315b40">Expiry</text><text x="1030" y="149" text-anchor="end" font-size="14" font-weight="700" fill="#315b40">Status</text>' + (content || '<text x="55" y="' + (header+45) + '" font-size="20" fill="#64766b">No items</text>') + '</svg>';
  const url = URL.createObjectURL(new Blob([svg], {type:"image/svg+xml;charset=utf-8"}));
  const image = new Image();
  image.onload = () => {
    try {
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(image,0,0,width,height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (blob) downloadBlob(blob,"redro-food-stock-"+today()+".png"); else showToast(t("dbError"));
      },"image/png");
    } catch (error) { URL.revokeObjectURL(url); console.error(error); showToast(t("dbError")); }
  };
  image.onerror = () => { URL.revokeObjectURL(url); showToast(t("dbError")); };
  image.src = url;
};

