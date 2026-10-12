import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SHOP_API } from "./Shop.jsx";
import "./Shop.css";

function ShopDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    setState("loading");
    fetch(`${SHOP_API}/${encodeURIComponent(id)}`)
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("api");
        return response.json();
      })
      .then((data) => { setProduct(data.product); setState("ready"); })
      .catch((error) => setState(error.message === "not-found" ? "not-found" : "error"));
  }, [id]);

  if (state === "loading") return <main className="shop-page shop-detail"><p>商品を読み込んでいます…</p></main>;
  if (state === "not-found") return <main className="shop-page shop-detail"><h1>商品が見つかりません</h1><Link className="shop-back-link" to="/shop">SHOPに戻る</Link></main>;
  if (state === "error") return <main className="shop-page shop-detail"><p>商品を読み込めませんでした。</p><Link className="shop-back-link" to="/shop">SHOPに戻る</Link></main>;

  return <main className="shop-page shop-detail"><Link className="shop-back-link" to="/shop">← SHOPに戻る</Link><article className="shop-detail-card"><img src={SHOP_API.replace("/api/products", "") + product.image_url} alt={product.name} /><div><h1>{product.name}</h1><p className="shop-product-id">商品ID：{String(product.product_number || product.id).padStart(6, "0")}</p><p className="shop-product-price">¥{product.price.toLocaleString()}</p><p>{product.description}</p><p>{product.stock > 0 ? `在庫: ${product.stock}` : "売り切れ"}</p><button type="button" disabled>購入する（準備中）</button></div></article></main>;
}
export default ShopDetail;



