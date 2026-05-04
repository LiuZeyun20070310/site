// 游戏状态
const state = {
  n: 3,
  towers: [[], [], []],
  step: 0,
  selectTower: null,
  autoing: false
};

// 获取元素
const diskNum = document.getElementById('diskNum');
const diskRange = document.getElementById('diskRange');
const resetBtn = document.getElementById('reset');
const autoBtn = document.getElementById('autoPlay');
const stepDom = document.getElementById('stepCount');
const warnModal = document.getElementById('warnModal');
const winModal = document.getElementById('winModal');
const towerDoms = document.querySelectorAll('.tower');

// 初始化
function init(num) {
  state.n = num;
  state.towers = [[], [], []];
  state.step = 0;
  state.selectTower = null;
  stepDom.innerText = 0;

  // 初始化第一个柱子圆盘
  for(let i = num; i >= 1; i--){
    state.towers[0].push(i);
  }
  render();
}

// 渲染页面
function render() {
  towerDoms.forEach((tower, idx) => {
    const box = tower.querySelector('.disk-box');
    box.innerHTML = '';
    state.towers[idx].forEach(size => {
      const disk = document.createElement('div');
      disk.className = 'disk';
      disk.dataset.size = size;
      box.appendChild(disk);
    });
  });
}

// 获取柱子最上面圆盘
function getTop(towerIdx) {
  const arr = state.towers[towerIdx];
  return arr.length ? arr[arr.length - 1] : null;
}

// 判断移动是否合法
function canMove(from, to) {
  const fTop = getTop(from);
  const tTop = getTop(to);
  if(!fTop) return false;
  if(!tTop) return true;
  return fTop < tTop;
}

// 执行移动
function moveDisk(from, to) {
  if(!canMove(from, to)) return false;
  const disk = state.towers[from].pop();
  state.towers[to].push(disk);
  state.step++;
  stepDom.innerText = state.step;
  render();
  checkWin();
  return true;
}

// 检查是否通关
function checkWin() {
  if(state.towers[2].length === state.n){
    setTimeout(()=>{
      winModal.style.display = 'block';
      // 胜利发光
      document.querySelectorAll('.disk').forEach(d=>d.classList.add('win-glow'));
    },300);
  }
}

// 点击柱子
towerDoms.forEach((tower, idx)=>{
  tower.addEventListener('click', ()=>{
    if(state.autoing) return;
    if(state.selectTower === null){
      // 选中柱子
      if(getTop(idx)){
        state.selectTower = idx;
        const disks = tower.querySelector('.disk-box').lastElementChild;
        if(disks) disks.classList.add('selected');
      }
    }else{
      // 放置圆盘
      if(moveDisk(state.selectTower, idx)){
        state.selectTower = null;
      }else{
        // 违规提示
        tower.classList.add('shake');
        warnModal.style.display = 'block';
        setTimeout(()=>{
          tower.classList.remove('shake');
          warnModal.style.display = 'none';
        },600);
      }
      // 清除选中样式
      document.querySelectorAll('.disk.selected').forEach(d=>{
        d.classList.remove('selected');
      });
      state.selectTower = null;
    }
  });
});

// 数量输入联动
diskNum.addEventListener('change', ()=>{
  let val = parseInt(diskNum.value);
  val = Math.max(3, Math.min(8, val));
  diskRange.value = val;
  init(val);
});

diskRange.addEventListener('input', ()=>{
  let val = parseInt(diskRange.value);
  diskNum.value = val;
  init(val);
});

// 重置
resetBtn.addEventListener('click', ()=>{
  if(state.autoing) return;
  winModal.style.display = 'none';
  document.querySelectorAll('.disk').forEach(d=>d.classList.remove('win-glow'));
  init(state.n);
});

// 自动解题 递归
async function hanoi(n, from, to, temp) {
  if(n === 1){
    await delay(600);
    moveDisk(from, to);
    return;
  }
  await hanoi(n-1, from, temp, to);
  await delay(600);
  moveDisk(from, to);
  await hanoi(n-1, temp, to, from);
}

function delay(time){
  return new Promise(resolve=>setTimeout(resolve,time));
}

// 自动解题按钮
autoBtn.addEventListener('click', async ()=>{
  if(state.autoing) return;
  state.autoing = true;
  autoBtn.disabled = true;
  resetBtn.disabled = true;
  winModal.style.display = 'none';
  document.querySelectorAll('.disk').forEach(d=>d.classList.remove('win-glow'));

  await hanoi(state.n, 0, 2, 1);

  state.autoing = false;
  autoBtn.disabled = false;
  resetBtn.disabled = false;
});

// 页面初始初始化
init(3);