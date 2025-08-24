# Sistema de Autenticación con Supabase

Este proyecto de Next.js demuestra cómo implementar un sistema completo de autenticación utilizando Supabase Auth, incluyendo registro de usuarios mediante email/contraseña, login y autenticación con Google OAuth.

## 🚀 Características Implementadas

- ✅ **Registro de usuarios** con email y contraseña
- ✅ **Login de usuarios** con email y contraseña
- ✅ **Autenticación con Google OAuth**
- ✅ **Manejo de sesiones** con middleware de Next.js
- ✅ **Contexto de autenticación global** para React
- ✅ **Server Actions** para operaciones de autenticación
- ✅ **Protección de rutas** y manejo de estado de autenticación
- ✅ **UI moderna** con Tailwind CSS y componentes de Radix UI
- ✅ **Manejo de errores** y estados de carga

## 📋 Prerrequisitos

- Node.js 18+ 
- Cuenta en [Supabase](https://supabase.com)
- Conocimientos básicos de Next.js y React

## 🛠️ Instalación y Configuración

### 1. Clonar y instalar dependencias

```bash
git clone <tu-repositorio>
cd fishiary
npm install
```

### 2. Configurar Supabase (Google sign in)

#### Crear proyecto en Google Cloud
1. Crear el proyecto
2. Ir a **API y Servicios habilitados > Pantalla de consentimiento > Clientes**
3. Crear un nuevo cliente 
5. Manten la pagina abierta y sigue con la creación del proyecto en supabase:

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración
5. En tu proyecto de Supabase, ve a **Authentication > Sign In/Providers**
7. Activar Google y copiar Callback URL (for OAuth)
8. Mantener esta pagina tambien abierta

#### Conectar servicios
1. Ahora vuelve a la pagina de Google Cloud y copia el Callback URL en **URIs de redireccionamiento autorizados**
2. No poner nada en **Orígenes autorizados de JavaScript**
3. Copiar el **ID de cliente** y **Secreto de Cliente**
4. En la configuración de Google en Supabase copia el Client ID y el Client Secret de Google Cloud
5. Marcar **Skip nonce checks**
6. Listo!


### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_del_proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

## 🏗️ Arquitectura del Proyecto

### Estructura de archivos

```
fishiary/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── SignInWithGoogleButton.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   ├── components/
│   │   │   │   │   └── SignUpForm.tsx
│   │   │   │   └── page.tsx
│   │   │   └── logout/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── LoginLogoutButton.tsx
│   │   ├── UserGreetText.tsx
│   │   └── ui/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   └── lib/
│       └── auth-actions.ts
├── utils/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── middleware.ts
└── package.json
```

## 🔧 Configuración Técnica

### 1. Dependencias principales

```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.56.0",
  "next": "15.5.0",
  "react": "19.1.0"
}
```

### 2. ¿Qué es Supabase y por qué lo necesitamos?

**Supabase** es como un "Firebase alternativo" que nos proporciona:
- **Base de datos** para almacenar información
- **Autenticación** para gestionar usuarios y sesiones
- **APIs automáticas** para acceder a los datos
- **Almacenamiento de archivos**

En nuestro caso, lo usamos principalmente para **autenticación de usuarios**.

### 3. Cliente de Supabase - ¿Por qué necesitamos dos versiones?

En Next.js tenemos dos entornos diferentes:
- **Navegador del usuario** (cliente)
- **Servidor de Next.js** (servidor)

Por eso necesitamos crear dos "clientes" diferentes para comunicarnos con Supabase desde cada entorno.

#### Cliente del lado del navegador (`utils/supabase/client.ts`)

**¿Para qué sirve?** Este archivo crea una "conexión" entre el navegador del usuario y Supabase.

**¿Cuándo se usa?** Cuando el usuario interactúa con la página (hace clic en botones, envía formularios, etc.)

**¿Por qué es necesario?** Porque el navegador necesita saber cómo comunicarse con Supabase para hacer cosas como login, registro, etc.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Verificamos que estemos en el navegador
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be created on the client side')
  }

  // Creamos la conexión con Supabase usando nuestras credenciales
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,    // URL de nuestro proyecto Supabase
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Clave pública para conectar
  )
}
```

#### Cliente del lado del servidor (`utils/supabase/server.ts`)

**¿Para qué sirve?** Este archivo crea una "conexión" entre el servidor de Next.js y Supabase.

**¿Cuándo se usa?** Cuando Next.js necesita hacer algo en el servidor (como verificar si un usuario está logueado antes de mostrar una página).

**¿Por qué es necesario?** Porque el servidor también necesita comunicarse con Supabase, pero desde un entorno diferente al navegador.

**¿Qué son las cookies?** Las cookies son pequeños archivos que se guardan en el navegador del usuario para recordar información (como si está logueado o no).

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Obtenemos acceso a las cookies del usuario
  const cookieStore = await cookies()
  
  // Creamos la conexión con Supabase
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Función para leer cookies
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Función para guardar cookies
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        // Función para eliminar cookies
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 4. Middleware de autenticación - ¿Qué es y por qué es importante?

**¿Qué es un middleware?** Es como un "guardián" que se ejecuta **antes** de que el usuario vea cualquier página.

**¿Para qué sirve?** Para verificar si el usuario está logueado, actualizar su sesión, y proteger rutas antes de que se muestren.

**¿Cuándo se ejecuta?** **Siempre**, en cada página que el usuario visita.

**¿Por qué es importante?** Sin middleware, cualquier persona podría acceder a páginas privadas sin estar logueado.

#### Middleware principal (`middleware.ts`)

```typescript
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Cada vez que alguien visita una página, actualizamos su sesión
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Este patrón dice: "ejecuta el middleware en TODAS las páginas EXCEPTO archivos estáticos"
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Función de actualización de sesión (`utils/supabase/middleware.ts`)

**¿Para qué sirve?** Esta función se ejecuta en cada página para verificar y actualizar la sesión del usuario.

**¿Qué hace paso a paso?**
1. Lee las cookies del usuario
2. Se conecta a Supabase
3. Verifica si el usuario está logueado
4. Actualiza la sesión si es necesario

```typescript
export async function updateSession(request: NextRequest) {
  // Creamos una respuesta básica
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Nos conectamos a Supabase desde el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Leemos las cookies del usuario
        get: (name) => request.cookies.get(name)?.value,
        // Guardamos cookies en la request y response
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        // Eliminamos cookies
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verificamos si el usuario está logueado
  await supabase.auth.getUser()
  return response
}
```

### 5. Contexto de autenticación - ¿Qué es y por qué lo necesitamos?

**¿Qué es un contexto en React?** Es como una "caja mágica" que permite compartir información entre diferentes componentes sin tener que pasarla manualmente.

**¿Para qué sirve el AuthContext?** Para que **toda la aplicación** sepa si hay un usuario logueado o no, sin importar en qué componente estemos.

**¿Por qué es importante?** Sin contexto, tendríamos que pasar la información del usuario desde el componente padre hasta el hijo, y luego al nieto, y así sucesivamente (esto se llama "prop drilling").

**¿Cómo funciona?** El contexto "envuelve" toda la aplicación y proporciona información sobre el usuario a cualquier componente que la necesite.

#### AuthContext (`src/contexts/AuthContext.tsx`)

```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  // Estado para almacenar información del usuario
  const [user, setUser] = useState<User | null>(null)        // ¿Quién está logueado?
  const [isLoading, setIsLoading] = useState(true)           // ¿Estamos cargando?
  const [error, setError] = useState<string | null>(null)    // ¿Hubo algún error?

  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient()
      
      // 1. Verificamos si ya hay un usuario logueado
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      setUser(initialUser)

      // 2. Configuramos un "escuchador" para cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Cuando cambia el estado de autenticación, actualizamos el contexto
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [])

  // ... resto del contexto
}
```

### 6. Server Actions - ¿Qué son y por qué son seguras?

**¿Qué son los Server Actions?** Son funciones que se ejecutan **en el servidor** en lugar de en el navegador del usuario.

**¿Por qué son importantes para la autenticación?** Porque las operaciones de login/registro son **sensible** y no queremos que el código se ejecute en el navegador donde podría ser manipulado.

**¿Cuáles son las ventajas?**
- ✅ **Seguridad**: El código se ejecuta en el servidor
- ✅ **Velocidad**: No se descarga código JavaScript al navegador
- ✅ **SEO**: Mejor para motores de búsqueda
- ✅ **Validación**: Podemos validar datos en el servidor

#### Acciones de autenticación (`src/lib/auth-actions.ts`)

```typescript
// 1. LOGIN con email/contraseña
export async function login(formData: FormData) {
  // Nos conectamos a Supabase desde el servidor
  const supabase = await createClient()
  
  // Extraemos los datos del formulario
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // Intentamos hacer login
  const { error } = await supabase.auth.signInWithPassword(data)
  
  // Si hay error, redirigimos a página de error
  if (error) redirect("/error")
  
  // Si todo sale bien, actualizamos la página y redirigimos
  revalidatePath("/", "layout")
  redirect("/")
}

// 2. REGISTRO de usuario
export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  // Preparamos los datos del usuario
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        // Guardamos nombre completo y email como datos adicionales
        full_name: `${formData.get("first-name")} ${formData.get("last-name")}`,
        email: formData.get("email") as string,
      },
    },
  }

  // Creamos la cuenta del usuario
  const { error } = await supabase.auth.signUp(data)
  
  if (error) redirect("/error")
  
  revalidatePath("/", "layout")
  redirect("/")
}

// 3. LOGIN con Google (OAuth)
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Iniciamos el proceso de OAuth con Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",  // Para obtener refresh tokens
        prompt: "consent",       // Para pedir consentimiento del usuario
      },
    },
  })

  if (error) redirect("/error")
  
  // Redirigimos al usuario a Google para autorización
  redirect(data.url)
}
```

## 🎨 Componentes de UI

### 1. Formulario de Login (`src/app/(auth)/login/components/LoginForm.tsx`)
- Campos para email y contraseña
- Botón de login con Server Action
- Botón de login con Google
- Enlace para registro

### 2. Formulario de Registro (`src/app/(auth)/signup/components/SignUpForm.tsx`)
- Campos para nombre, apellido, email y contraseña
- Botón de registro con Server Action
- Enlace para login

### 3. Botón de Login/Logout (`src/components/LoginLogoutButton.tsx`)
- Muestra estado de autenticación
- Botón de login si no hay usuario
- Botón de logout si hay usuario autenticado

## 🔐 Flujo de Autenticación - Explicación Visual

### 🎯 ¿Cómo funciona todo junto?

Imagina que tu aplicación es como un **edificio con seguridad**:

```
🏢 EDIFICIO (Tu aplicación)
├── 🚪 ENTRADA PRINCIPAL (Página de login)
├── 🛡️ GUARDIA DE SEGURIDAD (Middleware)
├── 🗝️ LLAVES (Cookies de sesión)
├── 📋 REGISTRO DE VISITANTES (Supabase)
└── 🏠 HABITACIONES PRIVADAS (Páginas protegidas)
```

### 1. 🆕 Registro de usuario (Primera vez)
```
Usuario → Llena formulario → Server Action → Supabase crea cuenta → Email confirmación → ✅ Usuario registrado
```

**¿Qué pasa?**
1. Usuario llena formulario de registro
2. Se ejecuta `signup()` Server Action (en el servidor)
3. Supabase crea cuenta y envía email de confirmación
4. Usuario es redirigido a la página principal

### 2. 🔑 Login con email/contraseña
```
Usuario → Ingresa credenciales → Server Action → Supabase valida → Crea sesión → 🍪 Cookie guardada → ✅ Usuario logueado
```

**¿Qué pasa?**
1. Usuario ingresa credenciales
2. Se ejecuta `login()` Server Action (en el servidor)
3. Supabase valida credenciales
4. Se crea sesión y se guarda en cookies
5. Usuario es redirigido a la página principal

### 3. 🌐 Login con Google (OAuth)
```
Usuario → Clic "Login Google" → Server Action → Redirige a Google → Usuario autoriza → Google redirige → ✅ Sesión creada
```

**¿Qué pasa?**
1. Usuario hace clic en "Login with Google"
2. Se ejecuta `signInWithGoogle()` Server Action
3. Se redirige a Google para autorización
4. Después de autorización, Google redirige de vuelta
5. Se crea sesión automáticamente

### 4. 🛡️ Manejo de sesiones (En cada página)
```
Usuario visita página → Middleware intercepta → Lee cookies → Verifica con Supabase → ✅ Página se muestra
```

**¿Qué pasa en cada página?**
1. **Middleware** intercepta la visita (como un guardia de seguridad)
2. Lee las **cookies** del usuario
3. Se conecta a **Supabase** para verificar la sesión
4. Si es válida, la página se muestra
5. Si no es válida, se redirige al login

### 5. 🔄 Sincronización en tiempo real
```
Supabase cambia → AuthContext se actualiza → UI se actualiza automáticamente → ✅ Usuario ve cambios inmediatamente
```

**¿Qué pasa cuando cambia algo?**
1. **Middleware** actualiza la sesión en cada request
2. **AuthContext** mantiene el estado sincronizado
3. **UI** se actualiza automáticamente
4. Usuario ve los cambios en tiempo real

## 🚨 Manejo de Errores

- **Errores de autenticación**: Redirección a página de error
- **Estados de carga**: Indicadores visuales durante operaciones
- **Validación de formularios**: Campos requeridos y tipos de datos
- **Manejo de sesiones expiradas**: Actualización automática

## 🔒 Seguridad

- **Server Actions**: Operaciones de autenticación en el servidor
- **Middleware**: Protección de rutas y manejo de cookies
- **Variables de entorno**: Credenciales seguras
- **Validación de datos**: Sanitización de inputs

## 🎯 Casos de Uso

### Desarrollo local
- Autenticación completa en `localhost:3000`
- Redirecciones configuradas para desarrollo
- Hot reload con cambios en tiempo real

### Producción
- Configurar URLs de producción en Supabase
- Variables de entorno en plataforma de hosting
- Middleware funcionando en producción

## 📝 Notas Importantes

1. **Cookies**: El middleware maneja cookies de sesión automáticamente
2. **SSR**: El cliente de servidor permite operaciones SSR
3. **Contexto**: El AuthContext proporciona estado global de autenticación
4. **Server Actions**: Las operaciones de auth son Server Actions para mayor seguridad
5. **OAuth**: Google OAuth requiere configuración adicional en Google Cloud Console

## ❓ Preguntas Frecuentes para Principiantes

### 🤔 "¿Por qué necesito dos archivos para conectar con Supabase?"
**Respuesta**: Porque Next.js tiene dos entornos diferentes:
- **Cliente**: El navegador del usuario (donde se ejecuta JavaScript)
- **Servidor**: La computadora donde está alojada tu aplicación

Es como tener dos teléfonos diferentes para llamar al mismo lugar.

### 🤔 "¿Qué es el middleware y por qué es importante?"
**Respuesta**: El middleware es como un **guardián de seguridad** que se ejecuta **antes** de mostrar cualquier página. Sin él, cualquier persona podría acceder a páginas privadas.

### 🤔 "¿Por qué uso Server Actions en lugar de funciones normales?"
**Respuesta**: Por **seguridad**. Las operaciones de login/registro son sensibles y no queremos que el código se ejecute en el navegador donde podría ser manipulado.

### 🤔 "¿Qué son las cookies y por qué las necesito?"
**Respuesta**: Las cookies son como **tarjetas de identificación** que se guardan en el navegador. Permiten que la aplicación recuerde si estás logueado o no.

### 🤔 "¿Por qué necesito un contexto de autenticación?"
**Respuesta**: Sin contexto, tendrías que pasar la información del usuario desde el componente padre hasta el hijo, y luego al nieto... ¡sería muy complicado!

## 🐛 Solución de Problemas

### Error: "Supabase client can only be created on the client side"
**¿Qué significa?** Estás intentando usar el cliente del navegador en el servidor.

**¿Cómo solucionarlo?**
- ✅ Para componentes del navegador: usa `createClient()` del archivo `client.ts`
- ✅ Para operaciones del servidor: usa `createClient()` del archivo `server.ts`

### Error: "Invalid login credentials"
**¿Qué significa?** Las credenciales (email/contraseña) no son correctas.

**¿Cómo solucionarlo?**
- ✅ Verifica que el usuario esté registrado
- ✅ Confirma que el email esté verificado
- ✅ Revisa que la contraseña sea correcta
- ✅ Verifica la configuración de Supabase

### Error: "OAuth provider not configured"
**¿Qué significa?** Google OAuth no está configurado correctamente.

**¿Cómo solucionarlo?**
- ✅ Configura Google OAuth en Supabase
- ✅ Verifica las credenciales de Google Cloud Console
- ✅ Asegúrate de que las URLs de redirección estén configuradas

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Server Actions de Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

## 🆘 Glosario para Principiantes

### Conceptos Básicos

**🔐 Autenticación**: Proceso de verificar quién eres (como mostrar tu DNI)

**👤 Usuario**: Persona que usa tu aplicación

**🔑 Sesión**: Período de tiempo en que un usuario está "logueado"

**🍪 Cookie**: Pequeño archivo que se guarda en el navegador para recordar información

**🌐 Cliente vs Servidor**:
- **Cliente**: El navegador del usuario (Chrome, Firefox, etc.)
- **Servidor**: La computadora donde está alojada tu aplicación

**📱 SSR (Server-Side Rendering)**: Cuando las páginas se generan en el servidor antes de enviarlas al navegador

**🔄 OAuth**: Sistema que permite a los usuarios loguearse usando cuentas de otros servicios (Google, Facebook, etc.)

### ¿Por qué esta arquitectura?

**1. Seguridad**: Las operaciones sensibles se hacen en el servidor
**2. Velocidad**: Las páginas se cargan más rápido
**3. Escalabilidad**: Puedes manejar muchos usuarios simultáneos
**4. Mantenibilidad**: El código está bien organizado y es fácil de entender

## 🤝 Contribución

Este proyecto es un ejemplo educativo. Si encuentras errores o quieres mejorar la implementación, las contribuciones son bienvenidas.

---

**Nota**: Este README está diseñado para ser una referencia completa para implementar autenticación con Supabase en Next.js. Sigue los pasos en orden y asegúrate de configurar correctamente todas las variables de entorno y configuraciones de Supabase.