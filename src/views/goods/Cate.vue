<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="updateCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)" >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- v-model绑定一个数组，用来放选中的父级分类的id数组 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 编辑按钮的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="updateCateDialogVisible"
      width="50%"
    >
      <!-- 编辑按钮主体区域 -->
      <el-form
        :model="updateInfo"
        :rules="addCateFormRules"
        ref="updateInfoRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="updateInfo.cat_name"></el-input>
        </el-form-item>
      </el-form>  
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询数据
      querInfo: {
        type: 3, //所选参数
        pagenum: 1, //当前页码值
        pagesize: 5, //每页显示多少条数据
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示将当前列定义为摸板列
          type: "template",
          // 表示当前这一列使用摸板名称
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: "", // 将要添加分类的名称
        cat_pid: 0, //父级分类的id
        cat_level: 0, //分类的等级默认要添加的是一级分类
      },
      // 添加分类表单个验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: "请输入分类的名称" }],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 定义展开子级菜单的触发方式
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑对话框的显示与隐藏
      updateCateDialogVisible: false,
      // 编辑按钮要修改的信息
      updateInfo: ''
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res.data);
      // 把数据列表赋值给cateList
      this.cateList = res.data.result;
      // 把总数据条数赋值给total
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagename的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类数据列表
      this.getParentCateList();
      // 展示添加分类对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      console.log(res.data);
      // 将获取到的数据赋值到父级分类的列表
      this.parentCateList = res.data;
    },
    // 选择项发生变化时触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      // 如果selectedKeys数组中的length大于0，证明选中了父级分类
      // 反之就没有选中任何父级分类
      if(this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }

    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })

    },
    // 监听对话框的监听事件，然后重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      // 重置级联选择器中的数据
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 编辑按钮，根据id获取对应数据
    async updateCateDialog(id) {
      const {data: res} = await this.$http.get('categories/' + id)
      if(res.meta.status !== 200) {
        this.$message.error('请求数据失败')
      }
      this.updateInfo = res.data
      this.updateCateDialogVisible = true
    },
    // 编辑按钮修改信息
    updateCate() {
      // 预验证
      this.$refs.updateInfoRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('categories/' + this.updateInfo.cat_id, {
          cat_name: this.updateInfo.cat_name
        })
        if(res.meta.status !== 200) {
          this.$message.error('修改分类名称失败')
        }
        this.$message.success('修改分类名称成功')
        this.getCateList()
        this.updateCateDialogVisible = false
      })
    },
    // 删除分类操作
    removeCate(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('categories/' + id).then(res => {
          if(res.status !== 200) {
            this.$message({
              type: 'error',
              message: '删除失败!'
            });
          }
          this.$message.success('删除成功')
          this.getCateList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    }
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>