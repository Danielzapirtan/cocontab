const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");
const tab3 = document.getElementById("tab3");
let currtab = 0;

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

