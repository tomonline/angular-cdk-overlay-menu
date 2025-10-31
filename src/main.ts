import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DemoComponent } from './app/demo.component';

bootstrapApplication(DemoComponent, {
    providers: [
        provideAnimations(),
        importProvidersFrom(OverlayModule, PortalModule)
    ]
}).catch(err => console.error(err));
