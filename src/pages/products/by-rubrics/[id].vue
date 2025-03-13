<template>
  <NavBar
    :min-price="minPrice"
    :max-price="maxPrice"
    :rubric-id="rubricId"
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
  />
  <Spinner v-if="loading"/>
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
<script>
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import ProductsCards from "@/components/ProductsCards.vue";
import Spinner from "@/components/Spinner.vue";
import {isProductsInBasket} from "@/utils/is-products-in-basket.js";

export default {
  components: {Spinner, ProductsCards, NavBar},
  data() {
    return {
      products: [],
      minPrice: 0,
      maxPrice: 0,
      rubricId: null,
      filters: null,
      loading: true
    }
  },
  methods: {
    async getData(rubricId) {
      const data = (await Api.get("/products/by-rubrics/" + rubricId)).data;

      this.products = isProductsInBasket(data.products);
      this.minPrice = data.minPrice;
      this.maxPrice = data.maxPrice;
      this.rubricId = rubricId;
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
      url += "&rubricId=" + this.rubricId;

      this.products = isProductsInBasket((await Api.get(url)).data);
    },
    async findProductByName(findOptions) {
      const data = (await Api.get("/products/by-name/?name=" + findOptions.name)).data;

      this.minPrice = data.minPrice;
      this.maxPrice = data.maxPrice;
      this.products = isProductsInBasket(data.products);

      if(!this.filters) {
        this.filters = { name: findOptions.name };
      } else {
        this.filters.name = findOptions.name;
      }
    },
  },
  async mounted() {
    try {
      await this.getData(this.$route.params.id);

      this.loading = false;
    } catch {
      this.loading = false;
    }
  },
  created() {
    this.$watch(
      () => this.$route.params.id,
      (newId) => {
        this.getData(newId);
      }
    )
  },
}
</script>
