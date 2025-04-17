<template>
  <v-app-bar class="bg-yellow-accent-4">
    <v-app-bar-nav-icon variant="text" @click="showSideNavBar = !showSideNavBar"></v-app-bar-nav-icon>

    <RouterLink to="/">
      <h2 class="logo">zolotar.shop</h2>
    </RouterLink>

    <form class="search-product-by-name-form pc" @submit="findProductByName" v-if="!hideSearchBar">
      <input type="text" placeholder="Пошук товару:" class="search-product-by-name-input" v-model="findProductOptions.name"/>
      <button type="submit">
        <v-icon
          color="white"
          icon="mdi-magnify"
          size="large"
        ></v-icon>
      </button>
    </form>
    <div class="ml-auto">
      <a href="https://www.facebook.com/zolotar.ua" target="_blank" class="mr-3">
        <v-icon icon="mdi-facebook"></v-icon>
      </a>
      <a href="https://www.instagram.com/zolotar_shop_ua/" target="_blank" class="mr-3">
        <v-icon icon="mdi-instagram"></v-icon>
      </a>
      <RouterLink to="/basket">
        <v-icon icon="mdi-basket" class="mr-5"></v-icon>
      </RouterLink>
    </div>
  </v-app-bar>
  <v-navigation-drawer
    v-model="showSideNavBar"
    class="bg-grey-lighten-5"
  >
    <form class="search-product-by-name-form mobile" @submit="findProductByName" v-if="!hideSearchBar">
      <input type="text" placeholder="Пошук товару:" class="search-product-by-name-input" v-model="findProductOptions.name"/>
      <button type="submit">
        <v-icon
          color="white"
          icon="mdi-magnify"
          size="large"
        ></v-icon>
      </button>
    </form>
    <v-list
    >
      <v-list-item v-for="item in sideNavBarItems" v-bind:key="item.id">
        <div v-if="item.type === 'LINK' && item.active" class="w-100 bg-grey-lighten-3">
          <a :href="item.value" v-if="item.value !== '/basket' && item.value !== '/articles' && item.value !== '/support'">{{item.title}}</a>
          <RouterLink :to="item.value" v-if="item.value === '/basket' || item.value === '/articles' || item.value === '/support'">{{item.title}}</RouterLink>
        </div>
        <div v-if="item.type === 'LINK' && !item.active">
          <a :href="item.value" v-if="item.value !== '/basket' && item.value !== '/articles' && item.value !== '/support'">{{item.title}}</a>
          <RouterLink :to="item.value" v-if="item.value === '/basket' || item.value === '/articles' || item.value === '/support'">{{item.title}}</RouterLink>
        </div>
        <v-form v-if="item.type === 'PRICE_FILTER' && !hideFilters" class="price-filter-form">
          <h3>Ціна:</h3>
          <div class="price-filter-form-inputs mt-5">
            <input type="number" placeholder="Від:" v-model="productsFiltersRangeInput[0]">
            <input type="number" placeholder="До:" v-model="productsFiltersRangeInput[1]">
          </div>
          <div class="ma-auto d-block w-90 mt-5">
            <v-range-slider
              v-model="productsFiltersRangeInput"
              class="price-filter-form-input-range"
              color="yellow-accent-4"
              step="10"
              :min="minPriceState"
              :max="maxPriceState"
            />
          </div>
          <h3>Статус:</h3>
          <v-select variant="outlined" :items="productsFiltersSelectStatus" v-model="productsFilters.status" class="mt-5"></v-select>
          <v-btn class="bg-green mt-5 font-size-12 d-block" @click="setFilters">Застосувати</v-btn>
        </v-form>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import Api from "@/lib/api.js";

export default {
  props: {
    hideSearchBar: {
      required: false,
      type: Boolean
    },
    hideFilters: {
      required: false,
      type: Boolean
    },
    minPrice: {
      required: true,
      type: Number
    },
    maxPrice: {
      required: true,
      type: Number
    },
    rubricId: {
      required: false,
      type: Number
    },
    typeId: {
      required: false,
      type: Number || String
    }
  },
  data() {
    return {
      showSideNavBar: true,
      sideNavBarItems: [],
      productsFiltersSelectStatus: [
        { title: "Всі", value: "all" },
        { title: "Є в наявності", value: "available" },
        { title: "Немає в наявності", value: "not_available" },
      ],
      productsFiltersRangeInput: [],
      minPriceState: 0,
      maxPriceState: 0,
      productsFilters: {
        priceFrom: 0,
        priceTo: 0,
        status: "all"
      },
      findProductOptions: {
        name: ""
      }
    }
  },
  methods: {
    findProductByName(e) {
      e.preventDefault();
      this.$emit("find-product", this.findProductOptions);

      const indexActiveLink = this.sideNavBarItems.findIndex(item => item.active === true);

      if(indexActiveLink !== -1) {
        this.sideNavBarItems[indexActiveLink].active = false;
      }
    },
    setFilters() {
      this.productsFilters.priceFrom = this.productsFiltersRangeInput[0];
      this.productsFilters.priceTo = this.productsFiltersRangeInput[1];

      this.$emit("set-filters", this.productsFilters);
    },
    async getNavBarItems(rubricId) {
      let parsedItems;

      if(rubricId) {
        const rubricTypes = (await Api.get("/rubrics/rubrics-types/" + rubricId)).data;
        parsedItems = rubricTypes.map(rubricType => ({
          title: rubricType.name,
          value: `/products/by-type/${rubricType.id}/?rubricId=${rubricId}`,
          type: "LINK",
          id: rubricType.id,
          active: this.typeId ? rubricType.id === Number(this.typeId) : false
        }));
      } else {
        const rubrics = (await Api.get("/rubrics")).data;
        parsedItems = rubrics.map(rubric => ({
          title: rubric.name,
          value: `/products/by-rubrics/${rubric.id}`,
          type: "LINK",
          id: rubric.id
        }));
      }

      this.sideNavBarItems = [
        { title: "Головна", value: "/", type: "LINK", id: Date.now() },
        ...parsedItems,
      ];

      if(!this.hideFilters) {
        this.sideNavBarItems.push({ type: "PRICE_FILTER" });
      }
      this.sideNavBarItems.push(
        { title: "Кошик", value: "/basket", type: "LINK", id: Date.now() + 1 },
        { title: "Статті", value: "/articles", type: "LINK", id: Date.now() + 2 },
        { title: "Галерея", value: "/video-photo-gallery", type: "LINK", id: Date.now() + 2 }
      )

      this.productsFiltersRangeInput[0] = this.minPriceState;
      this.productsFiltersRangeInput[1]  = this.maxPriceState;
    }
  },
  watch: {
    minPrice: function (newVal) {
      this.minPriceState = newVal
      this.productsFiltersRangeInput[0] = this.minPriceState;
    },
    maxPrice: function (newVal) {
      this.maxPriceState = newVal
      this.productsFiltersRangeInput[1]  = this.maxPriceState;
    },
    rubricId: function (newVal) {
      this.getNavBarItems(newVal);
    },
    typeId: function () {
      this.getNavBarItems(this.rubricId);
    }
  },
  async mounted() {
    await this.getNavBarItems(this.rubricId);
  }
}
</script>
<style scoped>
  .mobile {
    display: none !important;
  }
  .search-product-by-name-form {
    width: 50%;
    display: flex;
    margin: 0 auto;
    justify-content: center;
  }
  .search-product-by-name-input {
    background-color: #fff;
    color: #000;
    outline: none;
    width: 70%;
  }
  .price-filter-form-inputs {
    width: 90%;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }
  .price-filter-form-inputs input {
    width: 40%;
  }
  .search-product-by-name-form button {
    background-color: #000;
    border-radius: 5px;
    margin-left: 10px;
  }
  @media screen and (max-width: 992px) {
    .logo {
      font-size: 14px;
    }
    .search-product-by-name-form {
      font-size: 14px;
    }
    .search-product-by-name-input {
      width: 60%;
      font-size: 12px;
    }
    .search-product-by-name-form button {
      font-size: 12px;
      padding: 2px;
    }
    .pc {
      display: none;
    }
    .mobile {
      display: block !important;
    }
    .search-product-by-name-form {
      width: 90%;
    }
    .search-product-by-name-form input {
      width: 70%;
      border-bottom: 1px solid #000;
      margin-top: 20px;
      font-size: 14px;
    }
  }
</style>
