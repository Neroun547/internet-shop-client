<template>
  <NavBar
    :min-price="minPrice"
    :max-price="maxPrice"
    :rubric-id="rubricId"
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
  />
  <Spinner v-if="loading" />
  <div class="wrapper__products" v-if="!loading">
    <div v-if="!products.length">
      <h2 class="text-center">За вашим запитом товарів не знайдено :(</h2>
    </div>
    <ProductsCards
      :products="products"
      :rubric-id="rubricId"
      :filters="filters"
    />
  </div>
</template>
<script setup>
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import ProductsCards from "@/components/ProductsCards.vue";
import Spinner from "@/components/Spinner.vue";
import { isProductsInBasket } from "@/utils/is-products-in-basket.js";

const route = useRoute();

const products = ref([]);
const minPrice = ref(0);
const maxPrice = ref(0);
const rubricId = ref(null);
const filters = ref(null);
const loading = ref(true);

async function getData(rubricIdArg) {
  const data = (await Api.get("/products/by-rubrics/" + rubricIdArg)).data;

  products.value = isProductsInBasket(data.products);
  minPrice.value = data.minPrice;
  maxPrice.value = data.maxPrice;
  rubricId.value = rubricIdArg;
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
  url += "&rubricId=" + rubricId.value;

  products.value = isProductsInBasket((await Api.get(url)).data);
}
async function findProductByName(findOptions) {
  const data = (await Api.get("/products/by-name/?name=" + findOptions.name))
    .data;

  minPrice.value = data.minPrice;
  maxPrice.value = data.maxPrice;
  products.value = isProductsInBasket(data.products);

  if (!filters.value) {
    filters.value = { name: findOptions.name };
  } else {
    filters.value.name = findOptions.name;
  }
}

onMounted(async () => {
  try {
    await getData(route.params.id);

    loading.value = false;
  } catch {
    loading.value = false;
  }
});

watch(
  () => route.params.id,
  () => {
    getData(route.params.id);
  },
);
</script>
