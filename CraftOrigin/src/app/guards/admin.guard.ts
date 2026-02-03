import { CanActivateFn } from '@angular/router';

/** Allows admin access without login. Remove or re-enforce checks when adding real auth. */
export const adminGuard: CanActivateFn = () => true;
