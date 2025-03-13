<template>
  <NavBar
    :hide-search-bar="true"
    :hide-filters="true"
  />
  <div class="wrapper__publication">
    <v-card>
      <v-carousel v-if="files && files.length">
        <v-carousel-item v-for="file in files" v-bind:key="file.id" cover>
          <v-img v-if="file.type === 'image'" :src="api_url + 'gallery/' + file.filename"/>
          <video v-if="file.type === 'video'" preload="metadata" controls>
            <source :src="api_url + 'gallery/' + file.filename">
          </video>
        </v-carousel-item>
      </v-carousel>
      <v-card-title>{{name}}</v-card-title>
      <v-card-subtitle>{{theme}}</v-card-subtitle>
      <v-card-text>{{description}}</v-card-text>
    </v-card>
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
        name: "",
        theme: "",
        description: "",
        files: []
      }
    },
    mounted() {
      this.getPublication();
    },
    methods: {
      async getPublication() {
        const data = (await Api.get("/video-photo-gallery/" + this.$route.params.id)).data;

        this.name = data.name;
        this.description = data.description;
        this.theme = data.theme;
        this.files = data.files;
      }
    },
    computed: {
      api_url: {
        get() {
          return API_URL;
        }
      }
    }
  }
</script>
<style scoped>
  .wrapper__publication {
    width: 60%;
    display: block;
    margin: 0 auto;
    margin-top: 50px;
  }
</style>
