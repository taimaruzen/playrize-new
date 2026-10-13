export function quantityError(value, stock) {
  if (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) return "購入個数は1以上の整数で入力してください。";
  if (Number(value) > stock) return "在庫は" + stock + "個です。購入個数を減らしてください。";
  return "";
}
