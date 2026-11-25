let currtab = 0;
const bc = "bc";
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");
const tab3 = document.getElementById("tab3");
const bugetInput = document.getElementById("buget-input");
const produs = document.getElementById("produs");
const pret = document.getElementById("pret");
const categorie = document.getElementById("categorie");
const lcasa = document.getElementById("lcasa");
const lcumparaturi = document.getElementById("lcumparaturi"):
const buget = document.getElementById("buget");
const chelt = document.getElementById("chelt");
const ramas = document.getElementById("ramas");

let sold;
let db;

function saveToLocalStorage() {
  const bcv = {
    sold: sold;
    db = db;
  };
  const bcJson = JSON.stringify(bcv);
  localStorage.setItem(bc, bcJson);
}

let bcJson = localStorage.getItem(bc);
if (bcJson) {
  const bcv = JSON.parse(bcJson);
  sold = bcv.sold;
  db = [];
  bcv.db.forEach((rec) => {
    db.push(rec);
  });
} else {
  sold = 0;
  db = [];
  saveToLocalStorage();
}

function switchTab(tabno) {
  tab1.classList.add("disabled");
  tab2.classList.add("disabled");
  tab3.classList.add("disabled");
  if (tabno == 0)
	tab1.classList.remove("disabled");
  else if (tabno == 1)
	tab2.classList.remove("disabled");
  else if (tabno == 2)
	tab3.classList.remove("disabled");
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
  db.forEach((rec) => {
    if (rec["category"] === cat) {
      const row = document.createElement("div");
      addField(row, rec["produs"]);
      addField(row, rec["pret"]);
      el.appendChild(row);
    }
  });
}

function updateSpendings() {
  updateCategory("lcasa", "casa");
  updateCategory("lcumparaturi", "cumparaturi");
}

function updateBuget() {
  let cheltv = 0;
  db.forEach((record) => {
    cheltv += parseInt(JSON.parse(record["pret"]));
  });
  chelt.value = cheltv;
  chelt.ramas = buget.value - chelt.value;
}

function saveBuget() {
  sold = bugetInput.value;
  buget.value = sold;
  updateBuget();
  saveToLocalStorage();
}

function saveSpent() {
  const rec = {
    produs: produs.value;
    pret: pret.value;
    categorie: categorie.value;
  };
  db.push(rec);
  saveToLocalStorage();
  updateBuget();
  updateSpendings();
}

