export default class FixedAspectSelector {
  constructor(containerElement, aspectRatio) {
    this.container = containerElement;
    this.aspectRatio = aspectRatio;

    this.box = { x: 50, y: 50, width: 100, height: 100 / aspectRatio };

    // 色設定（UIから変更可能）
    this.borderColor = '#00f'; // 枠線色
    this.fillColor = 'rgba(0,0,255,0.1)'; // 塗りつぶし色

    // 選択範囲を表す要素を作成
    this.selectionBox = document.createElement('div');
    this.selectionBox.style.position = 'absolute';
    this.selectionBox.style.border = `2px solid ${this.borderColor}`;
    this.selectionBox.style.boxSizing = 'border-box';
    this.selectionBox.style.cursor = 'move';
    this.selectionBox.style.background = this.fillColor;
    this.container.appendChild(this.selectionBox);

    // 角のハンドル作成
    this.handles = {};
    const handleNames = ['nw', 'ne', 'sw', 'se'];
    handleNames.forEach(name => {
      const handle = document.createElement('div');
      handle.style.position = 'absolute';
      handle.style.width = '12px';
      handle.style.height = '12px';
      handle.style.background = this.borderColor;
      handle.style.borderRadius = '50%';
      handle.style.cursor = name + '-resize';
      this.selectionBox.appendChild(handle);
      this.handles[name] = handle;
    });

    // 内部状態
    this.dragging = false;
    this.draggingHandle = null;
    this.draggingEdge = null;
    this.dragStart = null;
    this.boxStart = null;

    // マウスイベント
    this.selectionBox.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));

    // 辺カーソル検出イベント
    this.selectionBox.addEventListener('mousemove', this.onMouseMoveEdgeDetect.bind(this));

    this.update();
  }

  static EDGE_MARGIN = 6;

  // 色設定を変更
  setColors(borderColor, fillColor) {
    this.borderColor = borderColor;
    this.fillColor = fillColor;
    this.update();
  }

  detectEdge(pos) {
    const rect = this.selectionBox.getBoundingClientRect();
    const leftDist = Math.abs(pos.x - rect.left);
    const rightDist = Math.abs(pos.x - rect.right);
    const topDist = Math.abs(pos.y - rect.top);
    const bottomDist = Math.abs(pos.y - rect.bottom);

    if (
      topDist <= FixedAspectSelector.EDGE_MARGIN &&
      pos.x >= rect.left + FixedAspectSelector.EDGE_MARGIN &&
      pos.x <= rect.right - FixedAspectSelector.EDGE_MARGIN
    ) {
      return 'top';
    }
    if (
      bottomDist <= FixedAspectSelector.EDGE_MARGIN &&
      pos.x >= rect.left + FixedAspectSelector.EDGE_MARGIN &&
      pos.x <= rect.right - FixedAspectSelector.EDGE_MARGIN
    ) {
      return 'bottom';
    }
    if (
      leftDist <= FixedAspectSelector.EDGE_MARGIN &&
      pos.y >= rect.top + FixedAspectSelector.EDGE_MARGIN &&
      pos.y <= rect.bottom - FixedAspectSelector.EDGE_MARGIN
    ) {
      return 'left';
    }
    if (
      rightDist <= FixedAspectSelector.EDGE_MARGIN &&
      pos.y >= rect.top + FixedAspectSelector.EDGE_MARGIN &&
      pos.y <= rect.bottom - FixedAspectSelector.EDGE_MARGIN
    ) {
      return 'right';
    }
    return null;
  }

  onMouseMoveEdgeDetect(e) {
    const edge = this.detectEdge({ x: e.clientX, y: e.clientY });
    if (edge) {
      switch (edge) {
        case 'top':
        case 'bottom':
          this.selectionBox.style.cursor = 'ns-resize';
          break;
        case 'left':
        case 'right':
          this.selectionBox.style.cursor = 'ew-resize';
          break;
      }
    } else {
      this.selectionBox.style.cursor = 'move';
    }
  }

  onMouseDown(e) {
    for (const [name, handle] of Object.entries(this.handles)) {
      if (e.target === handle) {
        this.draggingHandle = name;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.boxStart = { ...this.box };
        e.preventDefault();
        return;
      }
    }

    const edge = this.detectEdge({ x: e.clientX, y: e.clientY });
    if (edge) {
      this.draggingEdge = edge;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.boxStart = { ...this.box };
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.target === this.selectionBox) {
      this.dragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.boxStart = { ...this.box };
      e.preventDefault();
    }
  }

  onMouseMove(e) {
    if (this.draggingHandle) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.resizeBox(dx, dy);
      return;
    }

    if (this.draggingEdge) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      let nx = this.boxStart.x;
      let ny = this.boxStart.y;

      switch (this.draggingEdge) {
        case 'top':
        case 'bottom':
          ny = this.boxStart.y + dy;
          ny = Math.min(Math.max(ny, 0), this.container.clientHeight - this.box.height);
          this.box.y = ny;
          break;
        case 'left':
        case 'right':
          nx = this.boxStart.x + dx;
          nx = Math.min(Math.max(nx, 0), this.container.clientWidth - this.box.width);
          this.box.x = nx;
          break;
      }
      this.update();
      return;
    }

    if (this.dragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      let nx = this.boxStart.x + dx;
      let ny = this.boxStart.y + dy;

      nx = Math.max(0, Math.min(nx, this.container.clientWidth - this.box.width));
      ny = Math.max(0, Math.min(ny, this.container.clientHeight - this.box.height));

      this.box.x = nx;
      this.box.y = ny;
      this.update();
      return;
    }
  }

  onMouseUp(e) {
    this.dragging = false;
    this.draggingHandle = null;
    this.draggingEdge = null;
  }

  resizeBox(dx, dy) {
    let newWidth = this.boxStart.width;
    let newHeight = this.boxStart.height;
    let newX = this.boxStart.x;
    let newY = this.boxStart.y;

    switch (this.draggingHandle) {
      case 'nw':
        newWidth = this.boxStart.width - dx;
        newHeight = newWidth / this.aspectRatio;
        newX = this.boxStart.x + dx;
        newY = this.boxStart.y + (this.boxStart.height - newHeight);
        break;
      case 'ne':
        newWidth = this.boxStart.width + dx;
        newHeight = newWidth / this.aspectRatio;
        newY = this.boxStart.y + (this.boxStart.height - newHeight);
        break;
      case 'sw':
        newWidth = this.boxStart.width - dx;
        newHeight = newWidth / this.aspectRatio;
        newX = this.boxStart.x + dx;
        break;
      case 'se':
        newWidth = this.boxStart.width + dx;
        newHeight = newWidth / this.aspectRatio;
        break;
    }

    if (newWidth < 20) {
      newWidth = 20;
      newHeight = newWidth / this.aspectRatio;
    }

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + newWidth > this.container.clientWidth) {
      newWidth = this.container.clientWidth - newX;
      newHeight = newWidth / this.aspectRatio;
    }
    if (newY + newHeight > this.container.clientHeight) {
      newHeight = this.container.clientHeight - newY;
      newWidth = newHeight * this.aspectRatio;
    }

    this.box = { x: newX, y: newY, width: newWidth, height: newHeight };
    this.update();
  }

  update() {
    this.selectionBox.style.left = this.box.x + 'px';
    this.selectionBox.style.top = this.box.y + 'px';
    this.selectionBox.style.width = this.box.width + 'px';
    this.selectionBox.style.height = this.box.height + 'px';
    this.selectionBox.style.border = `2px solid ${this.borderColor}`;
    this.selectionBox.style.background = this.fillColor;

    for (const handle of Object.values(this.handles)) {
      handle.style.background = this.borderColor;
    }

    this.handles.nw.style.left = '-6px';
    this.handles.nw.style.top = '-6px';

    this.handles.ne.style.right = '-6px';
    this.handles.ne.style.top = '-6px';

    this.handles.sw.style.left = '-6px';
    this.handles.sw.style.bottom = '-6px';

    this.handles.se.style.right = '-6px';
    this.handles.se.style.bottom = '-6px';
  }

  getBox() {
    return { ...this.box };
  }

  setAspectRatio(aspectRatio) {
    this.aspectRatio = aspectRatio;
    const centerX = this.box.x + this.box.width / 2;
    const centerY = this.box.y + this.box.height / 2;

    this.box.height = this.box.width / aspectRatio;
    this.box.y = centerY - this.box.height / 2;

    if (this.box.y < 0) this.box.y = 0;
    if (this.box.y + this.box.height > this.container.clientHeight) {
      this.box.y = this.container.clientHeight - this.box.height;
    }

    this.update();
  }
}
