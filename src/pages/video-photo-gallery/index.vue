<template>
  <NavBar :hide-search-bar="true" :hide-filters="true" />
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
          <v-img
            v-if="!item.previewFileVideo"
            :src="API_URL + 'gallery/' + item.previewFile"
            style="max-height: 500px"
          ></v-img>
          <video
            preload="metadata"
            controls
            v-if="item.previewFileVideo"
            :type="item.mimeType"
            style="max-height: 500px; max-width: 300px"
          >
            <source :src="API_URL + 'gallery/' + item.previewFile" />
          </video>
          <v-card-title>{{ item.name }}</v-card-title>
          <v-card-subtitle class="mt-2">{{ item.theme }}</v-card-subtitle>
          <v-card-subtitle class="mt-2">{{ item.description }}</v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <RouterLink :to="'/video-photo-gallery/' + item.id">
              <v-btn class="bg-yellow-accent-4"> Докладніше </v-btn>
            </RouterLink>
          </v-card-actions>
        </v-card>
      </v-col>
      <div ref="sentinel" class="observer" />
    </v-row>
  </div>
</template>
<script setup>
import Api from "@/lib/api.js";
import NavBar from "@/components/NavBar.vue";
import { API_URL } from "@/constants.js";
import { isAlreadyAllLoaded } from "@/utils/is-already-all-loaded";

const sentinelRef = useTemplateRef("sentinel");

const publications = ref([]);
const loadMoreOptions = ref({
  take: 12,
  skip: 12,
  alreadyAllLoaded: false,
});

async function getPublications() {
  const apiResponse = await Api.get("/video-photo-gallery");

  if (apiResponse && Array.isArray(apiResponse.data)) {
    publications.value = apiResponse.data;
  }
}

async function loadMorePublications() {
  if (loadMoreOptions.value.alreadyAllLoaded) return;

  const apiResponse = await Api.get(
    `/video-photo-gallery/load-more/?take=${loadMoreOptions.value.take}&skip=${loadMoreOptions.value.skip}`,
  );
  if (apiResponse && Array.isArray(apiResponse.data)) {
    publications.value.push(...apiResponse.data);
  }
  loadMoreOptions.value.alreadyAllLoaded = isAlreadyAllLoaded(
    apiResponse,
    loadMoreOptions.value.take,
  );

  loadMoreOptions.value.skip += 12;
}

function createObserver() {
  const options = { threshold: 1.0 };
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMorePublications();
    }
  }, options);

  observer.observe(sentinelRef.value);
}

onMounted(async () => {
  await getPublications();

  createObserver();
});
</script>
<style scoped>
.wrapper__gallery {
  width: 90%;
  display: block;
  margin: 0 auto;
}
</style>
