export function isProductsInBasket(products) {
  const basket = localStorage.getItem("basket");

  if(basket) {
    const parsedBasket = JSON.parse(basket);

    return products.map(product => {
      if(parsedBasket.find(el => el.id === product.id)) {
        return { ...product, inBasket: true };
      }
      return { ...product, inBasket: false };
    });
  } else {
    return products;
  }
}
