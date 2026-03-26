export const priceService = {
  getPrices: () => JSON.parse(localStorage.getItem('mp_prices')) || { "쌀": 300 },
  savePrices: (prices) => localStorage.setItem('mp_prices', JSON.stringify(prices))
};