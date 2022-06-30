new Vue({
  el: "#app",
  data(){
    return{
      week:['一','二','三','四','五','六','日'],
      currentDay: 0,
      currentDateNum: 0,
      currentYear: 0,
      currentMonth: 0,
      currentDate: 0,
      nowDate: -1, //现在日期
      nowYear: -1,
      nowMonth: -1,
    }
  },
  mounted() {
    this.initDate()
  },
  computed: {
    isNowDate() {
      return this.nowMonth === this.currentMonth && this.nowYear===this.currentYear
    },
  },
  methods: {
    // 初始化
    initDate() {
      let date = new Date() 
      this.nowYear = date.getFullYear()
      this.nowMonth = date.getMonth()+1
      this.nowDate = date.getDate()
      this.getCurrentDateNum(date)
    },
    // 获取当月天数,起始星期
    getCurrentDateNum (date) {
      this.currentMonth = date.getMonth()+1 // 当前月份
      this.currentDate = date.getDate() //当前天数
      this.currentYear = date.getFullYear() //当年
      let month = 0
      if(date.getMonth() !== 11) {
        month = date.getMonth()+1
      }
      date.setMonth(month)
      date.setDate(0)
      this.currentDateNum = date.getDate() // 一个月中最后一天
      date.setDate(1)
      if(date.getDay() === 0 ) {
        this.currentDay = 6
      } else {
        this.currentDay = date.getDay()-1 // 当月第一天的星期 1，2，3，4，5，6，0
      }
      if(this.isNowDate) { //跟新天数
        let date = new Date() 
        this.nowYear = date.getFullYear()
        this.nowMonth = date.getMonth()+1
        this.nowDate = date.getDate()
      }
    },
    // 查询下一月
    getNextMonth() {
      let str =''
      if(this.currentMonth === 12) {
        str = `${this.currentYear+1}-${1}`
      } else {
        str = `${this.currentYear}-${this.currentMonth+1}-1`
      }
      let date = new Date(str)
      this.getCurrentDateNum(date)
    },
    // 查询上一月
    getUpMonth() {
      let str = ''
      if(this.currentMonth === 1) {
        str = `${this.currentYear-1}-${12}`
      } else {
        str = `${this.currentYear}-${this.currentMonth-1}-1`
      }
      let date = new Date(str)
      this.getCurrentDateNum(date)
    },
  },
});