let eleImg = document.getElementById("img");
let canvas = document.querySelector("canvas");
/**
 * @params source DOM 可以是图片或者视频元素
 **/
let fnCannyEdge = function (source, canvas, options) {
  options = options || {};
  // 可选参数
  let blur_radius = options.blur_radius || 2;
  let low_threshold = options.low_threshold || 20;
  let high_threshold = options.high_threshold || 50;
  // 资源的尺寸
  // 图片原始尺寸
  let originWidth = source.naturalWidth || source.width;
  let originHeight = source.naturalHeight || source.height;
  // 最大尺寸限制
  let maxWidth = 512,
    maxHeight = 512;
  // 目标尺寸
  let width = originWidth,
    height = originHeight;
  // 图片尺寸超过400x400的限制
  if (originWidth > maxWidth || originHeight > maxHeight) {
    if (originWidth / originHeight > maxWidth / maxHeight) {
      // 更宽，按照宽度限定尺寸
      width = maxWidth;
      height = Math.round(maxWidth * (originHeight / originWidth));
    } else {
      height = maxHeight;
      width = Math.round(maxHeight * (originWidth / originHeight));
    }
  }
  let context = canvas.getContext("2d");
  // canvas视觉展示
  canvas.width = source.width = width;
  canvas.height = source.height = height;
  // 清除内容
  context.clearRect(0, 0, width, height);
  // 或许图片信息
  context.drawImage(source, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  // 图像边缘查找处理
  // 原理为：
  // 1. 灰度
  // 2. 高斯模糊
  // 3. canny边缘检测
  let img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
  jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);
  let kernelSize = (blur_radius + 1) * 2;
  jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernelSize, 0);
  jsfeat.imgproc.canny(img_u8, img_u8, low_threshold, high_threshold);

  // 渲染结果重新绘制到canvas
  let data_u32 = new Uint32Array(imageData.data.buffer);
  let alpha = 0xff << 24;
  let i = img_u8.cols * img_u8.rows,
    pix = 0;
  while (--i >= 0) {
    pix = 255 - img_u8.data[i];
    data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
  context.putImageData(imageData, 0, 0);
};
// 图片回调处理
eleImg.addEventListener("load", function () {
  fnCannyEdge(this, canvas);
});
// 首次加载有可能上面回调不执行，window事件兜底
window.addEventListener("load", function () {
  fnCannyEdge(eleImg, canvas);
});

// 选择本地图片的处理
let reader = new FileReader();
// 文件base64化，以便获知图片原始尺寸
reader.onload = function (event) {
  eleImg.src = event.target.result;
};
// 选择的文件对象
let file = null;
document
  .getElementById("fileImg")
  .addEventListener("change", function (event) {
    file = event.target.files[0];
    // 选择的文件是图片
    if (file.type.indexOf("image") == 0) {
      reader.readAsDataURL(file);
    }
  });