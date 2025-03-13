<template>
  <div>
    <v-progress-circular color="yellow-accent-4"  indeterminate style="position: absolute; top: 25%; left: 50%; transform: translateX(-50%); z-index: 100;"></v-progress-circular>
    <v-overlay v-model="overlay">
    </v-overlay>
  </div>
</template>
<script>
export default {
  data() {
    return {
      overlay: true
    }
  }
}
</script>
