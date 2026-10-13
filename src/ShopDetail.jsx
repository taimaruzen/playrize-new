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
  const [quantity, setQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState("");

  useEffect(() => {
    fetch(`${SHOP_API}/${encodeURIComponent(id)}`)
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("api");
        return response.json();
      })
      .then((data) => { setProduct(data.product); setImageIndex(0); setQuantity("1"); setQuantityError(""); setState("ready"); })
      .catch((error) => setState(error.message === "not-found" ? "not-found" : "error"));
  }, [id]);

  if (state === "loading") return <main className="shop-page shop-detail"><p>商品を読み込んでいます…</p></main>;
  if (state === "not-found") return <main className="shop-page shop-detail"><h1>商品が見つかりません</h1><ShopBackLink /></main>;
  if (state === "error") return <main className="shop-page shop-detail"><p>商品を読み込めませんでした。</p><ShopBackLink /></main>;

  const images = product.images?.length ? product.images : [{ image_url: product.image_url }];
  return <main className="shop-page shop-detail"><ShopBackLink /><article className="shop-detail-card"><div className="shop-gallery"><img className="shop-detail-main-image" src={SHOP_API.replace("/api/products", "") + images[imageIndex].image_url} alt={product.name} onTouchStart={(e) => { e.currentTarget.dataset.x = e.touches[0].clientX; }} onTouchEnd={(e) => { const start = Number(e.currentTarget.dataset.x); const delta = e.changedTouches[0].clientX - start; if (Math.abs(delta) > 40) setImageIndex((v) => (v + (delta < 0 ? 1 : images.length - 1)) % images.length); }} /><div className="shop-thumbnails">{images.map((image, index) => <button type="button" className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)} key={image.image_url}><img src={SHOP_API.replace("/api/products", "") + image.image_url} alt={`${product.name} ${index + 1}`} /></button>)}</div></div><div><h1>{product.name}</h1><p className="shop-product-price">¥{product.price.toLocaleString()}</p><p>{product.description}</p><p>{product.stock > 0 ? `在庫: ${product.stock}` : "売り切れ"}</p><div className="shop-quantity">
    <label htmlFor="shop-quantity">購入個数</label>
    <input
      id="shop-quantity"
      type="number"
      min="1"
      step="1"
      value={quantity}
      disabled={product.stock <= 0}
      aria-invalid={Boolean(quantityError)}
      aria-describedby={quantityError ? "shop-quantity-error" : undefined}
      onChange={(e) => {
        setQuantity(e.target.value);
        setQuantityError("");
      }}
    />
    {quantityError && <p id="shop-quantity-error" className="shop-quantity-error" role="alert">{quantityError}</p>}
  </div>
  <p className="shop-order-total">合計：¥{(product.price * (Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 0)).toLocaleString("ja-JP")}</p>
  <button type="button" disabled={product.stock <= 0} onClick={() => {
    const count = Number(quantity);
    if (!quantity.trim() || !/^\\d+$/.test(quantity) || !Number.isSafeInteger(count) || count < 1) {
      setQuantityError("購入個数は1以上の整数で入力してください。");
      return;
    }
    if (count > product.stock) {
      setQuantityError(`在庫数は${product.stock}個です。購入個数を減らしてください。`);
      return;
    }
    setQuantityError("決済機能は現在準備中です。注文はまだ確定できません。");
  }}>購入する（準備中）</button></div></article></main>;
}
export default ShopDetail;

