# Login Front

Frontend de autenticación y gestión de usuarios construido con Angular 18. El proyecto implementa login, registro, listado de usuarios, edición, eliminación y cierre de sesión, consumiendo un backend REST y aplicando una separación por capas inspirada en arquitectura hexagonal.

## Objetivo del proyecto

Esta aplicación resuelve el flujo base de acceso y administración de usuarios:

- inicio de sesión con almacenamiento de `access_token` y `refresh_token`
- protección de rutas privadas mediante guard
- renovación automática del token cuando el backend responde `401`
- registro de nuevos usuarios
- consulta, edición y eliminación de usuarios existentes

## Stack tecnológico

- Angular 18
- TypeScript 5
- Angular Router
- Angular Reactive Forms
- Angular Signals
- HttpClient con interceptor global
- Angular SSR con Express
- Karma + Jasmine para pruebas unitarias

## Funcionalidades principales

- `Login`: autentica contra el backend y redirige a `/users`
- `Register`: crea usuarios nuevos y luego redirige a `/login`
- `User List`: muestra todos los usuarios registrados
- `User Edit Modal`: permite modificar nombre y estado activo
- `Delete Confirmation`: confirma la eliminación antes de ejecutar el borrado
- `Logout`: invalida sesión en backend, limpia credenciales locales y vuelve al login

## Arquitectura

El módulo `user-management` está organizado por responsabilidades:

- `domain/`: entidades y reglas del dominio
- `application/input/`: casos de uso consumidos desde la UI
- `application/services/`: implementación de la lógica de aplicación
- `application/output/`: contratos de salida hacia infraestructura
- `infrastructure/`: adaptadores HTTP, DTOs, mapper, guard e interceptor
- `presentation/`: componentes standalone y vistas

La inyección de dependencias se configura en [`src/app/app.config.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/app.config.ts), donde:

- `AuthUseCase` se resuelve con `AuthService`
- `UserUseCase` se resuelve con `UserService`
- `UserRepository` se resuelve con `UserHttpAdapter`

Esto permite mantener la UI desacoplada de la implementación HTTP concreta.

### Estilo arquitectónico

El proyecto sigue una variante de arquitectura hexagonal aplicada al frontend:

- la capa de `presentation` dispara acciones desde componentes y formularios
- la capa de `application` define casos de uso y coordina la lógica de negocio
- la capa de `domain` contiene la entidad principal `User`
- la capa de `infrastructure` implementa el acceso real al backend mediante HTTP

La intención es que la interfaz no dependa directamente de `HttpClient`, DTOs ni detalles del backend.

### Diagrama de capas

```text
Presentation
  LoginComponent
  RegisterComponent
  UserListComponent
  UserEditModalComponent
        |
        v
Application Input
  AuthUseCase
  UserUseCase
        |
        v
Application Services
  AuthService
  UserService
        |
        v
Application Output
  UserRepository
        |
        v
Infrastructure
  UserHttpAdapter
  AuthInterceptor
  authGuard
  DTOs / Mapper
        |
        v
Backend REST API
```

### Reglas de dependencia

- `presentation` conoce los casos de uso, no el adaptador HTTP
- `application/services` depende de abstracciones como `UserRepository`
- `infrastructure` implementa esas abstracciones y traduce datos externos al modelo del dominio
- `domain` no depende de Angular ni de detalles de transporte

### Flujo interno de una operación

Ejemplo: carga del listado de usuarios

1. [`UserListComponent`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/presentation/user-list/user-list.component.ts) invoca `userUseCase.getAllUsers()`.
2. Angular resuelve `UserUseCase` con `UserService`.
3. `UserService` delega en `UserRepository`.
4. Angular resuelve `UserRepository` con `UserHttpAdapter`.
5. `UserHttpAdapter` ejecuta `GET /users` con `HttpClient`.
6. La respuesta del backend se transforma con `UserMapper`.
7. El componente recibe entidades `User` ya adaptadas al dominio y actualiza sus `signals`.

Ejemplo: autenticación

1. [`LoginComponent`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/presentation/login/login.component.ts) invoca `authUseCase.loginWithRefreshToken(...)`.
2. `AuthService` delega la autenticación al repositorio.
3. `UserHttpAdapter` consume `POST /login`.
4. El componente persiste `access_token` y `refresh_token` en `localStorage`.
5. [`authGuard.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/infrastructure/auth.guard.ts) protege `/users`.
6. [`Auth.interceptor.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/infrastructure/interceptors/Auth.interceptor.ts) adjunta el bearer token y resuelve expiraciones mediante refresh token.

## Estructura del proyecto

```text
src/
  app/
    user-management/
      application/
      domain/
      infrastructure/
      presentation/
  environments/
  index.html
  main.ts
  main.server.ts
server.ts
```

## Flujo de autenticación

1. El usuario inicia sesión desde `/login`.
2. El frontend envía credenciales a `POST /login`.
3. Si la autenticación es correcta, se guardan `access_token` y `refresh_token` en `localStorage`.
4. La ruta `/users` queda protegida por [`auth.guard.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/infrastructure/auth.guard.ts).
5. El interceptor agrega el header `Authorization: Bearer <token>` en cada petición autenticada.
6. Si el backend responde `401`, el interceptor intenta renovar sesión con el `refresh_token`.
7. Si la renovación falla, se limpia `localStorage` y se redirige a `/login`.

## Rutas disponibles

- `/login`
- `/register`
- `/users`

La ruta raíz redirige automáticamente a `/login`.

## Integración con backend

La URL base configurada actualmente es:

```ts
http://localhost:8080/api/auth
```

Se define en:

- [`src/environments/environment.ts`](/Users/oospina/Documents/davivienda/loginFront/src/environments/environment.ts)
- [`src/environments/environment.development.ts`](/Users/oospina/Documents/davivienda/loginFront/src/environments/environment.development.ts)

### Endpoints consumidos

- `POST /login`
- `POST /logout`
- `POST /create`
- `PUT /update`
- `GET /users`
- `GET /users/:id`
- `DELETE /users/:id`
- `POST /refresh-token`

## Modelo de datos principal

La entidad base es `User`, definida en [`src/app/user-management/domain/User.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/domain/User.ts), con los siguientes campos:

- `id`
- `name`
- `email`
- `isActive`
- `createdAt`
- `updatedAt`
- `password` opcional

El mapeo entre DTOs del backend y el modelo de dominio se realiza en [`UserMapper.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/infrastructure/mappers/UserMapper.ts).

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- backend disponible en `http://localhost:8080`

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm start
```

La aplicación queda disponible en:

```text
http://localhost:4200
```

## Build de producción

```bash
npm run build
```

El resultado se genera en:

```text
dist/login-front
```

## Ejecución SSR

Después del build, puedes levantar la versión server-side renderizada con:

```bash
npm run serve:ssr:loginFront
```

Por defecto, el servidor Express arranca en:

```text
http://localhost:4000
```

## Pruebas

```bash
npm test
```

## Decisiones técnicas relevantes

- Se usan componentes `standalone` en lugar de módulos clásicos.
- Se usan `signals` para manejar estado de carga, errores, selección y modales.
- Los formularios están construidos con `ReactiveFormsModule`.
- El acceso a rutas privadas depende de la existencia del token en `localStorage`.
- La capa de infraestructura encapsula el contrato HTTP para no contaminar la capa de presentación.

## Observaciones importantes

- La URL de `refresh-token` está escrita de forma fija dentro del interceptor en [`Auth.interceptor.ts`](/Users/oospina/Documents/davivienda/loginFront/src/app/user-management/infrastructure/interceptors/Auth.interceptor.ts), mientras el resto de endpoints usa `environment.apiUrl`. Conviene unificar eso si vas a mover entornos.
- `environment.ts` y `environment.development.ts` apuntan hoy a la misma URL.
- El proyecto ya incluye SSR, pero el flujo principal es una SPA de autenticación y administración.

## Scripts disponibles

```bash
npm start
npm run build
npm run watch
npm test
npm run serve:ssr:loginFront
```

## Próximas mejoras recomendadas

- centralizar todos los endpoints en un único archivo de configuración
- mover tokens a una estrategia de almacenamiento más robusta si el contexto de seguridad lo exige
- agregar pruebas unitarias más profundas para servicios, interceptor y guard
- incorporar manejo visual más explícito para estados vacíos, errores de red y expiración de sesión

## Autoría

Proyecto frontend Angular orientado a autenticación y administración de usuarios para flujo tipo Davivienda.
