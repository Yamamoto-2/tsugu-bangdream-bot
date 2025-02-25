import { Chart, registerables } from 'chart.js';
import { Chart as ChartJSNode } from 'chart.js/auto';
import { Canvas, FontLibrary, loadImage } from 'skia-canvas';
import 'chartjs-adapter-moment';
import { assetsRootPath } from '@/config';
import { assetErrorImageBuffer } from '@/image/utils';

// 2. 注册 Chart.js 所有组件
Chart.register(...registerables);

// 3. 强制使用 `basic` platform，避免 DOM 相关错误
// ChartJSNode.defaults.platform = 'basic';

// 4. 配置字体（如果有的话）
FontLibrary.use("old", [`${assetsRootPath}/Fonts/old.ttf`]);

// 5. 定义参数接口
interface drawTimeLineChartOptions {
  start: Date;
  end: Date;
  setStartToZero?: boolean;
  data: {
    datasets: any[];
  };
}

// 6. 主函数：生成时间轴图表
export async function drawTimeLineChart(
  { start, end, setStartToZero = false, data }: drawTimeLineChartOptions,
  displayLabel = false
) {
  const width = 800;
  const height = 900;

  // 7. 创建 skia-canvas 实例
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  // 8. 计算 y 轴最大值
  const yMax = Math.max(
    ...data.datasets.map((dataset: any) =>
      Math.max(...dataset.data.map((pt: any) => pt.y))
    )
  );

  // 9. 配置 Chart.js 选项
  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 20,
          },
        },
        display: displayLabel,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
        min: start,
        max: end,
        display: !setStartToZero,
      },
      y: {
        min: 0,
        max: (yMax + 1000) * 1.1,
      },
    },
  };

  // 10. Chart.js 配置
  const config = {
    type: 'line' as const,
    data,
    options: {
      ...options,
      responsive: false, // 重要：关闭 Chart.js 自适应模式
      animation: false,
    },
  };

  try {
    // 11. 生成 Chart.js 图表
    const chart = new Chart(ctx as any, config as any);

    // 12. 返回 skia-canvas 的 Image 对象
    return canvas
  } catch (e) {
    console.error(e);
    return loadImage(assetErrorImageBuffer);
  }
}
