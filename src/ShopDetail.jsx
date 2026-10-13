import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SHOP_API } from "./Shop.jsx";
import "./Shop.css";

function ShopBackLink() {
  return (
    <Link className="shop-back-link" to="/shop">
      <span className="shop-back-link__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M19 12H5m7-7-7 7 7 7" />
        </svg>
      </span>
      <span>SHOPに戻る</span>
    </Link>
  );
}

function ShopDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${SHOP_API}/${encodeURIComponent(id)}`)
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("api");
        return response.json();
      })
      .then((data) => { setProduct(data.product); setImageIndex(0); setQuantity(1); setState("ready"); })
      .catch((error) => setState(error.message === "not-found" ? "not-found" : "error"));
  }, [id]);

  if (state === "loading") return <main className="shop-page shop-detail"><p>商品を読み込んでいます…</p></main>;
  if (state === "not-found") return <main className="shop-page shop-detail"><h1>商品が見つかりません</h1><ShopBackLink /></main>;
  if (state === "error") return <main className="shop-page shop-detail"><p>商品を読み込めませんでした。</p><ShopBackLink /></main>;

  const images = product.images?.length ? product.images : [{ image_url: product.image_url }];
  return <main className="shop-page shop-detail"><ShopBackLink /><article className="shop-detail-card"><div className="shop-gallery"><img className="shop-detail-main-image" src={SHOP_API.replace("/api/products", "") + images[imageIndex].image_url} alt={product.name} onTouchStart={(e) => { e.currentTarget.dataset.x = e.touches[0].clientX; }} onTouchEnd={(e) => { const start = Number(e.currentTarget.dataset.x); const delta = e.changedTouches[0].clientX - start; if (Math.abs(delta) > 40) setImageIndex((v) => (v + (delta < 0 ? 1 : images.length - 1)) % images.length); }} /><div className="shop-thumbnails">{images.map((image, index) => <button type="button" className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)} key={image.image_url}><img src={SHOP_API.replace("/api/products", "") + image.image_url} alt={`${product.name} ${index + 1}`} /></button>)}</div></div><div><h1>{product.name}</h1><p className="shop-product-price">¥{product.price.toLocaleString()}</p><p>{product.description}</p><p>{product.stock > 0 ? `在庫: ${product.stock}` : "売り切れ"}</p><div className="shop-quantity"><label htmlFor="shop-quantity">購入個数</label><div className="shop-quantity-controls"><button type="button" aria-label="1個減らす" disabled={quantity <= 1} onClick={() => setQuantity((v) => Math.max(1, v - 1))}>−</button><input id="shop-quantity" type="number" min="1" max={product.stock} value={quantity} disabled={product.stock <= 0} onChange={(e) => { const value = Number(e.target.value); if (Number.isFinite(value)) setQuantity(Math.max(1, Math.min(product.stock || 1, Math.trunc(value)))); }} /><button type="button" aria-label="1個増やす" disabled={quantity >= product.stock} onClick={() => setQuantity((v) => Math.min(product.stock, v + 1))}>＋</button></div></div><p className="shop-order-total">合計：¥{(product.price * quantity).toLocaleString("ja-JP")}</p><button type="button" disabled>購入する（準備中）</button></div></article></main>;
}
export default ShopDetail;

