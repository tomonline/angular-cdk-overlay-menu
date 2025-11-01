import { Component } from '@angular/core';
import { MenuItem } from './context-menu-item.model';
import { ContextMenuService } from './services/context-menu.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  template: `
      <div style="padding: 24px; display: flex; justify-content: right;">
      <button #menuBtn type="button" (click)="openMenu(menuBtn)">Open menu under me</button>
    </div>

    <div
      style="height: 400px; border: 1px dashed #ccc; margin: 24px"
      (contextmenu)="onContextMenu($event)"
    >
      Right-click anywhere in this box for a point-positioned context menu.
    </div>`
})
export class DemoComponent {
    constructor(private contextMenu: ContextMenuService) {}

  private buildItems(): MenuItem[] {
    return [
      { label: 'Edit', icon: 'edit', action: () => console.log('Edit') },
      { label: 'Duplicate', icon: 'content_copy', action: () => console.log('Duplicate') },
      { divider: true, label: '' },
      { label: 'Delete', icon: 'delete', action: () => console.log('Delete') },
    ];
  }

  private buttonItems(): MenuItem[] {
    return [
      { label: 'Refresh', icon: 'refresh', action: () => console.log('Refresh') },
      { label: 'Settings', icon: 'settings', action: () => console.log('Settings') },
    ];
  }

  openMenu(buttonEl: HTMLElement) {
    this.contextMenu.openUnder(buttonEl, this.buttonItems());
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.contextMenu.openAtPoint({ x: event.clientX, y: event.clientY }, this.buildItems());
  }
}
