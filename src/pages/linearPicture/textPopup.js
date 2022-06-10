let fnTextPopup = function (arr, options) {
  // arr参数是必须的
  if (!arr || !arr.length) {
      return;    
  }
  // 主逻辑
  let index = 0;
  document.documentElement.addEventListener('click', function (event) {
      let x = event.pageX, y = event.pageY;
      let eleText = document.createElement('span');
      eleText.className = 'text-popup';
      this.appendChild(eleText);
      if (arr[index]) {
          eleText.innerHTML = arr[index];
      } else {
          index = 0;
          eleText.innerHTML = arr[0];
      }
      // 动画结束后删除自己
      eleText.addEventListener('animationend', function () {
          eleText.parentNode.removeChild(eleText);
      });
      // 位置
      eleText.style.left = (x - eleText.clientWidth / 2) + 'px';
      eleText.style.top = (y - eleText.clientHeight) + 'px';
      // index递增
      index++;
  });    
};

fnTextPopup(['我的宝','孙仙宏']);