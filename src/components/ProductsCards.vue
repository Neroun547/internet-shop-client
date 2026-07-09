<template>
  <v-row v-if="productsState.length">
    <v-col
      v-for="product in productsState"
      :key="product.id"
      cols="12"
      sm="12"
      md="6"
      lg="3"
    >
      <v-card max-width="344" class="bg-grey-lighten-5 mx-auto product-card">
        <RouterLink :to="'/products/' + product.id">
          <v-img
            height="200px"
            :src="API_URL + '/images/' + product.file_name"
            style="object-fit: contain !important"
          />

          <v-card-title class="text-center text-wrap">
            {{ product.name }}
          </v-card-title>

          <v-card-subtitle class="text-center">
            {{ product.type }}
          </v-card-subtitle>

          <v-card-subtitle
            v-if="product.available"
            class="text-green text-center mt-2 mb-2"
          >
            Є в наявності
          </v-card-subtitle>
          <v-card-subtitle
            v-if="!product.available"
            class="text-red text-center mt-2 mb-2"
          >
            Немає в наявності
          </v-card-subtitle>
          <v-card-title class="text-center">
            {{ product.price }}грн
          </v-card-title>
          <v-card-subtitle v-if="!product.partner" class="text-center">
            Товар від Zolotar
          </v-card-subtitle>
          <v-card-subtitle v-if="product.partner" class="text-center">
            Товар від партнера Zolotar
          </v-card-subtitle>
        </RouterLink>
        <v-card-actions>
          <v-btn
            v-if="!product.inBasket"
            class="w-100 bg-green"
            color="white"
            @click="addProductToBasket(product)"
          >
            Додати в кошик
            <v-icon icon="mdi-basket" class="ml-2" />
          </v-btn>
          <v-btn
            v-if="product.inBasket"
            class="w-100 bg-grey-lighten-2"
            color="black"
          >
            Вже в кошику
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <div ref="sentinel" class="observer" />
</template>
<script setup>
import { API_URL } from "@/constants.js";
import Api from "@/lib/api.js";
import { isAlreadyAllLoaded } from "@/utils/is-already-all-loaded";
import { addProductToBasketStore, getBasketFromStore } from "@/stores/basket";

const sentinelRef = useTemplateRef("sentinel");

const props = defineProps(["products", "rubricId", "typeId", "filters"]);

const productsState = ref([]);
const loadMoreProductsOptions = ref({
  take: 16,
  skip: 16,
  alreadyAllLoaded: false,
});

function addProductToBasket(product) {
  addProductToBasketStore(product);

  const index = productsState.value.findIndex((el) => el.id === product.id);
  productsState.value[index] = {
    ...productsState.value[index],
    inBasket: true,
  };
}

async function loadMoreProducts() {
  if (loadMoreProductsOptions.value.alreadyAllLoaded) return;
  if (props.rubricId !== 0 && !props.rubricId) return;

  const basket = getBasketFromStore();

  let url = `/products/load-more?skip=${loadMoreProductsOptions.value.skip}&take=${loadMoreProductsOptions.value.take}`;

  if (props.rubricId) {
    url += "&rubricId=" + props.rubricId;
  }
  if (props.typeId) {
    url += "&type=" + props.typeId;
  }
  if (props.filters && Object.keys(props.filters).length) {
    if (props.filters.status) {
      url += "&available=" + props.filters.status;
    }
    if (props.filters.priceFrom) {
      url += "&priceFrom=" + props.filters.priceFrom;
    }
    if (props.filters.priceTo) {
      url += "&priceTo=" + props.filters.priceTo;
    }
    if (props.filters.name) {
      url += "&name=" + props.filters.name;
    }
  }
  if (basket) {
    const apiResponse = await Api.get(url);

    loadMoreProductsOptions.value.alreadyAllLoaded = isAlreadyAllLoaded(
      apiResponse,
      loadMoreProductsOptions.value.take,
    );

    if (apiResponse && Array.isArray(apiResponse.data)) {
      productsState.value.push(
        ...apiResponse.data.map((product) => {
          if (basket.find((el) => el.id === product.id)) {
            return { ...product, inBasket: true };
          }
          return { ...product, inBasket: false };
        }),
      );
    }
  } else {
    const apiResponse = await Api.get(url);

    loadMoreProductsOptions.value.alreadyAllLoaded = isAlreadyAllLoaded(
      apiResponse,
      loadMoreProductsOptions.value.take,
    );

    if (apiResponse && Array.isArray(apiResponse.data)) {
      productsState.value.push(...apiResponse.data);
    }
  }
  loadMoreProductsOptions.value.skip += 16;
}

function createObserver() {
  const options = { threshold: 1.0 };
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMoreProducts();
    }
  }, options);
  observer.observe(sentinelRef.value);
}

onMounted(() => {
  createObserver();
  productsState.value = props.products;
});

watch(
  () => props.products,
  () => {
    productsState.value = props.products;
    loadMoreProductsOptions.value.skip = 16;
    loadMoreProductsOptions.value.alreadyAllLoaded = false;
  },
);
</script>
<style scoped>
.product-card {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  justify-content: space-between !important;
}
</style>
