<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools>
        <!-- 右侧按钮 -->
        <el-button
          slot="after"
          type="primary"
          size="small"
          @click="addPermission(1, '0')"
          >添加权限</el-button
        >
      </page-tools>
      <!-- 表格 -->
      <!-- 指定ID为唯一属性标识 -->
      <el-table border :data="list" row-key="id">
        <el-table-column
          align="center"
          label="名称"
          prop="name"
        ></el-table-column>
        <el-table-column
          align="center"
          label="标识"
          prop="code"
        ></el-table-column>
        <el-table-column
          align="center"
          label="描述"
          prop="description"
        ></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.type === 1"
              type="text"
              @click="addPermission(2, row.id)"
              >添加</el-button
            >
            <el-button type="text" @click="editPermission(row.id)"
              >编辑</el-button
            >
            <el-button type="text" @click="deletePermission(row.id)">
              删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增编辑弹层 -->
    <el-dialog :visible="showDialog" :title="showText" @close="btnCancel">
      <!-- 表单 -->
      <el-form
        ref="perForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item prop="name" label="名称">
          <el-input v-model="formData.name" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item prop="code" label="标识">
          <el-input v-model="formData.code" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            style="width: 90%"
          ></el-input>
        </el-form-item>
        <el-form-item label="开启">
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
            style="width: 90%"
          ></el-switch>
        </el-form-item>
      </el-form>
      <!-- 底部弹层 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPermissionList,
  addPermission,
  updatePermission,
  deletePermission,
  getPermissionDetail,
} from "@/api/permission";
import { transListToTreeData } from "@/utils";
import { thisExpression } from "@babel/types";
export default {
  data() {
    return {
      list: [],
      showDialog: false,
      formData: {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      },
      rules: {
        name: [
          { required: true, message: "权限名称不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "权限标识不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getPermissionList();
  },
  computed: {
    showText() {
      return this.formData.id ? "编辑权限" : "新增权限";
    },
  },
  methods: {
    async getPermissionList() {
      // 将数据转化成 带Childrend的树形结构
      this.list = transListToTreeData(await getPermissionList(), "0");
    },
    deletePermission(id) {
      this.$confirm("确认删除该权限点吗")
        .then(() => {
          return deletePermission(id);
        })
        .then(() => {
          this.$message.success("删除成功");
          this.getPermissionList();
        });
    },
    async addPermission(type, pid) {
      this.formData.type = type;
      this.formData.pid = pid;
      this.showDialog = true;
    },
    btnOK() {
      this.$refs.perForm
        .validate()
        .then(() => {
          if (this.formData.id) {
            // 有id 为编辑
            return updatePermission(this.formData);
          }
          // 没id 为新增
          return addPermission(this.formData);
        })
        .then(() => {
          //  提示消息
          this.$message.success("操作成功");
          this.getPermissionList();
          this.showDialog = false;
        });
    },
    btnCancel() {
      // 重置数据
      this.formData = {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      };
      // 移除校验
      this.$refs.perForm.resetFields();
      this.showDialog = false;
    },
    async editPermission(id) {
      this.formData = await getPermissionDetail(id);
      this.showDialog = true;
    },
  },
};
</script>

<style></style>
