const properties = [
  {id:1,title:"Studio moderne à Cocody",type:"Studio",deal:"Location",city:"Abidjan",area:"Cocody",price:75000,period:"mois",furnished:"Meublé",rooms:"1 pièce",image:"https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80",description:"Un studio lumineux avec espace nuit, cuisine et salle d’eau. Exemple d’annonce à remplacer par un bien réel."},
  {id:2,title:"Appartement meublé",type:"Appartement",deal:"Location",city:"Abidjan",area:"Marcory",price:35000,period:"nuit",furnished:"Meublé",rooms:"2 pièces",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",description:"Un appartement équipé pour un séjour confortable. Les tarifs et la disponibilité sont fictifs."},
  {id:3,title:"Villa familiale avec cour",type:"Villa",deal:"Vente",city:"Abidjan",area:"Bingerville",price:45000000,period:"à vendre",furnished:"Non meublé",rooms:"4 pièces",image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",description:"Une villa spacieuse avec plusieurs pièces et un extérieur agréable. Exemple de présentation, pas une offre réelle."},
  {id:4,title:"Résidence près du centre",type:"Résidence",deal:"Location",city:"Yamoussoukro",area:"Centre-ville",price:180000,period:"mois",furnished:"Non meublé",rooms:"3 pièces",image:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",description:"Un logement adapté à une famille ou à un long séjour. Annonce de démonstration."}
];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
const propertyGrid = $("#propertyGrid");
const emptyState = $("#emptyState");
const resultCount = $("#resultCount");
const propertyModal = $("#propertyModal");
const publishModal = $("#publishModal");
let activeDeal = "Tous";
let selectedDonation = 1000;

const money = value => new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
const dealPrice = p => p.deal === "Vente" ? `${money(p.price)} <small>à vendre</small>` : `${money(p.price)} <small>/${p.period}</small>`;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function closeMenu() {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  document.body.classList.remove("menu-open");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  mainNav.classList.toggle("open", !isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
  document.body.classList.toggle("menu-open", !isOpen);
});

function showPage(page) {
  $$(".page").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  $$(".nav-link[data-page-link]").forEach(el => el.classList.toggle("active", el.dataset.pageLink === page));
  closeMenu();
  if (page === "dons") history.replaceState(null, "", "#dons");
  else history.replaceState(null, "", "#accueil");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-page-link]").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  showPage(link.dataset.pageLink);
}));
$$("[data-scroll-link]").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  const targetId = link.dataset.scrollLink;
  showPage("accueil");
  window.setTimeout(() => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({behavior:"smooth",block:"start"});
  }, 40);
}));

function getFilteredProperties() {
  const keyword = $("#keyword").value.trim().toLocaleLowerCase("fr");
  const type = $("#typeFilter").value;
  const city = $("#cityFilter").value;
  const budget = $("#budgetFilter").value;
  return properties.filter(p => {
    const text = `${p.title} ${p.type} ${p.city} ${p.area} ${p.deal}`.toLocaleLowerCase("fr");
    const matchesKeyword = !keyword || text.includes(keyword);
    const matchesType = type === "tous" || p.type === type;
    const matchesCity = city === "toutes" || p.city === city;
    const monthlyOrSalePrice = p.price;
    const matchesBudget = budget === "tous" || (p.deal !== "Vente" && monthlyOrSalePrice <= Number(budget));
    return matchesKeyword && matchesType && matchesCity && matchesBudget && (activeDeal === "Tous" || p.deal === activeDeal);
  });
}

function renderProperties() {
  const filtered = getFilteredProperties();
  propertyGrid.innerHTML = filtered.map(p => `
    <article class="property-card">
      <div class="property-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <span class="property-badge">${p.deal}</span>
        <span class="property-type">${p.type}</span>
      </div>
      <div class="property-info">
        <div class="property-location"><span aria-hidden="true">⌖</span> ${p.area}, ${p.city}</div>
        <h3>${p.title}</h3>
        <div class="property-price">${dealPrice(p)}</div>
        <div class="property-meta"><span>⌂ ${p.rooms}</span><span>${p.furnished}</span></div>
        <button class="property-link" type="button" data-property-id="${p.id}">Voir les détails <span aria-hidden="true">↗</span></button>
      </div>
    </article>`).join("");
  resultCount.textContent = `${filtered.length} bien${filtered.length > 1 ? "s" : ""} de démonstration`;
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  propertyGrid.classList.toggle("hidden", filtered.length === 0);
}
$("#searchForm").addEventListener("submit", event => { event.preventDefault(); renderProperties(); $("#annonces").scrollIntoView({behavior:"smooth"}); });
["keyword","typeFilter","cityFilter","budgetFilter"].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener(id === "keyword" ? "input" : "change", renderProperties);
});
$$("[data-deal]").forEach(button => button.addEventListener("click", () => {
  activeDeal = button.dataset.deal;
  $$("[data-deal]").forEach(tab => tab.classList.toggle("active", tab === button));
  renderProperties();
}));
$("#resetFilters").addEventListener("click", () => {
  $("#keyword").value = "";
  $("#typeFilter").value = "tous";
  $("#cityFilter").value = "toutes";
  $("#budgetFilter").value = "tous";
  activeDeal = "Tous";
  $$("[data-deal]").forEach(tab => tab.classList.toggle("active", tab.dataset.deal === "Tous"));
  renderProperties();
});

propertyGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-property-id]");
  if (!button) return;
  const p = properties.find(item => item.id === Number(button.dataset.propertyId));
  if (!p) return;
  const commission = Math.round(p.price * 0.05);
  $("#modalContent").innerHTML = `
    <span class="eyebrow">${p.deal} · ${p.type}</span>
    <img class="modal-property-image" src="${p.image}" alt="${p.title}">
    <h2>${p.title}</h2>
    <p>⌖ ${p.area}, ${p.city} · ${p.furnished} · ${p.rooms}</p>
    <div class="modal-property-price">${dealPrice(p)}</div>
    <p>${p.description}</p>
    <div class="notice"><strong>Commission indicative de 5 % :</strong> ${money(commission)} calculés sur le prix affiché. Pour une vente ou une location, les règles et la base de calcul devront être clairement définies avant le lancement.</div>
    <button class="btn btn-primary btn-full" id="contactDemo" type="button">Demander à être contacté</button>
    <p class="form-note">Annonce fictive. Aucun propriétaire n’est connecté et aucune transaction n’est activée.</p>`;
  propertyModal.showModal();
  $("#contactDemo").addEventListener("click", () => {
    propertyModal.close();
    showToast("La prise de contact sera disponible lorsque Visiteo sera connecté à son service d’annonces.");
  });
});
$("#modalClose").addEventListener("click", () => propertyModal.close());
propertyModal.addEventListener("click", event => { if (event.target === propertyModal) propertyModal.close(); });

$("#publishButton").addEventListener("click", () => publishModal.showModal());
$("#publishModalClose").addEventListener("click", () => publishModal.close());
publishModal.addEventListener("click", event => { if (event.target === publishModal) publishModal.close(); });
$("#listingForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#listingTitle").value.trim();
  const deal = $("#listingDeal").value;
  const type = $("#listingType").value;
  const city = $("#listingCity").value.trim();
  const price = Number($("#listingPrice").value);
  const phone = $("#listingPhone").value.trim();
  const commission = Math.round(price * 0.05);
  $("#listingMessage").textContent = `Brouillon prêt : ${title} — ${type}, ${deal.toLowerCase()}, ${city}, ${money(price)}. Commission indicative à 5 % : ${money(commission)}. Contact saisi : ${phone}. Ce formulaire ne publie pas encore l’annonce.`;
});

$$("[data-amount]").forEach(button => button.addEventListener("click", () => {
  selectedDonation = Number(button.dataset.amount);
  $("#customAmount").value = "";
  $$("[data-amount]").forEach(item => item.classList.toggle("selected", item === button));
  updateDonationTotal();
}));
$("#customAmount").addEventListener("input", () => {
  if ($("#customAmount").value !== "") $$("[data-amount]").forEach(item => item.classList.remove("selected"));
  else $$("[data-amount]").forEach(item => item.classList.toggle("selected", Number(item.dataset.amount) === selectedDonation));
  updateDonationTotal();
});
function updateDonationTotal() {
  const custom = $("#customAmount").value;
  const amount = custom !== "" ? Number(custom) : selectedDonation;
  $("#donationTotal").textContent = money(Math.max(0, amount || 0));
}
$("#donationForm").addEventListener("submit", event => {
  event.preventDefault();
  const custom = $("#customAmount").value;
  const amount = custom !== "" ? Number(custom) : selectedDonation;
  if (!Number.isFinite(amount) || amount < 100) {
    $("#donationMessage").textContent = "Saisissez un montant d’au moins 100 FCFA.";
    return;
  }
  $("#donationMessage").textContent = `Votre choix : ${money(amount)}. Le paiement Wave n’est pas encore connecté ; aucun débit n’a été effectué.`;
});
$("#year").textContent = new Date().getFullYear();

if (window.location.hash === "#dons") showPage("dons");
renderProperties();
