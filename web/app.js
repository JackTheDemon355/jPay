const backendBase = "http://localhost:3000";

const platformHint = document.getElementById("platformHint");
const platformRadios = document.querySelectorAll('input[name="platform"]');

function updatePlatformHint() {
  const value = document.querySelector('input[name="platform"]:checked').value;
  platformHint.textContent =
    value === "ios"
      ? "jPay iOS: Use Stripe Terminal iOS SDK with retrieve/collect/confirm."
      : "jPay Android: Use Stripe Terminal Android SDK with retrieve/collect/confirm.";
}

platformRadios.forEach(r => r.addEventListener("change", updatePlatformHint));
updatePlatformHint();

// ---------- jPay PRODUCTS UI ----------

const productListDiv = document.getElementById("productList");
const prodId = document.getElementById("prodId");
const prodName = document.getElementById("prodName");
const prodAmount = document.getElementById("prodAmount");
const prodCurrency = document.getElementById("prodCurrency");

async function loadProducts() {
  const res = await fetch(`${backendBase}/products`);
  const data = await res.json();
  productListDiv.innerHTML = "";
  data.forEach(p => {
    const row = document.createElement("div");
    row.textContent = `${p.id} | ${p.name} | ${p.amount} ${p.currency}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteProduct(p.id);
    row.appendChild(delBtn);
    productListDiv.appendChild(row);
  });
}

async function deleteProduct(id) {
  await fetch(`${backendBase}/products/${id}`, { method: "DELETE" });
  loadProducts();
}

loadProducts();

document.getElementById("addProductBtn").onclick = async () => {
  const body = {
    id: prodId.value,
    name: prodName.value,
    amount: parseInt(prodAmount.value, 10),
    currency: prodCurrency.value
  };
  await fetch(`${backendBase}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  loadProducts();
};

document.getElementById("editProductBtn").onclick = async () => {
  const id = prodId.value;
  const body = {
    name: prodName.value || undefined,
    amount: prodAmount.value ? parseInt(prodAmount.value, 10) : undefined,
    currency: prodCurrency.value || undefined
  };
  await fetch(`${backendBase}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  loadProducts();
};

// ---------- jPay PAYMENT INTENTS ----------

const chargeProductId = document.getElementById("chargeProductId");
const productIntentResult = document.getElementById("productIntentResult");
const customAmount = document.getElementById("customAmount");
const customCurrency = document.getElementById("customCurrency");
const amountIntentResult = document.getElementById("amountIntentResult");

document.getElementById("chargeProductBtn").onclick = async () => {
  const body = { productId: chargeProductId.value };
  const res = await fetch(`${backendBase}/create-intent/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  productIntentResult.textContent = JSON.stringify(data, null, 2);
};

document.getElementById("chargeAmountBtn").onclick = async () => {
  const body = {
    amount: parseInt(customAmount.value, 10),
    currency: customCurrency.value
  };
  const res = await fetch(`${backendBase}/create-intent/amount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  amountIntentResult.textContent = JSON.stringify(data, null, 2);
};
