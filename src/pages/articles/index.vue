<template>
  <NavBar
    :hide-search-bar="true"
    :hide-filters="true"
  />
  <Spinner v-if="loading" />
  <div class="wrapper__articles" v-if="!loading">
    <v-card v-for="article in articles" :key="article.id" class="mt-5 mb-5">
      <v-card-title>{{article.name}}</v-card-title>
      <v-card-subtitle class="mt-2">Тема: {{article.theme}}</v-card-subtitle>
      <v-card-subtitle class="mt-2">Дата: {{article.created_at}}</v-card-subtitle>
      <v-card-subtitle class="mt-2">Автори: {{article.authors}}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <RouterLink :to="'/articles/' + article.filename" class="text-yellow-accent-4">Читати</RouterLink>
      </v-card-actions>
    </v-card>
    <div
      ref="sentinel"
      class="observer"
    />
  </div>
</template>
<script>
import NavBar from "@/components/NavBar.vue";
import Api from "@/lib/api.js";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {Spinner, NavBar },
  data() {
    return {
      minPrice: 0,
      maxPrice: 0,
      articles: [],
      loading: true,
      loadMoreOptions: {
        take: 16,
        skip: 16
      }
    }
  },
  async mounted() {
    try {
      await this.getArticles();
      this.createObserver();
      this.loading = false;
    } catch(e) {
      console.log("E", e);
      this.loading = false;
    }
  },
  methods: {
    async getArticles() {
      this.articles = (await Api.get(`/articles/?take=${this.loadMoreOptions.take}&skip=0`)).data;
    },
    async loadMoreArticles() {
      const data = (await Api.get(`/articles/?take=${this.loadMoreOptions.take}&skip=${this.loadMoreOptions.skip}`)).data;

      this.articles.push(...data);

      this.loadMoreOptions.skip += 16;
    },
    createObserver() {
      const options = { threshold: 1.0 };
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.loadMoreArticles();
        }
      }, options);
      observer.observe(this.$refs.sentinel);
    },
  }
}
</script>
<style scoped>
.wrapper__articles {
  width: 80%;
  display: block;
  margin: 0 auto;
}
</style>
