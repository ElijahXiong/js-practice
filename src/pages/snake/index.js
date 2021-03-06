const directionType = {
  right: "right",
  left: "left",
  up: "up",
  down: "down",
};
let snakeBody = []; // 蛇身体节点
let snakeSize = 10; // 节点大小
let direction = directionType.right; // 蛇头方向 'up、down、right、left'
let beforeDirection = directionType.right; // 操作前蛇头的方向
const mapElement = document.getElementById("map"); // 地element
let setAction = ""; // 执行
let isGameOver = false; // 防止撞到后的再生成新dom
let food = { x: 5, y: 5 }; // 食物位置
let snakeElements = []; // 蛇Element
let isPause = false; // 暂停、继续
let isBegin = false; // 开始
let snakeSpeed = 80; // 小蛇移动速度 默认一百毫秒移动一次
let pauseElement = document.getElementById("pause"); // 暂停element
let maxX = (mapElement.offsetWidth - 4) / snakeSize; // 地图最大的x轴
let maxY = (mapElement.offsetHeight - 4) / snakeSize; // 地图最大的y轴
/**
 * 选择模式
 * @param {*} val 执行间隔
 */
function handleModel(val) {
  // 选择模式
  let model = document.getElementById("model");
  // if (!isBegin) {
  //   // model.disabled = false;
  let index = val.selectedIndex;
  snakeSpeed = Number(val.options[index].value);
  //   console.log('==========1', snakeSpeed)
  // } else {
  //   // model.disabled = true;
  // }
}
/**
 * 开始游戏
 */
function begin() {
  if (!isBegin) {
    direction = directionType.right;
    beforeDirection = directionType.right;
    isGameOver = false;
    initSnakeBody();
    game();
    isBegin = !isBegin;
  }
}
/**
 * 暂停/继续
 */
function pause() {
  if (!isBegin) return;
  if (!isPause) {
    clearInterval(setAction);
    pauseElement.innerText = "继续";
    isPause = !isPause;
  } else {
    execute();
    isPause = !isPause;
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
  let snake = document.createElement("div");
  snake.id = "snake";
  mapElement.appendChild(snake);
  snakeBody.forEach((item) => {
    let snakeNode = document.createElement("div");
    snakeNode.className = "snake";
    snakeNode.style.width = snakeSize + "px";
    snakeNode.style.height = snakeSize + "px";
    snakeNode.style.background = item.color;
    snakeNode.style.left = item.x * snakeSize + "px";
    snakeNode.style.top = item.y * snakeSize + "px";
    snake.appendChild(snakeNode);
    // snakeElements.push(snakeNode);
  });
}
/**
 * 删除蛇的节点
 */
function deleteSnake() {
  let snakeFrame = document.getElementById("snake");
  if (snakeFrame) snakeFrame.remove();
  // for (var i = 0; i < snakeElements.length; i++) {
  //   snakeElements[i].remove();
  // }
  // snakeElements = [];
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
  console.log('==========2', snakeSpeed)
  setAction = setInterval(function () {
    snakeMove();
    checkSnakeOver();
    if (!isGameOver) createSnake();
  }, snakeSpeed);
}
/**
 * 蛇移动位置
 */
function snakeMove() {
  if (food.x === snakeBody[0].x && food.y === snakeBody[0].y) {
    // 吃到食物
    let endNode = snakeBody[snakeBody.length - 1];
    // 可以随便赋值位置，反正会被覆盖掉
    snakeBody.push({ x: endNode.x, y: endNode.y, color: endNode.color });
    productFood();
  }

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
  removeFood();
  let foodX = 0;
  let foodY = 0;
  let inSnakeBody = true;
  // 当食物节点在蛇身体上再次生成
  while (inSnakeBody) {
    foodX = Math.floor(Math.random() * ((maxX - 10)));
    foodY = Math.floor(Math.random() * ((maxY - 10)));
    inSnakeBody = snakeBody.find((item) => {
      return item.x === foodX && item.y === foodY;
    });
  }
  food.x = foodX;
  food.y = foodY;
  let foodElem = document.createElement("div");
  foodElem.className = "food";
  foodElem.style.width = snakeSize + "px";
  foodElem.style.height = snakeSize + "px";
  foodElem.style.left = foodX * snakeSize + "px";
  foodElem.style.top = foodY * snakeSize + "px";
  foodElem.id = "food";
  mapElement.appendChild(foodElem);
}
/**
 * 移除食物
 */
function removeFood() {
  let eatFood = document.getElementById("food");
  if (eatFood) eatFood.remove();
}

/**
 * 检查蛇是否移动到边界、是否撞到身体
 */
function checkSnakeOver() {
  let headX = snakeBody[0].x;
  let headY = snakeBody[0].y;
  // 边界
  if (headX < 0 || headX >= maxX || headY < 0 || headY >= maxY) {
    clearInterval(setAction);
    if (headX >= maxX || headX <= 0 || headY >= maxY || headY <= 0) {
      isGameOver = true;
    }
    isBegin = false;
    alert("GAME OVER!");
  }

  let isKnock = snakeBody.find((item, index) => {
    if (index) return item.x === headX && item.y === headY;
  });
  // 撞到身体
  if (isKnock) {
    isGameOver = true;
    clearInterval(setAction);
    isBegin = false;
    alert("GAME OVER!");
  }

  // 是否吃完所有食物
  if (maxX * maxY <= snakeBody.length) {
    isGameOver = true;
    clearInterval(setAction);
    isBegin = false;
    alert("Congratulate!");
  }
}

/**
 * 监听键盘事件、上下左右
 */
function listenKeyboard() {
  let timerHandle = null;
  document.addEventListener("keydown", function (e) {
    clearTimeout(timerHandle);
    // // 防抖
    timerHandle = setTimeout(() => {
      switch (e.key) {
        // 向左，如果之前蛇头状态向右，蛇头不允许向左
        case "ArrowLeft":
          direction =
            beforeDirection === directionType.right
              ? directionType.right
              : directionType.left;
          beforeDirection = direction;
          break;
        // 向上
        case "ArrowUp":
          direction =
            beforeDirection === directionType.down
              ? directionType.down
              : directionType.up;
          beforeDirection = direction;
          break;
        // 向右
        case "ArrowRight":
          direction =
            beforeDirection === directionType.left
              ? directionType.left
              : directionType.right;
          beforeDirection = direction;
          break;
        // 向下
        case "ArrowDown":
          direction =
            beforeDirection === directionType.up
              ? directionType.up
              : directionType.down;
          beforeDirection = direction;
          break;
      }
    }, snakeSpeed);
  });
}
