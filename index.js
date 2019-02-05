'use strict'

const braintree = require('braintree')
const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const port = process.env.PORT || 3000

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "8gyjrptyqcnsdbfn",
    publicKey: "xb6zmnjcx895mngq",
    privateKey: "20e6418b8cec0ad397bb51018ade8ded"
})

const app = express()
app.set('port', port)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(port, () => {
    console.log(`Server listening on port:${port}`)
})

app.get('/client_token', (req, res) => {
    /* Send a client token to your client */
    generateClientToken()
    .then((result) => {
        console.log("Generated Client Token")
        res.statusCode = 200
        res.end(result)
    })
    .catch((err) => {
        console.log(err.message)
        res.statusCode = 500
        res.end(err.message)
    })
})

app.post('/checkout', (req, res) => {
    /* Receive a payment method nonce from your client */
    const nonceFromTheClient = req.body.payment_method_nonce
    const amount = req.body.amount
    console.log("Got nonce from client: " + nonceFromTheClient + "\nAmount: " + amount)
    transaction(nonceFromTheClient, amount)
    .then((result) => {
        res.statusCode = 200
        res.end(result)
    })
    .catch((err) => {
        console.log(err.message)
        res.statusCode = 500
        res.end(err.message)
    })
})

function generateClientToken() {
    return new Promise((resolve, reject) => {
        gateway.clientToken.generate({}, (err, res) => {
            err ? reject(err) : resolve(res.clientToken)
        })
    })
}

function transaction(nonce, amount) {
    return new Promise ((resolve, reject) => {
        gateway.transaction.sale({
            amount: amount,
            paymentMethodNonce: nonce,
            options: {
            submitForSettlement: true
            }
        }, (err, res) => {
            err ? reject(err) : resolve(res)
        })
    })
}