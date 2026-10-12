import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Shop.css";

export const SHOP_API = "https://playrize-shop-apimisty-glade-fbee.tainosuke79.workers.dev/api/products";

function Shop() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(SHOP_API)
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => setProducts(data.products || []))
      .catch(() => setError("商品を読み込めませんでした。"));
  }, []);

  return (
    <main className="shop-page">
      <h1>SHOP</h1>
      {error && <p>{error}</p>}
      {!error && products.length === 0 && <p>商品はまだありません。</p>}
      <div className="shop-products">
        {products.map((product) => (
          <Link className="shop-product-card" to={`/shop/${String(product.product_number || product.id).padStart(6, "0")}`} key={product.id} aria-label={`${product.name}の詳細を見る`}>
            <img src={SHOP_API.replace("/api/products", "") + product.image_url} alt={product.name} />
            <h2>{product.name}</h2>
            <p className="shop-product-price">¥{product.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Shop;

