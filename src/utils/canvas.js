// 计算顶点数组的平均点
export const getAvaragePoint = (points) => {
  let totalX = 0;
  let totalY = 0;
  // 循环遍历顶点数组，每两个元素为一个点的坐标
  for (let i = 0; i < points.length; i += 2) {
    totalX += points[i]; // 累加X坐标
    totalY += points[i + 1]; // 累加Y坐标
  }
  // 返回平均点的坐标对象
  return {
    x: totalX / (points.length / 2),
    y: totalY / (points.length / 2),
  };
};

// 计算两个节点之间的距离
export const getDistance = (node1, node2) => {
  let diffX = Math.abs(node1[0] - node2[0]); // X坐标之差的绝对值
  let diffY = Math.abs(node1[1] - node2[1]); // Y坐标之差的绝对值
  const distanceInPixel = Math.sqrt(diffX * diffX + diffY * diffY); // 计算欧几里得距离
  return Number.parseFloat(distanceInPixel).toFixed(2); // 返回保留两位小数的距离值
};

// 限制拖动的边界
export const dragBoundFunc = (stageWidth, stageHeight, vertexRadius, pos) => {
  let x = pos.x;
  let y = pos.y;
  // 如果顶点超出舞台范围，则限制在舞台内
  if (pos.x + vertexRadius > stageWidth) x = stageWidth;
  if (pos.x - vertexRadius < 0) x = 0;
  if (pos.y + vertexRadius > stageHeight) y = stageHeight;
  if (pos.y - vertexRadius < 0) y = 0;
  // 返回限制后的坐标对象
  return { x, y };
};

// 计算数组中的最小值和最大值
export const minMax = (points) => {
  // 使用reduce函数计算最小值和最大值
  return points.reduce((acc, val) => {
    acc[0] = acc[0] === undefined || val < acc[0] ? val : acc[0]; // 更新最小值
    acc[1] = acc[1] === undefined || val > acc[1] ? val : acc[1]; // 更新最大值
    return acc;
  }, []);
};
