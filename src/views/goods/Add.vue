<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <!-- Steps 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--Tabs 标签页区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的后台api地址 -->
            <!-- on-preview 表示图片预览事件 -->
            <!-- on-remove 表示处理移除图片的操作事件  -->
            <!-- list-type 预览图片的呈现方式 -->
            <!-- 每次上传图片时都需要手动指定headers请求头，并在请求头中绑定Authorization字段
            因为上传组件并没上传axios -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImag">
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash插件
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条被激活的下标
      activeIndex: "0",
      // 添加商品表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的参数（数组）
        attrs: []
      },
      // 添加商品表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分内列表
      cateList: [],
      // 级联选择器的配置项
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // url路径
      previewPath: '',
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      }
      this.$message.success("获取商品分类数据成功");
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 级联选择器选中项变化触发此函数
    handleChange() {
      console.log(this.addForm.goods_cat);
      // 没有选择三级分类内容就为空
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 如果不选择三级分类，就无法切换标签页
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将离开的标签页的名字" + oldActiveName);
      // console.log("即将进入的activeName的名字" + activeName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    // 根据侧边栏点击来获取对应是数据
    async tabClicked() {
      // console.log(this.activeIndex);
      // 证明访问的是动态参数面板
      if(this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel: 'many'}})
        if(res.meta.status !== 200) {
          this.$message.error('获取动态参数列表失败')
        }
        console.log(res.data);
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex == '2') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel: 'only'}})
        if(res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        console.log(res.data);
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file);
      // 1.获取到具体的URL地址
      this.previewPath = file.response.data.url
      // 2.
      this.previewVisible = true
    },
    //处理移除图片的操作  file 将要被移除的图片信息对象
    handleRemove(file) {
      // console.log(file);
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm);
    }, 
    // 监听图片上传成功的事件 response：服务呢器返回的数据对象
    handleSuccess(response) {
      console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics);
    },
    // 添加商品
    add() {
      // console.log(this.addForm);
      // 预验证
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return this.$message.error('请填写必要的表单项')
        // 预验证通过执行添加商品功能
        // 处理goods_cat，在级联选择器中需要数组形式，而提交到数据库时需要转为字符串为了避免共用一个而报错，所以进行转换字符串操作时，进行深拷贝即可
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)  //深拷贝
        form.goods_cat = form.goods_cat.join(',')
        // 处理attrs数组
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form);
        // 发起请求添加商品数据
        // 商品的名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImag {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>