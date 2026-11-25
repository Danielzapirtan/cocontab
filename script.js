var currtab = 0;

function saveToLocalStorage() {
  const bcv = {
    sold: sold,
    db: db,
  };
  localStorage.setItem("bc", JSON.stringify(bcv));
}

if (localStorage.getItem("bc")) {
  const bcv = JSON.parse(localStorage.getItem("bc"));
  sold = bcv.sold;
  updateBuget(sold);
  db = bcv.db;
}
/*sold = 0;
db = [];*/

function switchTab(tabno) {
  const tab1 = document.getElementById("tab1");
  const tab2 = document.getElementById("tab2");
  const tab3 = document.getElementById("tab3");
  tab1.classList.add("disabled");
  tab2.classList.add("disabled");
  tab3.classList.add("disabled");
  if (tabno == 0) tab1.classList.remove("disabled");
  else if (tabno == 1) tab2.classList.remove("disabled");
  else if (tabno == 2) tab3.classList.remove("disabled");
}

function back() {
  currtab = (currtab + 2) % 3;
  switchTab(currtab);
}

function fwd() {
  currtab = (currtab + 1) % 3;
  switchTab(currtab);
}

function addField(el, field) {
  const camp = document.createElement("div");
  camp.classList.add("field");
  camp.textContent = JSON.stringify(field);
  el.appendChild(camp);
}

function updateCategory(el, cat) {
  el.innerHTML = ``;
  db.forEach((rec) => {
    if (rec["categorie"] == cat) {
      const row = document.createElement("div");
      row.classList.add("inreg");
      addField(row, rec["produs"]);
      addField(row, rec["pret"]);
      el.appendChild(row);
    }
  });
}

function updateSpendings() {
  const lcasa = document.getElementById("lcasa");
  const lcumparaturi = document.getElementById("lcumparaturi");
  updateCategory(lcasa, "casa");
  updateCategory(lcumparaturi, "cumparaturi");
}

function updateBuget(sold) {
  const buget = document.getElementById("buget");
  const chelt = document.getElementById("chelt");
  const ramas = document.getElementById("ramas");
  buget.value = sold;
  let cheltv = 0;
  db.forEach((record) => {
    cheltv += parseInt(JSON.parse(record["pret"]));
  });
  chelt.value = cheltv;
  ramas.value = sold - cheltv;
}

function saveBuget() {
  const bugetInput = document.getElementById("buget-input");
  updateBuget(bugetInput.value);
  saveToLocalStorage();
}

function saveSpent() {
  const produs = document.getElementById("produs");
  const pret = document.getElementById("pret");
  const categorie = document.getElementById("categorie");
  const rec = {
    produs: produs.value,
    pret: pret.value,
    categorie: categorie.value,
  };
  db.push(rec);
  saveToLocalStorage();
  updateBuget(document.getElementById("buget").value);
  updateSpendings();
}
