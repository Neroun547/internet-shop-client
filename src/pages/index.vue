<template>
  <NavBar
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
    :min-price="minPrice"
    :max-price="maxPrice"
  />
  <Spinner v-if="loading"/>

  <div class="wrapper__products" v-if="!loading">
    <div v-if="!products.length">
      <h2 class="text-center">За вашим запитом товарів не знайдено :(</h2>
    </div>
    <!-- rubricId must be 0 -->
    <ProductsCards
      :products="products"
      :rubric-id="0"
      :filters="filters"
    />
  </div>
</template>
<script>
  import Api from "@/lib/api.js";
  import {API_URL} from "@/constants.js";
  import ProductsCards from "@/components/ProductsCards.vue";
  import NavBar from "@/components/NavBar.vue";
  import Spinner from "@/components/Spinner.vue";
  import {isProductsInBasket} from "@/utils/is-products-in-basket.js";

  export default {
    components: {Spinner, NavBar, ProductsCards},
    data() {
      return {
        products: [],
        minPrice: 0,
        maxPrice: 0,
        filters: null,
        loading: true
      }
    },
    computed: {
      api_url: {
        get() {
          return API_URL;
        }
      }
    },
    async mounted() {
      try {
        await this.getProducts();
        await this.getMaxAndMinPrices();
        this.loading = false;
      } catch {
        this.loading = false;
      }
    },
    methods: {
      async getMaxAndMinPrices() {
        this.minPrice = (await Api.get("/products/prices/min")).data.value;
        this.maxPrice = (await Api.get("/products/prices/max")).data.value;
      },
      async findProductByName(findOptions) {
        const data = (await Api.get("/products/by-name/?name=" + findOptions.name)).data;

        this.products = isProductsInBasket(data.products);
        this.minPrice = data.minPrice;
        this.maxPrice = data.maxPrice;

        if(!this.filters) {
          this.filters = { name: findOptions.name };
        } else {
          this.filters.name = findOptions.name;
        }
      },
      async changeFilters(data) {
        let url = `/products/by-filters/`;

        this.filters = data;

        if(data.status) {
          url += "?available=" + data.status;
        }
        if(data.priceFrom) {
          url += "&priceFrom=" + data.priceFrom;
        }
        if(data.priceTo) {
          url += "&priceTo=" + data.priceTo;
        }
        this.products = isProductsInBasket((await Api.get(url)).data);
      },
      async getProducts() {
        this.products = isProductsInBasket((await Api.get("/products")).data);
      }
    }
  }
</script>
<style>

</style>
