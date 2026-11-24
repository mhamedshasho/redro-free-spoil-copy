(() => {
  const $ = id => document.getElementById(id);
  const translations = {
    en: {mode:"Expiry information",dateMode:"Choose expiry date",durationMode:"Enter shelf life",expiry:"Expiry date",days:"Shelf life in days",dateHint:"Choose the expiry date directly.",durationHint:"The app calculates the expiry date from the production date.",quickHint:"Calculated expiry: "},
    ar: {mode:"طريقة تحديد الصلاحية",dateMode:"اختيار تاريخ الانتهاء",durationMode:"إدخال مدة الصلاحية",expiry:"تاريخ الانتهاء",days:"مدة الصلاحية بالأيام",dateHint:"اختر تاريخ الانتهاء مباشرة.",durationHint:"سيحسب التطبيق تاريخ الانتهاء من تاريخ الإنتاج.",quickHint:"تاريخ الانتهاء المحسوب: "},
    zh: {mode:"有效期输入方式",dateMode:"选择到期日期",durationMode:"输入保质期",expiry:"到期日期",days:"保质期（天）",dateHint:"直接选择到期日期。",durationHint:"应用会根据生产日期计算到期日期。",quickHint:"计算的到期日期："},
    ja: {mode:"期限の入力方法",dateMode:"期限日を選択",durationMode:"保存期間を入力",expiry:"期限日",days:"保存期間（日）",dateHint:"期限日を直接選択します。",durationHint:"製造日から期限日を自動計算します。",quickHint:"計算された期限日："}
  };
  const language = () => translations[window.currentLanguage] ? window.currentLanguage : (document.documentElement.lang || "en");
  const text = () => translations[language()] || translations.en;
  const addDays = (dateValue, daysValue) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || "")) return "";
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
    date.setUTCDate(date.getUTCDate() + daysValue);
    return date.toISOString().slice(0, 10);
  };
  const validDays = value => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 36500;
  const calculated = (prefix, mode, date, days) => mode === "duration" && validDays(days) ? addDays(date, Number(days)) : "";
  function translateFields() {
    const t = text();
    const mode = $("expiryMode"), quickMode = $("quickExpiryMode");
    if (mode) {
      mode.setAttribute("aria-label", t.mode);
      mode.options[0].text = t.dateMode;
      mode.options[1].text = t.durationMode;
    }
    if (quickMode) {
      quickMode.setAttribute("aria-label", t.mode);
      quickMode.options[0].text = t.dateMode;
      quickMode.options[1].text = t.durationMode;
    }
    const dateLabel = $("expiryDateWrap")?.querySelector(".field-tip");
    if (dateLabel) dateLabel.textContent = t.dateHint;
    const durationLabel = $("expiryDurationWrap")?.querySelector(".field-tip");
    if (durationLabel) durationLabel.textContent = t.durationHint;
  }
  function updateFull() {
    const mode = $("expiryMode")?.value || "date";
    const dateWrap = $("expiryDateWrap"), durationWrap = $("expiryDurationWrap");
    if (!dateWrap || !durationWrap) return;
    const duration = mode === "duration";
    dateWrap.hidden = duration;
    durationWrap.hidden = !duration;
    $("expiryDate").disabled = duration;
    $("expiryDate").required = !duration;
    $("expiryDuration").disabled = !duration;
    $("expiryDuration").required = duration;
    const result = calculated("", mode, $("createdDate").value, $("expiryDuration").value);
    $("expiryCalculated").textContent = duration ? (result ? text().quickHint + result : "") : "";
  }
  function updateQuick() {
    const mode = $("quickExpiryMode")?.value || "date";
    const dateWrap = $("quickExpiryDateWrap"), durationWrap = $("quickExpiryDurationWrap");
    if (!dateWrap || !durationWrap) return;
    const duration = mode === "duration";
    dateWrap.hidden = duration;
    durationWrap.hidden = !duration;
    $("quickExpiry").disabled = duration;
    $("quickExpiry").required = !duration;
    $("quickExpiryDuration").disabled = !duration;
    $("quickExpiryDuration").required = duration;
    const result = calculated("", mode, $("quickCreatedDate").value, $("quickExpiryDuration").value);
    $("quickExpiryCalculated").textContent = duration && result ? text().quickHint + result : "";
  }
  const originalOpenItem = window.openItem;
  if (typeof originalOpenItem === "function") {
    window.openItem = function(item) {
      originalOpenItem(item);
      $("expiryMode").value = "date";
      $("expiryDuration").value = "";
      updateFull();
    };
  }
  const originalOpenQuickAdd = window.openQuickAdd;
  if (typeof originalOpenQuickAdd === "function") {
    window.openQuickAdd = function() {
      originalOpenQuickAdd();
      $("quickExpiryMode").value = "date";
      $("quickExpiryDuration").value = "";
      updateQuick();
    };
  }
  $("expiryMode")?.addEventListener("change", updateFull);
  $("expiryDuration")?.addEventListener("input", updateFull);
  $("createdDate")?.addEventListener("change", updateFull);
  $("quickExpiryMode")?.addEventListener("change", updateQuick);
  $("quickExpiryDuration")?.addEventListener("input", updateQuick);
  $("quickCreatedDate")?.addEventListener("change", updateQuick);
  $("languageSelect")?.addEventListener("change", () => { translateFields(); updateFull(); updateQuick(); });
  translateFields();
  updateFull();
  updateQuick();

  $("itemForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const name = $("itemName").value.trim();
    const quantity = Number($("itemQuantity").value);
    const createdDate = $("createdDate").value;
    const mode = $("expiryMode").value;
    const expiryDate = mode === "duration" ? calculated("", mode, createdDate, $("expiryDuration").value) : $("expiryDate").value;
    if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || !expiryDate || (mode === "duration" && !validDays($("expiryDuration").value))) {
      $("formError").textContent = text().durationHint;
      return;
    }
    if (expiryDate < createdDate) {
      $("formError").textContent = window.t("dateError");
      return;
    }
    const id = $("itemId").value || window.makeId();
    const submit = $("itemForm").querySelector('button[type="submit"]');
    const expectedUpdatedAt = $("itemId").dataset.expectedUpdatedAt || "";
    submit.disabled = true;
    try {
      const selectedPhoto = $("itemPhoto").files[0];
      const image = selectedPhoto ? await window.readImageFile(selectedPhoto) : $("itemPhoto").dataset.existing || "";
      const record = {id,name,quantity,unit:$("itemUnit").value,category:$("itemCategory").value || "Other",storageLocation:$("itemLocation").value,storageZone:$("itemZone").value,createdDate,expiryDate,notes:$("itemNotes").value.trim(),image,updatedAt:new Date().toISOString()};
      if ($("itemId").value) await window.persistUpdatedRecord(record, expectedUpdatedAt);
      else await window.persistNewRecord(record);
      window.activeLocation = record.storageLocation;
      window.persistActiveLocation?.();
      window.announceInventoryChange?.();
      await window.refresh();
      window.activeFilter = "all";
      window.activeGroup = "all";
      $("searchInput").value = "";
      $("itemDialog").close();
      window.render();
      window.renderGroups();
      window.showToast(window.t("saved"));
    } catch (error) {
      console.error("Redro item save failed:", error);
      $("formError").textContent = error.message === window.t("recordChanged") || error.message === window.t("recordRemoved") ? error.message : window.t("dbError") + " (" + (error?.name || "Error") + ")";
    } finally {
      submit.disabled = false;
    }
  }, true);

  $("quickAddForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const name = $("quickName").value.trim();
    const quantity = Number($("quickQuantity").value);
    const createdDate = $("quickCreatedDate").value;
    const mode = $("quickExpiryMode").value;
    const expiryDate = mode === "duration" ? calculated("", mode, createdDate, $("quickExpiryDuration").value) : $("quickExpiry").value;
    if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || !expiryDate || (mode === "duration" && !validDays($("quickExpiryDuration").value))) {
      $("quickName").focus();
      return;
    }
    if (expiryDate < createdDate) {
      window.showToast(window.t("dateError"));
      return;
    }
    const location = $("quickLocation").value;
    const record = {id:window.makeId(),name,quantity,unit:$("quickUnit").value,category:$("quickCategory").value || "Other",storageLocation:location,storageZone:window.zonesFor(location)[0],createdDate,expiryDate,notes:"",updatedAt:new Date().toISOString()};
    const button = $("quickSave");
    button.disabled = true;
    try {
      await window.persistNewRecord(record);
      window.activeLocation = location;
      window.persistActiveLocation?.();
      window.announceInventoryChange?.();
      await window.refresh();
      window.closeQuickAdd();
      window.activeFilter = "all";
      window.activeGroup = "all";
      $("searchInput").value = "";
      window.render();
      window.renderGroups();
      window.showToast(window.t("saved"));
    } catch (error) {
      console.error("Redro quick save failed:", error);
      window.showToast(window.t("dbError") + " (" + (error?.name || "Error") + ")");
    } finally {
      button.disabled = false;
    }
  }, true);
})();
