(() => {
  const $ = id => document.getElementById(id);
  const PLAN_KEY = "redro-notification-plan-v1";
  const PLUGIN = () => window.Capacitor?.Plugins?.LocalNotifications || window.Capacitor?.registerPlugin?.("LocalNotifications");
  const SETTINGS_PLUGIN = () => window.Capacitor?.Plugins?.NotificationSettings || window.Capacitor?.registerPlugin?.("NotificationSettings");
  const lang = () => document.documentElement.lang || "ar";
  const strings = {
    ar:{
      date:"التاريخ",notifications:"الإشعارات",notificationDesc:"فعّل التنبيهات لتصلك تحذيرات المواد القريبة والمنتهية الصلاحية.",inventory:"المخزون",search:"ابحث عن مادة...",itemName:"اسم المادة",group:"المجموعة",storage:"مكان التخزين",quantity:"الكمية",unit:"الوحدة",created:"تاريخ الإنتاج / التحضير",expiry:"تاريخ الانتهاء",expiryInfo:"معلومات الصلاحية",expiryDays:"مدة الصلاحية بالأيام",photo:"الصورة",notes:"ملاحظات",other:"أخرى",close:"إغلاق",cancel:"إلغاء",save:"حفظ المادة",
      enable:"تفعيل الإشعارات",test:"اختبار الإشعارات",enabled:"الإشعارات مفعّلة على هذا الجهاز.",disabled:"الإشعارات غير مفعّلة. افتح إعدادات التطبيق واسمح بالإشعارات.",unsupported:"ميزة الإشعارات الأصلية متاحة في نسخة Android المثبتة.",permission:"لم يتم منح إذن الإشعارات.",testTitle:"اختبار إشعارات Redro",testBody:"نجح اختبار الإشعارات والصوت.",threeDaysTitle:"تذكير بانتهاء الصلاحية",threeDaysBody:"بقي 3 أيام على انتهاء صلاحية {name}.",twoDaysTitle:"تذكير بانتهاء الصلاحية",twoDaysBody:"بقي يومان على انتهاء صلاحية {name}.",expiredTitle:"تحذير: منتج منتهي الصلاحية",expiredBody:"انتهت صلاحية {name}.",testDone:"تم إرسال إشعار الاختبار.",groupRename:"تعديل اسم المجموعة",groupNew:"اسم المجموعة الجديد",groupRenamed:"تم تعديل اسم المجموعة.",groupNameEmpty:"اكتب اسماً للمجموعة.",groupExists:"توجد مجموعة بهذا الاسم بالفعل.",groupRenameError:"تعذر تعديل المجموعة. حاول مجدداً.",groupDelete:"حذف المجموعة",groupEdit:"تعديل المجموعة",openSettings:"افتح إعدادات التطبيق ثم الإشعارات واسمح بها.",notificationDenied:"الإذن غير مفعّل. انتقل إلى إعدادات الإشعارات لتفعيله."
    },
    en:{
      date:"Date",notifications:"Notifications",notificationDesc:"Enable alerts for items that are nearing or past their expiry date.",inventory:"Inventory",search:"Search items...",itemName:"Item name",group:"Group",storage:"Storage location",quantity:"Quantity",unit:"Unit",created:"Production / prepared date",expiry:"Expiry date",expiryInfo:"Expiry information",expiryDays:"Shelf life in days",photo:"Photo",notes:"Notes",other:"Other",close:"Close",cancel:"Cancel",save:"Save item",
      enable:"Enable notifications",test:"Test notifications",enabled:"Notifications are enabled on this device.",disabled:"Notifications are disabled. Open app settings and allow notifications.",unsupported:"Native notifications are available in the installed Android app.",permission:"Notification permission was not granted.",testTitle:"Redro notification test",testBody:"Notification and sound test successful.",threeDaysTitle:"Expiry reminder",threeDaysBody:"{name} expires in 3 days.",twoDaysTitle:"Expiry reminder",twoDaysBody:"{name} expires in 2 days.",expiredTitle:"Expired item warning",expiredBody:"{name} has expired.",testDone:"Test notification sent.",groupRename:"Rename group",groupNew:"New group name",groupRenamed:"Group name updated.",groupNameEmpty:"Enter a group name.",groupExists:"A group with this name already exists.",groupRenameError:"Could not rename the group. Try again.",groupDelete:"Delete group",groupEdit:"Edit group",openSettings:"Open app settings, then Notifications, and allow notifications.",notificationDenied:"Permission is disabled. Open notification settings to enable it."
    },
    zh:{
      date:"日期",notifications:"通知",notificationDesc:"启用即将到期和已过期物品提醒。",inventory:"库存",search:"搜索物品...",itemName:"物品名称",group:"分组",storage:"存放位置",quantity:"数量",unit:"单位",created:"生产 / 制备日期",expiry:"到期日期",expiryInfo:"有效期信息",expiryDays:"保质期（天）",photo:"照片",notes:"备注",other:"其他",close:"关闭",cancel:"取消",save:"保存物品",
      enable:"启用通知",test:"测试通知",enabled:"此设备已启用通知。",disabled:"通知未启用。请在应用设置中允许通知。",unsupported:"原生通知功能可在已安装的 Android 应用中使用。",permission:"未获得通知权限。",testTitle:"Redro 通知测试",testBody:"通知和声音测试成功。",threeDaysTitle:"到期提醒",threeDaysBody:"{name} 将在3天后到期。",twoDaysTitle:"到期提醒",twoDaysBody:"{name} 将在2天后到期。",expiredTitle:"物品已过期",expiredBody:"{name} 已过期。",testDone:"测试通知已发送。",groupRename:"重命名分组",groupNew:"新的分组名称",groupRenamed:"分组名称已更新。",groupNameEmpty:"请输入分组名称。",groupExists:"此分组名称已存在。",groupRenameError:"无法重命名分组，请重试。",groupDelete:"删除分组",groupEdit:"编辑分组",openSettings:"打开应用设置，然后进入通知并允许通知。",notificationDenied:"权限未启用。请打开通知设置。"
    },
    ja:{
      date:"日付",notifications:"通知",notificationDesc:"期限が近い商品や期限切れの商品を通知します。",inventory:"在庫",search:"アイテムを検索...",itemName:"アイテム名",group:"グループ",storage:"保存場所",quantity:"数量",unit:"単位",created:"製造 / 準備日",expiry:"期限日",expiryInfo:"期限情報",expiryDays:"保存期間（日）",photo:"写真",notes:"メモ",other:"その他",close:"閉じる",cancel:"キャンセル",save:"保存",
      enable:"通知を有効にする",test:"通知をテスト",enabled:"この端末では通知が有効です。",disabled:"通知は無効です。アプリ設定で通知を許可してください。",unsupported:"ネイティブ通知はインストール済みAndroidアプリで利用できます。",permission:"通知の許可がありません。",testTitle:"Redro通知テスト",testBody:"通知とサウンドのテストに成功しました。",threeDaysTitle:"期限のお知らせ",threeDaysBody:"{name} は3日後に期限切れになります。",twoDaysTitle:"期限のお知らせ",twoDaysBody:"{name} は2日後に期限切れになります。",expiredTitle:"期限切れ商品の警告",expiredBody:"{name} の期限が切れました。",testDone:"テスト通知を送信しました。",groupRename:"グループ名を変更",groupNew:"新しいグループ名",groupRenamed:"グループ名を更新しました。",groupNameEmpty:"グループ名を入力してください。",groupExists:"同じ名前のグループがあります。",groupRenameError:"グループ名を変更できませんでした。",groupDelete:"グループを削除",groupEdit:"グループを編集",openSettings:"アプリ設定を開き、通知を許可してください。",notificationDenied:"権限が無効です。通知設定を開いてください。"
    }
  };
  const t = key => (strings[lang()] || strings.ar)[key] || strings.ar[key] || key;
  const fill = (template, name) => template.replace("{name}", name);
  const native = () => {
    const plugin = PLUGIN();
    return plugin && typeof plugin.schedule === "function" ? plugin : null;
  };
  const isNative = () => Boolean(window.Capacitor?.isNativePlatform?.());
  const dateText = () => new Intl.DateTimeFormat(lang(), {weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(new Date(window.RedroClock?.now?.() || Date.now()));
  function updateDate() {
    const node = $("redro-date");
    if (node) node.textContent = dateText();
  }
  function setLabelText(inputId,key) {
    const input = $(inputId);
    const label = input?.closest("label");
    if (!label) return;
    const textNode = [...label.childNodes].find(node=>node.nodeType===Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = t(key) + " ";
  }
  function updateLabels() {
    $("notificationSettingsTitle").textContent = t("notifications");
    $("notificationSettingsDescription").textContent = t("notificationDesc");
    $("enableNotifications").textContent = t("enable");
    $("testNotifications").textContent = t("test");
    updateDate();
    const search = $("searchInput");
    if (search) { search.placeholder = t("search"); search.removeAttribute("aria-keyshortcuts"); }
    const quickLabels = [...document.querySelectorAll("#quickAddForm .quick-field > span")];
    [t("itemName"),t("group"),t("storage"),t("quantity"),t("unit"),t("created"),t("expiryInfo")].forEach((value,index)=>{if(quickLabels[index])quickLabels[index].textContent=value;});
    const quickExpiryDate = $("quickExpiryDateWrap")?.querySelector("span"); if(quickExpiryDate)quickExpiryDate.textContent=t("expiry");
    const quickExpiryDuration = $("quickExpiryDuration")?.closest("label")?.querySelector("span"); if(quickExpiryDuration)quickExpiryDuration.textContent=t("expiryDays");
    setLabelText("itemName","itemName"); setLabelText("itemCategory","group"); setLabelText("itemQuantity","quantity"); setLabelText("itemUnit","unit"); setLabelText("createdDate","created"); setLabelText("itemNotes","notes");
    const fullExpiryDate = $("expiryDateWrap")?.querySelector("span"); if(fullExpiryDate)fullExpiryDate.textContent=t("expiry");
    const expiryInfo = $("expiryMode")?.closest(".expiry-entry")?.querySelector(":scope > span"); if(expiryInfo)expiryInfo.textContent=t("expiryInfo");
    const unitSelects = [$("itemUnit"),$("quickUnit")]; unitSelects.forEach(select=>{const option=[...select.options].find(item=>item.value==="other"||item.text==="other");if(option)option.text=t("other");});
    const navInventory = document.querySelector(".bottom-nav .nav-item[href] small"); if(navInventory)navInventory.textContent=t("inventory");
    const restock = $("restockLabel"); if(restock && lang()==="ar")restock.textContent="إعادة التزويد";
    $("searchToggle")?.setAttribute("aria-label",t("search")); $("settingsToggle")?.setAttribute("aria-label",lang()==="ar"?"الإعدادات":"Settings");
    [".soon-card",".expired-card"].forEach((selector,index)=>{const card=document.querySelector(selector);if(card){card.setAttribute("role","button");card.setAttribute("tabindex","0");card.setAttribute("aria-label",index===0?t("soon"):t("expiredFilter"));}});
  }
  function readPlan() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY) || "{}"); } catch { return {}; }
  }
  function savePlan(plan) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch {}
  }
  function hash(value) {
    let h = 2166136261;
    for (const char of String(value)) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 2000000000;
  }
  function notificationIds(item) {
    const base = hash(item.id + "|" + item.expiryDate);
    return [base, base + 1, base + 2];
  }
  function expiryDateAt(item, hour=9) {
    const date = new Date(item.expiryDate + "T00:00:00");
    if (!Number.isFinite(date.getTime())) return NaN;
    date.setHours(hour,0,0,0);
    return date.getTime();
  }
  function expiryTimes(item) {
    const now = Date.now();
    const expiryAt = expiryDateAt(item,9);
    if (!Number.isFinite(expiryAt)) return [];
    const reminders = [
      {days:3,id:0,title:t("threeDaysTitle"),body:fill(t("threeDaysBody"),item.name)},
      {days:2,id:1,title:t("twoDaysTitle"),body:fill(t("twoDaysBody"),item.name)}
    ];
    const scheduled = reminders.map(entry=>({...entry,at:expiryAt-entry.days*86400000})).filter(entry=>entry.at>now).map(entry=>({id:entry.id,at:entry.at,title:entry.title,body:entry.body}));
    if (expiryAt>now) scheduled.push({id:2,at:expiryAt,title:t("expiredTitle"),body:fill(t("expiredBody"),item.name)});
    else if (new Date(item.expiryDate+"T00:00:00").toDateString()===new Date(now).toDateString()) scheduled.push({id:2,at:now+5000,title:t("expiredTitle"),body:fill(t("expiredBody"),item.name)});
    return scheduled;
  }
  async function cancelIds(plugin, ids) {
    try { await plugin.cancel({notifications:ids.map(id=>({id}))}); } catch (error) { console.warn("Redro notification cancellation failed.", error); }
  }
  async function createChannel(plugin) {
    const settings = SETTINGS_PLUGIN();
    if (settings && typeof settings.ensureAlarmChannel === "function") {
      try {
        const result = await settings.ensureAlarmChannel();
        if (result?.channelId) return result.channelId;
      } catch (error) {
        console.warn("Redro native alarm channel setup failed.", error);
      }
    }
    if (plugin.createChannel) {
      try {
        await plugin.createChannel({
          id:"redro-expiry-alarm-v2",
          name:lang()==="ar"?"تنبيهات صلاحية المواد":"Expiry alerts",
          description:lang()==="ar"?"تنبيهات المواد القريبة والمنتهية الصلاحية":"Expiry and stock alerts",
          importance:5,
          sound:"default",
          vibration:true,
          visibility:1
        });
      } catch (error) { console.warn("Redro notification channel setup failed.", error); }
    }
    return "redro-expiry-alarm-v2";
  }
  async function permissionState(plugin) {
    try {
      const result = await plugin.checkPermissions();
      if (result.display !== "granted") return false;
      if (typeof plugin.areEnabled === "function") {
        const enabled = await plugin.areEnabled();
        if (enabled && enabled.value === false) return false;
      }
      return true;
    } catch { return false; }
  }
  async function refreshPermissionStatus() {
    const status = $("notificationStatus");
    const plugin = native();
    if (!status) return;
    if (!plugin) {
      status.textContent = isNative() ? t("unsupported") : t("unsupported");
      return;
    }
    status.textContent = await permissionState(plugin) ? t("enabled") : t("disabled");
  }
  async function openNotificationSettings(plugin) {
    const settings = SETTINGS_PLUGIN();
    if (settings && typeof settings.open === "function") {
      try { await settings.open(); return; } catch (error) { console.warn("Could not open Android notification settings.", error); }
    }
    if (typeof plugin.openNotificationSettings === "function") {
      try { await plugin.openNotificationSettings(); return; } catch (error) { console.warn(error); }
    }
    $("notificationStatus").textContent = t("openSettings");
    alert(t("openSettings"));
  }
  async function enableNotifications() {
    const plugin = native();
    if (!plugin) {
      $("notificationStatus").textContent = t("unsupported");
      return;
    }
    try {
      let result = await plugin.checkPermissions();
      if (result.display !== "granted") result = await plugin.requestPermissions();
      if (result.display !== "granted") {
        $("notificationStatus").textContent = t("notificationDenied");
        await openNotificationSettings(plugin);
        return;
      }
      await createChannel(plugin);
      $("notificationStatus").textContent = t("enabled");
      await syncNotifications(window.RedroInventory?.getItems?.() || []);
    } catch (error) {
      console.error("Redro notification permission error:", error);
      $("notificationStatus").textContent = t("permission");
    }
  }
  async function testNotifications() {
    const plugin = native();
    if (!plugin) {
      $("notificationStatus").textContent = t("unsupported");
      return;
    }
    if (!(await permissionState(plugin))) {
      await enableNotifications();
      if (!(await permissionState(plugin))) return;
    }
    try {
      await createChannel(plugin);
      await plugin.schedule({notifications:[{
        id:hash("redro-test-" + Date.now()),
        title:t("testTitle"),
        body:t("testBody"),
        schedule:{at:new Date(Date.now()+1200)},
        channelId:"redro-expiry-alarm-v2",
        sound:"default",
        smallIcon:"ic_stat_icon_config_sample"
      }]});
      $("notificationStatus").textContent = t("testDone");
    } catch (error) {
      console.error("Redro test notification failed:", error);
      $("notificationStatus").textContent = t("permission");
    }
  }
  async function syncNotifications(items) {
    const plugin = native();
    if (!plugin || !(await permissionState(plugin))) return;
    await createChannel(plugin);
    const oldPlan = readPlan();
    const nextPlan = {};
    const schedules = [];
    const validIds = new Set();
    for (const item of items) {
      if (!item?.id || !item?.expiryDate) continue;
      const key = String(item.id);
      const signature = String(item.expiryDate) + "|" + String(item.name || "");
      const ids = notificationIds(item);
      ids.forEach(id=>validIds.add(id));
      nextPlan[key] = signature;
      if (oldPlan[key] === signature) continue;
      if (oldPlan[key]) await cancelIds(plugin, notificationIds({id:item.id,expiryDate:oldPlan[key]}));
      await cancelIds(plugin, ids);
      const times = expiryTimes(item);
      times.forEach(entry=>{
        schedules.push({
          id:ids[entry.id],
          title:entry.title,
          body:entry.body,
          schedule:{at:new Date(entry.at)},
          channelId:"redro-expiry-alarm-v2",
          sound:"default",
          smallIcon:"ic_stat_icon_config_sample",
          extra:{itemId:item.id,expiryDate:item.expiryDate}
        });
      });
    }
    for (const oldId of Object.keys(oldPlan)) {
      if (!(oldId in nextPlan)) {
        const oldItem = {id:oldId,expiryDate:oldPlan[oldId]};
        await cancelIds(plugin, notificationIds(oldItem));
      }
    }
    let scheduleSucceeded = true;
    if (schedules.length) {
      try { await plugin.schedule({notifications:schedules}); }
      catch (error) { scheduleSucceeded = false; console.error("Redro expiry notifications could not be scheduled.", error); }
    }
    if (scheduleSucceeded) savePlan(nextPlan);
  }
  async function renameGroup(oldName) {
    const nextName = prompt(t("groupRename"),oldName);
    if (nextName === null) return;
    const clean = nextName.trim();
    if (!clean) { alert(t("groupNameEmpty")); return; }
    if (clean === oldName) return;
    if (groups.some(group=>group.toLowerCase()===clean.toLowerCase())) { alert(t("groupExists")); return; }
    try {
      const affected = items.filter(item=>(item.category||"Other")===oldName);
      if (affected.length) {
        await transaction("readwrite",store=>affected.forEach(item=>store.put({...item,category:clean,updatedAt:new Date().toISOString()})));
      }
      groups = groups.map(group=>group===oldName?clean:group);
      saveStoredGroups(groups);
      if (activeGroup===oldName) activeGroup=clean;
      items = items.map(item=>(item.category||"Other")===oldName?{...item,category:clean}:item);
      renderCategorySelects();
      renderGroups();
      render();
      showToast(t("groupRenamed"));
    } catch (error) {
      console.error("Redro group rename failed:",error);
      showToast(t("groupRenameError"));
    }
  }
  const originalRenderGroups = renderGroups;
  renderGroups = function renderGroupsWithEditActions() {
    originalRenderGroups();
    const container = $("groupChips");
    if (!container) return;
    container.querySelectorAll("[data-group]").forEach(button=>{
      const name = button.dataset.group;
      if (name==="all" || name==="Other") return;
      const wrap = button.closest(".group-chip-wrap");
      if (!wrap || wrap.querySelector(".group-edit")) return;
      const edit = document.createElement("button");
      edit.type="button";
      edit.className="group-edit";
      edit.dataset.editGroup=name;
      edit.title=t("groupEdit");
      edit.setAttribute("aria-label",t("groupEdit")+" "+groupLabel(name));
      edit.textContent="✎";
      button.after(edit);
    });
    container.querySelectorAll("[data-edit-group]").forEach(button=>{
      button.addEventListener("click",event=>{event.stopPropagation();renameGroup(button.dataset.editGroup);});
    });
  };
  const originalRefresh = refresh;
  refresh = async function refreshAndScheduleNotifications() {
    const result = await originalRefresh();
    await syncNotifications(result);
    return result;
  };
  window.RedroInventory = {getItems:()=>items.slice()};
  function applyStatusShortcut(selector,filter) {
    const card=document.querySelector(selector);
    if(!card)return;
    const activate=()=>{activeFilter=filter;render();document.querySelector(".inventory-section")?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});};
    card.addEventListener("click",activate);
    card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}});
  }
  applyStatusShortcut(".soon-card","soon");
  applyStatusShortcut(".expired-card","expired");
  $("enableNotifications")?.addEventListener("click",enableNotifications);
  $("testNotifications")?.addEventListener("click",testNotifications);
  $("languageSelect")?.addEventListener("change",updateLabels);
  $("settingsToggle")?.addEventListener("click",()=>setTimeout(refreshPermissionStatus,100));
  window.addEventListener("redro-time-updated",updateDate);
  window.addEventListener("focus",refreshPermissionStatus);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){refreshPermissionStatus();updateDate();}});
  const previousApply = applyPreferences;
  applyPreferences = function applyEnhancedPreferences() {
    previousApply();
    updateLabels();
  };
  document.addEventListener("DOMContentLoaded",()=>{});
  updateLabels();
  setTimeout(refreshPermissionStatus,800);
  if (window.Capacitor?.Plugins?.LocalNotifications?.addListener) {
    window.Capacitor.Plugins.LocalNotifications.addListener("localNotificationActionPerformed",event=>{
      const id=event?.notification?.extra?.itemId;
      const item=window.RedroInventory?.getItems?.().find(entry=>entry.id===id);
      if(item){activeLocation=item.storageLocation||"Fridge";persistActiveLocation();refresh().then(()=>openItem(item));}
    });
  }
  window.RedroNotifications = {sync:syncNotifications,test:testNotifications,enable:enableNotifications};
})();