import { useEffect, useRef, useState } from "react";
import { PREFECTURES, validateAddress, normalizeAddress, lookupPostalAddress } from "./shopAddress.js";

export default function ShopAddressForm({ address, onChange }) {
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [choices, setChoices] = useState([]);
  const [confirmed, setConfirmed] = useState(null);
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);
  const errors = validateAddress(address);
  const edit = (key, value) => {
    request.current++;
    setBusy(false);
    setStatus("");
    setChoices([]);
    setConfirmed(null);
    onChange({ ...address, [key]: value });
  };
  const apply = row => {
    onChange({ ...address, prefecture: row[0], city: row[1], street: row[2] });
    setConfirmed(null); setChoices([]);
    setStatus("住所を入力しました。丁目・番地を確認・追記してください。");
  };
  const lookup = async () => {
    setTouched(t => ({ ...t, postalCode: true }));
    if (errors.postalCode) return;
    const version = ++request.current;
    setBusy(true); setStatus(""); setChoices([]);
    try {
      const rows = await lookupPostalAddress(address.postalCode);
      if (version !== request.current) return;
      if (!rows.length) setStatus("該当する住所がありません。手動で入力してください。");
      else if (rows.length === 1) apply(rows[0]);
      else { setChoices(rows); setStatus("該当する住所を選択してください。"); }
    } catch { if (version === request.current) setStatus("住所検索に失敗しました。手動で入力できます。"); }
    finally { if (version === request.current) setBusy(false); }
  };
  const fields = [
    ["postalCode", "郵便番号", "5000000", "postal-code", 7],
    ["prefecture", "都道府県", "", "address-level1", 20],
    ["city", "市区町村", "岐阜市", "address-level2", 100],
    ["street", "町名・丁目・番地", "○○町1丁目2-3", "address-line1", 200],
    ["building", "建物名・部屋番号", "PLAYRIZEマンション 101号室", "address-line2", 200]
  ];
  return <fieldset className="checkout-address">
    <legend>お届け先住所</legend>
    <div className="checkout-address-grid">{fields.map(([key, label, placeholder, autocomplete, maxLength]) => {
      const error = touched[key] && errors[key];
      const props = { id: "address-" + key, name: key, value: address[key], required: key !== "building", autoComplete: autocomplete,
        onBlur: () => setTouched(t => ({ ...t, [key]: true })), "aria-invalid": Boolean(error),
        "aria-describedby": error ? "address-" + key + "-error" : undefined,
        onChange: e => { if (key !== "postalCode" || /^[0-9]{0,7}$/.test(e.target.value)) edit(key, e.target.value); } };
      return <div key={key} className={"address-field address-field-" + key}>
        <label htmlFor={props.id}>{label}<span className="address-required">{key === "building" ? "任意" : "必須"}</span></label>
        {key === "prefecture" ? <select {...props}><option value="">選択してください</option>{PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}</select> :
          <input {...props} type="text" inputMode={key === "postalCode" ? "numeric" : undefined} pattern={key === "postalCode" ? "[0-9]{7}" : undefined} maxLength={maxLength} placeholder={placeholder} />}
        {error && <p className="checkout-error" id={"address-" + key + "-error"}>{error}</p>}
        {key === "postalCode" && <><button className="address-lookup" type="button" onClick={lookup} disabled={busy}>{busy ? "検索中…" : "郵便番号から住所を入力"}</button><p role="status">{status}</p></>}
      </div>;
    })}</div>
    {choices.length > 0 && <div className="address-choices">{choices.map((row, i) => <button type="button" className="address-lookup" key={i} onClick={() => apply(row)}>{row.join(" ")}</button>)}</div>}
    <p className="address-help">自動入力後も修正できます。検索結果で住所欄が置き換わるため、建物名・部屋番号は別欄に入力してください。</p>
    <button type="button" className="address-lookup" onClick={() => {
      setTouched({ postalCode: true, prefecture: true, city: true, street: true });
      if (Object.values(errors).some(Boolean)) { document.getElementById("address-" + Object.keys(errors).find(k => errors[k]))?.focus(); return; }
      setConfirmed(normalizeAddress(address));
    }}>入力した住所を確認</button>
    {confirmed && <section className="address-confirmation" aria-label="お届け先住所の確認" aria-live="polite"><h3>お届け先住所の確認</h3><p>〒{confirmed.postalCode}</p><p>{confirmed.prefecture} {confirmed.city}</p><p>{confirmed.street}</p>{confirmed.building && <p>{confirmed.building}</p>}<p>この住所での注文はまだ確定していません。</p></section>}
    <p className="address-help">郵便番号データ：<a href="https://www.post.japanpost.jp/service/search/zipcode/download/utf-zip.html" target="_blank" rel="noreferrer">日本郵便</a></p>
  </fieldset>;
}
