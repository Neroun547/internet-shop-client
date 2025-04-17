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
      <v-card
        max-width="344"
        class="bg-grey-lighten-5 mx-auto"
      >
        <RouterLink :to="'/products/' + product.id">
          <v-img
            height="200px"
            :src="api_url + '/images/' + product.file_name"
            style="object-fit: contain !important;"
          />

          <v-card-title class="text-center text-wrap">
            {{ product.name }}
          </v-card-title>

          <v-card-subtitle class="text-center">
            {{ product.type }}
          </v-card-subtitle>

          <v-card-subtitle v-if="product.available" class="text-green text-center mt-2 mb-2">
            Є в наявності
          </v-card-subtitle>
          <v-card-subtitle v-if="!product.available" class="text-red text-center mt-2 mb-2">
            Немає в наявності
          </v-card-subtitle>
          <v-card-title class="text-center ">
            {{product.price}}грн
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
            <v-icon
              icon="mdi-basket"
              class="ml-2"
            />
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
  <div
    ref="sentinel"
    class="observer"
  />
</template>
<script>
import {API_URL} from "@/constants.js";
import Api from "@/lib/api.js";

export default {
  props: {
    products: Array,
    rubricId: {
      required: false,
      type: Number
    },
    typeId: {
      required: false,
      type: Number || String
    },
    filters: {
      required: false,
      type: Object
    }
  },
  data() {
    return {
      productsState: [],
      loadMoreProductsOptions: {
        take: 16,
        skip: 16
      }
    }
  },
  mounted() {
    this.createObserver();
    this.productsState = this.products;
  },
  methods: {
    addProductToBasket(product) {
      const basket = localStorage.getItem("basket");

      if(basket) {
        const newBasket = JSON.parse(basket);
        newBasket.push(product);
        localStorage.setItem("basket", JSON.stringify(newBasket));
      } else {
        localStorage.setItem("basket", JSON.stringify([product]));
      }
      const index = this.productsState.findIndex(el => el.id === product.id);
      this.productsState[index] = { ...this.productsState[index], inBasket: true };
    },
    async loadMoreProducts() {
      if(this.rubricId !== 0 && !this.rubricId) return;

      const basket = localStorage.getItem("basket");
      let parsedBasket;
      let url = `/products/load-more?skip=${this.loadMoreProductsOptions.skip}&take=${this.loadMoreProductsOptions.take}`;

      if(this.rubricId) {
        url += "&rubricId=" + this.rubricId;
      }
      if(this.typeId) {
        url += "&type=" + this.typeId;
      }
      if(this.filters && Object.keys(this.filters).length) {
        if(this.filters.status) {
          url += "&available=" + this.filters.status;
        }
        if(this.filters.priceFrom) {
          url += "&priceFrom=" + this.filters.priceFrom;
        }
        if(this.filters.priceTo) {
          url += "&priceTo=" + this.filters.priceTo;
        }
        if(this.filters.name) {
          url += "&name=" + this.filters.name;
        }
      }
      if(basket) {
        parsedBasket = JSON.parse(basket);
        const data = (await Api.get(url)).data;

        this.productsState.push(...data.map(product => {
          if(parsedBasket.find(el => el.id === product.id)) {
            return { ...product, inBasket: true };
          }
          return { ...product, inBasket: false };
        }))
      } else {
        const data = (await Api.get(url)).data;
        this.productsState.push(...data);
      }
      this.loadMoreProductsOptions.skip += 16;
    },
    createObserver() {
      const options = { threshold: 1.0 };
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.loadMoreProducts();
        }
      }, options);
      observer.observe(this.$refs.sentinel);
    },
  },
  computed: {
    api_url: {
      get() {
        return API_URL;
      }
    }
  },
  watch: {
    products: function (value) {
      this.productsState = value;
      this.loadMoreProductsOptions.skip = 16;
    }
  }
}
</script>
