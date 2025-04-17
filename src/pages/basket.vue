<template>
  <v-dialog max-width="500" v-model="isDialogActive">
    <v-card>
      <v-card-text>{{dialogMessage}}</v-card-text>

      <v-card-actions>
        <v-btn
          class="bg-green"
          @click="closeDialog"
        >
          Ок
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <NavBar :max-price="maxPrice" :min-price="minPrice" :hide-search-bar="true" :hide-filters="true"/>
  <h2 v-if="!products.length" class="text-center mt-50px">Кошик пустий</h2>
  <div v-if="products.length">
    <v-table class="basket-table">
      <thead>
      <tr>
        <th>Назва</th>
        <th>Кількість</th>
        <th>Ціна</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="item in products"
        :key="item.name"
      >
        <td>{{ item.name }}</td>
        <td><input type="number" class="count-input" v-model="item.count" min="1"></td>
        <td>{{ item.price * item.count}}</td>
        <td>
          <v-icon icon="mdi-delete" size="small" class="cursor-pointer" @click="deleteProductFromBasket(item.id)"></v-icon>
        </td>
      </tr>
      </tbody>
    </v-table>
    <span class="d-block font-weight-bold font-size-20 ml-5 mt-5 basket-text">Загальна сума: {{fullPrice}}</span>
    <span class="d-block font-size-20 ml-5 mt-5 font-weight-bold mt-50px text-center basket-text">Вкажіть як з вами зв'язатися</span>
    <form class="w-90 d-block ma-auto mt-5">
      <v-text-field v-model="firstName" placeholder="Ваше ім'я" :rules="rules" class="basket-text" variant="outlined" />
      <v-text-field v-model="lastName" placeholder="Ваше прізвище" :rules="rules" class="basket-text" variant="outlined" />
      <v-text-field placeholder="Телеграм, WhatsApp, Viber, мобільний номер і т.д" v-model="contactInfo" :rules="rules" class="basket-text" variant="outlined" />
      <v-text-field placeholder="Примітка" v-model="remark" class="basket-text" variant="outlined" />
      <v-btn class="bg-green d-block w-75 d-block mt-3 ma-auto height-50px basket-text mb-5" @click="buy">Замовити зараз</v-btn>
    </form>
  </div>
</template>
<script setup>
  import NavBar from "@/components/NavBar.vue";

  const rules = [value => !!value || "Це поле обов'язкове"];
</script>
<script>

import Api from "@/lib/api.js";

export default {
  data() {
    return {
      products: [],
      contactInfo: "",
      firstName: "",
      lastName: "",
      remark: "",
      isDialogActive: false,
      dialogMessage: "",
      maxPrice: 0,
      minPrice: 0
    }
  },
  methods: {
    async getMaxAndMinPrices() {
      this.minPrice = (await Api.get("/products/prices/min")).data.value;
      this.maxPrice = (await Api.get("/products/prices/max")).data.value;
    },
    deleteProductFromBasket(id) {
      this.products = this.products.filter(product => product.id !== id);

      localStorage.setItem("basket", JSON.stringify(this.products));
    },
    async buy() {
      if(this.firstName.length && this.lastName.length && this.contactInfo.length) {
        await Api.post("/buy", {
          products: this.products,
          first_name: this.firstName,
          last_name: this.lastName,
          contact_info: this.contactInfo,
          remark: this.remark
        });

        this.dialogMessage = "Замовлення зробено успішно. З вами зв'яжеться менеджер";
        this.isDialogActive = true;
      }
    },
    closeDialog() {
      this.isDialogActive = false;

      this.products = [];
      localStorage.setItem("basket", "");
    }
  },
  computed: {
    fullPrice() {
      return this.products.reduce((previousValue, currentValue) => previousValue + (currentValue.price * currentValue.count), 0);
    }
  },
  async mounted() {
    const basket = localStorage.getItem("basket");

    if(basket) {
      this.products = JSON.parse(basket).map(product => ({ ...product, count: 1 }));
    }
    await this.getMaxAndMinPrices();
  }
}
</script>
<style>
  .count-input {
    border: 1px solid #000;
    outline: none;
  }
  @media screen and (max-width: 525px) {
    .basket-table {
      font-size: 11px !important;
    }
    .basket-text {
      font-size: 14px !important;
    }
  }
</style>
