const request = require('request');
const urlProductStock = "https://mt-node-stock-api.glitch.me/products";
const productModel = require('../models/item-model.js/index.js');

let productsDB = {
  name: "gato",
  price: 10
}

// Consultar todos os produtos
const getProducts = (req, res) => {
  res.status(200).send(productsDB)
}

// Consultar produto pelo nome
const getProduct = (req, res) => {
  let product = productsDB.find(item => (item.name === req.params.name))
  if (product) {
    res.status(200).send(product)
  } else {
    res.sendStatus(204)
  }
}

// Adicionar produto
const addProducts = (req, res) => {
  let reqProducts = req.body
  let newProducts = []
  let responseErr = {}

  // Converte objeto em array
  if (!Array.isArray(reqProducts)) {
    reqProducts = [reqProducts]
  }

  // Verifica se o pedido tem menos de 1000 itens
  if (reqProducts.length > 1000) {
    responseErr.error = {
      message: "Maximum of 1000 request products reached.",
      type: "RequestToolarge"
    }
    return res.status(413).send(responseErr)
  }
  
  // Procura por erros em cada elemento da array
  for (let i = 0; i < reqProducts.length; i++) {
    let product = reqProducts[i]

    // Verifica se produto já existe na requisição
    let duplicateProduct = reqProducts.find((item, index) => (item.name === product.name && index != i))
    if (duplicateProduct) {
      responseErr.error = {
        message: "Duplicated product: '" + product.name + "', please type a different name.",
        type: "DuplicatedProduct"
      }
      return res.status(409).send(responseErr)
    }
    // Verifica se produto já existe no banco (mock)
    if (productsDB.find(item => (item.name === product.name))) {
      responseErr.error = {
        message: "Product already exists on database: '" + product.name + "'.",
        type: "ProductExists"
      }
      return res.status(409).send(responseErr)
    }
    // Verifica se o nome é maior ou igual a 6 caracteres
    if (product.name.length <= 5) {
      responseErr.error = {
        message: "Product name must be greater than 6 characteres: '" + product.name + "'.",
        type: "TooSmallNameProduct"
      }
      return res.status(400).send(responseErr)
    }
    // Verifica se o campo preço é um numeral
    if (isNaN(product.price)) {
      responseErr.error = {
        message: "Field 'price' must be an number on product: '" + product.name + "'.",
        type: "InvalidPriceField"
      }
      return res.status(400).send(responseErr)
    }
    // Verifica se o campo preço é maior ou igual a 0
    if (product.price <= 0) {
      responseErr.error = {
        message: "Field 'price' must be greater than or equal to 0 on product: '" + product.name + "'.",
        type: "NegativePriceField"
      }
      return res.status(400).send(responseErr)
    }
  }

  // Enviar para API de Controle de Estoque, caso dê tudo certo, salvar no banco de dados
  for (let index = 0; index < reqProducts.length; index++) {
    let product = reqProducts[index]
    let data = {
      name: product.name
    }

    request({
      url: urlProductStock,
      headers: { 'Content-Type': 'application/json' },
      body: data,
      method: 'POST',
      json: true
    }, (err, response, body) => {
      if (err) {
        return res.status(500).send(err)
      }

      // caso retorne código 201 (Created), salvar no banco
      if (response.statusCode == 201) {
        let newProduct = productModel(product)
        newProducts.push(newProduct)
        productsDB.push(newProduct)
        // Enviar mensagem para cliente após a requisição final
        if (index === reqProducts.length-1) {
          return res.status(201).send(newProducts)
        }
      } else {
        return res.status(response.statusCode).send(response.body)
      }
    })
  }
}

// Atualizar produto pelo nome
const updateProduct = (req, res) => {
  let response = {}

  // Verifica se produto existe
  let product = productsDB.find(item => (item.name === req.params.name))
  if (!product) {
    response.error = {
      message: "Product not found.",
      type: "ProductNotFound"
    }
    return res.status(404).send(response)
  }
  // Verifica se o valor de preço é um inteiro
  let newPrice = Number.parseInt(req.body.price, 10)
  if (isNaN(newPrice)) {
    response.error = {
      message: "Field 'price' must be a number.",
      type: "InvalidPriceField"
    }
    return res.status(400).send(response)
  }
  // Verifica se o valor de preço é maior ou igual a zero
  if (newPrice <= 0) {
    response.error = {
      message: "Field 'price' must be greater than or equal to 0.",
      type: "NegativePriceField"
    }
    return res.status(400).send(response)
  }
  product.price = newPrice

  // Se der tudo certo, retorna o produto editado
  res.status(200).send(product)
}

// Exportar módulos
module.exports = {
  getProducts,
  getProduct,
  addProducts,
  updateProduct
}