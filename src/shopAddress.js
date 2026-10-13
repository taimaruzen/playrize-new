export const PREFECTURES = "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県".split(" ");
export const emptyAddress = () => ({ postalCode: "", prefecture: "", city: "", street: "", building: "" });
export function validateAddress(a) {
  return {
    postalCode: /^[0-9]{7}$/.test(a.postalCode) ? "" : "郵便番号は数字7桁で入力してください。",
    prefecture: PREFECTURES.includes(a.prefecture) ? "" : "都道府県を選択してください。",
    city: a.city.trim() ? "" : "市区町村を入力してください。",
    street: a.street.trim() ? "" : "町名・丁目・番地を入力してください。"
  };
}
export function normalizeAddress(a) {
  return Object.fromEntries(Object.keys(emptyAddress()).map(key => [key, a[key].trim()]));
}
let dataset;
export async function lookupPostalAddress(code) {
  if (!/^[0-9]{7}$/.test(code)) return [];
  if (!dataset) dataset = fetch("/postal-addresses.json", { credentials: "omit" })
    .then(r => { if (!r.ok) throw new Error("dataset"); return r.json(); })
    .catch(() => { dataset = undefined; throw new Error("dataset"); });
  const data = await dataset;
  return data[code] || [];
}
