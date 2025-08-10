/**
 * selector.js
 * 固定アスペクト比の選択枠UIを作成・操作するクラス
 */

class FixedAspectSelector {
  /**
   * @param {HTMLElement} container 選択枠を重ねる親要素 (position: relative推奨)
   * @param {number} aspectRatio 横÷縦の比率 (例: 50/30=1.666...)
   */
  constructor(container, aspectRatio) {
    this.container = container;
    this.aspectRatio = aspectRatio;

    this.selectionBox = document.createElement('div');
    this.selectionBox.id = 'selectionBox';

    // ドラッグハンドル4つを作成
    this.handles = {};
    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const h = document.createElement('div');
      h.classList.add('handle', pos);
      this.selectionBox.appendChild(h);
      this.handles[pos] = h;
    });

    container.appendChild(this.selectionBox);

    // 初期サイズと位置
    this.box = { x: 20, y: 20, width: 200, height: 200 / this.aspectRatio };

    this.dragging = false;
    this.dragType = null; // 'move' or handle name
    this.dragStart = { x: 0, y: 0 };
    this.boxStart = { ...this.box };

    this._initEvents();
    this.update();
  }

  _initEvents() {
    // ハンドル・枠でのドラッグ開始
    this.selectionBox.addEventListener('mousedown', (e) => this._onPointerDown(e));
    for (const h of Object.values(this.handles)) {
      h.addEventListener('mousedown', (e) => this._onPointerDown(e));
    }
    window.addEventListener('mousemove', (e) => this._onPointerMove(e));
    window.addEventListener('mouseup', (e) => this._onPointerUp(e));
  }

  _onPointerDown(e) {
    e.preventDefault();
    this.dragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.boxStart = { ...this.box };

    // どの部分が押されたか判定
    if (e.target.classList.contains('handle')) {
      this.dragType = e.target.classList[1]; // tl, tr, bl, br
    } else if (e.target === this.selectionBox) {
      this.dragType = 'move';
    } else {
      this.dragType = null;
    }
  }

  _onPointerMove(e) {
    if (!this.dragging) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    if (this.dragType === 'move') {
      this.box.x = this.boxStart.x + dx;
      this.box.y = this.boxStart.y + dy;
      this._clampPosition();
    } else if (this.dragType) {
      this._resizeBox(dx, dy, this.dragType);
    }

    this.update();
  }

  _onPointerUp(e) {
    this.dragging = false;
    this.dragType = null;
  }

  _clampPosition() {
    const maxX = this.container.clientWidth - this.box.width;
    const maxY = this.container.clientHeight - this.box.height;
    this.box.x = Math.min(Math.max(0, this.box.x), maxX);
    this.box.y = Math.min(Math.max(0, this.box.y), maxY);
  }

  _resizeBox(dx, dy, corner) {
    let newWidth, newHeight, newX, newY;
    const aspect = this.aspectRatio;

    switch(corner) {
      case 'tl':
        newWidth = this.boxStart.width - dx;
        newHeight = newWidth / aspect;
        newX = this.boxStart.x + dx;
        newY = this.boxStart.y + (this.boxStart.height - newHeight);
        break;
      case 'tr':
        newWidth = this.boxStart.width + dx;
        newHeight = newWidth / aspect;
        newX = this.boxStart.x;
        newY = this.boxStart.y + (this.boxStart.height - newHeight);
        break;
      case 'bl':
        newWidth = this.boxStart.width - dx;
        newHeight = newWidth / aspect;
        newX = this.boxStart.x + dx;
        newY = this.boxStart.y;
        break;
      case 'br':
        newWidth = this.boxStart.width + dx;
        newHeight = newWidth / aspect;
        newX = this.boxStart.x;
        newY = this.boxStart.y;
        break;
    }

    const minSize = 20;
    if (newWidth < minSize || newHeight < minSize) return;

    this.box.width = newWidth;
    this.box.height = newHeight;
    this.box.x = newX;
    this.box.y = newY;

    this._clampPosition();
  }

  update() {
    this.selectionBox.style.left = this.box.x + 'px';
    this.selectionBox.style.top = this.box.y + 'px';
    this.selectionBox.style.width = this.box.width + 'px';
    this.selectionBox.style.height = this.box.height + 'px';
  }

  getRect() {
    // 選択枠の現在の矩形(整数pixel)
    return {
      x: Math.round(this.box.x),
      y: Math.round(this.box.y),
      width: Math.round(this.box.width),
      height: Math.round(this.box.height)
    };
  }

  setAspectRatio(aspect) {
    this.aspectRatio = aspect;
    // サイズ縦横比維持で調整
    this.box.height = this.box.width / aspect;
    this.update();
  }
}
