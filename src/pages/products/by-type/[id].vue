<template>
  <NavBar
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
    :min-price="minPrice"
    :max-price="maxPrice"
    :rubric-id="rubricIdState"
    :type-id="typeId"
  />
  <Spinner v-if="loading" />
  <div class="wrapper__products" v-if="!loading">
    <div v-if="!products.length">
      <h2 class="text-center">За вашим запитом товарів не знайдено :(</h2>
    </div>
    <ProductsCards
      :products="products"
      :rubric-id="rubricIdState"
      :type-id="typeId"
      :filters="filters"
    />
  </div>
</template>
<script setup>
import NavBar from "@/components/NavBar.vue";
import ProductsCards from "@/components/ProductsCards.vue";
import Api from "@/lib/api.js";
import Spinner from "@/components/Spinner.vue";
import { isProductsInBasket } from "@/stores/basket";
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const products = ref([]);
const minPrice = ref(0);
const maxPrice = ref(0);
const rubricIdState = ref(null);
const typeId = ref(null);
const filters = ref(null);
const loading = ref(true);

async function getProductsByTypeId(typeId) {
  const data = (await Api.get(`/products/by-type/${typeId}`)).data;

  minPrice.value = data.minPrice;
  maxPrice.value = data.maxPrice;
  products.value = isProductsInBasket(data.products);
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
  url += "&rubricId=" + rubricIdState.value;
  url += "&type=" + typeId.value;

  products.value = isProductsInBasket((await Api.get(url)).data);
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

onMounted(async () => {
  try {
    rubricIdState.value = route.query["rubricId"];
    typeId.value = route.params.id;

    await getProductsByTypeId(route.params.id);

    loading.value = false;
  } catch {
    loading.value = false;
  }
});

watch(
  () => route.params.id,
  (newId) => {
    getProductsByTypeId(newId);
    rubricIdState.value = route.query["rubricId"];
    typeId.value = newId;
  },
);
</script>
