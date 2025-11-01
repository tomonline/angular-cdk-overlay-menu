import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class MyActionsService {
    edit(recordId: string) {
        console.log('Editing', recordId);
        // ... your sync logic
    }

    duplicate(recordId: string) {
        console.log('Duplicating', recordId);
        // ... your sync logic
    }

    async delete(recordId: string): Promise<void> {
        console.log('Deleting', recordId);
        // Simulate async work (e.g., HTTP)
        await new Promise(res => setTimeout(res, 500));
        console.log('Deleted', recordId);
    }
}