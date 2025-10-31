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

  private positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -8 },
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
    this.overlayRef.keydownEvents().subscribe(ev => { if (ev.key === 'Escape') this.close(); });

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
  }

  private createPositionStrategy(origin: Origin): FlexibleConnectedPositionStrategy {
    return this.overlay.position()
      .flexibleConnectedTo(origin as any)
      .withPositions(this.positions)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(true)
      .withViewportMargin(8)
      .withPush(true);
  }
}
