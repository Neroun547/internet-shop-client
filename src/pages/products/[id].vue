<template>
  <NavBar
    :max-price="maxPrice"
    :min-price="minPrice"
    :hide-search-bar="true"
    :hide-filters="true"
  />
  <Spinner v-if="loading" />
  <v-card class="w-75 d-block ma-auto mt-5" v-if="!loading">
    <div>
      <v-carousel v-model="model" hide-delimiter-background color="black">
        <v-carousel-item
          v-for="(item, i) in product.images"
          :key="i"
          :value="i"
        >
          <v-sheet height="100%">
            <div class="d-flex fill-height justify-center align-center">
              <v-img :src="API_URL + '/images/' + item" />
            </div>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </div>
    <v-card-title class="text-wrap">{{ product.name }}</v-card-title>
    <v-card-title>{{ product.price }}грн</v-card-title>
    <v-card-subtitle v-if="product.available" class="text-green mt-2 mb-2">
      Є в наявності
    </v-card-subtitle>
    <v-card-subtitle
      v-if="!product.available"
      class="text-red text-center mt-2 mb-2"
    >
      Немає в наявності
    </v-card-subtitle>
    <v-card-text>{{ product.description }}</v-card-text>
    <v-btn
      v-if="isProductInBasketState"
      class="w-90 d-block ma-auto mb-5 bg-grey-lighten-2"
      color="black"
      >Вже в кошику</v-btn
    >
    <v-btn
      v-if="!isProductInBasketState"
      class="bg-green w-90 d-block ma-auto mb-5"
      @click="addToBasket"
      >Додати в кошик</v-btn
    >
  </v-card>
</template>
<script setup>
import {API_URL} from "@/constants.js";
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import Spinner from "@/components/Spinner.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const product = ref({});
const model = ref(0);
const isProductInBasketState = ref(false);
const maxPrice = ref(0);
const minPrice = ref(0);
const loading = ref(true);

async function getMaxAndMinPrices() {
  minPrice.value = (await Api.get("/products/prices/min")).data.value;
  maxPrice.value = (await Api.get("/products/prices/max")).data.value;
}
function addToBasket() {
    const basket = localStorage.getItem("basket");

    if(basket) {
      const parsedBasket = JSON.parse(basket);

      parsedBasket.push(product.value);
      localStorage.setItem("basket", JSON.stringify(parsedBasket));
    } else {
      localStorage.setItem("basket", JSON.stringify([product.value]));
    }
    isProductInBasket();
}

function isProductInBasket() {
  const basket = localStorage.getItem("basket");

  if(!basket) return false;

  const parsedBasket = JSON.parse(basket);

  isProductInBasketState.value = parsedBasket.findIndex(el => el.id === product.value.id) !== -1;
}

onMounted(async () => {
    try {
      product.value = (await Api.get("/products/" + route.params.id)).data;
      
      isProductInBasket();
      await getMaxAndMinPrices();
      
      loading.value = false;
    } catch(e) {
      loading.value = false;
    }
});
</script>