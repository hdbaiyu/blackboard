
//  黑板
class ClassBoard {
  constructor() {
    this.state = {
      openFile: false,
      beginPoint: {},
      menuPen: [
        {text: "红", key: 7, className:"span-icon icon-red"},
        {text: "白", key: 8, className:"span-icon icon-white"},
        {text: "绿", key: 9, className:"span-icon icon-green"},
        {text: "细", key: 10, className:"line-icon icon-fine"},
        {text: "中", key: 11, className:"line-icon icon-center"},
        {text: "粗", key: 12, className:"line-icon icon-thick"},
      ],
      menus: [
        {text: "新建",key: 0, className:"hyfont xinjianyiye"},
        {text: "上一页",key: 1,className:"hyfont ketang-shangyiye"},
        {text: "下一页", key: 2, className:"hyfont ketang-xiayiye"},
        {text: "橡皮",key: 3,className:"hyfont ketang-cachu"},
        {text: "清屏", key: 4, className:"hyfont ketang-qingkong"},
        {text: "画笔", key: 5, className:"hyfont ketang-huabi"},
        {text: "保存",key: 6, className:"hyfont baocun"},
      ],
      bodies: { //点对象
        color: 'red', //颜色
        courseWareNum: '', //课件页数
        drawState: -1, //是否画笔
        isBord: 1, //黑板还是课件
        isEraser: false,//画笔还是橡皮擦
        lastLineId: '', //最后一条线id
        lineId: 1, //线id
        lineSize: 1, //粗细
        pointId: 0,//点id
        pointX: 0, //x坐标
        pointY: 0, //y坐标
        width: 0, //黑板对象 宽
        height: 0 //黑板对象 高
      },
      board: {
        canvas: null, //canvas dom
        context: {}, //canvas 对象
        drawWidth: 1000,
        drawHeigth: 500
      },
      rate:1, //传入的宽高和实际canvas宽高 比
      points: [], //一条线的点集合
      boardlist: [], //黑板 预览数据
      boardIndex: 0, // 黑板数量索引
      changeBard: true, // 是否可以新建黑板
    }
  }
  touchMove () {
    const canvas = document.getElementById('canvas')
    canvas.addEventListener('touchstart', this.canvasDown.bind(this), false)
    canvas.addEventListener('touchmove', this.canvasMove.bind(this), false)
    canvas.addEventListener('touchend', this.canvasUp.bind(this), false)
  }
  initCanvas(){
    const canvas = document.getElementById('canvas')
    const board = document.getElementById('board')
    canvas.setAttribute('class', 'pencil')
    canvas.setAttribute('width', board.clientWidth)
    canvas.setAttribute('height', board.clientHeight - 90)
    const context = canvas.getContext("2d");
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#333333'
    this.state.baseMenus = this.state.menus
    // context.fillRect(0,0,this.state.board.clientWidth,this.state.board.clientHeight - 90);
    Object.assign(this.state.board,{
      drawWidth: board.clientWidth, //canvas 容器宽
      drawHeigth: board.clientHeight -90, //canvas 容器高
      canvas: canvas, //canvas dom
      context: context //canvas 对象
    })
    this.appenedMenus()
    
  }
  appenedMenus() {
    const hasUl = document.getElementById('boardMenus')
    const board = document.getElementById('board')
    if (hasUl) {
      board.removeChild(hasUl)
    }
    const menus = document.createElement('ul')
    menus.setAttribute('id','boardMenus')
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
      li.appendChild(div)
      li.appendChild(divText)
      li.addEventListener('click',()=> this.boardTool(menu.key))
      menus.appendChild(li)
      // return li
    })
    console.log('li', lis)
    board.appendChild(menus)

  }
  //画线处理
  dealPoint(x,y,state){
    console.log('this.state.bodies', this.state.beginPoint)
    const len = this.state.points.length;
    if(state != -1 && len > 1){
      const before = this.state.points[len - 1],end={
        x:x,
        y:y
      },cp={
        x:(before.x + x) / 2,
        y:(before.y + y) / 2
      }
      Object.assign(this.state.bodies, {
        pointId: this.state.bodies.pointId + 0.5,
        drawState: state,
        pointX:Math.ceil(cp.x),
        pointY:Math.ceil(cp.y)
      });
      this.sendPoint();
      this.state.points.push(end);
      this.state.pointsNum++;
      Object.assign(this.state.bodies, {
        pointId: Math.floor(this.state.bodies.pointId) + 1,
        pointX:x,
        pointY:y
      });
      this.sendPoint();
      if (this.state.points.length > 2) {
        if (this.state.bodies.isEraser) {
          this.earseLine(this.state.beginPoint, before, cp);
        } else {
          this.drowline(this.state.beginPoint, before, cp);
        }
        this.state.beginPoint = cp
      }
    }else{
      let lineId = parseInt(this.state.bodies.lastLineId) + 1
      Object.assign(this.state.bodies, {
        pointId: 0,
        drawState: state,
        pointX:x,
        pointY:y,
        lineId: lineId ? lineId :0,
        lastLineId: parseInt(this.state.bodies.lastLineId) + 1
      });
      this.sendPoint();
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
    console.log('....this', this)
    if(e instanceof TouchEvent){
      this.dealPoint(e.touches[0].clientX,e.touches[0].clientY,-1)
    }else{
      this.dealPoint(e.offsetX,e.offsetY,-1)
    }
  }
  //移动ing
  canvasMove(e) {
    e.stopPropagation();
    e.preventDefault()
    if(e instanceof TouchEvent){
      this.dealPoint(e.touches[0].clientX,e.touches[0].clientY,0)
    }else{
      if (e.buttons == 1 && this.canvasMoveUse) {
        this.dealPoint(e.offsetX,e.offsetY,0)
      }else{
        this.canvasMoveUse = false;
      }
    }
  }
  // 松开结束
  canvasUp(e) {
    e.stopPropagation();
    e.preventDefault()
    if(e instanceof TouchEvent){
      this.dealPoint(this.state.bodies.pointX,this.state.bodies.pointY,1)
    }else{
      this.dealPoint(e.offsetX,e.offsetY,1)
    }
    this.canvasMoveUse = false;
    if (this.state.pointsNum >= 3000) {
      this.saveCanvas(res => {
        this.state.pointsNum = 0;
      });
    }
    this.points = [];
  }
  // 发送坐标
  sendPoint() {
    this.state.bodies.pointX=Math.ceil(this.state.bodies.pointX*this.state.rate);
    this.state.bodies.pointY=Math.ceil(this.state.bodies.pointY*this.state.rate);
  }
  clearCanvas() {
    this.state.board.canvas.height = this.state.board.canvas.height;
  }
  // 本地保存图片
  localSaveCanvas() {
      // const imgData = this.state.board.canvas.toDataURL({format: 'png', quality:1, width:200, height:400});
      // const strDataURI = imgData.substr(22, imgData.length);
      const imageData =  this.state.board.canvas.toDataURL('image/png')
      window.postMessage(imageData, window.location.origin )
  }
  //保存canvas图片
  saveCanvas(callback) {
    const baseImg = this.state.board.canvas.toDataURL("image/png");
    if (this.state.changeBard) {
      // todo: 新建顺序有问题
      if (this.state.boardIndex === this.state.boardlist.length - 1) {
        this.state.boardlist.push({img:baseImg})
      } else {
        const index = this.state.boardIndex
        // todo: 0 =》 1
        this.state.boardlist.splice(index, 0,{img: baseImg})
      }
      // ++ this.boardIndex
    } else {
      
      const index = this.state.boardIndex
      // todo: 0 =》 1
      this.state.boardlist.splice(index, 1,{img: baseImg})
    }

    // document.getElementById('img').src = baseImg
    console.log('boardlist', this.state.boardlist, this.state.boardIndex)
  }
   //橡皮檫
  earseLine(start, controlPoint, endPoint) {
    console.log('xxx', start.x, start.y)
    this.state.board.context.beginPath();
    this.state.board.context.clearRect(
      start.x,
      start.y,
      this.state.bodies.lineSize * 10,
      this.state.bodies.lineSize * 10
    );
  }
  //画线
  drowline(start, control, end) {
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
    this.state.board.context.lineWidth = lineWidth;
    this.state.board.context.shadowBlur = shadowBlur;
    this.state.board.context.shadowColor = shadowColor;
    this.state.board.context.strokeStyle = strokeStyle;
  }
  // 设置颜色
  setColor(i) {
    this.state.bodies.color = i;
    this.state.dynamic = -1;
  }
  // 获取颜色
  getColor() {
    if (this.state.bodies.isEraser) {
      return 'white'
    }
    return 'red';
  }
  // 插入图片
  openImage(e) {
    console.log('e', e.target.files[0])
    const _this = this
    const reader = new FileReader();
    reader.onload = function(e){
      // get_data(this.result);
        console.log('resxxx',e.target.result);
        const image = new Image()
        image.src = e.target.result
        image.onload =() =>{
          const imageLeft = (_this.state.board.drawWidth - image.width)/2
          const imageTop = (_this.state.board.drawHeigth - image.height)/2
          console.log('image', imageLeft, imageTop)
          _this.state.board.context.drawImage( image, imageLeft, imageTop, image.width, image.height);

        }
    }
    reader.readAsDataURL(e.target.files[0]);
  }
  // 新建
  createBoard() {
    this.state.boardIndex +=1
    this.state.changeBard = true
   
    this.saveCanvas()
    this.clearCanvas()
    console.log('boardlist', this.state.boardlist)
  }
  // 翻页
  paging(num) {
    if (this.state.boardIndex >= this.state.boardlist.length -1 && num != 1) {
      return
    }
    if (this.state.boardIndex <= 0 && num !=2) {
      return
    }
    if (num ===1) {
      // 上一页 先保存后渲染
      this.state.changeBard = false
      this.saveCanvas()
      this.state.boardIndex --
      console.log('inxx11', this.state.boardIndex)
      const image = new Image()
      image.src = this.state.boardlist[this.state.boardIndex].img
      image.onload =() =>{
        this.clearCanvas()
        console.log(this.state.board.drawWidth)
        this.state.board.context.drawImage( image, 0, 0, image.width, image.height);
      }
      
      return
    }
    this.state.changeBard = false
    this.saveCanvas()
    this.state.boardIndex ++
    console.log('inx===', this.state.boardIndex)

    const nextImage = new Image()
    nextImage.src = this.state.boardlist[this.state.boardIndex].img
    nextImage.onload =() =>{
    this.clearCanvas()
    this.state.board.context.drawImage( nextImage, 0, 0, nextImage.width, nextImage.height);
    }
  }
  boardTool(index) {
    console.log('index',index)
    switch (index) {
      case 0:
        // this.openImage()
        this.createBoard()
        return
      case 1:
      case 2:
        this.paging(index)
        return
      case 3:
       this.state.bodies.isEraser = true;
       document.getElementById('canvas').setAttribute('class','eraser')
       return;
      case 4:
        this.clearCanvas()
        return;
      case 5: {
        const len = this.state.menus.length
        const lasetItem = this.state.menus.slice(len -1)
        const startItem = this.state.baseMenus.slice(0,len -1)
        console.log('lasetItem',  this.state.menus, lasetItem)
        // this.menus = Object.assign([], this.menus,this.menuPen,lasetItem)
         this.state.bodies.isEraser = false
        if (!this.isOpen) {
          this.state.menus = [{text: "画笔", key: 5, className:"hyfont ketang-huabi"}, ...this.state.menuPen, ...lasetItem]
          this.isOpen = true;
        } else {
          this.state.menus = this.state.baseMenus
          this.isOpen = false;
        }
        document.getElementById('canvas').setAttribute('class','pencil')
        this.appenedMenus()
        return;
      }
      case 6:// 保存
        this.localSaveCanvas()
        return;
      case 7:
        this.setColor('red')
        return
      case 8:
        this.setColor('white')
        return
      case 9:
        this.setColor('green')
        return
      case 10: 
        this.state.bodies.lineSize= 1
        return
      case 11: 
        this.state.bodies.lineSize = 3
        return
      case 12: 
        this.state.bodies.lineSize = 5
        return
      default:
        return
    }
  }
  
}


export default ClassBoard
