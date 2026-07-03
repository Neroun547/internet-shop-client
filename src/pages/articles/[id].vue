<template>
  <NavBar :hide-filters="true" :hide-search-bar="true" />
  <div v-html="data" class="wrapper__article"></div>
</template>
<script setup>
import Api from "@/lib/api.js";

const route = useRoute();

const data = ref("");

onMounted(async () => {
  data.value = (await Api.get("/articles/" + route.params.id)).data;
});
</script>
<style scoped>
.wrapper__article {
  width: 80%;
  display: block;
  margin: 0 auto;
  margin-top: 50px;
}
</style>
