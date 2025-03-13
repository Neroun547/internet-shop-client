<template>
  <NavBar
    v-on:set-filters="changeFilters"
    v-on:find-product="findProductByName"
    :min-price="minPrice"
    :max-price="maxPrice"
    :rubric-id="rubricIdState"
    :type-id="typeId"
  />
  <Spinner v-if="loading"/>
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
<script>
import NavBar from "@/components/NavBar.vue";
import ProductsCards from "@/components/ProductsCards.vue";
import Api from "@/lib/api.js";
import Spinner from "@/components/Spinner.vue";
import {isProductsInBasket} from "@/utils/is-products-in-basket.js";

export default {
  components: {Spinner, NavBar, ProductsCards },
  created() {
    this.$watch(
      () => this.$route.params.id,
      (newId) => {
        this.getProductsByTypeId(newId);
        this.rubricIdState = this.$route.query["rubricId"];
        this.typeId = newId;
      }
    )
  },
  data() {
    return {
      products: [],
      minPrice: 0,
      maxPrice: 0,
      rubricIdState: null,
      typeId: null,
      filters: null,
      loading: true
    }
  },
  methods: {
    async getProductsByTypeId(typeId) {
      const data = (await Api.get(`/products/by-type/${typeId}`)).data;

      this.minPrice = data.minPrice;
      this.maxPrice = data.maxPrice;
      this.products = isProductsInBasket(data.products);
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
      url += "&rubricId=" + this.rubricIdState;
      url += "&type=" + this.typeId;

      this.products = isProductsInBasket((await Api.get(url)).data);
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

  },
  async mounted() {
    try {
      this.rubricIdState = this.$route.query["rubricId"];
      this.typeId = this.$route.params.id;
      await this.getProductsByTypeId(this.$route.params.id);

      this.loading = false;
    } catch {
      this.loading = false;
    }
  }
}
</script>
