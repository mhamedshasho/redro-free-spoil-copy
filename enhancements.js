(() => {
  const $ = id => document.getElementById(id);
  const PLAN_KEY = "redro-notification-plan-v1";
  const PLUGIN = () => window.Capacitor?.Plugins?.LocalNotifications || window.Capacitor?.registerPlugin?.("LocalNotifications");
  const lang = () => document.documentElement.lang || "ar";
  const strings = {
    ar:{
      date:"التاريخ",notifications:"الإشعارات",notificationDesc:"فعّل التنبيهات لتصلك تحذيرات المواد القريبة والمنتهية الصلاحية.",
      enable:"تفعيل الإشعارات",test:"اختبار الإشعارات",enabled:"الإشعارات مفعّلة على هذا الجهاز.",disabled:"الإشعارات غير مفعّلة. افتح إعدادات التطبيق واسمح بالإشعارات.",unsupported:"ميزة الإشعارات الأصلية متاحة في نسخة Android المثبتة.",permission:"لم يتم منح إذن الإشعارات.",testTitle:"اختبار إشعارات Redro",testBody:"نجح اختبار الإشعارات والصوت.",expiredTitle:"تحذير: مادة منتهية الصلاحية",expiredBody:"انتهت صلاحية {name}. تحقق منها وأزلها من المخزون إذا لزم الأمر.",soonTitle:"مادة قاربت على انتهاء الصلاحية",soonBody:"اقترب موعد انتهاء صلاحية {name}.",removedTitle:"تمت إزالة مادة من المخزون",removedBody:"تم حذف {name} من مخزون Redro.",testDone:"تم إرسال إشعار الاختبار.",groupRename:"تعديل اسم المجموعة",groupNew:"اسم المجموعة الجديد",groupRenamed:"تم تعديل اسم المجموعة.",groupNameEmpty:"اكتب اسماً للمجموعة.",groupExists:"توجد مجموعة بهذا الاسم بالفعل.",groupRenameError:"تعذر تعديل المجموعة. حاول مجدداً.",groupDelete:"حذف المجموعة",groupEdit:"تعديل المجموعة",openSettings:"افتح إعدادات التطبيق ثم الإشعارات واسمح بها.",notificationDenied:"الإذن غير مفعّل. انتقل إلى إعدادات الإشعارات لتفعيله."
    },
    en:{
      date:"Date",notifications:"Notifications",notificationDesc:"Enable alerts for items that are nearing or past their expiry date.",
      enable:"Enable notifications",test:"Test notifications",enabled:"Notifications are enabled on this device.",disabled:"Notifications are disabled. Open app settings and allow notifications.",unsupported:"Native notifications are available in the installed Android app.",permission:"Notification permission was not granted.",testTitle:"Redro notification test",testBody:"Notification and sound test successful.",expiredTitle:"Expired item warning",expiredBody:"{name} has expired. Check it and remove it from stock if needed.",soonTitle:"Item expiring soon",soonBody:"{name} is approaching its expiry date.",removedTitle:"Item removed from inventory",removedBody:"{name} was removed from Redro inventory.",testDone:"Test notification sent.",groupRename:"Rename group",groupNew:"New group name",groupRenamed:"Group name updated.",groupNameEmpty:"Enter a group name.",groupExists:"A group with this name already exists.",groupRenameError:"Could not rename the group. Try again.",groupDelete:"Delete group",groupEdit:"Edit group",openSettings:"Open app settings, then Notifications, and allow notifications.",notificationDenied:"Permission is disabled. Open notification settings to enable it."
    },
    zh:{
      date:"日期",notifications:"通知",notificationDesc:"启用即将到期和已过期物品提醒。",
      enable:"启用通知",test:"测试通知",enabled:"此设备已启用通知。",disabled:"通知未启用。请在应用设置中允许通知。",unsupported:"原生通知功能可在已安装的 Android 应用中使用。",permission:"未获得通知权限。",testTitle:"Redro 通知测试",testBody:"通知和声音测试成功。",expiredTitle:"物品已过期",expiredBody:"{name} 已过期，请检查并按需从库存中移除。",soonTitle:"物品即将到期",soonBody:"{name} 即将到期。",removedTitle:"物品已从库存移除",removedBody:"{name} 已从 Redro 库存中删除。",testDone:"测试通知已发送。",groupRename:"重命名分组",groupNew:"新的分组名称",groupRenamed:"分组名称已更新。",groupNameEmpty:"请输入分组名称。",groupExists:"此分组名称已存在。",groupRenameError:"无法重命名分组，请重试。",groupDelete:"删除分组",groupEdit:"编辑分组",openSettings:"打开应用设置，然后进入通知并允许通知。",notificationDenied:"权限未启用。请打开通知设置。"
    },
    ja:{
      date:"日付",notifications:"通知",notificationDesc:"期限が近い商品や期限切れの商品を通知します。",
      enable:"通知を有効にする",test:"通知をテスト",enabled:"この端末では通知が有効です。",disabled:"通知は無効です。アプリ設定で通知を許可してください。",unsupported:"ネイティブ通知はインストール済みAndroidアプリで利用できます。",permission:"通知の許可がありません。",testTitle:"Redro通知テスト",testBody:"通知とサウンドのテストに成功しました。",expiredTitle:"期限切れ商品の警告",expiredBody:"{name} の期限が切れました。確認して必要に応じて在庫から削除してください。",soonTitle:"期限が近い商品",soonBody:"{name} の期限が近づいています。",removedTitle:"商品を在庫から削除しました",removedBody:"{name} はRedroの在庫から削除されました。",testDone:"テスト通知を送信しました。",groupRename:"グループ名を変更",groupNew:"新しいグループ名",groupRenamed:"グループ名を更新しました。",groupNameEmpty:"グループ名を入力してください。",groupExists:"同じ名前のグループがあります。",groupRenameError:"グループ名を変更できませんでした。",groupDelete:"グループを削除",groupEdit:"グループを編集",openSettings:"アプリ設定を開き、通知を許可してください。",notificationDenied:"権限が無効です。通知設定を開いてください。"
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
  function updateLabels() {
    $("notificationSettingsTitle").textContent = t("notifications");
    $("notificationSettingsDescription").textContent = t("notificationDesc");
    $("enableNotifications").textContent = t("enable");
    $("testNotifications").textContent = t("test");
    updateDate();
    const search = $("searchInput");
    if (search) search.removeAttribute("aria-keyshortcuts");
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
  function expiryTimes(item) {
    const now = Date.now();
    const date = new Date(item.expiryDate + "T09:00:00");
    if (!Number.isFinite(date.getTime())) return [];
    if (date.getTime() <= now) return [now + 15000, now + 30 * 60000, now + 2 * 60 * 60000];
    return [date.getTime(), date.getTime() + 6 * 60 * 60000, date.getTime() + 24 * 60 * 60000];
  }
  async function cancelIds(plugin, ids) {
    try { await plugin.cancel({notifications:ids.map(id=>({id}))}); } catch (error) { console.warn("Redro notification cancellation failed.", error); }
  }
  async function createChannel(plugin) {
    if (!plugin.createChannel) return;
    try {
      await plugin.createChannel({
        id:"redro-expiry-alerts",
        name:lang()==="ar"?"تنبيهات صلاحية المواد":"Expiry alerts",
        description:lang()==="ar"?"تنبيهات المواد القريبة والمنتهية الصلاحية":"Expiry and stock alerts",
        importance:5,
        sound:"default",
        vibration:true,
        visibility:1
      });
    } catch (error) { console.warn("Redro notification channel setup failed.", error); }
  }
  async function permissionState(plugin) {
    try {
      const result = await plugin.checkPermissions();
      return result.display === "granted";
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
        channelId:"redro-expiry-alerts",
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
      const signature = String(item.expiryDate);
      const ids = notificationIds(item);
      ids.forEach(id=>validIds.add(id));
      nextPlan[key] = signature;
      if (oldPlan[key] === signature) continue;
      await cancelIds(plugin, ids);
      const times = expiryTimes(item);
      times.forEach((time,index)=>{
        const expired = time <= Date.now() + 60000 && new Date(item.expiryDate + "T23:59:59").getTime() < Date.now();
        schedules.push({
          id:ids[index],
          title:expired?t("expiredTitle"):t("soonTitle"),
          body:expired?fill(t("expiredBody"),item.name):fill(t("soonBody"),item.name),
          schedule:{at:new Date(time)},
          channelId:"redro-expiry-alerts",
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
    if (schedules.length) {
      try { await plugin.schedule({notifications:schedules}); }
      catch (error) { console.error("Redro expiry notifications could not be scheduled.", error); }
    }
    savePlan(nextPlan);
  }
  async function sendRemovalNotice(name) {
    const plugin = native();
    if (!plugin || !(await permissionState(plugin))) return;
    try {
      await plugin.schedule({notifications:[{
        id:hash("removed-" + Date.now() + "-" + name),
        title:t("removedTitle"),
        body:fill(t("removedBody"),name),
        schedule:{at:new Date(Date.now()+800)},
        channelId:"redro-expiry-alerts",
        sound:"default",
        smallIcon:"ic_stat_icon_config_sample"
      }]});
    } catch (error) { console.warn("Redro removal notification failed.", error); }
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
  const originalDeleteItem = deleteItem;
  deleteItem = async function deleteItemWithNotification(id) {
    const item = items.find(entry=>entry.id===id);
    await originalDeleteItem(id);
    if (item && !items.some(entry=>entry.id===id)) await sendRemovalNotice(item.name);
  };
  const originalRefresh = refresh;
  refresh = async function refreshAndScheduleNotifications() {
    const result = await originalRefresh();
    await syncNotifications(result);
    return result;
  };
  window.RedroInventory = {getItems:()=>items.slice()};
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