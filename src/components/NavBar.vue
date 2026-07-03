<template>
  <v-app-bar class="bg-yellow-accent-4">
    <v-app-bar-nav-icon
      variant="text"
      @click="showSideNavBar = !showSideNavBar"
    ></v-app-bar-nav-icon>

    <RouterLink to="/">
      <h2 class="logo">zolotar.shop</h2>
    </RouterLink>

    <form
      class="search-product-by-name-form pc"
      @submit="findProductByName"
      v-if="!hideSearchBar"
    >
      <input
        type="text"
        placeholder="Пошук товару:"
        class="search-product-by-name-input"
        v-model="findProductOptions.name"
      />
      <button type="submit">
        <v-icon color="white" icon="mdi-magnify" size="large"></v-icon>
      </button>
    </form>
    <div class="ml-auto">
      <a
        href="https://www.facebook.com/zolotar.ua"
        target="_blank"
        class="mr-3"
      >
        <v-icon icon="mdi-facebook"></v-icon>
      </a>
      <a
        href="https://www.instagram.com/zolotar_shop_ua/"
        target="_blank"
        class="mr-3"
      >
        <v-icon icon="mdi-instagram"></v-icon>
      </a>
      <RouterLink to="/basket">
        <v-icon icon="mdi-basket" class="mr-5"></v-icon>
      </RouterLink>
    </div>
  </v-app-bar>
  <v-navigation-drawer v-model="showSideNavBar" class="bg-grey-lighten-5">
    <form
      class="search-product-by-name-form mobile"
      @submit="findProductByName"
      v-if="!hideSearchBar"
    >
      <input
        type="text"
        placeholder="Пошук товару:"
        class="search-product-by-name-input"
        v-model="findProductOptions.name"
      />
      <button type="submit">
        <v-icon color="white" icon="mdi-magnify" size="large"></v-icon>
      </button>
    </form>
    <v-list>
      <v-list-item v-for="item in sideNavBarItems" v-bind:key="item.id">
        <div
          v-if="item.type === 'LINK' && item.active"
          class="w-100 bg-grey-lighten-3"
        >
          <RouterLink :to="item.value">{{ item.title }}</RouterLink>
        </div>
        <div v-if="item.type === 'LINK' && !item.active">
          <RouterLink :to="item.value">{{ item.title }}</RouterLink>
        </div>
        <v-form
          v-if="item.type === 'PRICE_FILTER' && !props.hideFilters"
          class="price-filter-form"
        >
          <h3>Ціна:</h3>
          <div class="price-filter-form-inputs mt-5">
            <input
              type="number"
              placeholder="Від:"
              v-model="productsFiltersRangeInput[0]"
            />
            <input
              type="number"
              placeholder="До:"
              v-model="productsFiltersRangeInput[1]"
            />
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
          <v-select
            variant="outlined"
            :items="productsFiltersSelectStatus"
            v-model="productsFilters.status"
            class="mt-5"
          ></v-select>
          <v-btn
            class="bg-green mt-5 font-size-12 d-block mb-2"
            @click="setFilters"
            >Застосувати</v-btn
          >
        </v-form>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup>
import Api from "@/lib/api.js";

const emits = defineEmits(["find-product", "set-filters"]);

const props = defineProps([
  "hideSearchBar",
  "hideFilters",
  "minPrice",
  "maxPrice",
  "rubricId",
  "typeId",
]);

const showSideNavBar = ref(true);
const sideNavBarItems = ref([]);
const productsFiltersSelectStatus = ref([
  { title: "Всі", value: "all" },
  { title: "Є в наявності", value: "available" },
  { title: "Немає в наявності", value: "not_available" },
]);

const productsFiltersRangeInput = ref([]);
const minPriceState = ref(0);
const maxPriceState = ref(0);
const productsFilters = ref({
  priceFrom: 0,
  priceTo: 0,
  status: "all",
});
const findProductOptions = ref({
  name: "",
});

function findProductByName(e) {
  e.preventDefault();

  emits("find-product", findProductOptions.value);

  const indexActiveLink = sideNavBarItems.value.findIndex(
    (item) => item.active === true,
  );

  if (indexActiveLink !== -1) {
    sideNavBarItems.value[indexActiveLink].active = false;
  }
}

function setFilters() {
  productsFilters.value.priceFrom = productsFiltersRangeInput.value[0];
  productsFilters.value.priceTo = productsFiltersRangeInput.value[1];

  emits("set-filters", productsFilters.value);
}

async function getNavBarItems(rubricId) {
  let parsedItems;

  if (rubricId) {
    const rubricTypes = (await Api.get("/rubrics/rubrics-types/" + rubricId))
      .data;
    parsedItems = rubricTypes.map((rubricType) => ({
      title: rubricType.name,
      value: `/products/by-type/${rubricType.id}/?rubricId=${rubricId}`,
      type: "LINK",
      id: rubricType.id,
      active: props.typeId ? rubricType.id === Number(props.typeId) : false,
    }));
  } else {
    const rubrics = (await Api.get("/rubrics")).data;
    parsedItems = rubrics.map((rubric) => ({
      title: rubric.name,
      value: `/products/by-rubrics/${rubric.id}`,
      type: "LINK",
      id: rubric.id,
    }));
  }

  sideNavBarItems.value = [
    { title: "Головна", value: "/", type: "LINK", id: Date.now() },
    ...parsedItems,
  ];

  if (!props.hideFilters) {
    sideNavBarItems.value.push({ type: "PRICE_FILTER" });
  }
  sideNavBarItems.value.push(
    { title: "Кошик", value: "/basket", type: "LINK", id: Date.now() + 1 },
    {
      title: "Статті",
      value: "/articles",
      type: "LINK",
      id: Date.now() + 2,
    },
    {
      title: "Галерея",
      value: "/video-photo-gallery",
      type: "LINK",
      id: Date.now() + 3,
    },
  );

  productsFiltersRangeInput.value[0] = minPriceState.value;
  productsFiltersRangeInput.value[1] = maxPriceState.value;
}

watch(
  () => props.minPrice,
  () => {
    minPriceState.value = props.minPrice;
    productsFiltersRangeInput.value[0] = minPriceState.value;
  },
);

watch(
  () => props.maxPrice,
  () => {
    maxPriceState.value = props.maxPrice;
    productsFiltersRangeInput.value[1] = maxPriceState.value;
  },
);

watch([() => props.rubricId, () => props.typeId], () => {
  getNavBarItems(props.rubricId);
});

onMounted(async () => {
  await getNavBarItems(props.rubricId);
});
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
  outline: none;
  border: 1px solid #000;
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
