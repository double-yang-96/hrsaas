<template>
  <!-- 放置弹层组件 -->
  <el-dialog
    :title="showTitle"
    :visible="true"
    v-if="showDialog"
    @close="btnCancel"
  >
    <!-- 表单数据 -->
    <el-form
      ref="deptForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select
          @focus="getEmployeesSimple"
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
        >
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          v-model="formData.introduce"
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :rows="3"
        ></el-input>
      </el-form-item>
    </el-form>
    <!-- 确定和取消 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small" @click="btnCancel">取消</el-button>
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {
  getDepartments,
  addDepartments,
  getDepartDetail,
  updateDepartments,
} from "@/api/departments";
import { getEmployeesSimple } from "@/api/employees";
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    treeNode: {
      type: Object,
      default: null,
    },
  },
  data() {
    const checkNameRepeat = async (rule, value, callback) => {
      // value 是部门名称 要和同级部门下的部门进行比较 有相同不能过
      const { depts } = await getDepartments();
      //   console.log(this.treeNode);
      // 找同级部门下 有没有和value相同的数据
      // 找到同级部门所有子部门 找有没有与value相同名字的部门
      //   debugger;
      let isRepeat = false;
      if (this.formData.id) {
        // 有id是编辑模式
        // 编辑的数据 在数据库里有
        isRepeat = depts
          .filter(
            (item) =>
              item.pid === this.treeNode.pid && item.id !== this.treeNode.id
          )
          .some((item) => item.name === value);
      } else {
        // 没有id是新增模式
        isRepeat = depts
          .filter((item) => item.pid === this.treeNode.id)
          .some((item) => item.name === value);
      }

      // isRepeat 为true 表示找到了一样的名字
      isRepeat
        ? callback(new Error(`同级部门下已存在${value}部门`))
        : callback();
    };
    const checkCodeRepeat = async (rule, value, callback) => {
      const { depts } = await getDepartments();
      // 要求编码 和所有的部门编码都不能重复
      let isRepeat = false;
      if (this.formData.id) {
        // 有id是编辑模式
        isRepeat = depts
          .filter((item) => item.id !== this.treeNode.id)
          .some((item) => item.code === value && value);
      } else {
        // 没有id是新增模式
        isRepeat = depts.some((item) => item.code === value && value);
      }

      isRepeat
        ? callback(new Error(`组织架构下已存在${value}编码了`))
        : callback();
    };
    return {
      // 定义一个表单数据
      formData: {
        name: "",
        manager: "",
        code: "",
        introduce: "",
      },
      rules: {
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门名称长度应为1-50个字符",
            trigger: "blur",
          },
          { trigger: "blur", validator: checkNameRepeat },
        ],
        manager: [
          { required: true, message: "部门负责人不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "部门编码不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门编码长度应为1-50个字符",
            trigger: "blur",
          },
          { trigger: "blur", validator: checkCodeRepeat },
        ],
        introduce: [
          { required: true, message: "部门介绍不能为空", trigger: "blur" },
          {
            min: 1,
            max: 300,
            message: "部门介绍长度应为1-300个字符",
            trigger: "blur",
          },
        ],
      }, // 校验规则{key:数组}
      peoples: [],
    };
  },
  computed: {
    showTitle() {
      return this.formData.id ? "编辑部门" : "新增子部门";
    },
  },
  methods: {
    async getEmployeesSimple() {
      this.peoples = await getEmployeesSimple();
    },
    btnOK() {
      // 手动校验表单
      this.$refs.deptForm.validate(async (isOK) => {
        if (isOK) {
          if (this.formData.id) {
            // 编辑
            await updateDepartments(this.formData);
          } else {
            // 表单验证通过
            await addDepartments({ ...this.formData, pid: this.treeNode.id });
          }

          // 更新数据
          this.$emit("addDepts");
          // 子组件 update:固定写法 (update:props名称, 值)
          this.$emit("update:showDialog", false);
        }
      });
    },
    btnCancel() {
      // 重置数据
      this.formData = {
        name: "",
        manager: "",
        code: "",
        introduce: "",
      };
      // 关闭弹层
      this.$emit("update:showDialog", false);
      // 清除之前的校验
      this.$refs.deptForm.resetFields();
    },
    // 获取详情方法
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id);
    },
  },
};
</script>

<style></style>
