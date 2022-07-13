const directionType = {
  right: "right",
  left: "left",
  up: "up",
  down: "down",
};
let snakeBody = []; // 蛇身体节点
const snakeSize = 10; // 节点大小
let direction = directionType.right; // 蛇头方向 'up、down、right、left'
let beforeDirection = directionType.right; // 操作前蛇头的方向
const mapElement = document.getElementById("map"); // 地element
let food = { x: 5, y: 5 }; // 食物位置
let snakeElements = []; // 蛇Element
let isPause = true; // 暂停、继续
let isBegin = false; // 开始
let snakeSpeed = 200; // 小蛇移动速度 默认一百毫秒移动一次
const pauseElement = document.getElementById("pause"); // 暂停element
const maxX = (mapElement.offsetWidth - 4) / snakeSize; // 地图最大的x轴
const maxY = (mapElement.offsetHeight - 4) / snakeSize; // 地图最大的y轴
let isOverGame = false; // 是否结束游戏
let raf = null; // requestAnimationFrame的id
const model = document.getElementById("model"); // 模式element
const highestScoreELe = document.getElementById("highestScore"); // 最高分数element
const currentScoreELe = document.getElementById("currentScore"); // 当前分数element
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
    const index = val.selectedIndex;
    snakeSpeed = Number(val.options[index].value);
  }
}
/**
 * 开始游戏
 */
function begin() {
  if (!isBegin) {
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
  snakeBody.forEach((item) => {
    const snakeNode = document.createElement("div");
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
    currentScore = currentScore++;
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
  const blankNode = mapNode.filter(outItem=>{
    // 判断蛇身体在哪些节点上
    return !snakeBody.find(
      (inItem) => outItem[0] === inItem.x && outItem[1] === inItem.y
    );
  })
  const index = Math.floor(Math.random() * (blankNode.length - 1));
  const foodX = blankNode[index][0];
  const foodY = blankNode[index][1];
  food.x = foodX;
  food.y = foodY;
  const foodElem = document.createElement("div");
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
  if (highestScore < currentScore) {
    localStorage.setItem("highestScore", currentScore);
    highestScoreELe.innerText = currentScore;
  }
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
    alert("GAME OVER!");
  }

  const isKnock = snakeBody.find((item, index) => {
    if (index) return item.x === headX && item.y === headY;
  });
  // 撞到身体
  if (isKnock) {
    newRocord();
    alert("GAME OVER!");
  }

  // 是否吃完所有食物
  if (maxX * maxY <= snakeBody.length) {
    newRocord();
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
    // 防抖
    timerHandle = setTimeout(() => {
      switch (e.key) {
        // 向左，如果之前蛇头状态向右，蛇头不允许向左
        case "ArrowLeft":
          if (beforeDirection !== directionType.right) {
            direction = directionType.left;
            beforeDirection = direction;
          }
          break;
        // 向上
        case "ArrowUp":
          if (beforeDirection !== directionType.down) {
            direction = directionType.up;
            beforeDirection = direction;
          }
          break;
        // 向右
        case "ArrowRight":
          if (beforeDirection !== directionType.left) {
            direction = directionType.right;
            beforeDirection = direction;
          }
          break;
        // 向下
        case "ArrowDown":
          if (beforeDirection !== directionType.up) {
            direction = directionType.down;
            beforeDirection = direction;
          }
          break;
        // 向下
        case "ArrowDown":
          if (beforeDirection !== directionType.up) {
            direction = directionType.down;
            beforeDirection = direction;
          }
          break;
      }
    }, snakeSpeed);
  });
}

/**
 * 进入页面的部署；
 * 监听开始暂停键盘事件、最高分数
 */
window.onload = function initDeployment() {
  for (let x = 0; x <= 79; x++) {
    for (let y = 0; y <= 49; y++) {
      mapNode.push([x, y]);
    }
  }
  highestScoreELe.innerText = highestScore;
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      // 开始游戏
      case " ":
        pause();
        break;
      // 空格键暂停、继续
      case "Enter":
        begin();
        break;
    }
  });
};
