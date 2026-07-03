<template>
  <NavBar
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
    :min-price="minPrice"
    :max-price="maxPrice"
  />
  <Spinner v-if="loading" />

  <div class="wrapper__products" v-if="!loading">
    <div v-if="!products.length">
      <h2 class="text-center">За вашим запитом товарів не знайдено :(</h2>
    </div>
    <!-- rubricId must be 0 -->
    <ProductsCards :products="products" :rubric-id="0" :filters="filters" />
  </div>
</template>
<script setup>
import Api from "@/lib/api.js";
import ProductsCards from "@/components/ProductsCards.vue";
import NavBar from "@/components/NavBar.vue";
import Spinner from "@/components/Spinner.vue";
import { isProductsInBasket } from "@/utils/is-products-in-basket.js";

const products = ref([]);
const minPrice = ref(0);
const maxPrice = ref(0);
const filters = ref(null);
const loading = ref(true);

async function getMaxAndMinPrices() {
  minPrice.value = (await Api.get("/products/prices/min")).data.value;
  maxPrice.value = (await Api.get("/products/prices/max")).data.value;
}
async function findProductByName(findOptions) {
  const data = (await Api.get("/products/by-name/?name=" + findOptions.name))
    .data;

  products.value = isProductsInBasket(data.products);
  minPrice.value = data.minPrice;
  maxPrice.value = data.maxPrice;

  if (!filters.value) {
    filters.value = { name: findOptions.name };
  } else {
    filters.value.name = findOptions.name;
  }
}
async function changeFilters(data) {
  let url = `/products/by-filters/`;

  filters.value = data;

  if (data.status) {
    url += "?available=" + data.status;
  }
  if (data.priceFrom) {
    url += "&priceFrom=" + data.priceFrom;
  }
  if (data.priceTo) {
    url += "&priceTo=" + data.priceTo;
  }
  products.value = isProductsInBasket((await Api.get(url)).data);
}
async function getProducts() {
  products.value = isProductsInBasket((await Api.get("/products")).data);
}

onMounted(async () => {
  try {
    await getProducts();
    await getMaxAndMinPrices();

    loading.value = false;
  } catch {
    loading.value = false;
  }
});
</script>
<style></style>
