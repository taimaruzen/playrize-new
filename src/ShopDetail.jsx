import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SHOP_API } from "./Shop.jsx";
import "./Shop.css";

function ShopDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetch(`${SHOP_API}/${encodeURIComponent(id)}`)
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("api");
        return response.json();
      })
      .then((data) => { setProduct(data.product); setImageIndex(0); setState("ready"); })
      .catch((error) => setState(error.message === "not-found" ? "not-found" : "error"));
  }, [id]);

  if (state === "loading") return <main className="shop-page shop-detail"><p>商品を読み込んでいます…</p></main>;
  if (state === "not-found") return <main className="shop-page shop-detail"><h1>商品が見つかりません</h1><Link className="shop-back-link" to="/shop">SHOPに戻る</Link></main>;
  if (state === "error") return <main className="shop-page shop-detail"><p>商品を読み込めませんでした。</p><Link className="shop-back-link" to="/shop">SHOPに戻る</Link></main>;

  const images = product.images?.length ? product.images : [{ image_url: product.image_url }];
  return <main className="shop-page shop-detail"><Link className="shop-back-link" to="/shop">← SHOPに戻る</Link><article className="shop-detail-card"><div className="shop-gallery"><img className="shop-detail-main-image" src={SHOP_API.replace("/api/products", "") + images[imageIndex].image_url} alt={product.name} onTouchStart={(e) => { e.currentTarget.dataset.x = e.touches[0].clientX; }} onTouchEnd={(e) => { const start = Number(e.currentTarget.dataset.x); const delta = e.changedTouches[0].clientX - start; if (Math.abs(delta) > 40) setImageIndex((v) => (v + (delta < 0 ? 1 : images.length - 1)) % images.length); }} /><div className="shop-thumbnails">{images.map((image, index) => <button type="button" className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)} key={image.image_url}><img src={SHOP_API.replace("/api/products", "") + image.image_url} alt={`${product.name} ${index + 1}`} /></button>)}</div></div><div><h1>{product.name}</h1><p className="shop-product-price">¥{product.price.toLocaleString()}</p><p>{product.description}</p><p>{product.stock > 0 ? `在庫: ${product.stock}` : "売り切れ"}</p><button type="button" disabled>購入する（準備中）</button></div></article></main>;
}
export default ShopDetail;

