export default class FixedAspectSelector {
  constructor(container, aspectRatio) {
    this.container = container;
    this.aspectRatio = aspectRatio || 1;
    this.box = { x: 50, y: 50, width: 100, height: 100 / this.aspectRatio };
    this.borderColor = '#f00';
    this.fillColor = 'rgba(255,0,0,0.12)';

    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'selection-box';
    this.selectionBox.style.position = 'absolute';
    this.selectionBox.style.boxSizing = 'border-box';
    this.container.appendChild(this.selectionBox);

    this.initEvents();
    this.update();
  }

  setAspectRatio(aspectRatio) {
    this.aspectRatio = aspectRatio;
    this.box.height = this.box.width / this.aspectRatio;
    this.update();
  }

  setColors(border, fill) {
    this.borderColor = border;
    this.fillColor = fill;
    this.update();
  }

  getBox() {
    return this.box;
  }

  update() {
    this.selectionBox.style.left = `${this.box.x}px`;
    this.selectionBox.style.top = `${this.box.y}px`;
    this.selectionBox.style.width = `${this.box.width}px`;
    this.selectionBox.style.height = `${this.box.height}px`;
    this.selectionBox.style.border = `2px solid ${this.borderColor}`;
    this.selectionBox.style.background = this.fillColor;
  }

  initEvents() {
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // ドラッグ開始
    this.selectionBox.addEventListener('mousedown', e => {
      isDragging = true;
      dragOffsetX = e.offsetX;
      dragOffsetY = e.offsetY;
      e.preventDefault();
    });

    // ドラッグ中
    const onMouseMove = e => {
      if (!isDragging) return;
      const rect = this.container.getBoundingClientRect();
      let x = e.clientX - rect.left - dragOffsetX;
      let y = e.clientY - rect.top - dragOffsetY;

      // コンテナ内に制限
      x = Math.max(0, Math.min(rect.width - this.box.width, x));
      y = Math.max(0, Math.min(rect.height - this.box.height, y));

      this.box.x = x;
      this.box.y = y;
      this.update();
    };

    // ドラッグ終了
    const onMouseUp = () => { isDragging = false; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // リサイズ用ハンドル
    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.width = '12px';
    handle.style.height = '12px';
    handle.style.right = '0';
    handle.style.bottom = '0';
    handle.style.cursor = 'se-resize';
    handle.style.background = this.borderColor;
    this.selectionBox.appendChild(handle);

    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    handle.addEventListener('mousedown', e => {
      isResizing = true;
      startWidth = this.box.width;
      startHeight = this.box.height;
      startX = e.clientX;
      startY = e.clientY;
      e.stopPropagation();
      e.preventDefault();
    });

    const onResize = e => {
      if (!isResizing) return;
      let deltaX = e.clientX - startX;
      let newWidth = startWidth + deltaX;
      let newHeight = newWidth / this.aspectRatio;

      const rect = this.container.getBoundingClientRect();
      if (this.box.x + newWidth > rect.width) newWidth = rect.width - this.box.x;
      if (this.box.y + newHeight > rect.height) newHeight = rect.height - this.box.y;

      this.box.width = newWidth;
      this.box.height = newHeight;
      this.update();
    };

    const onStopResize = () => { isResizing = false; };

    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', onStopResize);
  }
}
