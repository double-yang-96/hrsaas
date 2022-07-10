<template>
  <div>
    <el-upload
      action="#"
      list-type="picture-card"
      :limit="1"
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :http-request="upload"
      :class="{ disabled: fileComputed }"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <img :src="imgUrl" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5"; // 引入腾讯云cos包
const cos = new COS({
  SecretId: "AKIDlMhla8VdXAWaNvDExQbV8VbQyFFyQcYD", // 身份识别id
  SecretKey: "PXOyHI2VifLlulLfiV4MN7amhMHwKRHq", // 身份秘钥
});
export default {
  data() {
    return {
      showDialog: false,
      imgUrl: "",
      currentFileUid: null, // 记录当前正在上传的uid
      fileList: [],
      percent: 0, //记录当前百分比
      showPercent: false,
    };
  },
  computed: {
    fileComputed() {
      return this.fileList.length === 1;
    },
  },
  methods: {
    preview(file) {
      this.imgUrl = file.url;
      this.showDialog = true;
    },
    handleRemove(file, fileList) {
      //   this.fileList = fileList;
      this.fileList = this.fileList.filter((item) => item.uid !== file.uid);
    },
    changeFile(file, fileList) {
      this.fileList = fileList.map((item) => item);
    },
    beforeUpload(file) {
      // 文件类型 文件大小
      const types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      if (!types.includes(file.type)) {
        this.$message.error("上传图片只能是 JPG、GIF、BMP、PNG 格式!");
        return false;
      }
      // 检查大小
      const maxSize = 5 * 1024 * 1024;
      if (maxSize < file.size) {
        this.$message.error("图片大小最大不能超过5M");
        return false;
      }
      this.currentFileUid = file.uid;
      return true;
    },
    // 进行上传操作
    upload(params) {
      if (params.file) {
        // 执行上传操作
        cos.putObject(
          {
            Bucket: "touxiang-1312842688", // 存储桶
            Region: "ap-nanjing", // 地域
            Key: params.file.name, // 文件名
            Body: params.file, // 要上传的文件对象
            StorageClass: "STANDARD", // 上传的模式类型 标准模式
            onProgress: (params) => {
              this.percent = params.percent * 100;
            },
          },
          (err, data) => {
            console.log(err || data);
            // data中有一个statusCode === 200 的时候说明上传成功
            if (!err && data.statusCode === 200) {
              // 此时说明文件上传成功 要获取返回的成功地址
              this.fileList = this.fileList.map((item) => {
                if (item.uid === this.currentFileUid) {
                  return { url: "http://" + data.Location, upload: true };
                }
                return item;
              });
              // 将上传成功的地址 回写到了fileList中
            }
          }
        );
      }
    },
  },
};
</script>

<style>
.disabled .el-upload--picture-card {
  display: none;
}
</style>
