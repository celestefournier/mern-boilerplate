module.exports = (app) => {
  const productController = require('../controllers/item-controller.js/index.js.js');

  // GET /products
  app.route('/products')
    .get(productController.getProducts);
  
  // GET /products/:name
  app.route('/products/:name')
    .get(productController.getProduct);

  // POST /products
  app.route('/products')
    .post(productController.addProducts);
    
  // PUT /products/:name
  app.route('/products/:name')
    .put(productController.updateProduct);
};