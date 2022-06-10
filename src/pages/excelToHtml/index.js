      // 实例化对象
      let X = XLSX;
      //  渲染函数
      /*
       * param:
       * workbook sheet.js 读取后转化的对象
       */
      let process_wb = (function () {
        let HTMLOUT = document.getElementById("htmlout");
        let to_html = function to_html(workbook) {
          HTMLOUT.innerHTML = "";
          workbook.SheetNames.forEach(function (sheetName) {
            // sheet.js 输出html
            let htmlstr = X.write(workbook, {
              sheet: sheetName,
              type: "string",
              bookType: "html",
            });
            HTMLOUT.innerHTML += htmlstr;
          });
          return "";
        };

        return function process_wb(wb) {
          to_html(wb);
        };
      })();
      // 处理file文件流
      /*
       * param:
       * files  文件流
       */
      let do_file = (function () {
        return function do_file(files) {
          // 上传的excel文件流
          let f = files[0];
          let reader = new FileReader();
          reader.onload = function (e) {
            // ArrayBuffer 二进制对象
            let data = e.target.result;
            process_wb(X.read(data, { type: "array" }));
          };
          reader.readAsArrayBuffer(f);
        };
      })();

      (function () {
        // 获取按钮对象
        let xlf = document.getElementById("xlf");
        if (!xlf.addEventListener) return;
        function handleFile(e) {
          console.log(e);
          do_file(e.target.files);
        }
        // 监听上传 文件事件
        xlf.addEventListener("change", handleFile, false);
      })();