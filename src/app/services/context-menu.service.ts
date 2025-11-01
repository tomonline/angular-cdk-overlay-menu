// src/app/context-menu/context-menu.service.ts
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ElementRef, inject, Injectable } from '@angular/core';
import { ContextPanelMenuComponent } from '../components/context-panel-menu/context-panel-menu.component';
import { MenuItem } from '../context-menu-item.model';

type Origin = ElementRef | HTMLElement | { x: number; y: number };

@Injectable({ providedIn: 'root' })
export class ContextMenuService {
  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private removeDocContextMenuTrap?: () => void;

  // Preferred positions when anchored to an element (e.g., button)
  private elementPositions: ConnectedPosition[] = [
    // Preferred: align menu's top-right corner with the button's right edge, below the button
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 1 },
    // Fallbacks when space is constrained
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -1 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 1 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -1 },
  ];

  // Preferred positions when anchored to a point (e.g., right-click)
  // First choice anchors the popup's top-right corner at the click point.
  private pointPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'end',   overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'end',   overlayY: 'bottom' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];

  openFrom(origin: Origin, items: MenuItem[]) {
    this.close();
    const positionStrategy = this.createPositionStrategy(origin);
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'context-menu-panel'
    });

    const portal = new ComponentPortal(ContextPanelMenuComponent);
    const compRef = this.overlayRef.attach(portal);
    compRef.instance.items = items;

    this.overlayRef.backdropClick().subscribe(() => this.close());
    // If user right-clicks on the backdrop while a menu is open, prevent the native menu,
    // close the current overlay, and re-dispatch the contextmenu event to the underlying element
    // so app-level handlers can compute items and open a new menu at that point.
    this.overlayRef.backdropElement?.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      const x = ev.clientX;
      const y = ev.clientY;
      // Close the current overlay first
      this.close();
      // Find underlying element and redispatch the event so its handler runs
      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      if (target) {
        const cloned = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          button: 2
        });
        target.dispatchEvent(cloned);
      }
    }, { passive: false });
    this.overlayRef.keydownEvents().subscribe(ev => { if (ev.key === 'Escape') this.close(); });

  // Prevent the native context menu anywhere while this overlay is open
  // and coordinate re-opening when the user right-clicks elsewhere quickly.
  this.trapContextmenuWhileOpen();

    compRef.instance.itemSelected.subscribe(item => {
      try { item.action?.(); } finally { this.close(); }
    });
    compRef.instance.closed.subscribe(() => this.close());

    queueMicrotask(() => compRef.location.nativeElement?.querySelector('.menu')?.focus());
  }

  openUnder(button: ElementRef | HTMLElement, items: MenuItem[]) {
    this.openFrom(button, items);
  }

  openAtPoint(point: { x: number; y: number }, items: MenuItem[]) {
    this.openFrom(point, items);
  }

  close() {
    if (!this.overlayRef) return;
    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = undefined;

    // Keep the trap for a short period to avoid a race on quick double right-clicks,
    // then remove it so normal contextmenu handlers resume.
    if (this.removeDocContextMenuTrap) {
      const remove = this.removeDocContextMenuTrap;
      this.removeDocContextMenuTrap = undefined;
      setTimeout(() => remove(), 120);
    }
  }

  private createPositionStrategy(origin: Origin): FlexibleConnectedPositionStrategy {
    const positions = this.isPoint(origin) ? this.pointPositions : this.elementPositions;
    return this.overlay.position()
      .flexibleConnectedTo(origin as any)
      .withPositions(positions)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(true)
      .withViewportMargin(8)
      .withPush(true);
  }

  private isPoint(origin: Origin): origin is { x: number; y: number } {
    return !!origin && typeof (origin as any).x === 'number' && typeof (origin as any).y === 'number';
  }

  private trapContextmenuWhileOpen() {
    // If already trapping, do nothing
    if (this.removeDocContextMenuTrap) return;

    const handler = (ev: MouseEvent) => {
      // Always prevent the native menu while an overlay is (or was just) open
      ev.preventDefault();
      ev.stopPropagation();

      const x = ev.clientX;
      const y = ev.clientY;

      // If right-click occurred on the backdrop, our backdrop handler will take care of redispatch.
      // Otherwise, if clicked outside the panel, close and redispatch so app handlers can open a new menu.
      const isInsidePanel = !!this.overlayRef && this.overlayRef.overlayElement.contains(ev.target as Node);
      if (!isInsidePanel) {
        // Close current overlay (if any) and redispatch to the underlying element on next macrotask
        if (this.overlayRef) this.close();
        const target = document.elementFromPoint(x, y) as HTMLElement | null;
        if (target) {
          setTimeout(() => {
            const cloned = new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: x,
              clientY: y,
              button: 2
            });
            target.dispatchEvent(cloned);
          }, 0);
        }
      }
    };

    document.addEventListener('contextmenu', handler, { capture: true, passive: false });
    this.removeDocContextMenuTrap = () => document.removeEventListener('contextmenu', handler, true);
  }
}
