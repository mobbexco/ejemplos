const express = require('express')
const mobbex = require('mobbex')
const config = require('./config');

let app = express()

app.use(express.static(__dirname + '/views'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

mobbex.configurations.configure({
    apiKey: config.apiKey,
    accessToken: config.accessToken
})

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/checkout', (req, res) => {
    const data = req.body
    console.log(data)
    const checkout = {
        total: 100,
        currency: "ARS",
        reference: config.reference,
        description: "Venta de 2 productos",
        items: [
            {
                image: "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
                quantity: 1,
                description: data.product1Title,
                total: parseInt(data.product1Val)
            },
            {
                image: "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
                quantity: 1,
                description: data.product2Title,
                total: parseInt(data.product2Val)
            }
        ],
        options: {
            domain: config.domain,
            button: true,
            embed: true
        },
        test: true,
        return_url: "https://localhost:8443/sale/return?session=56789",
    }

    mobbex.checkout.create(checkout)
        .then(data => res.status(200).send(data))
        .catch(() => res.status(500))
})

app.listen(config.port)

console.log(`Running on port: ${config.port}`)