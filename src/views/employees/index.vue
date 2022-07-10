<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <!-- <span slot="before">共16条记录</span> -->
        <template v-slot:before>
          <span slot="before">共{{ page.total }}条记录</span>
        </template>
        <!-- 右侧显示三个按钮  execl导入 execl导出  新增员工-->
        <template v-slot:after>
          <el-button
            size="small"
            type="success"
            @click="$router.push('/import')"
            >execl导入</el-button
          >
          <el-button size="small" type="danger" @click="exportData"
            >execl导出</el-button
          >
          <el-button size="small" type="primary" @click="showDialog = true"
            >新增员工</el-button
          >
        </template>
      </page-tools>
      <el-table border v-loading="loading" :data="list">
        <el-table-column label="序号" sortable="" type="index" />
        <el-table-column label="姓名" sortable="" prop="username" />
        <el-table-column label="头像" align="center">
          <template slot-scope="{ row }">
            <img
              @click="showQRCode(row.staffPhoto)"
              slot="reference"
              v-imagerror="require('@/assets/common/bigUserHeader.png')"
              :src="row.staffPhoto"
              style="
                border-radius: 50%;
                width: 100px;
                height: 100px;
                padding: 10px;
              "
              alt=""
            />
          </template>
        </el-table-column>
        <el-table-column label="工号" sortable="" prop="workNumber" />
        <el-table-column
          label="聘用形式"
          sortable=""
          prop="formOfEmployment"
          :formatter="formatEmployment"
        />
        <el-table-column label="部门" sortable="" prop="departmentName" />
        <!-- 作用域插槽处理时间格式 -->
        <el-table-column label="入职时间" sortable prop="timeOfEntry">
          <template slot-scope="{ row }">{{
            row.timeOfEntry | formatDate
          }}</template>
        </el-table-column>
        <el-table-column
          label="账户状态"
          align="center"
          sortable=""
          prop="enableState"
        >
          <template slot-scope="{ row }">
            <!-- 根据当前状态来确定 是否打开开关 -->
            <el-switch :value="row.enableState === 1" />
          </template>
        </el-table-column>
        <el-table-column label="操作" sortable="" fixed="right" width="280">
          <template v-slot="{ row }">
            <el-button
              type="text"
              size="small"
              @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button
            >
            <el-button type="text" size="small">转正</el-button>
            <el-button type="text" size="small">调岗</el-button>
            <el-button type="text" size="small">离职</el-button>
            <el-button type="text" size="small" @click="editRole(row.id)"
              >角色</el-button
            >
            <el-button type="text" size="small" @click="delEmployee(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-row type="flex" justify="center" align="middle" style="height: 60px">
        <el-pagination
          :current-page="page.page"
          :page-size="page.size"
          :total="page.total"
          @current-change="changePage"
          layout="prev,pager,next"
        />
      </el-row>
    </div>
    <!-- 放置组件弹层 -->
    <!-- sync修饰符 是 子组件去改变父组件的一个语法糖 -->
    <add-employee :show-dialog.sync="showDialog"></add-employee>
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas"></canvas>
      </el-row>
    </el-dialog>
    <!-- 放置权限分配组件 -->
    <assign-role
      ref="assignRole"
      :show-role-dialog.sync="showRoleDialog"
      :userId="userId"
    ></assign-role>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from "@/api/employees";
import AddEmployee from "./components/add-employee";
import AssignRole from "./components/assign-role"; // 引入用户权限组件
import EmployeeEnum from "@/api/constant/employees"; // 引入员工的枚举对象
import { formatDate } from "@/filters";
import QrCode from "qrcode";
export default {
  data() {
    return {
      list: [], // 接受数组
      page: {
        page: 1,
        size: 10,
        total: 0, // 总数
      },
      loading: false, // 显示遮罩层
      showDialog: false,
      showCodeDialog: false, // 显示二维码弹层
      showRoleDialog: false, // 显示分配角色弹层
      userId: null,
    };
  },
  components: {
    AddEmployee,
    AssignRole,
  },
  created() {
    this.getEmployeeList();
  },
  methods: {
    async getEmployeeList() {
      this.loading = true;
      const { total, rows } = await getEmployeeList(this.page);
      this.page.total = total;
      this.list = rows;
      // console.log(rows);
      this.loading = false;
    },
    changePage(newPage) {
      this.page.page = newPage;
      this.getEmployeeList();
    },
    // 格式化聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 要去找 1所对应的值
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue);
      return obj ? obj.value : "未知";
    },
    async delEmployee(id) {
      try {
        await this.$confirm("确定删除该员工吗？");
        // 点击了确定
        await delEmployee(id);
        this.$message.success("删除员工成功");
        this.getEmployeeList();
      } catch (err) {
        console.log(err);
      }
    },
    exportData() {
      // 导出Excel
      const headers = {
        姓名: "username",
        手机号: "mobile",
        入职日期: "timeOfEntry",
        聘用形式: "formOfEmployment",
        转正日期: "correctionTime",
        工号: "workNumber",
        部门: "departmentName",
      };
      // 懒加载
      import("@/vendor/Export2Excel").then(async (excel) => {
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total,
        });
        const data = this.formatJson(headers, rows);

        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: "员工信息表",
          autoWidth: true,
          bookType: "xlsx",
        });
      });
    },
    formatJson(headers, rows) {
      return rows.map((item) => {
        // item是一个对象  { mobile: 132111,username: '张三'  }
        // ["手机号", "姓名", "入职日期" 。。]
        return Object.keys(headers).map((key) => {
          // 需要判断 字段
          if (
            headers[key] === "timeOfEntry" ||
            headers[key] === "correctionTime"
          ) {
            // 格式化日期
            return formatDate(item[headers[key]]);
          } else if (headers[key] === "formOfEmployment") {
            const obj = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            );
            return obj ? obj.value : "未知";
          }
          return item[headers[key]];
        });
        // ["132", '张三’， ‘’，‘’，‘’d]
      });
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
      // 需要处理时间格式问题
    },
    showQRCode(url) {
      // url存在的情况下才弹出层
      if (url) {
        this.showCodeDialog = true;
        this.$nextTick(() => {
          QrCode.toCanvas(this.$refs.myCanvas, url);
        });
      } else {
        this.$message.warning("该用户还未上传头像");
      }
    },
    async editRole(id) {
      this.userId = id;
      await this.$refs.assignRole.getUserDetailById(id); // 调用子组件方法
      this.showRoleDialog = true;
    },
  },
};
</script>

<style></style>
