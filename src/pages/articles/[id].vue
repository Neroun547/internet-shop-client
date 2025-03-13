<template>
  <NavBar
    :hide-filters="true"
    :hide-search-bar="true"
  />
  <div v-html="data" class="wrapper__article"></div>
</template>
<script>
import Api from "@/lib/api.js";

export default {
  data() {
    return {
      data: ""
    }
  },
  async mounted() {
    this.data = (await Api.get("/articles/" + this.$route.params.id)).data;
  }
}
</script>
<style scoped>
  .wrapper__article {
    width: 80%;
    display: block;
    margin: 0 auto;
    margin-top: 50px;
  }
</style>
