<template>
  <NavBar :hide-search-bar="true" :hide-filters="true" />
  <Spinner v-if="loading" />
  <div class="wrapper__articles" v-if="!loading">
    <v-card v-for="article in articles" :key="article.id" class="mt-5 mb-5">
      <v-card-title class="text-wrap">{{ article.name }}</v-card-title>
      <v-card-subtitle class="mt-2 text-wrap"
        >Тема: {{ article.theme }}</v-card-subtitle
      >
      <v-card-subtitle class="mt-2 text-wrap"
        >Дата: {{ article.created_at }}</v-card-subtitle
      >
      <v-card-subtitle class="mt-2 text-wrap"
        >Автори: {{ article.authors }}</v-card-subtitle
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <RouterLink
          :to="'/articles/' + article.filename"
          class="text-yellow-accent-4"
          >Читати</RouterLink
        >
      </v-card-actions>
    </v-card>
    <div ref="sentinel" class="observer" />
  </div>
</template>
<script setup>
import NavBar from "@/components/NavBar.vue";
import Api from "@/lib/api.js";
import Spinner from "@/components/Spinner.vue";
import { useTemplateRef } from "vue";

const sentinelRef = useTemplateRef("sentinel");

const articles = ref([]);
const loading = ref(true);
const loadMoreOptions = ref({
  take: 16,
  skip: 16,
});

async function getArticles() {
  articles.value = (
    await Api.get(`/articles/?take=${loadMoreOptions.value.take}&skip=0`)
  ).data;
}
async function loadMoreArticles() {
  const data = (
    await Api.get(
      `/articles/?take=${loadMoreOptions.value.take}&skip=${loadMoreOptions.value.skip}`,
    )
  ).data;

  articles.value.push(...data);

  loadMoreOptions.value.skip += 16;
}
function createObserver() {
  const options = { threshold: 1.0 };
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMoreArticles();
    }
  }, options);

  observer.observe(sentinelRef.value);
}

onMounted(async () => {
  try {
    await getArticles();

    createObserver();
    loading.value = false;
  } catch {
    loading.value = false;
  }
});
</script>
<style scoped>
.wrapper__articles {
  width: 80%;
  display: block;
  margin: 0 auto;
}
</style>
