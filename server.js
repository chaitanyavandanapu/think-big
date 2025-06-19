const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const productsDataPath = path.join(__dirname, 'data', 'products.json');
let allProducts = {};

try {
  allProducts = JSON.parse(fs.readFileSync(productsDataPath, 'utf8'));
} catch (err) {
  console.error('Error reading products data:', err);
  process.exit(1);
}

app.get('/category/:id', (req, res) => {
  const categoryId = req.params.id.toLowerCase();

  // Get category data object
  const categoryData = allProducts[categoryId];

  if (!categoryData || !categoryData.products || categoryData.products.length === 0) {
    return res.status(404).send('<h1>Category Not Found</h1>');
  }

  let categoryHtml;
  try {
    categoryHtml = fs.readFileSync(path.join(__dirname, 'public', 'category.html'), 'utf8');
  } catch (err) {
    return res.status(500).send('<h1>Server Error: Unable to load category page.</h1>');
  }

const productCards = categoryData.products.map(product => `
  <div class="product-card">
    <a href="/product/${product.id}">
      <div class="image-container">
        <img src="${product.imageSrc}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.subCategory || 'General'}</div>
      </div>
    </a>
  </div>
`).join('');


  const finalHtml = categoryHtml.replace('{{PRODUCT_CARDS}}', productCards);
  res.send(finalHtml);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});