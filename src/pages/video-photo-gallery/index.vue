<template>
  <NavBar
      :hide-search-bar="true"
      :hide-filters="true"
  />
  <div class="wrapper__gallery">
    <v-row class="mt-5 mb-5">
      <v-col
          cols="12"
          lg="3"
          md="6"
          sm="12"
          v-for="item in publications"
          v-bind:key="item.id"
      >
        <v-card>
          <v-img v-if="!item.previewFileVideo" :src="api_url + 'gallery/' + item.previewFile" style="max-height: 500px;"></v-img>
          <video preload="metadata" controls v-if="item.previewFileVideo" :type="item.mimeType" style="max-height: 500px; max-width: 300px;">
            <source :src="api_url + 'gallery/' + item.previewFile">
          </video>
          <v-card-title>{{ item.name }}</v-card-title>
          <v-card-subtitle class="mt-2">{{ item.theme }}</v-card-subtitle>
          <v-card-subtitle class="mt-2">{{ item.description }}</v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <RouterLink :to="'/video-photo-gallery/' + item.id">
              <v-btn class="bg-yellow-accent-4">
                Докладніше
              </v-btn>
            </RouterLink>
          </v-card-actions>
        </v-card>
      </v-col>
      <div
        ref="sentinel"
        class="observer"
      />
    </v-row>
  </div>
</template>
<script>
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import {API_URL} from "@/constants.js";

export default {
  components: {NavBar},
  data() {
    return {
      publications: [],
      loadMoreOptions: {
        take: 12,
        skip: 12
      }
    }
  },
  methods: {
    async getPublications() {
      this.publications = (await Api.get("/video-photo-gallery")).data
    },
    async loadMorePublications() {
      this.publications.push(...(await Api.get(`/video-photo-gallery/load-more/?take=${this.loadMoreOptions.take}&skip=${this.loadMoreOptions.skip}`)).data);

      this.loadMoreOptions.skip += 12;
    },
    createObserver() {
      const options = { threshold: 1.0 };
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.loadMorePublications();
        }
      }, options);
      observer.observe(this.$refs.sentinel);
    },
  },
  async mounted() {
    await this.getPublications();
    this.createObserver();
  },
  computed: {
    api_url: {
      get() {
        return API_URL
      }
    }
  }
}
</script>
<style scoped>
  .wrapper__gallery {
    width: 90%;
    display: block;
    margin: 0 auto;
  }
</style>
