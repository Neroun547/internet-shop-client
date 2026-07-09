// Just store with native browser localStorage

const LOCALSTORAGE_ITEM_BASKET_NAME = "basket";

function addProductToBasketStore(product) {
  const basket = getBasketFromStore();

  if (basket) {
    basket.push(product);
    setProductsToBasketStore(JSON.stringify(basket));
  } else {
    setProductsToBasketStore(JSON.stringify([product]));
  }
}

function isProductsInBasket(products) {
  const basket = getBasketFromStore();

  if(basket) {
    return products.map(product => {
      if(basket.find(el => el.id === product.id)) {
        return { ...product, inBasket: true };
      }
      return { ...product, inBasket: false };
    });
  } else {
    return products;
  }
}

function getBasketFromStore() {
    const data = localStorage.getItem(LOCALSTORAGE_ITEM_BASKET_NAME);

    try {
        return JSON.parse(data);
    } catch(err) {
        return [];
    }
}

function findProductInBasket(productId) {
    const basket = getBasketFromStore();

    return basket.find(product => product.id === productId);
}

function clearBasket() {
    localStorage.setItem(LOCALSTORAGE_ITEM_BASKET_NAME, "");
}

function setProductsToBasketStore(products) {
    if(typeof products === "string") {
        localStorage.setItem(LOCALSTORAGE_ITEM_BASKET_NAME, products);
    } else {
        localStorage.setItem(LOCALSTORAGE_ITEM_BASKET_NAME, JSON.stringify(products));
    }
}

export {
    addProductToBasketStore,
    setProductsToBasketStore,
    getBasketFromStore,
    clearBasket,
    findProductInBasket,
    isProductsInBasket
}
