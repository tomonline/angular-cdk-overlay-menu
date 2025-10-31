import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from '../../context-menu-item.model';

@Component({
  selector: 'app-context-panel-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-panel-menu.component.html',
  styleUrl: './context-panel-menu.component.css'
})
export class ContextPanelMenuComponent {

  @Input() items: MenuItem[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<MenuItem>();

  onItemClick(item: MenuItem) {
    if (!item.disabled) this.itemSelected.emit(item);
  }

}
