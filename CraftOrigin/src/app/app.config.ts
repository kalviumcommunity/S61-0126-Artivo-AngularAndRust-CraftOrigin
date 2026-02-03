import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';
import {
  LucideAngularModule,
  Heart,
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Store,
  ShoppingCart,
  LogOut,
  Plus,
  Minus,
  LayoutDashboard,
  Palette,
  Settings,
  Truck,
  Image,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader
} from 'lucide-angular';
import { SharedModule } from './shared/shared.module';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Heart,
        ShoppingBag,
        Search,
        User,
        Menu,
        X,
        Facebook,
        Instagram,
        Twitter,
        Youtube,
        Mail,
        Phone,
        MapPin,
        Store,
        ShoppingCart,
        LogOut,
        Plus,
        Minus,
        LayoutDashboard,
        Palette,
        Settings,
        Truck,
        Image,
        Edit2,
        Trash2,
        Eye,
        EyeOff,
        Loader
      })
    ),
    importProvidersFrom(
      SharedModule
    )
  ]
};
