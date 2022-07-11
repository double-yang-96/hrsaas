<template>
  <!-- 必须给高宽 -->
  <div ref="myDiv" class="radar-echart"></div>
</template>

<script>
// var echarts = require("echarts");
var echarts = require("echarts/lib/echarts"); // 引入echarts主模块
require("echarts/lib/chart/radar");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");
export default {
  mounted() {
    const myChart = echarts.init(this.$refs.myDiv);
    myChart.setOption({
      title: {
        text: "基础雷达图",
      },
      tooltip: {},
      legend: {
        data: ["预算分配（Allocated Budget）", "实际开销（Actual Spending）"],
      },
      radar: {
        // shape: 'circle',
        name: {
          textStyle: {
            color: "#fff",
            backgroundColor: "#999",
            borderRadius: 3,
            padding: [3, 5],
          },
        },
        // 每个区域的最高值
        indicator: [
          { name: "工作效率", max: 100 },
          { name: "考勤", max: 100 },
          { name: "积极性", max: 100 },
          { name: "帮助同事", max: 100 },
          { name: "自主学习", max: 100 },
          { name: "正确率", max: 100 },
        ],
      },
      series: [
        {
          name: "预算 vs 开销（Budget vs spending）",
          type: "radar",
          // areaStyle: {normal: {}},
          data: [
            {
              value: [60, 50, 40, 25, 70, 40],
              name: "张三",
            },
            {
              value: [50, 50, 50, 50, 50, 30],
              name: "李四",
            },
          ],
        },
      ],
    });
  },
};
</script>

<style>
.radar-echart {
  width: 600px;
  height: 400px;
}
</style>
