// Formatar nome e preço do produto
const buildProduct = (body) => {
  return {
    name: body.name,
    price: Number.parseInt(body.price, 10),
  }
}

module.exports = buildProduct;