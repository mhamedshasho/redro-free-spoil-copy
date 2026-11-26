(() => {
  const $ = id => document.getElementById(id);
  const oldStatusOf = window.statusOf;
  window.statusOf = function(item) {
    if (item?.hasExpiry === false || !item?.expiryDate) return {key:"noExpiry",label:document.documentElement.lang==="ar"?"بلا تاريخ انتهاء":"No expiry date"};
    return oldStatusOf(item);
  };
  const oldRender = window.render;
  window.render = function() {
    oldRender();
    document.querySelectorAll(".item-card").forEach(card => {
      const edit = card.querySelector("[data-edit]");
      const item = (window.items || []).find(entry => entry.id === edit?.dataset.edit);
      if (!item) return;
      const meta = card.querySelector(".item-meta");
      if (!meta) return;
      if (item.price !== null && item.price !== undefined && item.price !== "") {
        const price = document.createElement("span");
        price.className = "item-price";
        price.textContent = (document.documentElement.lang === "ar" ? "السعر: " : "Price: ") + Number(item.price).toLocaleString() + " " + (item.currency || "SYP");
        meta.append(price);
      }
      if (item.hasExpiry === false || !item.expiryDate) {
        const date = [...meta.children].find(node => node.textContent.includes(item.expiryDate || "Invalid"));
        if (date) date.remove();
      }
    });
  };
  const oldValidate = window.validateBackup;
  window.validateBackup = function(data) {
    if (!data || data.format !== "redro-food-stock-backup" || !Array.isArray(data.items) || data.items.length > 100000) throw new Error(t("invalidBackup"));
    const seen = new Set();
    const realDate = value => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const [y,m,d] = value.split("-").map(Number);
      const date = new Date(Date.UTC(y,m-1,d));
      return date.getUTCFullYear()===y && date.getUTCMonth()===m-1 && date.getUTCDate()===d;
    };
    return data.items.map(item => {
      const hasExpiry = item.hasExpiry !== false && Boolean(item.expiryDate);
      if (!item || typeof item.name!=="string" || !item.name.trim() || typeof item.id!=="string" || !item.id || seen.has(item.id) || !Number.isFinite(Number(item.quantity)) || Number(item.quantity)<0 || !realDate(item.createdDate) || (hasExpiry && (!realDate(item.expiryDate) || item.expiryDate<item.createdDate))) throw new Error(t("invalidRecord"));
      const price = item.price === null || item.price === undefined || item.price === "" ? null : Number(item.price);
      if (price !== null && (!Number.isFinite(price) || price < 0)) throw new Error(t("invalidRecord"));
      seen.add(item.id);
      return {...item,id:item.id,name:item.name.trim(),quantity:Number(item.quantity),price,currency:String(item.currency||"SYP").slice(0,12),hasExpiry,expiryDate:hasExpiry?item.expiryDate:"",unit:String(item.unit||"pcs"),category:String(item.category||"Other"),storageLocation:["Fridge","Freezer","Pantry"].includes(item.storageLocation)?item.storageLocation:"Fridge",storageZone:String(item.storageZone||""),createdDate:item.createdDate,notes:String(item.notes||"").slice(0,500),image:typeof item.image==="string"&&item.image.startsWith("data:image/")&&item.image.length<=7*1024*1024?item.image:"",updatedAt:typeof item.updatedAt==="string"?item.updatedAt:new Date().toISOString()};
    });
  };
  const priorOpen = window.openItem;
  window.openItem = function(item) {
    priorOpen(item);
    $("itemPrice").value = item?.price ?? "";
    $("itemCurrency").value = item?.currency || "SYP";
    $("hasExpiry").checked = item?.hasExpiry !== false && Boolean(item?.expiryDate);
    $("expiryFields").hidden = !$("hasExpiry").checked;
  };
  const priorQuick = window.openQuickAdd;
  window.openQuickAdd = function() {
    priorQuick();
    $("quickPrice").value = "";
    $("quickCurrency").value = "SYP";
    $("quickHasExpiry").checked = true;
    $("quickExpiryFields").hidden = false;
  };
  $("hasExpiry")?.addEventListener("change",()=>{$("expiryFields").hidden=!$("hasExpiry").checked;});
  $("quickHasExpiry")?.addEventListener("change",()=>{$("quickExpiryFields").hidden=!$("quickHasExpiry").checked;});
  window.addEventListener("load",()=>window.render?.());
})();
