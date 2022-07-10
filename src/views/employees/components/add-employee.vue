<template>
  <el-dialog title="新增员工" :visible="showDialog" @close="btnCancel">
    <!-- 表单 -->
    <el-form
      ref="addEmployee"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item prop="username" label="姓名">
        <el-input
          style="width: 50%"
          v-model="formData.username"
          placeholder="请输入姓名"
        ></el-input>
      </el-form-item>
      <el-form-item prop="mobile" label="手机">
        <el-input
          style="width: 50%"
          v-model="formData.mobile"
          placeholder="请输入手机号"
        ></el-input>
      </el-form-item>
      <el-form-item prop="timeOfEntry" label="入职时间">
        <el-date-picker
          style="width: 50%"
          placeholder="请选择日期"
          v-model="formData.timeOfEntry"
        ></el-date-picker>
      </el-form-item>
      <el-form-item prop="formOfEmployment" label="聘用形式">
        <el-select
          style="width: 50%"
          v-model="formData.formOfEmployment"
          placeholder="请选择"
        >
          <el-option
            v-for="item in EmployeeEnum.hireType"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="workNumber" label="工号">
        <el-input
          style="width: 50%"
          v-model="formData.workNumber"
          placeholder="请输入工号"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门" prop="departmentName">
        <el-input
          v-model="formData.departmentName"
          style="width: 50%"
          placeholder="请选择部门"
          @focus="getDepartments"
        />
        <!-- 放置一个tree组件 -->
        <el-tree
          v-if="showTree"
          v-loading="loading"
          :data="treeData"
          default-expand-all=""
          :props="{ label: 'name' }"
          @node-click="selectNode"
        />
      </el-form-item>
      <el-form-item prop="correctionTime" label="转正时间">
        <el-date-picker
          style="width: 50%"
          placeholder="请选择日期"
          v-model="formData.correctionTime"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <!-- footer插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small" @click="btnCancel">取消</el-button>
        <el-button size="small" type="primary" @click="btnOK">确认</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { addEmployee } from "@/api/employees";
import { getDepartments } from "@/api/departments";
import { transListToTreeData } from "@/utils";
import EmployeeEnum from "@/api/constant/employees";
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      },
      treeData: [], // 定义一个数组来接收树形结构
      showTree: false, // 默认不显示树形组件
      loading: false, // 加上进度条
      EmployeeEnum,
      rules: {
        username: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
          {
            min: 1,
            max: 4,
            message: "用户姓名为1-4位",
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "手机号格式不正确",
            trigger: "blur",
          },
        ],
        formOfEmployment: [
          { required: true, message: "聘用形式不能为空", trigger: "blur" },
        ],
        workNumber: [
          { required: true, message: "工号不能为空", trigger: "blur" },
        ],
        departmentName: [
          { required: true, message: "部门不能为空", trigger: "change" },
        ],
        timeOfEntry: [{ required: true, message: "入职时间", trigger: "blur" }],
      },
    };
  },
  methods: {
    async getDepartments() {
      this.showTree = true;
      this.loading = true;
      const { depts } = await getDepartments();
      // depts是数组 但不是树形
      this.treeData = transListToTreeData(depts, "");
      this.loading = false;
    },
    selectNode(node) {
      this.formData.departmentName = node.name;
      this.showTree = false;
    },
    async btnOK() {
      try {
        // 校验表单
        await this.$refs.addEmployee.validate();
        // 校验成功 执行下面内容
        await addEmployee(this.formData);
        // 通知父组件 更新数据
        this.$parent.getEmployeeList && this.$parent.getEmployeeList(); // 父组件实例
        this.$parent.showDialog = false;
      } catch (err) {
        console.log(err);
      }
    },
    btnCancel() {
      this.formData = {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      };
      this.$refs.addEmployee.resetFields(); // 移除校验
      this.$emit("update:showDialog", false);
    },
  },
};
</script>

<style></style>
