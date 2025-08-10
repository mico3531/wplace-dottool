/**
 * selector.js
 * アスペクト比固定の選択枠を画像上に表示・操作するクラス
 */

export default class FixedAspectSelector {
  constructor(containerElement, aspectRatio) {
    this.container = containerElement;
    this.aspectRatio = aspectRatio;
    this.box = { x: 0, y: 0, width: 100, height: 100 / aspectRatio };

    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'selection-box';

    this.handles = {};
    for (const pos of ['nw','ne','sw','se']) {
      const h = document.createElement('div');
      h.className = 'selection-handle ' + pos;
      this.selectionBox.appendChild(h);
      this.handles[pos] = h;
    }

    this.container.appendChild(this.selectionBox);

    this.dragging = false;
    this.draggingHandle = null;
    this.dragStart = {x:0, y:0};
    this.boxStart = {...this.box};

    // イベント
    this.selectionBox.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    for (const pos in this.handles) {
      this.handles[pos].addEventListener('mousedown', e => this.onHandleMouseDown(e, pos));
    }

    this.update();
  }

  update() {
    this.selectionBox.style.left = this.box.x + 'px';
    this.selectionBox.style.top = this.box.y + 'px';
    this.selectionBox.style.width = this.box.width + 'px';
    this.selectionBox.style.height = this.box.height + 'px';
  }

  getRect() {
    return {
      x: Math.round(this.box.x),
      y: Math.round(this.box.y),
      width: Math.round(this.box.width),
      height: Math.round(this.box.height)
    };
  }

  setAspectRatio(aspect) {
    this.aspectRatio = aspect;
    // 幅は変えず高さを調整
    this.box.height = this.box.width / aspect;
    this.update();
  }

  onMouseDown(e) {
    if (e.target !== this.selectionBox) return;
    this.dragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.boxStart = {...this.box};
    e.preventDefault();
  }

  onMouseUp(e) {
    this.dragging = false;
    this.draggingHandle = null;
  }

  onMouseMove(e) {
    if (!this.dragging && !this.draggingHandle) return;
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    if (this.dragging) {
      // 選択枠移動（親要素内に制限）
      let nx = this.boxStart.x + dx;
      let ny = this.boxStart.y + dy;

      nx = Math.max(0, Math.min(nx, this.container.clientWidth - this.box.width));
      ny = Math.max(0, Math.min(ny, this.container.clientHeight - this.box.height));

      this.box.x = nx;
      this.box.y = ny;
      this.update();
      return;
    }

    if (this.draggingHandle) {
      // リサイズ
      this.resizeBox(dx, dy);
    }
  }

  onHandleMouseDown(e, handlePos) {
    this.draggingHandle = handlePos;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.boxStart = {...this.box};
    e.stopPropagation();
    e.preventDefault();
  }

  resizeBox(dx, dy) {
    let {x, y, width, height} = this.boxStart;

    // アスペクト比維持しつつ拡大縮小
    // どのハンドルかで処理変える
    switch(this.draggingHandle) {
      case 'nw': {
        // 左上を動かすので、幅・高さ増減は逆符号
        let newWidth = width - dx;
        let newHeight = newWidth / this.aspectRatio;
        let newX = x + dx;
        let newY = y + (height - newHeight);
        if (newWidth > 20 && newX >= 0 && newY >= 0) {
          this.box.width = newWidth;
          this.box.height = newHeight;
          this.box.x = newX;
          this.box.y = newY;
        }
        break;
      }
      case 'ne': {
        let newWidth = width + dx;
        let newHeight = newWidth / this.aspectRatio;
        let newY = y + (height - newHeight);
        if (newWidth > 20 && newY >= 0 && (x + newWidth) <= this.container.clientWidth) {
          this.box.width = newWidth;
          this.box.height = newHeight;
          this.box.y = newY;
        }
        break;
      }
      case 'sw': {
        let newWidth = width - dx;
        let newHeight = newWidth / this.aspectRatio;
        let newX = x + dx;
        if (newWidth > 20 && newX >= 0 && (y + newHeight) <= this.container.clientHeight) {
          this.box.width = newWidth;
          this.box.height = newHeight;
          this.box.x = newX;
        }
        break;
      }
      case 'se': {
        let newWidth = width + dx;
        let newHeight = newWidth / this.aspectRatio;
        if (newWidth > 20 && (x + newWidth) <= this.container.clientWidth && (y + newHeight) <= this.container.clientHeight) {
          this.box.width = newWidth;
          this.box.height = newHeight;
        }
        break;
      }
    }
    this.update();
  }
}
