import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {UserInPort} from './user-management/application/input/UserInPort';
import {UserHttpAdapter} from './user-management/infrastructure/adapter/UserHttpAdapter';
import {authInterceptor} from './user-management/infrastructure/interceptors/Auth.interceptor';
import {AuthInPort} from './user-management/application/input/AuthInPort';
import {AuthService} from './user-management/application/services/AuthService';
import {UserService} from './user-management/application/services/UserService';
import {UserRepository} from './user-management/application/output/UserRepository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(),
      withInterceptors([authInterceptor])),
    //cada vez que un componente te pida el menú llamado UserInPort, ve a la cocina, dile a UserHttpAdapter

    // --- MAPEO DE NUESTRA ARQUITECTURA HEXAGONAL PURA ---

    // Cuando la vista pida AuthInPort, el núcleo responde con el servicio de aplicación AuthService
    {provide: AuthInPort, useClass: AuthService},

    // Cuando un componente pida operaciones de usuario, responde UserService
    {provide: UserInPort, useClass: UserService},

    // Cuando la Aplicación requiera el repositorio de salida, la infraestructura le provee el adaptador HTTP
    {provide: UserRepository, useClass: UserHttpAdapter}
  ]
};
