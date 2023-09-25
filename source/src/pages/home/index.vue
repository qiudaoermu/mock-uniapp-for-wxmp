<template>
  <div id="app" class="container">
    <div>static node</div>

    <span @click="clickHandler" :class="{ active: showSpan }" style="margin-top:30px;display:block">
      可以点击啊：<span v-if="showSpan">show span</span>
      <span v-else>hide span</span>
    </span>

    <div style="background: lightblue;margin-top:30px">
      for循环:
      <block v-for="(item, index) in items" :key="index">
        <span> {{ item }}、</span>
      </block>
    </div>
    <input style="margin-top:30px" v-model="searchText" class="input" />
  </div>
</template>
<script>

export default {
  data() {
    return {
      content: "test content",
      showSpan: true,
      searchText: "请输入内容",
      items: ["a", "b", "c"],
    };
  },
 
  watch: {
    searchText() {
      this.content = this.searchText;
    },
  },
  methods: {
    clickHandler() {
      this.showSpan = !this.showSpan;
      uni.navigateTo({
        url: "/pages/sub/sell/index",
      });
    },
  },
};
</script>

<style>
.container {
 
}

.input {

}

.active {
  background: lightgray;
}
</style>

