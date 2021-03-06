const WEEK = ["一", "二", "三", "四", "五", "六", "日"];
const Month = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
  "1月",
  "2月",
  "3月",
  "4月",
];
let yearList = []; // 年选择列表
let checkedYear = 0; // 选中的年
let checkedMonth = 1; // 选中的月

let currentYear = 0; // 当前年
let currentMonth = 1; // 当前月
let currentDay = 1; //当前日

let currentPanel = "day"; // 当前面板 year month day

let startYear = 0; // 年列表头部
let endYear = 0; // 年列表尾部

const dayElement = document.getElementById("day");
const weekElement = document.getElementById("week");

/**
 * 初始化数据
 */
;(function initData() {
  let current = new Date();
  startYear = checkedYear = currentYear = current.getFullYear();
  checkedMonth = currentMonth = current.getMonth() + 1;
  endYear = startYear + 15;
  currentDay = current.getDate();
  setMonth();
  getDateList(current);
  setInterval(getCurrentTime, 1000);
})()

/**
 * 选中年月
 */
function selectDate() {
  // 清除列表
  if (currentPanel === "year") return;
  deleteDom(dayElement);
  deleteDom(weekElement);
  // 切换面板
  if (currentPanel === "day") {
    // 进入月面板
    currentPanel = "month";
    goMonthPanel();
  } else if (currentPanel === "month") {
    // 进入年面板
    currentPanel = "year";
    goYearPanel();
  }
  setMonth();
}

function goCurrentDate() {
  // 回到当前日期
  dayElement.removeEventListener("click", listenerClickMonth);
  dayElement.removeEventListener("click", listenerClickYear);
  checkedMonth = currentMonth;
  checkedYear = currentYear;
  currentPanel = "day";
  getDateList(new Date(`${currentYear}-${currentMonth}-${currentDay}`)); // 进入日期面板
  setMonth();
}
/**
 * 监听点击的月份
 * @param {Element} e 点击的element
 */
function listenerClickMonth(e) {
  let month = Number(e.target.id);
  // 防止选择空白区域
  if (month !== 0 && !month) return;

  if (month < 12) {
    checkedMonth = month + 1;
  } else {
    // 下一年的月份
    checkedMonth = month - 11;
    checkedYear += 1;
  }

  dayElement.removeEventListener("click", listenerClickMonth);
  getDateList(new Date(`${checkedYear}-${checkedMonth}`)); // 进入日期面板
  currentPanel = "day";
  setMonth();
}
/**
 * 月份选择面板
 */
function goMonthPanel() {
  deleteDom(dayElement);
  dayElement.className = "month";
  Month.forEach((item, index) => {
    let div = document.createElement("div");
    div.className =
      index + 1 === currentMonth && currentYear === checkedYear
        ? "current-month"
        : "month-grid";
    div.id = `${index}`;
    if (index > 11) {
      div.style = "color: #908e8e;";
    }
    div.innerText = item;
    dayElement.appendChild(div);
  });
  dayElement.addEventListener("click", listenerClickMonth);
}
/**
 * 年份选择面板
 */
function goYearPanel() {
  dayElement.removeEventListener("click", listenerClickMonth);
  dayElement.removeEventListener("click", listenerClickYear);
  deleteDom(dayElement);
  let grid = 0;
  while (grid < 16) {
    let div = document.createElement("div");
    let indexNum = grid + startYear;
    div.className = currentYear === indexNum ? "current-month" : "month-grid";
    div.innerText = indexNum;
    div.id = `${indexNum}`;
    dayElement.appendChild(div);
    grid++;
  }
  dayElement.addEventListener("click", listenerClickYear);
}
/**
 * 监听年的点击事件
 * @param {Element} e 点击的element
 */
function listenerClickYear(e) {
  let year = Number(e.target.id);
  if (!year) return; // 防止选择空白区域
  checkedYear = year;
  currentPanel = "month";
  setMonth();
  goMonthPanel();
  dayElement.removeEventListener("click", listenerClickYear);
}
/**
 * 设置选中日期，显示切换内容
 */
function setMonth() {
  let selectTime = document.getElementById("selectTime");
  let desc = "";
  switch (currentPanel) {
    case "day":
      desc = `${checkedYear} 年 ${String(checkedMonth).padStart(2, 0)} 月`;
      break;
    case "month":
      desc = `${checkedYear} 年`;
      break;
    case "year":
      desc = `${startYear}-${endYear}`;
      break;
  }
  selectTime.innerText = desc;
}
/**
 * 清除节点
 * @param {Element} elem element
 */
function deleteDom(elem) {
  while (elem.hasChildNodes()) {
    //当elem下还存在子节点时 循环继续
    elem.removeChild(elem.firstChild);
  }
}
/**
 * 一个月天数列表
 * @param {Date} current 月份
 */
function getDateList(current) {
  dayElement.className = "day";
  deleteDom(dayElement);
  let month = current.getMonth() + 1;

  if (!weekElement.hasChildNodes()) {
    WEEK.forEach((item) => {
      let div = document.createElement("div");
      div.className = "day-grid";
      div.innerText = item;
      weekElement.appendChild(div);
    });
  }

  let grid = 1;
  current.setMonth(month);
  current.setDate(0);
  let endDay = current.getDate(); // 最后一天
  current.setDate(1);
  let startDay = 0; // 当月开始天数

  if (current.getDay() === 0) {
    startDay = 6;
  } else {
    startDay = current.getDay() - 1; // 当月第一天的星期 1，2，3，4，5，6，0
  }

  while (grid <= 42) {
    let div = document.createElement("div");

    if (grid > startDay && grid - startDay <= endDay) {
      div.className =
        currentDay === grid - startDay &&
        currentMonth === checkedMonth &&
        checkedYear === currentYear
          ? "current-day"
          : "day-grid";
      div.innerText = grid - startDay;
    } else {
      div.className = "blank-grid";
    }
    dayElement.appendChild(div);
    grid++;
  }
}
/**
 * 当前时间
 */
function getCurrentTime() {
  const current = new Date();
  let hour = String(current.getHours()).padStart(2, 0);
  let minute = String(current.getMinutes()).padStart(2, 0);
  let second = String(current.getSeconds()).padStart(2, 0);
  let year = current.getFullYear();
  let month = String(current.getMonth() + 1).padStart(2, 0);
  let day = String(current.getDate()).padStart(2, 0);
  let time = document.getElementById("time");
  let date = document.getElementById("date");
  time.innerText = `${hour}:${minute}:${second}`;
  date.innerText = `${year} 年 ${month} 月 ${day} 日`;
}

/**
 * 上一个年或月或日
 */
function handleUp() {
  switch (currentPanel) {
    case "day":
      upMonth();
      break;
    case "month":
      upYear();
      break;
    case "year":
      upSectionYear();
      break;
  }
}
/**
 * 下一个年或月或日
 */
function handleDown() {
  switch (currentPanel) {
    case "day":
      downMonth();
      break;
    case "month":
      downYear();
      break;
    case "year":
      downSectionYear();
      break;
  }
}
/**
 * 上一个区间年份
 */
function upSectionYear() {
  startYear -= 16;
  endYear = startYear - 16;
  goYearPanel();
}
/**
 * 下一个区间年份
 */
function downSectionYear() {
  startYear += 16;
  endYear = startYear + 16;
  goYearPanel();
}
/**
 * 上一年
 */
function upYear() {
  // if (checkedYear <= 1922 && checkedYear >=2122) return;
  let el = document.getElementById(`${currentMonth - 1}`);
  checkedYear -= 1;
  el.className = currentYear === checkedYear ? "current-month" : "month-grid";
  setMonth();
}
/**
 * 下一年
 */
function downYear() {
  // if (checkedYear <= 1922 && checkedYear >=2122) return;
  let el = document.getElementById(`${currentMonth - 1}`);
  checkedYear += 1;
  el.className = currentYear === checkedYear ? "current-month" : "month-grid";
  setMonth();
}
/**
 * 上一个月
 */
function upMonth() {
  if (checkedMonth === 1) {
    checkedMonth = 12;
    checkedYear -= 1;
  } else {
    checkedMonth -= 1;
  }
  setMonth();
  getDateList(new Date(`${checkedYear}-${checkedMonth}`));
}

/**
 * 下一个月
 */
function downMonth() {
  // 
  if (checkedMonth === 12) {
    checkedMonth = 1;
    checkedYear += 1;
  } else {
    checkedMonth += 1;
  }
  setMonth();
  getDateList(new Date(`${checkedYear}-${checkedMonth}`));
}
