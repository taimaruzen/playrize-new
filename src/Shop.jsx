import { useEffect, useState } from "react";
import "./Shop.css";

const SHOP_API = "https://playrize-shop-apimisty-glade-fbee.tainosuke79.workers.dev/api/products";

function Shop() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(SHOP_API)
      .then((response) => {
        if (!response.ok) throw new Error("商品の取得に失敗しました");
        return response.json();
      })
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
          <article className="shop-product-card" key={product.id}>
            <img src={SHOP_API.replace("/api/products", "") + product.image_url} alt={product.name} />
            <h2>{product.name}</h2>
            <p className="shop-product-price">¥{product.price.toLocaleString()}</p>
            <p>{product.description}</p>
            <p>{product.stock > 0 ? `在庫: ${product.stock}` : "売り切れ"}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Shop;
