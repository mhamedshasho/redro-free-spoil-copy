(() => {
  const KEY = "redro-stock-activity-v1";
  const $ = id => document.getElementById(id);
  const language = () => document.documentElement.lang || "ar";
  const labels = {
    ar:{added:"إضافة مادة",edited:"تعديل مادة",decreased:"خصم وحدة",restocked:"إعادة تعبئة",deleted:"حذف مادة",zero:"الكمية صفر بالفعل",decrease:"− خصم وحدة",restock:"إعادة تعبئة",amount:"كمية إعادة التعبئة",amountInvalid:"أدخل كمية صحيحة أكبر من صفر.",restockDone:"تمت إعادة تعبئة المادة.",decreaseDone:"تم خصم وحدة واحدة.",reportEmpty:"لا توجد عمليات مسجلة بعد.",clear:"هل تريد مسح سجل التقارير؟",clearDone:"تم مسح سجل التقارير.",quantity:"الكمية",from:"من",to:"إلى",package:"سعر الحزمة",unitPrice:"سعر الوحدة"},
    en:{added:"Item added",edited:"Item edited",decreased:"Unit deducted",restocked:"Stock replenished",deleted:"Item deleted",zero:"Quantity is already zero",decrease:"− Deduct one",restock:"Restock",amount:"Restock quantity",amountInvalid:"Enter a valid quantity greater than zero.",restockDone:"Stock replenished.",decreaseDone:"One unit deducted.",reportEmpty:"No activity recorded yet.",clear:"Clear the activity report?",clearDone:"Activity report cleared.",quantity:"Quantity",from:"from",to:"to",package:"Package price",unitPrice:"Unit price"}
  };
  const t = key => (labels[language()] || labels.ar)[key] || labels.ar[key] || key;
  const read = () => { try { const data=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(data)?data:[]; } catch { return []; } };
  const write = data => { try { localStorage.setItem(KEY,JSON.stringify(data.slice(0,500))); } catch(error) { console.warn("Could not save Redro activity report.",error); } };
  function log(action,item,extra={}) {
    const data=read();
    data.unshift({id:makeId(),action,name:String(item?.name||"—"),itemId:String(item?.id||""),at:new Date().toISOString(),quantity:item?.quantity??null,unit:String(item?.unit||""),packagePrice:item?.packagePrice??item?.price??null,unitPrice:item?.unitPrice??null,currency:String(item?.currency||"SYP"),...extra});
    write(data);
  }
  const oldPersistNew = persistNewRecord;
  persistNewRecord = async function(record){const result=await oldPersistNew(record);log("added",record);return result;};
  const oldPersistUpdate = persistUpdatedRecord;
  persistUpdatedRecord = async function(record,expectedUpdatedAt){
    const before=items.find(x=>x.id===record.id)||{};
    const action=Number(record.quantity)<Number(before.quantity)?"decreased":Number(record.quantity)>Number(before.quantity)?"restocked":"edited";
    const fieldLabels={name:"الاسم",quantity:"الكمية",price:"سعر الحزمة",unitPrice:"سعر الوحدة",unit:"الوحدة",expiryDate:"الصلاحية",createdDate:"تاريخ الإضافة",category:"المجموعة",notes:"الملاحظات",storageLocation:"مكان التخزين",storageZone:"الموقع"};
    const changes=[];
    [["name","name"],["quantity","quantity"],["packagePrice","packagePrice"],["unitPrice","unitPrice"],["unit","unit"],["expiryDate","expiryDate"],["createdDate","createdDate"],["category","category"],["notes","notes"],["storageLocation","storageLocation"],["storageZone","storageZone"]].forEach(([key,label])=>{
      const oldValue=key==="packagePrice"?(before.packagePrice??before.price):(before[key]);
      const newValue=key==="packagePrice"?(record.packagePrice??record.price):(record[key]);
      if(String(oldValue??"")!==String(newValue??""))changes.push((language()==="ar"?fieldLabels[label]:label)+": "+String(oldValue??"—")+" → "+String(newValue??"—"));
    });
    await oldPersistUpdate(record,expectedUpdatedAt);
    log(action,record,{previousQuantity:before.quantity,quantity:record.quantity,changes});
  };
  const oldPersistDelete = persistDeletedRecord;
  persistDeletedRecord = async function(id,expectedUpdatedAt){
    const before=items.find(x=>x.id===id)||{id,name:"مادة"};
    await oldPersistDelete(id,expectedUpdatedAt);
    log("deleted",before);
  };
  const oldRender=render;
  render=function renderWithStockActions(){
    oldRender();
    document.querySelectorAll(".item-card").forEach(card=>{
      const edit=card.querySelector("[data-edit]");
      const item=items.find(x=>x.id===edit?.dataset.edit);
      if(!item)return;
      const actions=card.querySelector(".item-actions");
      if(!actions||actions.querySelector("[data-decrease]"))return;
      const decrease=document.createElement("button");
      decrease.type="button";decrease.className="mini-button stock-decrease";decrease.dataset.decrease=item.id;decrease.textContent="−";decrease.title=t("decrease");decrease.setAttribute("aria-label",t("decrease")+" "+item.name);
      const restock=document.createElement("button");
      restock.type="button";restock.className="mini-button stock-restock";restock.dataset.restock=item.id;restock.textContent=t("restock");
      actions.prepend(restock,decrease);
    });
  };
  async function updateQuantity(id,delta){
    const item=items.find(x=>x.id===id);if(!item)return;
    if(delta<0&&Number(item.quantity)<=0){showToast(t("zero"));return;}
    const next={...item,quantity:Math.max(0,Number(item.quantity||0)+delta),updatedAt:new Date().toISOString()};
    try{
      await persistUpdatedRecord(next,item.updatedAt||"");
      announceInventoryChange();await refresh();showToast(delta<0?t("decreaseDone"):t("restockDone"));
    }catch(error){console.error("Redro quantity update failed.",error);showToast(error.message||t("dbError"));await refresh().catch(()=>{});}
  }
  const list=$("inventoryList");
  list?.addEventListener("click",event=>{
    const decrease=event.target.closest("[data-decrease]");
    if(decrease){updateQuantity(decrease.dataset.decrease,-1);return;}
    const restock=event.target.closest("[data-restock]");
    if(restock){
      const item=items.find(x=>x.id===restock.dataset.restock);if(!item)return;
      const raw=prompt(t("amount"),"1");
      if(raw===null)return;
      const amount=Number(raw);
      if(!Number.isFinite(amount)||amount<=0){showToast(t("amountInvalid"));return;}
      updateQuantity(item.id,amount);
    }
  });
  function renderReport(){
    const data=read();const root=$("activityReportList");if(!root)return;
    $("activityReportEmpty").hidden=data.length>0;
    root.innerHTML=data.map(row=>{
      const action=t(row.action);
      const date=new Date(row.at);
      const detail=row.previousQuantity!==undefined?t("quantity")+": "+row.previousQuantity+" → "+row.quantity+" "+row.unit:"";
      const prices=[row.packagePrice!==null&&row.packagePrice!==undefined?t("package")+": "+row.packagePrice+" "+row.currency:"",row.unitPrice!==null&&row.unitPrice!==undefined?t("unitPrice")+": "+row.unitPrice+" "+row.currency:""].filter(Boolean).join(" · ");
      const changes=Array.isArray(row.changes)?row.changes.join(" · "):"";
      return '<article class="activity-report-row"><strong>'+escapeHtml(action)+' — '+escapeHtml(row.name)+'</strong><p>'+escapeHtml([detail,changes,prices].filter(Boolean).join(" · ")||row.unit||"")+'</p><time datetime="'+escapeHtml(row.at)+'">'+escapeHtml(date.toLocaleString())+'</time></article>';
    }).join("");
  }
  $("reportToggle")?.addEventListener("click",()=>{renderReport();$("activityReportDialog").showModal();});
  $("clearActivityReport")?.addEventListener("click",()=>{if(!confirm(t("clear")))return;write([]);renderReport();showToast(t("clearDone"));});
  $("activityReportDialog")?.addEventListener("close",renderReport);
  window.addEventListener("storage",event=>{if(event.key===KEY&&$("activityReportDialog")?.open)renderReport();});
  function updateUnitPriceLabels(){
    const ar=language()==="ar";
    const units={pcs:ar?"القطعة": "piece",kg:ar?"الكيلوغرام":"kg",g:ar?"الغرام":"g",L:ar?"اللتر":"liter",ml:ar?"الملليلتر":"ml",box:ar?"الصندوق":"box",pack:ar?"العبوة":"pack",bag:ar?"الكيس":"bag",other:ar?"الوحدة":"unit"};
    [["itemUnit","itemUnitPriceLabel"],["quickUnit","quickUnitPriceLabel"]].forEach(([selectId,labelId])=>{
      const select=$(selectId),label=$(labelId);if(!select||!label)return;
      const unit=units[select.value]||units.other;
      label.textContent=ar?"سعر "+unit:"Price per "+unit;
    });
  }
  $("itemUnit")?.addEventListener("change",updateUnitPriceLabels);
  $("quickUnit")?.addEventListener("change",updateUnitPriceLabels);
  $("languageSelect")?.addEventListener("change",updateUnitPriceLabels);
  window.RedroActivityReport={getEntries:read,render:renderReport};
  window.addEventListener("load",()=>{render();updateUnitPriceLabels();});
})();