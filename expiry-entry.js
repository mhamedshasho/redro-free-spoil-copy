(() => {
  const $ = id => document.getElementById(id);
  const translations = {
    en: {mode:"Expiry information",dateMode:"Choose expiry date",durationMode:"Enter shelf life",expiry:"Expiry date",days:"Shelf life in days",dateHint:"Choose the expiry date directly.",durationHint:"The app calculates the expiry date from the production date.",quickHint:"Calculated expiry: "},
    ar: {mode:"طريقة تحديد الصلاحية",dateMode:"اختيار تاريخ الانتهاء",durationMode:"إدخال مدة الصلاحية",expiry:"تاريخ الانتهاء",days:"مدة الصلاحية بالأيام",dateHint:"اختر تاريخ الانتهاء مباشرة.",durationHint:"سيحسب التطبيق تاريخ الانتهاء من تاريخ الإنتاج.",quickHint:"تاريخ الانتهاء المحسوب: "},
    zh: {mode:"有效期输入方式",dateMode:"选择到期日期",durationMode:"输入保质期",expiry:"到期日期",days:"保质期（天）",dateHint:"直接选择到期日期。",durationHint:"应用会根据生产日期计算到期日期。",quickHint:"计算的到期日期："},
    ja: {mode:"期限の入力方法",dateMode:"期限日を選択",durationMode:"保存期間を入力",expiry:"期限日",days:"保存期間（日）",dateHint:"期限日を直接選択します。",durationHint:"製造日から期限日を自動計算します。",quickHint:"計算された期限日："}
  };
  const language = () => translations[currentLanguage] ? currentLanguage : (document.documentElement.lang || "en");
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
    const enabled = $("hasExpiry")?.checked !== false;
    $("expiryFields").hidden = !enabled;
    $("expiryDate").disabled = !enabled || mode === "duration";
    $("expiryDuration").disabled = !enabled || mode !== "duration";
    $("expiryDate").required = enabled && mode !== "duration";
    $("expiryDuration").required = enabled && mode === "duration";
    if (!enabled) { $("expiryCalculated").textContent = ""; return; }
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
    const enabled = $("quickHasExpiry")?.checked !== false;
    $("quickExpiryFields").hidden = !enabled;
    $("quickExpiry").disabled = !enabled || mode === "duration";
    $("quickExpiryDuration").disabled = !enabled || mode !== "duration";
    $("quickExpiry").required = enabled && mode !== "duration";
    $("quickExpiryDuration").required = enabled && mode === "duration";
    if (!enabled) { $("quickExpiryCalculated").textContent = ""; return; }
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
      delete $("itemId").dataset.restockAmount;
      delete $("itemId").dataset.restockOldExpiry;
      delete $("itemId").dataset.restockOldCreated;
      originalOpenItem(item);
      $("expiryMode").value = "date";
      $("expiryDuration").value = "";
      $("hasExpiry").checked = item?.hasExpiry !== false && Boolean(item?.expiryDate);
      $("itemPrice").value = item?.packagePrice ?? item?.price ?? "";
      $("itemUnitPrice").value = item?.unitPrice ?? "";
      $("itemCurrency").value = item?.currency || "SYP";
      updateFull();
    };
  }
  const originalOpenQuickAdd = window.openQuickAdd;
  if (typeof originalOpenQuickAdd === "function") {
    window.openQuickAdd = function() {
      originalOpenQuickAdd();
      $("quickExpiryMode").value = "date";
      $("quickExpiryDuration").value = "";
      $("quickHasExpiry").checked = true;
      $("quickPrice").value = "";
      $("quickUnitPrice").value = "";
      $("quickCurrency").value = "SYP";
      updateQuick();
    };
  }
  $("expiryMode")?.addEventListener("change", updateFull);
  $("hasExpiry")?.addEventListener("change", updateFull);
  $("quickHasExpiry")?.addEventListener("change", updateQuick);
  $("expiryDuration")?.addEventListener("input", updateFull);
  $("createdDate")?.addEventListener("change", updateFull);
  $("quickExpiryMode")?.addEventListener("change", updateQuick);
  $("quickExpiryDuration")?.addEventListener("input", updateQuick);
  $("quickCreatedDate")?.addEventListener("change", updateQuick);
  $("languageSelect")?.addEventListener("change", () => { translateFields(); updateFull(); updateQuick(); });
  const previousApplyPreferences = applyPreferences;
  applyPreferences = function applyExpiryEntryPreferences() {
    previousApplyPreferences();
    translateFields();
    updateFull();
    updateQuick();
  };
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
    const hasExpiry = $("hasExpiry").checked;
    const expiryDate = !hasExpiry ? "" : mode === "duration" ? calculated("", mode, createdDate, $("expiryDuration").value) : $("expiryDate").value;
    const priceRaw = $("itemPrice").value.trim();
    const unitPriceRaw = $("itemUnitPrice").value.trim();
    const price = priceRaw === "" ? null : Number(priceRaw);
    const unitPrice = unitPriceRaw === "" ? null : Number(unitPriceRaw);
    if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || price === null || unitPrice === null || !Number.isFinite(price) || price < 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || (hasExpiry && (!expiryDate || (mode === "duration" && !validDays($("expiryDuration").value))))) {
      $("formError").textContent = text().durationHint;
      return;
    }
    if (hasExpiry && expiryDate < createdDate) {
      $("formError").textContent = t("dateError");
      return;
    }
    const restockOldExpiry=$("itemId").dataset.restockOldExpiry||"";
    const restockOldCreated=$("itemId").dataset.restockOldCreated||"";
    if(restockOldExpiry && hasExpiry && (expiryDate===restockOldExpiry || createdDate===restockOldCreated)){
      $("formError").textContent=language()==="ar"?"لإعادة تعبئة هذه المادة، يجب إدخال تاريخ إنتاج/تحضير جديد وتاريخ انتهاء جديد للدفعة الجديدة.":"To restock this item, enter a new production/preparation date and a new expiry date for the new batch.";
      return;
    }
    if(restockOldExpiry && !hasExpiry){
      $("formError").textContent=language()==="ar"?"لا يمكن إلغاء متابعة الصلاحية أثناء إعادة التعبئة. حدّث تاريخ الانتهاء بدلاً من ذلك.":"Expiry tracking cannot be disabled during restocking. Update the expiry date instead.";
      return;
    }
    const id = $("itemId").value || makeId();
    const submit = $("itemForm").querySelector('button[type="submit"]');
    const expectedUpdatedAt = $("itemId").dataset.expectedUpdatedAt || "";
    submit.disabled = true;
    try {
      const selectedPhoto = $("itemPhoto").files[0];
      const image = selectedPhoto ? await readImageFile(selectedPhoto) : $("itemPhoto").dataset.existing || "";
      const record = {id,name,quantity,price,packagePrice:price,unitPrice,currency:$("itemCurrency").value.trim().slice(0,12)||"SYP",hasExpiry,unit:$("itemUnit").value,category:$("itemCategory").value || "Other",storageLocation:$("itemLocation").value,storageZone:$("itemZone").value,createdDate,expiryDate,notes:$("itemNotes").value.trim(),image,updatedAt:new Date().toISOString()};
      if ($("itemId").value) await persistUpdatedRecord(record, expectedUpdatedAt);
      else await persistNewRecord(record);
      delete $("itemId").dataset.restockAmount;
      delete $("itemId").dataset.restockOldExpiry;
      delete $("itemId").dataset.restockOldCreated;
      activeLocation = record.storageLocation;
      persistActiveLocation();
      announceInventoryChange();
      await refresh();
      activeFilter = "all";
      activeGroup = "all";
      $("searchInput").value = "";
      $("itemDialog").close();
      render();
      renderGroups();
      showToast(t("saved"));
    } catch (error) {
      console.error("Redro item save failed:", error);
      $("formError").textContent = error.message === t("recordChanged") || error.message === t("recordRemoved") ? error.message : t("dbError") + " (" + (error?.name || "Error") + ")";
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
    const hasExpiry = $("quickHasExpiry").checked;
    const expiryDate = !hasExpiry ? "" : mode === "duration" ? calculated("", mode, createdDate, $("quickExpiryDuration").value) : $("quickExpiry").value;
    const priceRaw = $("quickPrice").value.trim();
    const unitPriceRaw = $("quickUnitPrice").value.trim();
    const price = priceRaw === "" ? null : Number(priceRaw);
    const unitPrice = unitPriceRaw === "" ? null : Number(unitPriceRaw);
    if (!name || !Number.isFinite(quantity) || quantity < 0 || !createdDate || price === null || unitPrice === null || !Number.isFinite(price) || price < 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || (hasExpiry && (!expiryDate || (mode === "duration" && !validDays($("quickExpiryDuration").value))))) {
      $("quickName").focus();
      return;
    }
    if (hasExpiry && expiryDate < createdDate) {
      showToast(t("dateError"));
      return;
    }
    const location = $("quickLocation").value;
    const record = {id:makeId(),name,quantity,price,packagePrice:price,unitPrice,currency:$("quickCurrency").value.trim().slice(0,12)||"SYP",hasExpiry,unit:$("quickUnit").value,category:$("quickCategory").value || "Other",storageLocation:location,storageZone:zonesFor(location)[0],createdDate,expiryDate,notes:"",updatedAt:new Date().toISOString()};
    const button = $("quickSave");
    button.disabled = true;
    try {
      await persistNewRecord(record);
      activeLocation = location;
      persistActiveLocation();
      announceInventoryChange();
      await refresh();
      closeQuickAdd();
      activeFilter = "all";
      activeGroup = "all";
      $("searchInput").value = "";
      render();
      renderGroups();
      showToast(t("saved"));
    } catch (error) {
      console.error("Redro quick save failed:", error);
      showToast(t("dbError") + " (" + (error?.name || "Error") + ")");
    } finally {
      button.disabled = false;
    }
  }, true);
})();
