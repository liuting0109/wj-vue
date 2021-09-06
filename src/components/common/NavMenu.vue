<template>
  <el-menu
    :default-active="$route.path"
    router
    mode="horizontal"
    background-color="white"
    text-color="#222"
    active-text-color="red"
    style="min-width: 1300px">
    <el-menu-item v-for="(item,i) in navList" :key="i" :index="item.name">
      {{ item.navItem }}
    </el-menu-item>
    <i class="el-icon-switch-button" v-on:click="logout" style="float:right;font-size: 40px;color: #222;padding: 10px"></i>
    <span style="position: absolute;padding-top: 20px;right: 43%;font-size: 20px;font-weight: bold">liuting</span>
  </el-menu>
</template>

<script>
export default {
  // 导航栏
  name: 'NavMenu',
  data () {
    return {
      navList: [
        {name: '/index', navItem: '首页'},
        {name: '/jotter', navItem: '笔记本'},
        {name: '/library', navItem: '图书馆'},
        {name: '/admin', navItem: '个人中心'}
      ]
    }
  },
  computed: {
    hoverBackground () {
      return '#ffd04b'
    }
  },
  methods: {
    logout () {
      var _this = this
      this.$axios.get('/logout').then(resp => {
        if (resp.data.code === 200) {
          // 登出操作前后端应保持一致
          _this.$store.commit('logout')
          _this.$router.replace('/login')
        }
      }).catch(failResponse => {})
    }
  }
}
</script>

<style scoped>
  a{
    text-decoration: none;
  }
  span {
    pointer-events: none;
  }
  .el-icon-switch-button{
    cursor: pointer;
    /*去除点击时的框线*/
    outline:0;
  }
</style>
