<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧内容 -->
            <el-row style="height: 60px"
              ><el-button type="primary" icon="el-icon-plus" size="small"
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
                  <el-button type="primary" size="small">编辑</el-button>
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
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole } from "@/api/setting";
import { tsThisType } from "@babel/types";
import { mapGetters } from "vuex";

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
      FormData: {
        // 公司信息
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
  },
};
</script>

<style></style>
