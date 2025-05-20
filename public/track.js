
<script>
(function () {
  console.log("🧪 GTM etiketi başarıyla yüklendi!");

  // ✅ Kullanıcı ID oluştur
  if (!localStorage.getItem("user_id")) {
    localStorage.setItem("user_id", "user-" + Math.random().toString(36).substring(2));
  }

  // ✅ Genel event gönderici
  function sendEvent(eventName, extraData) {
    var data = {
      event_name: eventName,
      user_id: localStorage.getItem("user_id") || null
    };

    if (extraData) {
      for (var key in extraData) {
        data[key] = extraData[key];
      }
    }

    fetch("https://searchprojectdemo.com/api/track-event/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function () {
      console.log("📡 Event gönderildi:", eventName, data);
    }).catch(function (err) {
      console.warn("❌ Hata:", err);
    });
  }

  // ✅ JSON-LD'den SKU çek
  function getSKU() {
    try {
      var script = document.querySelector('script[type="application/ld+json"]');
      var json = JSON.parse(script.innerText);
      if (json["@graph"] && json["@graph"][0] && json["@graph"][0].sku) {
        return json["@graph"][0].sku;
      }
    } catch (e) {
      console.warn("⚠️ JSON-LD parse edilemedi:", e);
    }
    return null;
  }

  // ✅ view_item eventi gönder
  var sku = getSKU();
  if (sku) {
    sendEvent("view_item", { product_id: sku });
  }

  // ✅ Sepete ekleme dinleyici bağla
  function bindAddToCart() {
    var buttons = document.querySelectorAll("input.button--add-to-cart");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (!btn.getAttribute("data-tracking-bound")) {
        btn.setAttribute("data-tracking-bound", "true");

        btn.addEventListener("mousedown", function () {
          var skuNow = getSKU();
          console.log("👉 Sepete ekleye tıklandı. SKU:", skuNow);
          if (skuNow) {
            sendEvent("add_to_cart", { product_id: skuNow });
          } else {
            console.warn("❌ SKU bulunamadı!");
          }
        });

        console.log("✅ Sepete ekleme dinleyicisi eklendi:", btn);
      }
    }
  }

  // ✅ Sayfa yüklendiğinde ve DOM değiştiğinde tekrar bağla
  window.addEventListener("load", function () {
    bindAddToCart();

    var observer = new MutationObserver(function () {
      bindAddToCart();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
</script>
