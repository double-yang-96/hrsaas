<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <tree-tools
          :tree-node="company"
          :isRoot="true"
          @addDepts="addDepts"
        ></tree-tools>
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="false"
        >
          <!-- 传入内容 插槽内容-->
          <tree-tools
            slot-scope="{ data }"
            :tree-node="data"
            @delDepts="getDepartments"
            @addDepts="addDepts"
            @editDepts="editDepts"
          ></tree-tools>
        </el-tree>
      </el-card>
    </div>
    <add-dept
      ref="addDept"
      :show-dialog="showDialog"
      :tree-node="node"
      @addDepts="getDepartments"
      :show-dialog.sync="showDialog"
    ></add-dept>
  </div>
</template>

<script>
import TreeTools from "./components/tree-tools";
import AddDept from "./components/add-dept";
import { getDepartments } from "@/api/departments";
import { transListToTreeData } from "@/utils";
export default {
  components: {
    TreeTools,
    AddDept,
  },
  data() {
    return {
      company: {},
      departs: [],
      defaultProps: {
        label: "name",
      },
      showDialog: false,
      node: null, // 记录当前点击的node节点
    };
  },
  created() {
    this.getDepartments();
  },
  methods: {
    async getDepartments() {
      const result = await getDepartments();
      // console.log(result);
      this.company = { name: result.companyName, manager: "负责人", id: "" };
      this.departs = transListToTreeData(result.depts, "");
    },
    // 监听tree-tools中触发的点击添加子部门的事件
    addDepts(node) {
      this.showDialog = true;
      this.node = node;
    },
    editDepts(node) {
      this.showDialog = true;
      this.node = node;
      this.$refs.addDept.getDepartDetail(node.id);
    },
  },
};
</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
