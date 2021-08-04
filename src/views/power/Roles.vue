<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleList">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="[i1 === 0 ? 'bdtop' : 'bdbottom', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id" >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag :class="[i3 === 0 ? '' : 'bdtop']" v-for="(item3, i3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showUpdatRoles(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色列表的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加用户主体区域 -->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 修改角色列表信信息的对话框 -->
    <el-dialog title="修改角色" :visible.sync="updateDialogVisible" width="50%" @close="updateDialogClosed">
      <!-- 修改角色列表信息主体 -->
      <el-form :model="updataRoles" :rules="addRoleFormRules" ref="updataRolesRef" label-width="80px">
        <el-form-item label="角色ID">
          <el-input v-model="updataRoles.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="updataRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="updataRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据表
      roleList: [],
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色列表的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加角色列表的验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 控制编辑角色列表对话框的显示与隐藏
      updateDialogVisible: false,
      // 查询到的要修改的角色列表
      updataRoles: {},
      // 控制分配角色对话框的现实与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('请求角色列表失败')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 控制添加角色列表的显示
    addRoleList() {
      this.addDialogVisible = true
    },
    // 清除效果：即恢复为初始效果
    addDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击添加新角色
    addRoles() {
      // 先进行表单预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return this.$message.error('请输入符合条件的角色信息')
        // 验证通过，发起添加角色的网络请求
        const {data: res} = await this.$http.post('roles', this.addRoleForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addDialogVisible = false
        // 刷新角色列表
        this.getRolesList()
      })
    },
    // 通过点击按钮获取到对应的数据
    async showUpdatRoles(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('roles/'+ id)
      if(res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.updataRoles = res.data
      this.updateDialogVisible = true
    },
    // 修改角色信息的清除效果
    updateDialogClosed() {
      this.$refs.updataRolesRef.resetFields()
    },
    // 修改角色列表信息
    editRoles() {
      // 表单预验证
      this.$refs.updataRolesRef.validate(async valid => {
        console.log(valid);
        if(!valid) return
        // 发起修改用户请求
        const {data: res} = await this.$http.put('roles/' + this.updataRoles.roleId, {
          roleName: this.updataRoles.roleName,
          roleDesc: this.updataRoles.roleDesc
        })
        if(res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.updateDialogVisible = false
        this.getRolesList()
        this.$message.success('修改成功')
      }) 
    },
    // 删除角色功能
    removeRoleById(id) { 
      this.$confirm('此操作将永久删除该角色, 是否继续?', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${id}`).then(res => {
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getRolesList()
            return
          }
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      // 发起删除角色指定权限的请求
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // this.getRolesList()
      // 删除权限成功，不进行整个页面的渲染，只是进行页面权限的渲染，即对当前的角色信息重新赋值一个权限
      role.children = res.data
      return this.$message.success('删除权限成功')
    },
    // 展示分配权限的对话框 scope.row就是当前的角色role
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const {data: res} = await this.$http.get('rights/tree')

      if(res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 获取到的权限数据保存到data中
      this.rightsList = res.data
      // 递归三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    // node: 有一个节点进行判断是否是三级节点，arr：用来保存的数组 
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则为三级节点，将三级节点中的id添加到数组中
      if(!node.children) {
        return arr.push(node.id)
      }
      // 递归
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
     
      const idStr = keys.join(',');
      // 发送分配角色网络请求
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  // 纵向对齐
  align-items: center;
}
</style>