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
let isOverGame = false; // 是否结束游戏
let raf = null; // requestAnimationFrame的id
let model = document.getElementById("model"); // 模式element
/**
 * 选择模式
 * @param {*} val 执行间隔
 */
function handleModel(val) {
  // 选择模式
  if (!isPause) {
    let index = val.selectedIndex;
    snakeSpeed = Number(val.options[index].value);
  }
}
/**
 * 开始游戏
 */
function begin() {
  console.log("===============", isBegin);
  if (!isBegin) {
    direction = directionType.right;
    beforeDirection = directionType.right;
    isGameOver = false;
    initSnakeBody();
    game();
    isBegin = !isBegin;
    isOverGame = false;
    model.disabled = true;
  }
};
/**
 * 暂停/继续
 */
function pause() {
  if (!isBegin) return;
  if (!isPause) {
    model.disabled = false;
    isOverGame = true;
    pauseElement.innerText = "继续";
    isOverGame = true;
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
  console.log("==========2", snakeSpeed);
  let lastRefresh = 0;
  let ctTime = 100;
  let randomImage = (time) => {
    //requestAnimationFrame调用回调函数的时候，会传入一个时间戳
    //通过这个时间戳进行比对来实现自定义延迟
    if (time - lastRefresh > snakeSpeed) {
      lastRefresh = time;
      snakeMove();
      checkSnakeOver();
      if (!isGameOver) createSnake();
      ctTime--;
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
    foodX = Math.floor(Math.random() * (maxX - 10));
    foodY = Math.floor(Math.random() * (maxY - 10));
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
    isOverGame = true;
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
    isOverGame = true;
    isBegin = false;
    alert("GAME OVER!");
  }

  // 是否吃完所有食物
  if (maxX * maxY <= snakeBody.length) {
    isGameOver = true;
    isOverGame = true;
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
    console.log("==============e", e.key);
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
 * 监听键盘事件开始暂停
 */

window.onload = function listenBegin() {
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      // 开始游戏
      case " ":
        console.log("=============空格");
        pause();
        break;
      // 空格键暂停、继续
      case "Enter":
        console.log("=============确定");
        begin();
        break;
    }
  });
};
