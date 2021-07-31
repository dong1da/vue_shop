<template>
  <!-- 侧边栏 -->
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <div class="toggle-button" @click="toggleCollapse">|||</div>
    <!-- 侧边栏菜单区域 -->
    <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      :unique-opened="true"
      :collapse="isCollapse"
      :collapse-transition="false"
      :router="true"
      :default-active="activePath"
    >
      <!-- 1级菜单 -->
      <!-- index只接受字符串形式，所以需要转成字符串，拼接字符串可以转化成字符串 -->
      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单的模版区域 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{ item.authName }}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item
          :index="'/' + subItem.path"
          v-for="subItem in item.children"
          :key="subItem.id"
          @click="saveNavState('/' + subItem.path)"
        >
          <i class="el-icon-menu"></i>
          <span>{{ subItem.authName }}</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-icon- ',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpingouwudai2',
        '102': 'iconfont icon-danju-tianchong',
        '145': 'iconfont icon-baobiao',
      },
      // 侧边栏是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    // 点击按钮切换按钮的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态，即点击二级菜单时对应的router
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
}
</script>

<style lang="less" scoped>
.el-aside {
  background-color: #333744;
  // 侧边栏的边框线会溢出，取消边框线
  .el-menu {
    border-right: none;
  }
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2;
  cursor: pointer;
}
</style>
