const express = require("express");
const { default: mobbex } = require("mobbex");
const config = require("./config");

let app = express();

app.set("view engine", "hbs");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

mobbex.configurations.configure({
  apiKey: config.apiKey,
  accessToken: config.accessToken,
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/checkout", (req, res) => {
  // Data del formulario del carrito
  const data = req.body;

  // Configuración de la clave privada

  // Objeto del checkout
  const checkout = {
    total: parseInt(data.total),
    currency: "ARS",
    reference: config.reference,
    description: "Venta de 2 productos",
    items: [
      {
        image: "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
        quantity: 1,
        description: data.product1Title,
        total: parseInt(data.product1Val),
      },
      {
        image: "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
        quantity: 1,
        description: data.product2Title,
        total: parseInt(data.product2Val),
      },
    ],
    customer: config.customer,
    options: {
      domain: config.domain,
    },
    test: true,
    wallet: true,
    return_url: "https://localhost:8443/sale/return?session=56789",
    webhook: "https://localhost:8443/sale/webhook?user=1234",
  };

  // Creación del checkout
  mobbex.checkout
    .create(checkout)
    .then((data) => {
      // Wallet con todas las tarjetas
      let wallet = data.data.wallet;
      // Url del checkout para agregar nuevas tarjetas
      let url = data.data.url;

      // Obtener la imagén de la tarjeta (visa, mastercard...)
      wallet.forEach((source) => {
        let logo = source.source.card.product.logo;
        // Se coloca la imagén en el source para poder renderizalo en el frontend
        source.logo = logo;
      });
      res.render("checkout", { wallet: wallet, url: url });
    })
    .catch((error) => console.log(error));
});

app.listen(config.port);

console.log(`Running on port: ${config.port}`);
