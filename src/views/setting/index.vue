<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧内容 -->
            <el-row style="height: 60px"
              ><el-button
                type="primary"
                icon="el-icon-plus"
                size="small"
                @click="showDialog = true"
                >新增角色</el-button
              ></el-row
            >
            <el-table border="" :data="list">
              <el-table-column
                type="index"
                label="序号"
                width="120px"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="name"
                label="名称"
                width="240px"
                align="center"
              ></el-table-column>
              <el-table-column
                prop="description"
                label="描述"
                align="center"
              ></el-table-column>
              <el-table-column label="操作" align="center">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <el-button type="success" size="small">分配权限</el-button>
                  <!-- <el-button
                    type="success"
                    size="small"
                    @click="assignPerm(row.id)"
                    >分配权限</el-button
                  > -->
                  <el-button
                    type="primary"
                    size="small"
                    @click="editRole(row.id)"
                    >编辑</el-button
                  >
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteRole(row.id)"
                    >删除</el-button
                  ></template
                >
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-row
              type="flex"
              justify="center"
              align="center"
              style="height=60px"
            >
              <el-pagination
                :total="page.total"
                :page-size="page.pagesize"
                :current-page="page.page"
                layout="prev, pager, next"
                @current-change="changePage"
              ></el-pagination>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <!-- 右侧内容 -->
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="企业名称">
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="电话">
                <el-input
                  v-model="formData.companyPhone"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item v-model="formData.remarks" label="备注">
                <el-input
                  disabled
                  style="width: 400px"
                  type="textarea"
                  :rows="3"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置一个弹层组件 -->
    <el-dialog title="编辑部门" :visible="showDialog" @close="btnCancel">
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button size="small" @click="btnCancel">取消</el-button>
          <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 放置分配权限弹层 -->
    <el-dialog
      title="分配权限"
      :visible="showPermDialog"
      @close="btnPermCancel"
    >
      <!-- 权限是一棵树 -->
      <el-tree
        :data="permData"
        :props="defaultProps"
        :default-expand-all="true"
        show-checkbox="true"
        check-strictly="true"
        node-key="id"
        :default-checked-keys="selectCheck"
        ref="permTree"
      ></el-tree>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOK"
            >确认</el-button
          >
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRoleList,
  getCompanyInfo,
  deleteRole,
  getRoleDetail,
  updateRole,
  addRole,
} from "@/api/setting";
import { mapGetters } from "vuex";
import { getPermissionList, assignPerm } from "@/api/permission";
import { transListToTreeData } from "@/utils";
export default {
  data() {
    return {
      list: [], // 承接数组
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0, // 记录总数
      },
      formData: {
        // 公司信息
      },
      showDialog: false, // 控制新增编辑弹层显示
      showPermDialog: false, // 控制分配权限弹层显示
      permData: [], // 接受权限数据
      defaultProps: {
        label: "name",
      }, // 定义显示字段的名称 和子属性的字段名称
      roleId: null, // 用来记录当前分配权限的id
      selectCheck: [],
      roleForm: {
        name: "",
        description: "",
      },
      rules: {
        name: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getRoleList();
    this.getCompanyInfo();
  },
  computed: {
    ...mapGetters(["companyId"]),
  },
  methods: {
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page);
      this.page.total = total;
      this.list = rows;
    },
    changePage(newPage) {
      // newpage 当前点击的页码
      this.page.page = newPage;
      this.getRoleList();
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId);
    },
    async deleteRole(id) {
      try {
        await this.$confirm("确认删除该角色吗");
        // 只有点击了确定 才能进入下方
        await deleteRole(id); // 调用删除接口
        this.getRoleList(); // 重新加载数据
        this.$message("删除成功");
      } catch (err) {
        console.log(err);
      }
    },
    async editRole(id) {
      this.roleForm = await getRoleDetail(id); // 先实现数据的回写
      console.log(this.roleForm);
      // 显示弹层
      this.showDialog = true;
    },
    btnCancel() {
      this.roleForm = {
        name: "",
        description: "",
      };
      // 移除校验规则
      this.$refs.roleForm.resetFields();
      this.showDialog = false;
    },
    async btnOK() {
      try {
        console.log(this.roleForm);
        await this.$refs.roleForm.validate();
        console.log(1);
        // 校验通过 执行await下方内容
        // roleForm 如果有id就是编辑 没有id就是新增
        if (this.roleForm.id) {
          await updateRole(this.roleForm);
        } else {
          // 新增角色
          console.log(2);
          await addRole(this.roleForm);
          console.log(3);
        }

        // 重新拉取数据
        this.getRoleList();
        this.$message("操作成功");
        this.showDialog = false;
      } catch (err) {
        console.log(err);
      }
    },
    async assignPerm(id) {
      this.permData = transListToTreeData(await getPermissionList(), "0");
      this.roleId = id;
      const { permIds } = await getRoleDetail(id);
      this.selectCheck = permIds; // 将当前角色拥有的id赋值
      this.showPermDialog = true;
    },
    async btnPermOK() {
      // 调用el-tree方法
      assignPerm({
        permIds: this.$refs.permTree.getCheckedKeys(),
        id: this.roleId,
      });
      this.$message.success("分配权限成功");
      this.showPermDialog = false;
    },
    btnPermCancel() {
      this.selectCheck = []; // 重置数据
      this.showPermDialog = false;
    },
  },
};
</script>

<style></style>
