import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SHOP_API } from "./Shop.jsx";
import { quantityError } from "./shopQuantity.js";
import "./Shop.css";

export default function ShopCheckout() {
  const [params] = useSearchParams();
  const id = params.get("product") || "";
  return <CheckoutContent key={id + ":" + (params.get("quantity") || "1")} id={id} initialQuantity={params.get("quantity") ?? "1"} />;
}
function CheckoutContent({ id, initialQuantity }) {
  const [quantity, setQuantity] = useState(/^[0-9]*$/.test(initialQuantity) ? initialQuantity : "");
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let controller;
    let disposed = false;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      if (!/^[1-9][0-9]{5}$/.test(id)) { setState("invalid"); return; }
      setState("loading");
      try {
        const response = await fetch(SHOP_API + "/" + encodeURIComponent(id), { cache: "no-store", signal });
        if (response.status === 404) { if (!disposed) setState("missing"); return; }
        if (!response.ok) throw new Error("api");
        const data = await response.json();
        const p = data.product;
        if (!p || !Number.isSafeInteger(p.price) || p.price < 0 || !Number.isSafeInteger(p.stock) || p.stock < 0) throw new Error("data");
        if (!disposed && !signal.aborted) { setProduct(p); setState("ready"); }
      } catch { if (!disposed && !signal.aborted) setState("error"); }
    };
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => { disposed = true; controller?.abort(); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", visible); };
  }, [id]);
  const error = product ? quantityError(quantity, product.stock) : "";
  const total = product && !error ? product.price * Number(quantity) : null;
  const money = value => "¥" + value.toLocaleString("ja-JP");
  return <main className="shop-page shop-detail checkout-page">
    <Link className="shop-back-link" to={/^[1-9][0-9]{5}$/.test(id) ? "/shop/" + id : "/shop"}>← 商品詳細に戻る</Link>
    <p className="checkout-eyebrow">PLAYRIZE SHOP</p><h1>購入内容の確認</h1>
    <p>決済機能は準備中です。入力情報は送信・保存されません。</p>
    {state !== "ready" && <p role="status">{state === "loading" ? "最新の商品情報を取得しています…" : state === "invalid" ? "商品IDが無効です。商品詳細からお進みください。" : state === "missing" ? "商品が見つかりません。" : "商品情報を取得できませんでした。時間をおいて再読み込みしてください。"}</p>}
    {state === "ready" && <div className="checkout-grid">
      <section className="checkout-panel" aria-labelledby="checkout-product">
        <h2 id="checkout-product">ご注文の商品</h2>
        <div className="checkout-product"><img src={SHOP_API.replace("/api/products", "") + product.image_url} alt={product.name} /><div><h3>{product.name}</h3><p>商品ID：{id}</p><p>単価：{money(product.price)}</p></div></div>
        <div className="checkout-quantity"><label htmlFor="checkout-quantity">購入個数</label><input id="checkout-quantity" type="text" inputMode="numeric" pattern="[0-9]*" value={quantity} onChange={e => { if (/^[0-9]*$/.test(e.target.value)) setQuantity(e.target.value); }} aria-invalid={Boolean(error)} aria-describedby="checkout-stock checkout-error" /><p id="checkout-stock">在庫：{product.stock}個</p><p id="checkout-error" role="status" className="checkout-error">{error}</p></div>
        <div className="checkout-total"><span>合計金額</span><strong>{total !== null && Number.isSafeInteger(total) ? money(total) : "—"}</strong></div>
      </section>
      <section className="checkout-panel" aria-labelledby="checkout-buyer"><h2 id="checkout-buyer">購入者情報</h2>
        <form onSubmit={e => e.preventDefault()}>
          <label htmlFor="buyer-name">お名前</label><input id="buyer-name" autoComplete="name" maxLength={100} />
          <label htmlFor="buyer-email">メールアドレス</label><input id="buyer-email" type="email" autoComplete="email" maxLength={254} />
          <label htmlFor="buyer-phone">電話番号</label><input id="buyer-phone" type="tel" autoComplete="tel" maxLength={30} />
          <label htmlFor="buyer-postal">郵便番号</label><input id="buyer-postal" autoComplete="postal-code" maxLength={12} />
          <label htmlFor="buyer-address">お届け先住所</label><textarea id="buyer-address" autoComplete="street-address" rows={3} maxLength={500} />
          <button className="checkout-action" type="button" disabled>購入確定（準備中）</button>
        </form>
      </section>
    </div>}
  </main>;
}
