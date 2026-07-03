<template>
  <NavBar :hide-search-bar="true" :hide-filters="true" />
  <div class="wrapper__publication">
    <v-card>
      <v-carousel v-if="files && files.length">
        <v-carousel-item v-for="file in files" v-bind:key="file.id" cover>
          <v-img
            v-if="file.type === 'image'"
            :src="API_URL + 'gallery/' + file.filename"
          />
          <video v-if="file.type === 'video'" preload="metadata" controls>
            <source :src="API_URL + 'gallery/' + file.filename" />
          </video>
        </v-carousel-item>
      </v-carousel>
      <v-card-title>{{ name }}</v-card-title>
      <v-card-subtitle>{{ theme }}</v-card-subtitle>
      <v-card-text>{{ description }}</v-card-text>
    </v-card>
  </div>
</template>
<script setup>
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import { API_URL } from "@/constants.js";
import { useRoute } from "vue-router";

const route = useRoute();

const name = ref("");
const theme = ref("");
const description = ref("");
const files = ref([]);

async function getPublication() {
  const data = (await Api.get("/video-photo-gallery/" + route.params.id)).data;

  name.value = data.name;
  description.value = data.description;
  theme.value = data.theme;
  files.value = data.files;
}

onMounted(() => {
  getPublication();
});
</script>
<style scoped>
.wrapper__publication {
  width: 60%;
  display: block;
  margin: 0 auto;
  margin-top: 50px;
}
</style>
