// 点对象
class Bodies {
    constructor () {
      this.color = 'white' //颜色
      this.courseWareNum = '' //课件页数
      this.drawState = -1 //当前操作状态，-1：开始，0：移动ing，1：结束
      this.isBoard = 1 //黑板还是课件
      this.isEraser = false //画笔还是橡皮擦
      this.lastLineId = -1  //最后一条线id
      this.lineId = 1  //线id
      this.lineSize = 2  //粗细
      this.pointId = 0 //点id
      this.pointX = 0  //x坐标
      this.pointY = 0  //y坐标
      this.width = 0  //黑板对象 宽
      this.height = 0 //黑板对象 高
    }
  }
  
  // 最后一次画笔对象
  class LastPen {
    constructor ({ color = 'white', lineSize = 2 } = {}) {
      this.color = color
      this.lineSize = lineSize
    }
  }
  
  // 黑板 canvas 对象
  class Board {
    constructor ({ canvas, context, drawWidth, drawHeight } = {}) {
      this.canvas = canvas || null //canvas dom
      this.context = context || {} //canvas 对象
      this.drawWidth = drawWidth || 1000
      this.drawHeight = drawHeight || 500
    }
  }
  
  //  黑板
  class ClassBoard {
    constructor(maxPick) {
      this.version = '0.0.42'
      this.maxPick = maxPick || 10;   // 画布页数最多 maxPick 个
      this.dpr = Math.ceil(window.devicePixelRatio)
      this.backgroundColor = 'transparent'   // 画布背景颜色
      this.fileUrl = false;
      this.isEditor = false;// 编辑态
      this.colors = {   // 画笔颜色
        'red': 'red',
        'white': 'white',
        'green': 'green'
      }
      this.pies = {   // 画笔粗细
        'thin': 2,
        'normal': 4,
        'thick': 8
      }
  
      // 状态
      this.state = {
        isPortrait: true,    // 是否竖屏
        openFile: false,
        beginPoint: {},
        allChunks: [],
        menus: [],    // 工具栏
        editMenus: [
          {text: "放大", key: 'zoomIn', className:"hyfont fangda1", visible: this.fileUrl},
          {text: "缩小", key: 'shrink', className:"hyfont suoxiao1", visible: this.fileUrl},
          {text: "旋转", key: 'rotate', className:"hyfont xuanzhuan", visible: this.fileUrl},
          {text: "画笔", key: 'huabi', className:"hyfont ketang-huabi", visible: this.fileUrl},
          {text: "保存", key: 6, className:"hyfont baocun",visible: true}
        ],
        baseMenus: [
          {text: "编辑", key: 'edit', className:"hyfont bianji", visible: !this.fileUrl},
          {text: "新建", key: 0, className:"hyfont xinjianyiye", visible: !this.fileUrl},
          {text: "上一页", key: 1,className:"hyfont ketang-shangyiye", visible: !this.fileUrl},
          {text: "下一页", key: 2, className:"hyfont ketang-xiayiye", visible: !this.fileUrl},
          {text: "橡皮", key: 3,className:"hyfont ketang-cachu", visible: !this.fileUrl},
          {text: "清屏", key: 4, className:"hyfont ketang-qingkong", visible: !this.fileUrl},
          {text: "画笔", key: 5, className:"hyfont ketang-huabi", visible: !this.fileUrl},
          {text: "保存", key: 6, className:"hyfont baocun",visible: !this.fileUrl}
        ],
        penMenus: [
          {text: "画笔", key: 5, className:"hyfont ketang-huabi"},
          {text: "红", key: 7, value: this.colors.red, className:"span-icon icon-red"},
          {text: "白", key: 8, value: this.colors.white, className:"span-icon icon-white"},
          {text: "绿", key: 9, value: this.colors.green, className:"span-icon icon-green"},
          {text: "细", key: 10, value: this.pies.thin, className:"line-icon icon-fine"},
          {text: "中", key: 11, value: this.pies.normal, className:"line-icon icon-center"},
          {text: "粗", key: 12, value: this.pies.thick, className:"line-icon icon-thick"},
          {text: "保存", key: 6, className:"hyfont baocun"}
        ],
        bodies: new Bodies(),   // 点对象
        lastPen: new LastPen(), // 最后一次画笔对象
        board: new Board(),   // 黑板对象
        rate:1, //传入的宽高和实际canvas宽高 比
        points: [], //所有的被点击和移动中的点集合 {x, y}
        pointsNum: 0,   // 所有的被点击和移动中的点个数
        boardlist: [], //黑板 预览数据
        boardIndex: 0, // 黑板数量索引
        changeBard: true, // 是否可以新建黑板
        insertedImg: null    // 被插入的图片
      }
      if((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        this.isMobile = true
      } else {
        this.isMobile = false
      }
  
      this.handleScreenDirection = this.handleScreenDirection.bind(this)
    }
    touchMove () {
      const canvas = document.getElementById('canvas')
      canvas.addEventListener('touchstart', this.canvasDown.bind(this), false)
      canvas.addEventListener('touchmove', this.canvasMove.bind(this), false)
      canvas.addEventListener('touchend', this.canvasUp.bind(this), false)
    }
    initCanvas(isNotNeedData) {
      const cw = document.documentElement.clientWidth,
        ch = document.documentElement.clientHeight;
      let lw = cw, lh = ch;
      if (!this.isPC) {
        lw = cw > ch ? ch : cw
        lh = cw > ch ? cw : ch
      }
  
      const board = document.getElementById('board')
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext("2d");
      !isNotNeedData && canvas.setAttribute('class', 'pencil')
      canvas.setAttribute('width', lw)
      canvas.setAttribute('height', lh - 80)
      canvas.style.height = (lh - 80 + 'px')
      canvas.style.position = 'relative'
      canvas.style.zIndex = '1'
      context.mozImageSmoothingEnabled = false;
      context.webkitImageSmoothingEnabled = false;
      context.msImageSmoothingEnabled = false;
      context.imageSmoothingEnabled = false;
      context.fillStyle = this.backgroundColor;
      context.fillRect(0, 0, board.clientWidth, board.clientHeight);
      if (isNotNeedData) {
        return {canvas, context}
      }
  
      board.style.width = lw + 'px'
      board.style.height = lh + 'px'
      board.style.margin = '0 auto'
      board.style.overflow = 'hidden'
      this.state.menus = this.state.baseMenus
      this.isOpen = false     // 是否打开画笔配置菜单
      this.maxLength = false  // 控制新建按钮最大10页
      Object.assign(this.state.board, {
        canvas: canvas, // canvas dom
        context: context, // canvas 对象
        drawWidth: board.clientWidth, // canvas 容器宽
        drawHeight: board.clientHeight - 80 // canvas 容器高
      })
      // 放入第一页画布
      this.state.boardlist.push(null)
      // 渲染底部工具栏
      this.renderMenus()
      // 窗口变化，改变画布大小
      // window.onresize = this.resetWidth.bind(this)
  
      // 强制竖屏
      // this.initwh()
  
      // 当前为横屏还是竖屏
      // if (window.orientation === 0 || window.orientation === 180) {
      //     // 竖屏
      //     this.state.isPortrait = true
      // } else if (window.orientation === 90 || window.orientation === -90) {
      //     // 横屏
      //     this.state.isPortrait = false
      // }
      // // 监听横竖屏事件
      // try {
      //     this.screenDirection = window.matchMedia("(orientation: portrait)");
      //     this.screenDirection.addListener(this.handleScreenDirection, false)
      // } catch (e) {
      //     console.log('board-error:', e)
      // }
      // this.insterImagetoView('')
    }
    // 清空数据
    closeBoard() {
      // this.clearCanvas()
      this.resetData()
    }
    // 数据重置
    resetData() {
      this.state.bodies = new Bodies()
      this.state.lastPen = new LastPen()
      this.state.board = new Board()
      this.state.points = []
      this.state.pointsNum = 0
      this.state.boardlist = []
      this.state.boardIndex = 0
      this.state.changeBard = true
      clearTimeout(this.resizeBoard)
      this.fileUrl = false
      // this.screenDirection.removeListener(this.handleScreenDirection, false)
      const wareImageDiv = document.getElementById('wareImageDiv')
      if (!wareImageDiv) return
      wareImageDiv.removeEventListener('touchstart', this.startMoveImg, false)
      wareImageDiv.removeEventListener('touchmove', this.moveImg, false)
      // wareImageDiv.removeEventListener('touchend', this.moveEndImg, false)
    }
    // 添加orientation
    initwh (res) {
      const cw = document.documentElement.clientWidth,
        ch = document.documentElement.clientHeight;
      const lw = cw > ch ? ch : cw,
        lh = cw > ch ? cw : ch
  
      // width:lw,height:lh
      const pos = Math.abs(cw - ch) /2
      const media = `@media screen and (orientation: landscape) {body{width:${lw}px;height:${lh}px;transform: translate(${pos}px, -${pos}px) rotate(-90deg)}}`
      const style = document.createElement('style')
      style.innerHTML = media;
      window.document.head.appendChild(style);
    }
    // 监听屏幕横竖屏事件
    handleScreenDirection(e) {
      this.state.isPortrait = e.matches
      if (e.matches) {
        // 竖屏
  
      } else {
        // 横屏
      }
    }
    resetWidth() {
      if (this.resizeBoard) clearTimeout(this.resizeBoard)
      this.resizeBoard = setTimeout(() => {   // 防止抖动
        const canvas = document.getElementById('canvas')
        const board = document.getElementById('board')
        if (!canvas) return
        this.saveCanvas()
        const canvasWidth = board.clientWidth - 10
        const canvasHeight = board.clientHeight - 80
        canvas.setAttribute('width', canvasWidth)
        canvas.setAttribute('height', canvasHeight)
        const image = new Image()
        image.src = this.state.boardlist[this.state.boardIndex]
        image.onload = () => {
          let widthScale = 1
          let tempWidth = image.width
          let tempHeight = image.height
  
          if (image.width > canvasWidth) {
            let scaling = 1-(image.width - canvasWidth)/image.width;
            //计算缩小比例
            tempWidth = image.width * scaling;
            tempHeight = image.height * scaling;            //img元素没有设置高度时将自动等比例缩小
            widthScale = scaling
          }
          if (tempHeight > canvasHeight) {
  
            let scaling = 1-(image.height - canvasHeight)/image.height;
            widthScale = scaling
            tempWidth = image.width * scaling
            tempHeight = image.height * scaling
          }
          const imageLeft = (canvasWidth - image.width * widthScale)/ 2 || 0
          // const imageTop = (this.state.board.drawHeight - tempHeight *heightScale)/2 ||0
          this.state.board.context.fillStyle = this.backgroundColor;
          this.state.board.context.fillRect(0, 0, canvasWidth, canvasHeight);
          this.state.board.context.drawImage( image, 0, 0, image.width, image.height, imageLeft, 0,
            tempWidth, tempHeight);
  
          // 保存当前 canvas
          this.saveCanvas()
          clearTimeout(this.resizeBoard)
        }
      }, 200)
    }
  
    // 渲染工具栏
    renderMenus() {
      const hasUl = document.getElementById('boardMenus')
      const board = document.getElementById('board')
      if (hasUl) {
        board.removeChild(hasUl)
      }
      const { boardIndex, boardlist } = this.state
      const menus = document.createElement('ul')
      menus.setAttribute('id','boardMenus')
      menus.style.position = 'relative'
      menus.style.zIndex = '5'
      menus.style.backgroundColor = '#333'
  
      const lis = this.state.menus.map(menu => {
        let li = document.createElement('li')
        let div = document.createElement('div')
        let divText = document.createElement('div')
        let span = document.createElement('span')
        div.className = 'item-icon'
        span.className = menu.className
        divText.innerText = menu.text
        divText.className = 'menu-text'
        div.appendChild(span)
        li.className = 'item-li'
        if (menu.key === 'edit') {// 编辑按钮
          if (document.getElementById('rotateBtn')) {
            return;
          }
          const rotateBtn = document.createElement('div')
          rotateBtn.setAttribute('id', 'rotateBtn')
          rotateBtn.setAttribute('title', '编辑图片')
          const icon = document.createElement('i')
          icon.setAttribute('class', menu.className)
          rotateBtn.appendChild(icon)
          rotateBtn.style.position = 'absolute'
          rotateBtn.style.zIndex = 2
          rotateBtn.addEventListener('click', () => {
            this.boardTool(menu.key)
          })
          board.appendChild(rotateBtn)
          return
        }
        if (menu.key === 0 && this.maxLength) {
          li.className = 'item-li disabled'
        }
        if (menu.key === 1) {
          if (boardlist.length === 1 || boardIndex === 0) {
            li.className = 'item-li disabled'
          }
        }
        if (menu.key === 2) {
          if (boardlist.length <= 1) {
            li.className = 'item-li disabled'
          }
          if (boardIndex === boardlist.length - 1) {
            li.className = 'item-li disabled'
          }
        }
        if (menu.key === 5) {
          div.style = `color: ${this.state.lastPen.color}`
        }
        if (this.isChoosedMenu(menu.key)) { // 当前选择的画笔
          div.className += ' choosed'
        }
        li.appendChild(div)
        li.appendChild(divText)
        li.addEventListener('click', () => {
          this.boardTool(menu.key)
        })
        menus.appendChild(li)
        // return li
      })
      board.appendChild(menus)
  
    }
    // 切换工具栏
    switchMenus() {
      this.isOpen = !this.isOpen
      if (this.isMobile) {   // 手机端
        if (this.isOpen) {
          this.state.menus = this.state.penMenus
        } else {
          this.state.menus = this.state.baseMenus
        }
  
      } else {  // PC 端
        // eslint-disable-next-line no-lonely-if
        if (this.isOpen) {
          const leftMenu = this.state.baseMenus.slice(0, -2)
          this.state.menus = [...leftMenu, ...this.state.penMenus]
  
        } else {
          this.state.menus = this.state.baseMenus
        }
      }
    }
    // 通过key，查找指定的工具菜单
    findMenuByKey(key) {
      return this.state.menus.filter(m => m.key === key)[0]
    }
    // 是否是当前选择的工具
    isChoosedMenu(key) {
      const { bodies } = this.state
      const curMenu = this.findMenuByKey(key)
      if (key === 3 && bodies.isEraser) // 橡皮檫
        return true
      if (key === 5 && !bodies.isEraser) // 画笔
        return true
      if (bodies.color === curMenu.value) // 颜色
        return true
      if (bodies.lineSize === curMenu.value)  // 粗细
        return true
      else
        return false
    }
    // 是否是手机端
    isPC() {
      let userAgentInfo = navigator.userAgent;
      let Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    }
    // 是否是iOs
    isIOS() {
      let u = navigator.userAgent;
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      return isiOS
    }
    handlePosition (x, y) {
      if (!this.state.isPortrait && window.getComputedStyle(document.body).transform !== 'none') {
        // 横屏
        let temp = x
        x = this.state.board.drawWidth - y
        y = temp
      }
      return {x, y}
    }
    //画线处理
    dealPoint(x, y, state) {
      // state: -1：开始，0：移动ing，1：结束
      const len = this.state.points.length;
      // todo: 修改了len， 1 => 0
      if (state !== -1 && len > 0) {   // 至少有1个点
        // 移动ing和结束
        const before = this.state.points[len - 1],
          end = {
            x:x,
            y:y
          },
          cp = {    // 中间点
            x: (before.x + x) / 2,
            y: (before.y + y) / 2
          }
  
        Object.assign(this.state.bodies, {    // 中间点对象
          pointId: this.state.bodies.pointId + 0.5,
          drawState: state,
          pointX: Math.ceil(cp.x),
          pointY: Math.ceil(cp.y)
        });
        this.state.points.push(end);
        this.state.pointsNum++;
  
        Object.assign(this.state.bodies, {    // 终点对象
          pointId: Math.floor(this.state.bodies.pointId) + 1,
          pointX:x,
          pointY:y
        });
  
        if (this.state.points.length > 2) {
          if (this.state.bodies.isEraser) {
            this.eraserLine(this.state.beginPoint, before, cp);
          } else {
            this.drawLine(this.state.beginPoint, before, cp);
          }
          this.state.beginPoint = cp
        }
      } else {
        let lineId = parseInt(this.state.bodies.lastLineId) + 1
        // 开始
        Object.assign(this.state.bodies, {
          pointId: 0,
          drawState: state,
          pointX: x,
          pointY: y,
          lineId: lineId ? lineId : 0,
          lastLineId: parseInt(this.state.bodies.lastLineId) + 1
        });
        this.state.points.push({x,y});
        this.state.pointsNum++;
        this.state.beginPoint = {x,y}
      }
  
    }
    // 按下开始
    canvasDown(e) {
      // this.dynamic = -1; //关面板
      this.canvasMoveUse = true;
      e.stopPropagation();
      e.preventDefault()
      if (this.isOpen) {
        this.state.menus = this.state.baseMenus
        this.renderMenus()
      }
      this.isOpen = false;
      let hasEvent
      try {
        if (e instanceof TouchEvent) {
          hasEvent = true
        }
      } catch (error) {
        hasEvent = false
      }
      if (hasEvent) {
        const offsetLeft = e.target.getBoundingClientRect().left
        const offsetTop = e.target.getBoundingClientRect().top
        let x = e.touches[0].clientX - offsetLeft
        let y = e.touches[0].clientY - offsetTop
  
        this.dealPoint(x, y, -1)
      } else {
        this.dealPoint(e.offsetX, e.offsetY, -1)
      }
    }
    //移动ing
    canvasMove(e) {
      e.stopPropagation();
      e.preventDefault()
      let hasEvent
      try {
        if (e instanceof TouchEvent) {
          hasEvent = true
        }
      } catch (error) {
        hasEvent = false
      }
      if (hasEvent) {
        const offsetLeft = e.target.getBoundingClientRect().left
        const offsetTop = e.target.getBoundingClientRect().top
        let x = e.touches[0].clientX - offsetLeft
        let y = e.touches[0].clientY - offsetTop
  
        this.dealPoint(x, y, 0)
      } else {
        // 左键按下
        if (e.buttons === 1 && this.canvasMoveUse) {
          this.dealPoint(e.offsetX, e.offsetY, 0)
        }else{
          this.canvasMoveUse = false;
        }
      }
    }
    // 松开结束
    canvasUp(e) {
      e.stopPropagation();
      e.preventDefault()
      let hasEvent
      try {
        if (e instanceof TouchEvent) {
          hasEvent = true
        }
      } catch (error) {
        hasEvent = false
      }
      if(hasEvent){
        this.dealPoint(this.state.bodies.pointX, this.state.bodies.pointY, 1)
      }else{
        this.dealPoint(e.offsetX, e.offsetY, 1)
      }
      this.canvasMoveUse = false;
      if (this.state.pointsNum >= 3000) {
        this.saveCanvas(res => {
          this.state.pointsNum = 0;
        });
      }
      this.points = [];
    }
    // 清屏
    clearCanvas() {
      this.state.board.canvas.height = this.state.board.canvas.height;
      const board = document.getElementById('board')
      this.state.board.context.fillStyle = this.backgroundColor;
      this.state.board.context.fillRect(0,0,board.clientWidth,board.clientHeight);
    }
    // 本地保存图片
    localSaveCanvas() {
      // 保存当前canvas图片
      this.saveCanvas()
      const that = this
      if (this.fileUrl) {
        window.postMessage({ type: 'loading', data: true }, window.location.origin)
        this.paging(0, ()=> {
          this.FullPageCapture().capture({
            dom: document.getElementById('wrapCanvas'),
            h2cUrl: 'https://factory-pro.oss-cn-chengdu.aliyuncs.com/resouces/libs/html2canvas.js'
          }, function (data) {
            that.state.boardlist[0] = data
            window.postMessage({ type: 'imgList', data: that.state.boardlist }, window.location.origin)
            // window.open().document.write("<img src=" + data + " />");
          })
  
        })
        return
      }
      window.postMessage({ type: 'imgList', data: this.state.boardlist }, window.location.origin)
      // 发送数据
    }
  
    // 保存当前canvas图片
    saveCanvas() {
      const { boardIndex } = this.state
      const baseImg = this.state.board.canvas.toDataURL("image/png", 1.0);
      this.state.boardlist.splice(boardIndex, 1, baseImg) // 保存当前页
    }
  
    // 新建
    createBoard() {
      // 最多 this.maxPick 页
      if (this.state.boardlist.length >= this.maxPick) {
        this.maxLength = true
        window.postMessage({ type: 'maxLength', data: true }, window.location.origin)
        return
      }
      if (document.getElementById('wareImage')) {
        document.getElementById('wareImage').style.display = 'none'
        document.getElementById('rotateBtn').style.display = 'none'
      }
      // 表示新增黑板
      this.state.changeBard = true
      // 保存当前页
      this.saveCanvas()
      // 创建新的黑板，并插入到 boardlist 中
      this.state.boardIndex++
      this.state.boardlist.splice(this.state.boardIndex, 0, null) // 插入新增的黑板
      // 清空黑板
      this.clearCanvas()
    }
    // 翻页
    paging(num, cb) {
      const { boardIndex } = this.state
      if (boardIndex <= 0 && num === 1) {
        // console.log('没有上一页了')
        return
      }
      if (boardIndex >= this.state.boardlist.length -1 && num === 2) {
        // console.log('没有下一页了')
        return
      }
  
      if (num === 0) {
        document.getElementById('wareImage').style.display = 'block'
        const image = new Image()
        image.src = this.state.boardlist[0]
        image.onload = () => {
          this.clearCanvas()
          this.state.board.context.drawImage( image, 0, 0, image.width, image.height);
          cb && cb()
        }
        return;
      }
      if (document.getElementById('wareImage')) {
        document.getElementById('wareImage').style.display = 'none'
        document.getElementById('rotateBtn').style.display = 'none'
      }
      if (num === 1) {
        // 上一页 先保存后渲染
        this.state.changeBard = false
        this.saveCanvas()
        this.state.boardIndex --
  
        const image = new Image()
        image.src = this.state.boardlist[this.state.boardIndex]
        image.onload = () => {
          this.clearCanvas()
          this.state.board.context.drawImage( image, 0, 0, image.width, image.height);
        }
        if (this.fileUrl) {
          document.getElementById('wareImage').style.display = this.state.boardIndex ===0 ? 'block':'none'
          document.getElementById('rotateBtn').style.display = this.state.boardIndex ===0 ? 'flex':'none'
        }
        return;
      }
      if (num === 2) {
        // 下一页 先保存后渲染
        this.state.changeBard = false
        this.saveCanvas()
        this.state.boardIndex ++
  
        const nextImage = new Image()
        nextImage.src = this.state.boardlist[this.state.boardIndex]
        nextImage.onload = () => {
          this.clearCanvas()
          this.state.board.context.drawImage( nextImage, 0, 0, nextImage.width, nextImage.height);
        }
      }
  
    }
    // 橡皮檫
    eraserLine(start, control, end) {
      // 用跟背景色一样的线覆盖
      this.state.board.context.save();
      // this.setCanvasStyle(this.state.bodies.lineSize,0, '#333', '#333');
      // this.state.board.context.beginPath();
      // this.state.board.context.moveTo(start.x, start.y);
      // this.state.board.context.quadraticCurveTo(control.x, control.y, end.x, end.y );
      // this.state.board.context.stroke();
      // this.state.board.context.closePath();
      // this.state.board.context.restore();
      this.state.board.context.beginPath();
      this.state.board.context.clearRect(
        control.x,
        control.y,
        this.state.bodies.lineSize,
        this.state.bodies.lineSize
      );
    }
    // 画线
    drawLine(start, control, end) {
      //设置画布属性
      this.setCanvasStyle(this.state.bodies.lineSize,2,this.state.bodies.color,this.state.bodies.color);
      this.state.board.context.beginPath();
      this.state.board.context.moveTo(start.x, start.y);
      this.state.board.context.quadraticCurveTo(control.x, control.y, end.x, end.y );
      this.state.board.context.stroke();
      this.state.board.context.closePath();
    }
    // 设置绘画配置
    setCanvasStyle(lineWidth, shadowBlur, shadowColor, strokeStyle) {
      this.state.board.context.globalCompositeOperation = 'source-over';
      this.state.board.context.lineCap = 'round';
      this.state.board.context.lineJoin = 'round';
      this.state.board.context.lineWidth = lineWidth;
      this.state.board.context.shadowBlur = shadowBlur;
      this.state.board.context.shadowColor = shadowColor;
      this.state.board.context.strokeStyle = strokeStyle;
    }
    // 设置颜色
    setColor(i) {
      this.state.bodies.color = i;
    }
    // 获取颜色
    getColor() {
      if (this.state.bodies.isEraser) {
        return 'transparent'
      }
      return this.state.bodies.color;
    }
    // 切换到画笔
    usePen() {
      this.state.bodies.isEraser = false
      this.state.bodies.lineSize = this.state.lastPen.lineSize
      this.setColor(this.state.lastPen.color)
      document.getElementById('canvas').setAttribute('class','pencil')
    }
    // 切换到橡皮擦
    useEraser() {
      this.state.bodies.isEraser = true
      this.state.bodies.lineSize = Math.max(this.state.lastPen.lineSize * 5, 20)
      // this.setColor('#333')
      document.getElementById('canvas').setAttribute('class','eraser')
    }
    // 记录上一次画笔的配置
    setLastPen() {
      Object.assign(this.state.lastPen, {
        color: this.state.bodies.color,
        lineSize: this.state.bodies.lineSize
      })
    }
    base64Img(imgUrl) {
      window.URL = window.URL || window.webkitURL;
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("get", imgUrl+`?t=${new Date().getTime()}`, true);
        // 至关重要
        xhr.responseType = "blob";
        xhr.onload = function () {
          if (this.status === 200) {
            //得到一个blob对象
            const blob = this.response;
            // 至关重要
            let oFileReader = new FileReader();
            oFileReader.onloadend = function (e) {
              let base64 = e.target.result;
              if (base64.length) {
                resolve(base64)
              }else {
                reject(base64)
              }
            };
            oFileReader.readAsDataURL(blob);
  
          }
        }
        xhr.onerror = function(err) {
          reject('image load error')
        }
        xhr.send();
        // xhr.onprogress= function (e) {}
      })
  
    }
    // 插入图片
    openImage(file) {
      // image.src = result
      this.fileUrl = true;// old image base64
      this.state.menus = this.state.editMenus
  
      this.renderMenus()
      window.postMessage({ type: 'loading', data: true }, window.location.origin)
      this.base64Img(file.fileUrl).then(result => {
        window.postMessage({ type: 'loading', data: false }, window.location.origin)
        if (!this.state.board.context) return
        document.getElementById('rotateBtn').style.display = 'flex'
        this.setColor(this.colors.red)
        this.state.lastPen.color = this.colors.red
        this.insterImagetoView(result)
        this.state.changeBard = false
        this.saveCanvas()
      }).catch(err => {
        window.postMessage({ type: 'error', data: false }, window.location.origin)
      })
  
      let script = document.createElement('script');
      const h2cUrl = 'https://factory-pro.oss-cn-chengdu.aliyuncs.com/resouces/libs/html2canvas.js'
      script.setAttribute('src', h2cUrl);
      document.head.appendChild(script);
    }
  
    // 插入图片到dom
    insterImagetoView(image) {
      const wareImageDom = document.getElementById('wareImage')
      if (wareImageDom) {
        wareImageDom.src = image
        return
      }
      const wrapCanvas = document.getElementById('wrapCanvas')
      const wareImageDiv = document.createElement('div')
      // wareImageDom.style.backgroundImage = 'url('+ image +')'
      const wareImage = document.createElement('div')
      const { canvas } = this.state.board
      wareImageDiv.setAttribute('id', 'wareImageDiv')
      wareImage.setAttribute('id', 'wareImage')
      wareImageDiv.style.position = 'absolute'
      // wareImage.style.backgroundImage = 'url('+ image +')'
      // wareImage.src = image
      wareImage.style.backgroundImage = `url(${image})`
      // wareImageDiv.style.overflow = 'hidden'
      wareImageDiv.style.top = '0px'
      wareImageDiv.style.left = 0
      wareImage.style.width = '100%'
      wareImage.style.height = '100%'
      wareImageDiv.style.width = canvas.width + 'px'
      wareImageDiv.style.height = canvas.height + 'px'
      wareImage.style.backgroundSize = 'contain'
      wareImage.style.backgroundPosition = 'center'
      wareImageDiv.style.zIndex = '2'
      wareImage.style.transform = 'rotate(0deg) scale(1)'
      wareImage.style.backgroundRepeat = 'no-repeat';
      wrapCanvas.style.width = canvas.width + 'px'
      wrapCanvas.style.height = canvas.height + 'px'
      wareImage.style.position = 'relative'
      wareImage.style.userSelect = 'none'
      // wareImage.style.display = 'none'
      if (this.isPC()) {
        const that = this
        wareImage.addEventListener('mousedown', this.putDown.bind(this), false)
  
      } else {
        wareImageDiv.addEventListener('touchstart', this.startMoveImg.bind(this), false)
        wareImageDiv.addEventListener('touchmove', this.moveImg.bind(this), false)
      }
      // wareImageDiv.addEventListener('touchend', this.moveEndImg, false)
      wareImageDiv.appendChild(wareImage)
      wrapCanvas.appendChild(wareImageDiv)
    }
    startMoveImg(e) {
      const wareImage = document.getElementById('wareImage')
      this.delayX = this.pageX ? wareImage.offsetLeft : 0;
      this.delayY = this.pageY ? wareImage.offsetTop : 0;
      if (this.isPC()) {
        this.pageX = e.pageX;
        this.pageY = e.pageY;
        return
      }
      this.pageX = e.touches[0].pageX;
      this.pageY = e.touches[0].pageY;
    }
    moveImg(e) {
      const wareImage = document.getElementById('wareImage')
      let delayX
      let delayY
      if (this.isPC()) {
        delayX = e.pageX - this.pageX + this.delayX;
        delayY = e.pageY - this.pageY + this.delayY;
      } else {
        delayX = e.touches[0].pageX - this.pageX + this.delayX;
        delayY = e.touches[0].pageY - this.pageY + this.delayY;
      }
      wareImage.style.top = `${delayY}px`;
      wareImage.style.left = `${delayX}px`;
    }
    moveEndImg(e) {
      // e.stopPropagation()
      // e.preventDefault()
      // console.log('结束', e)
    }
  
    // 鼠标按下事件 处理程序
    putDown (event) {
      // console.log('move start....')
      const wareImageDiv = document.getElementById('wareImageDiv');
      wareImageDiv.style.cursor = "move";
      let offsetX = parseInt(wareImageDiv.style.left); // 获取当前的x轴距离
      let offsetY = parseInt(wareImageDiv.style.top); // 获取当前的y轴距离
      let innerX = event.clientX - offsetX; // 获取鼠标在方块内的x轴距
      let innerY = event.clientY - offsetY; // 获取鼠标在方块内的y轴距
      // 按住鼠标时为div添加一个border
      // 鼠标移动的时候不停的修改div的left和top值
      this.isStartMoving = true
  
      wareImageDiv.onmousemove =  (event)=> {
        if (!this.isStartMoving) return
        wareImageDiv.style.left = event.clientX - innerX + "px";
        wareImageDiv.style.top = event.clientY - innerY + "px";
        // 边界判断
        // if (parseInt(wareImageDiv.style.left) <= 0) {
        //     wareImageDiv.style.left = "0px";
        // }
        // if (parseInt(wareImageDiv.style.top) <= 0) {
        //     wareImageDiv.style.top = "0px";
        // }
        // if (parseInt(wareImageDiv.style.left) >= window.innerWidth - parseInt(wareImageDiv.style.width)) {
        //     wareImageDiv.style.left = window.innerWidth - parseInt(wareImageDiv.style.width) + "px";
        // }
        // if (parseInt(wareImageDiv.style.top) >= window.innerHeight - parseInt(wareImageDiv.style.height)) {
        //     wareImageDiv.style.top = window.innerHeight - parseInt(wareImageDiv.style.height) + "px";
        // }
      }
      // 鼠标抬起时，清除绑定在文档上的mousemove和mouseup事件
      // 否则鼠标抬起后还可以继续拖拽方块
      wareImageDiv.onmouseup = (event)=> {
        this.isStartMoving = false
        wareImageDiv.onmousemove = null;
        wareImageDiv.onmouseup = null;
      }
      // this.startMoveImg(event)
      // this.isStartMoving = true;
      // const that = this
    }
  
    editState(zIndex) {
      const wareImageDiv = document.getElementById('wareImageDiv')
      this.state.menus = this.state.editMenus
      wareImageDiv.style.zIndex = zIndex || '2'
      this.renderMenus()
    }
    rotateImage() {
      const wareImage = document.getElementById('wareImage')
      const transform = wareImage.style.transform.split(' ')
      let rotate = transform[0].match(/\d+/g);
      const scale = transform[1].match(/\d+(\.\d)?/g);
      let query = Number(rotate[0]);
      if (query >= 360) {
        query = 0
      }
      wareImage.style.transform = `rotate(${(query + 90)}deg) scale(${scale})`
    }
    // 放大、缩小图片
    zoomImage(type) {
      const wareImage = document.getElementById('wareImage')
      const transform = wareImage.style.transform.split(' ')
      let rotate = transform[0].match(/\d+/g);
      let scale = transform[1].match(/\d+(\.\d)?/g);
      if (scale[0] >= 10 && type) {
        return
      }
      const parse = Number(scale[0] || 1)
      let scaleIn
      if (type ===1) {
        scaleIn = Math.min(parse + 0.2, 10)
      } else {
        scaleIn = Math.max(0.2,parse - 0.2)
      }
      wareImage.style.transform = `rotate(${rotate[0]}deg) scale(${scaleIn})`
    }
  
    // 点击工具栏
    boardTool(index) {
      const curMenu = this.findMenuByKey(index)
      switch (index) {
        case 'edit': {
          const wareImageDiv = document.getElementById('wareImageDiv');
          this.isEditor = true;
          this.state.menus = this.state.editMenus
          wareImageDiv.style.zIndex = 2;
          break;
        }
        case 'huabi': {// 去画笔操作
          const wareImageDiv = document.getElementById('wareImageDiv');
          this.isEditor = false;
          this.state.menus = this.state.baseMenus
          wareImageDiv.style.zIndex = 0;
          break;
        }
        case 'rotate': {
          this.rotateImage()
          return;
        }
        case 'zoomIn': {
          this.zoomImage(1);
          return;
        }
        case 'shrink': {
          this.zoomImage(0);
          return;
        }
        case 0:   // 新建
          this.createBoard()
          break
        case 1:   // 上一页
        case 2:   // 下一页
          this.paging(index)
          break
        case 3:   // 橡皮擦
          this.setLastPen() // 记录上一次画笔的配置
          this.useEraser()
          break;
        case 4:   // 清屏
          this.clearCanvas()
          break;
        case 5:   // 画笔
          this.usePen()
          this.switchMenus()
          break;
        case 6:   // 保存
          this.localSaveCanvas()
          return;
        case 7:   // 画笔颜色
        case 8:
        case 9:
          this.setColor(curMenu.value)
          this.setLastPen()
          break
        case 10:  // 画笔粗细
        case 11:
        case 12:
          this.state.bodies.lineSize = curMenu.value
          this.setLastPen()
          break;
        default:
          return
      }
      // 重新渲染底部工具栏
      if (!this.rendering) {
        this.rendering = true
        this.renderMenus()
        setTimeout(() => {
          this.rendering = false
        }, 200)
      }
    }
  
    FullPageCapture () {
      /**
       * 安装 html2canvas.js
       * @param h2cUrl html2canvas.js的URL地址
       * @param resolve
       */
      const installHtml2Canvas = function (h2cUrl,resolve) {
        if (typeof html2canvas === 'undefined') {
          // console.log('即将安装 html2canvas ...');
          if(!h2cUrl || !/^http(s)?:\/\/[^\s]+$/.test(h2cUrl)) {
            h2cUrl = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
          }
          let script = document.createElement('script');
          script.setAttribute('src', h2cUrl);
          document.head.appendChild(script);
  
          let intervalId = window.setInterval(function () {
            if (typeof html2canvas === 'function') {
              console.log('html2canvas安装成功！');
              window.clearInterval(intervalId);
              resolve && resolve();
            }
          }, 50);
        } else {
          resolve && resolve();
        }
      };
      /**
       * 给canvas打上水印
       * @param canvas
       * @param options
       *  @config text 需要水印的文字
       *  @config font 字体设置
       *  @config color 水印颜色
       *  @config position 位置{x,y}
       * @returns {*}
       */
      let waterMark = function(canvas,options){
        let ctx = canvas.getContext("2d");
        ctx.font = options.font || "12px";
        ctx.fillStyle = options.color || "rgba(255,0,0,0.8)";
        ctx.fillText(options.text, options.position && options.position.x || 10,
          options.position && options.position.y || 10);
  
        return canvas;
      };
  
      /**
       * 抓屏，有video标签都自动带上
       * @param options 配置参数
       *  @config dom 需要截取的DOM节点，默认是document.body
       *  @config h2cUrl html2canvas.js的URL地址
       *  @config waterMark 水印
       *      @c-config text 需要水印的文字
       *      @c-config font 字体设置
       *      @c-config color 水印颜色
       *      @c-config position 位置{x,y}
       * @param resolve 抓图回调
       */
      const capture = function (options, resolve) {
        options = options || {};
        if (typeof html2canvas === 'function') {
          try {
            let dom = options.dom || document.body;
            // eslint-disable-next-line no-undef
            html2canvas(dom, {
              useCORS : false,
              foreignObjectRendering : false,
              allowTaint :true,
              logging:true,
              backgroundColor: 'transparent',
              width: dom.clientWidth,
              height: dom.clientHeight,
              scrollX: 0,
              scrollY: 0,
              x: 0,
              y: 0,
              windowWidth: dom.clientWidth,
              windowHeight: dom.clientHeight
            }).then(function (canvas) {
              // console.log('屏幕截取成功！');
              if(options.waterMark) {
                canvas = waterMark(canvas,options.waterMark);
              }
              resolve && resolve(canvas.toDataURL('image/png'));
            });
          } catch (e) {
            console.log('sth happened : ', e)
          }
        } else {
          installHtml2Canvas(options.h2cUrl,function () {
            capture(options, resolve);
          });
        }
      };
      return {
        capture: capture
      }
  
    }
  }
  
  export default ClassBoard
  