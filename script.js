(function () {
  var WA = "221781950353";
  var IMG = { hen: "images/hen.jpg", roast: "images/roast.jpg", eggs: "images/eggs.jpg" };
  var PRODUCTS = [
    { id: "p-vivant", cat: "poulet", name: "Poulet de chair vivant", desc: "Vendu vivant, à la pièce.", unit: "la pièce", price: 3500, img: "hen" },
    { id: "p-prepare", cat: "poulet", name: "Poulet de chair préparé", desc: "Plumé, vidé et prêt à cuisiner.", unit: "la pièce", price: 4500, img: "roast" },
    { id: "p-lot2", cat: "poulet", name: "Lot de 2 poulets préparés", desc: "Pour les repas de famille et les fêtes.", unit: "le lot", price: 8500, img: "roast" },
    { id: "o-30", cat: "oeuf", name: "Plateau de 30 œufs", desc: "Œufs frais, au plateau.", unit: "le plateau", price: 2500, img: "eggs" },
    { id: "o-15", cat: "oeuf", name: "Demi-plateau de 15 œufs", desc: "Pour une petite famille.", unit: "le demi-plateau", price: 1300, img: "eggs" },
    { id: "o-carton", cat: "oeuf", name: "Carton de 12 plateaux", desc: "360 œufs pour revendeurs, boulangeries et restaurants.", unit: "le carton", price: 28000, img: "eggs" }
  ];
  var byId = {}; PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var cart = {};
  try { var saved = JSON.parse(localStorage.getItem("pdn-cart") || "{}"); Object.keys(saved).forEach(function (k) { if (byId[k] && saved[k] > 0) cart[k] = Math.min(99, saved[k] | 0); }); } catch (e) {}

  function money(n) { return n.toLocaleString("fr-FR").replace(/[  ]/g, " ") + " F CFA"; }
  function $(id) { return document.getElementById(id); }
  function save() { try { localStorage.setItem("pdn-cart", JSON.stringify(cart)); } catch (e) {} }

  var filter = "all";
  function renderGrid() {
    var html = "";
    PRODUCTS.forEach(function (p) {
      if (filter !== "all" && p.cat !== filter) return;
      html += '<article class="card"><div class="ph"><img src="' + IMG[p.img] + '" alt="' + p.name + '" loading="lazy">' +
        '<span class="tag ' + (p.cat === "oeuf" ? "egg" : "") + '">' + (p.cat === "oeuf" ? "Œufs" : "Poulet") + '</span></div>' +
        '<div class="body"><h3>' + p.name + '</h3><p>' + p.desc + '</p>' +
        '<div class="price">' + money(p.price) + ' <small>' + p.unit + '</small></div>' +
        '<button class="btn" type="button" data-add="' + p.id + '">Ajouter au panier</button></div></article>';
    });
    $("grid").innerHTML = html;
  }

  function count() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0); }
  function total() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k] * byId[k].price; }, 0); }

  function renderCart() {
    var ids = Object.keys(cart);
    var html = "";
    if (!ids.length) html = '<li class="empty">Votre panier est vide. Ajoutez un produit depuis la liste ci-dessus.</li>';
    ids.forEach(function (id) {
      var p = byId[id], q = cart[id];
      html += '<li class="line"><div><div class="nm">' + p.name + '</div><div class="sub">' + money(p.price) + ' ' + p.unit + '</div></div>' +
        '<div class="tot">' + money(p.price * q) + '</div>' +
        '<div class="qty" role="group" aria-label="Quantité de ' + p.name + '"><button type="button" data-dec="' + id + '" aria-label="Retirer un">−</button><output>' + q + '</output><button type="button" data-inc="' + id + '" aria-label="Ajouter un">+</button></div>' +
        '<div style="text-align:right"><button class="rm" type="button" data-rm="' + id + '">Supprimer</button></div></li>';
    });
    $("lines").innerHTML = html;
    $("total").textContent = money(total());
    $("cartcount").textContent = count();
    updateWA();
  }

  function message() {
    var L = ["Bonjour Poulet du Ndiambour, je souhaite commander :", ""];
    Object.keys(cart).forEach(function (id) {
      var p = byId[id];
      L.push("• " + cart[id] + " × " + p.name + " = " + money(p.price * cart[id]));
    });
    L.push("", "Total articles : " + money(total()));
    var mode = document.querySelector('input[name="mode"]:checked').value;
    L.push("Réception : " + (mode === "livraison" ? "livraison" : "retrait à Cité Damel"));
    if (mode === "livraison" && $("adresse").value.trim()) L.push("Adresse : " + $("adresse").value.trim());
    L.push("", "Nom : " + ($("nom").value.trim() || "—"), "Téléphone : " + ($("tel").value.trim() || "—"));
    return L.join("\n");
  }

  function updateWA() {
    var a = $("wa"), ok = count() > 0;
    a.setAttribute("aria-disabled", ok ? "false" : "true");
    a.href = ok ? "https://wa.me/" + WA + "?text=" + encodeURIComponent(message()) : "#panier";
    $("copybtn").disabled = !ok;
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a"); if (!t) return;
    var add = t.getAttribute("data-add"), inc = t.getAttribute("data-inc"), dec = t.getAttribute("data-dec"), rm = t.getAttribute("data-rm");
    if (add) { cart[add] = Math.min(99, (cart[add] || 0) + 1); save(); renderCart(); t.textContent = "Ajouté ✓"; setTimeout(function () { t.textContent = "Ajouter au panier"; }, 1200); }
    if (inc) { cart[inc] = Math.min(99, cart[inc] + 1); save(); renderCart(); }
    if (dec) { cart[dec] -= 1; if (cart[dec] <= 0) delete cart[dec]; save(); renderCart(); }
    if (rm) { delete cart[rm]; save(); renderCart(); }
    if (t.getAttribute("data-f")) {
      filter = t.getAttribute("data-f");
      document.querySelectorAll(".tab").forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); });
      renderGrid();
    }
    if (t.id === "wa" && t.getAttribute("aria-disabled") === "true") e.preventDefault();
  });

  ["nom", "tel", "adresse"].forEach(function (id) { $(id).addEventListener("input", updateWA); });
  document.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", function () {
      $("addrbox").hidden = document.querySelector('input[name="mode"]:checked').value !== "livraison";
      updateWA();
    });
  });
  $("orderform").addEventListener("submit", function (e) { e.preventDefault(); });

  $("copybtn").addEventListener("click", function () {
    var txt = message(), s = $("status");
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      s.textContent = ok ? "Message copié." : "Copie impossible. Sélectionnez le texte à la main.";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { s.textContent = "Message copié. Collez-le dans WhatsApp au 78 195 03 53."; }, fallback);
    } else fallback();
  });

  renderGrid(); renderCart();
})();
