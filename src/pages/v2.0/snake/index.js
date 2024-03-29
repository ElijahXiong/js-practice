const directionType = {
  right: "right",
  left: "left",
  up: "up",
  down: "down",
};
const mapElement = document.getElementById("map"); // 地element
const highestScoreELe = document.getElementById("highestScore"); // 最高分数element
const currentScoreELe = document.getElementById("currentScore"); // 当前分数element
const model = document.getElementById("model"); // 模式element
const pauseElement = document.getElementById("pause"); // 暂停element
// 每个格子的大小
const nodeSize = 10;
const maxX = (mapElement.offsetWidth - 4) / nodeSize; // 地图最大的x轴
const maxY = (mapElement.offsetHeight - 4) / nodeSize; // 地图最大的y轴
let snakeBody = []; // 蛇身体节点
let direction = directionType.right; // 蛇头方向 'up、down、right、left'
let beforeDirection = directionType.right; // 操作前蛇头的方向
let food = { x: 5, y: 5 }; // 食物位置
let snakeElements = []; // 蛇Element
let isPause = true; // 暂停、继续
let isBegin = false; // 开始
let snakeSpeed = 100; // 小蛇移动速度 默认一百毫秒移动一次
let isOverGame = false; // 是否结束游戏
let raf = null; // requestAnimationFrame的id
let highestScore = Number(localStorage.getItem("highestScore") || 0);
let currentScore = 0; // 当前分数
let mapNode = []; // 地图的节点

/**
 * 选择模式
 * @param {*} val 执行间隔
 */
function handleModel(val) {
  // 选择模式
  if (isPause) {
    snakeSpeed = Number(val.value);
  }
}
/**
 * 开始游戏
 */
function begin() {
  if (isBegin) return;
  direction = directionType.right;
  beforeDirection = directionType.right;
  initSnakeBody();
  game();
  isPause = false;
  isBegin = true;
  isOverGame = false;
  model.disabled = true;
  currentScore = 0;
}
/**
 * 暂停/继续
 */
function pause() {
  if (!isBegin) return;
  if (!isPause) {
    model.disabled = false;
    isOverGame = true;
    pauseElement.innerText = "继续";
    isPause = !isPause;
  } else {
    // 继续游戏
    execute();
    model.disabled = true;
    isPause = !isPause;
    isOverGame = false;
    pauseElement.innerText = "暂停";
  }
}
/**
 * 初始蛇的身体
 */
function initSnakeBody() {
  snakeBody = [
    {
      x: 5,
      y: 2,
      color: "#f7155b",
    },
    {
      x: 4,
      y: 2,
      color: "#77d205",
    },
    {
      x: 3,
      y: 2,
      color: "#77d205",
    },
    {
      x: 2,
      y: 2,
      color: "#77d205",
    },
    {
      x: 1,
      y: 2,
      color: "#77d205",
    },
  ];
}
/**
 * 在地图生成蛇
 */
function createSnake() {
  deleteSnake();
  const snake = document.createElement("div");
  snake.id = "snake";
  mapElement.appendChild(snake);
  let snakeHtml = "";
  snakeBody.forEach((item) => {
    let snakeNode = `<div class="snake_node" style="width: ${nodeSize}px;height: ${nodeSize}px;background:${
      item.color
    };left:${item.x * nodeSize}px;top:${item.y * nodeSize}px"></div>`;
    snakeHtml += snakeNode;
  });
  snake.innerHTML = snakeHtml;
}
/**
 * 删除蛇的节点
 */
function deleteSnake() {
  const snakeFrame = document.getElementById("snake");
  if (snakeFrame) snakeFrame.remove();
}
/**
 * 开始游戏
 */
function game() {
  createSnake();
  productFood();
  listenKeyboard();
  execute();
}

/**
 * 蛇在地图上移动
 */
function execute() {
  let lastRefresh = 0;
  let randomImage = (time) => {
    //requestAnimationFrame调用回调函数的时候，会传入一个时间戳
    //通过这个时间戳进行比对来实现自定义延迟
    if (time - lastRefresh > snakeSpeed) {
      lastRefresh = time;
      snakeMove();
      checkSnakeOver();
      if (!isOverGame) createSnake();
    }
    //将自身作为参数传入实现重复调用
    raf = requestAnimationFrame(randomImage);
    if (isOverGame) {
      cancelAnimationFrame(raf);
    }
  };
  //初次调用，获得time参数
  //切记不能直接像randomImage()这样调用
  requestAnimationFrame(randomImage);
}
/**
 * 蛇移动位置
 */
function snakeMove() {
  if (food.x === snakeBody[0].x && food.y === snakeBody[0].y) {
    // 吃到食物
    const endNode = snakeBody[snakeBody.length - 1];
    // 可以随便赋值位置，反正会被覆盖掉
    snakeBody.push({ x: endNode.x, y: endNode.y, color: endNode.color });
    productFood();
    currentScore += 1;
    // 记录分数
    currentScoreELe.innerText = currentScore;
  }
  // TODO: 蛇头部加一，删除尾部
  for (let i = snakeBody.length - 1; i > 0; i--) {
    // 所有节点向前移动一个节点
    snakeBody[i].x = snakeBody[i - 1].x;
    snakeBody[i].y = snakeBody[i - 1].y;
  }
  switch (direction) {
    case directionType.right:
      snakeBody[0].x++;
      break;
    case directionType.left:
      snakeBody[0].x--;
      break;
    case directionType.up:
      snakeBody[0].y--;
      break;
    case directionType.down:
      snakeBody[0].y++;
      break;
  }
}

/**
 * 随机生成食物
 */
function productFood() {
  //空节点
  removeFood();
  const blankNode = mapNode.filter((outItem) => {
    // 判断蛇身体在哪些节点上
    return !snakeBody.find(
      (inItem) => outItem[0] === inItem.x && outItem[1] === inItem.y
    );
  });
  const index = Math.floor(Math.random() * (blankNode.length - 1));
  const foodX = blankNode[index][0];
  const foodY = blankNode[index][1];
  food.x = foodX;
  food.y = foodY;
  const foodElem = document.createElement("div");
  foodElem.className = "food";
  foodElem.style.width = nodeSize + "px";
  foodElem.style.height = nodeSize + "px";
  foodElem.style.left = foodX * nodeSize + "px";
  foodElem.style.top = foodY * nodeSize + "px";
  foodElem.id = "food";
  mapElement.appendChild(foodElem);
}
/**
 * 移除食物
 */
function removeFood() {
  const eatFood = document.getElementById("food");
  if (eatFood) eatFood.remove();
}
/**
 * 判断是否打破记录、状态更改
 */
function newRocord() {
  isOverGame = true;
  isBegin = false;
  isPause = true;
  model.disabled = false;
  highestScore = Number(localStorage.getItem("highestScore") || 0);
  if (highestScore < currentScore) {
    localStorage.setItem("highestScore", currentScore);
    highestScoreELe.innerText = currentScore;
  }
  currentScoreELe.innerText = 0;
}
/**
 * 检查蛇是否移动到边界、是否撞到身体
 */
function checkSnakeOver() {
  const headX = snakeBody[0].x;
  const headY = snakeBody[0].y;

  // 边界
  if (headX < 0 || headX >= maxX || headY < 0 || headY >= maxY) {
    newRocord();
    alert("GAME OVER!撞到墙");
    return;
  }

  const isKnock = snakeBody.find((item, index) => {
    if (index) {
      if (item.x === headX && item.y === headY) {
        console.log("... x,y", snakeBody);
        return true;
      }
    }
    return false;
  });

  // 撞到身体
  if (isKnock) {
    newRocord();
    alert("GAME OVER!撞到身体");
    return;
  }

  // 是否吃完所有食物
  if (maxX * maxY <= snakeBody.length) {
    newRocord();
    alert("Congratulate!");
    return;
  }
}

/**
 * 监听键盘事件、上下左右
 */
function listenKeyboard() {
  let timerHandle = null;
  document.addEventListener("keydown", function (e) {
    // 防抖
    clearTimeout(timerHandle);
    timerHandle = setTimeout(() => {
      switch (e.key) {
        // 向左，如果之前蛇头状态向右，蛇头不允许向左
        case "ArrowLeft":
          if (beforeDirection !== directionType.right) {
            direction = directionType.left;
          }
          break;
        // 向上
        case "ArrowUp":
          if (beforeDirection !== directionType.down) {
            direction = directionType.up;
          }
          break;
        // 向右
        case "ArrowRight":
          if (beforeDirection !== directionType.left) {
            direction = directionType.right;
          }
          break;
        // 向下
        case "ArrowDown":
          if (beforeDirection !== directionType.up) {
            direction = directionType.down;
          }
          break;
      }
      beforeDirection = direction;
    }, snakeSpeed);
  });
}

/**
 * 进入页面的部署；
 * 监听开始暂停键盘事件、最高分数
 */
window.onload = function initDeployment() {
  // 列数
  let lineNum = maxY - 1;
  // 横数
  let scrossNum = maxX - 1;
  // 地图节点个数
  for (let x = 0; x <= scrossNum; x++) {
    for (let y = 0; y <= lineNum; y++) {
      mapNode.push([x, y]);
    }
  }

  highestScoreELe.innerText = highestScore;
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      // 空格键暂停、继续
      case " ":
        pause();
        break;
      // 开始游戏
      case "Enter":
        begin();
        break;
    }
  });
};
