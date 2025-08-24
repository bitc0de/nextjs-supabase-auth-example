# Authentication System with Supabase

This Next.js project demonstrates how to implement a complete authentication system using Supabase Auth, including user registration via email/password, login, and authentication with Google OAuth.

## 🚀 Implemented Features

- ✅ **User registration** with email and password
- ✅ **User login** with email and password
- ✅ **Google OAuth authentication**
- ✅ **Session management** with Next.js middleware
- ✅ **Global authentication context** for React
- ✅ **Server Actions** for authentication operations
- ✅ **Route protection** and authentication state management
- ✅ **Modern UI** with Tailwind CSS and Radix UI components
- ✅ **Error handling** and loading states

## 📋 Prerequisites

- Node.js 18+ 
- Account on [Supabase](https://supabase.com)
- Basic knowledge of Next.js and React

## 🛠️ Installation and Configuration

### 1. Clone and install dependencies

```bash
# Clone the repository
git clone https://github.com/bitc0de/nextjs-supabase-auth-example.git
cd nextjs-supabase-auth-example

# Install dependencies
npm install

# Create .env.local with your Supabase credentials

# Run the project
npm run dev
```

### 2. Configure Supabase (Google sign in)

#### Create project in Google Cloud
1. Create the project
2. Go to **APIs & Services > Consent Screen > Credentials**
3. Create a new client
5. Keep the page open and continue with project creation in Supabase:

#### Create project in Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Wait for configuration to complete
5. In your Supabase project, go to **Authentication > Sign In/Providers**
7. Enable Google and copy Callback URL (for OAuth)
8. Keep this page open as well

#### Connect services
1. Now go back to the Google Cloud page and copy the Callback URL in **Authorized redirect URIs**
2. Don't put anything in **Authorized JavaScript origins**
3. Copy the **Client ID** and **Client Secret**
4. In the Google configuration in Supabase, copy the Client ID and Client Secret from Google Cloud
5. Check **Skip nonce checks**
6. Done!

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key
```

### 4. Run the project

```bash
npm run dev
```

## 🏗️ Project Architecture

### File structure

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

## 🔧 Technical Configuration

### 1. Main dependencies

```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.56.0",
  "next": "15.5.0",
  "react": "19.1.0"
}
```

### 2. What is Supabase and why do we need it?

**Supabase** is like a "Firebase alternative" that provides us with:
- **Database** for storing information
- **Authentication** for managing users and sessions
- **Automatic APIs** for accessing data
- **File storage**

In our case, we use it mainly for **user authentication**.

### 3. Supabase Client - Why do we need two versions?

In Next.js we have two different environments:
- **User's browser** (client)
- **Next.js server** (server)

That's why we need to create two different "clients" to communicate with Supabase from each environment.

#### Browser-side client (`utils/supabase/client.ts`)

**What is it for?** This file creates a "connection" between the user's browser and Supabase.

**When is it used?** When the user interacts with the page (clicks buttons, submits forms, etc.)

**Why is it necessary?** Because the browser needs to know how to communicate with Supabase to do things like login, registration, etc.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Verify we're in the browser
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be created on the client side')
  }

  // Create connection with Supabase using our credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,    // URL of our Supabase project
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Public key for connection
  )
}
```

#### Server-side client (`utils/supabase/server.ts`)

**What is it for?** This file creates a "connection" between the Next.js server and Supabase.

**When is it used?** When Next.js needs to do something on the server (like checking if a user is logged in before showing a page).

**Why is it necessary?** Because the server also needs to communicate with Supabase, but from a different environment than the browser.

**What are cookies?** Cookies are small files that are saved in the user's browser to remember information (like whether they're logged in or not).

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Get access to user's cookies
  const cookieStore = await cookies()
  
  // Create connection with Supabase
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Function to read cookies
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Function to save cookies
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        // Function to remove cookies
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 4. Authentication middleware - What is it and why is it important?

**What is middleware?** It's like a "guard" that runs **before** the user sees any page.

**What is it for?** To verify if the user is logged in, update their session, and protect routes before they are displayed.

**When does it run?** **Always**, on every page the user visits.

**Why is it important?** Without middleware, anyone could access private pages without being logged in.

#### Main middleware (`middleware.ts`)

```typescript
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Every time someone visits a page, we update their session
  return await updateSession(request)
}

export const config = {
  matcher: [
    // This pattern says: "run middleware on ALL pages EXCEPT static files"
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### Session update function (`utils/supabase/middleware.ts`)

**What is it for?** This function runs on every page to verify and update the user's session.

**What does it do step by step?**
1. Reads the user's cookies
2. Connects to Supabase
3. Verifies if the user is logged in
4. Updates the session if necessary

```typescript
export async function updateSession(request: NextRequest) {
  // Create a basic response
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Connect to Supabase from the server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read user's cookies
        get: (name) => request.cookies.get(name)?.value,
        // Save cookies in request and response
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        // Remove cookies
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verify if user is logged in
  await supabase.auth.getUser()
  return response
}
```

### 5. Authentication context - What is it and why do we need it?

**What is a context in React?** It's like a "magic box" that allows sharing information between different components without having to pass it manually.

**What is AuthContext for?** So that **the entire application** knows if there's a logged-in user or not, regardless of which component we're in.

**Why is it important?** Without context, we would have to pass user information from the parent component to the child, then to the grandchild, and so on (this is called "prop drilling").

**How does it work?** The context "wraps" the entire application and provides user information to any component that needs it.

#### AuthContext (`src/contexts/AuthContext.tsx`)

```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  // State to store user information
  const [user, setUser] = useState<User | null>(null)        // Who is logged in?
  const [isLoading, setIsLoading] = useState(true)           // Are we loading?
  const [error, setError] = useState<string | null>(null)    // Was there an error?

  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient()
      
      // 1. Check if there's already a logged-in user
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      setUser(initialUser)

      // 2. Set up a "listener" for authentication changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // When authentication state changes, we update the context
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [])

  // ... rest of context
}
```

### 6. Server Actions - What are they and why are they secure?

**What are Server Actions?** They are functions that run **on the server** instead of in the user's browser.

**Why are they important for authentication?** Because login/registration operations are **sensitive** and we don't want the code to run in the browser where it could be manipulated.

**What are the advantages?**
- ✅ **Security**: Code runs on the server
- ✅ **Speed**: No JavaScript code is downloaded to the browser
- ✅ **SEO**: Better for search engines
- ✅ **Validation**: We can validate data on the server

#### Authentication actions (`src/lib/auth-actions.ts`)

```typescript
// 1. LOGIN with email/password
export async function login(formData: FormData) {
  // Connect to Supabase from the server
  const supabase = await createClient()
  
  // Extract form data
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // Try to login
  const { error } = await supabase.auth.signInWithPassword(data)
  
  // If there's an error, redirect to error page
  if (error) redirect("/error")
  
  // If everything goes well, update the page and redirect
  revalidatePath("/", "layout")
  redirect("/")
}

// 2. USER REGISTRATION
export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  // Prepare user data
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        // Save full name and email as additional data
        full_name: `${formData.get("first-name")} ${formData.get("last-name")}`,
        email: formData.get("email") as string,
      },
    },
  }

  // Create user account
  const { error } = await supabase.auth.signUp(data)
  
  if (error) redirect("/error")
  
  revalidatePath("/", "layout")
  redirect("/")
}

// 3. LOGIN with Google (OAuth)
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Start OAuth process with Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",  // To get refresh tokens
        prompt: "consent",       // To ask for user consent
      },
    },
  })

  if (error) redirect("/error")
  
  // Redirect user to Google for authorization
  redirect(data.url)
}
```

## 🎨 UI Components

### 1. Login Form (`src/app/(auth)/login/components/LoginForm.tsx`)
- Fields for email and password
- Login button with Server Action
- Google login button
- Registration link

### 2. Registration Form (`src/app/(auth)/signup/components/SignUpForm.tsx`)
- Fields for first name, last name, email and password
- Registration button with Server Action
- Login link

### 3. Login/Logout Button (`src/components/LoginLogoutButton.tsx`)
- Shows authentication state
- Login button if no user
- Logout button if user is authenticated

## 🔐 Authentication Flow - Visual Explanation

### 🎯 How does everything work together?

Imagine your application is like a **building with security**:

```
🏢 BUILDING (Your application)
├── 🚪 MAIN ENTRANCE (Login page)
├── 🛡️ SECURITY GUARD (Middleware)
├── 🗝️ KEYS (Session cookies)
├── 📋 VISITOR REGISTRY (Supabase)
└── 🏠 PRIVATE ROOMS (Protected pages)
```

### 1. 🆕 User registration (First time)
```
User → Fills form → Server Action → Supabase creates account → Confirmation email → ✅ User registered
```

**What happens?**
1. User fills registration form
2. `signup()` Server Action executes (on server)
3. Supabase creates account and sends confirmation email
4. User is redirected to main page

### 2. 🔑 Login with email/password
```
User → Enters credentials → Server Action → Supabase validates → Creates session → 🍪 Cookie saved → ✅ User logged in
```

**What happens?**
1. User enters credentials
2. `login()` Server Action executes (on server)
3. Supabase validates credentials
4. Session is created and saved in cookies
5. User is redirected to main page

### 3. 🌐 Login with Google (OAuth)
```
User → Click "Login Google" → Server Action → Redirects to Google → User authorizes → Google redirects → ✅ Session created
```

**What happens?**
1. User clicks "Login with Google"
2. `signInWithGoogle()` Server Action executes
3. Redirects to Google for authorization
4. After authorization, Google redirects back
5. Session is created automatically

### 4. 🛡️ Session management (On every page)
```
User visits page → Middleware intercepts → Reads cookies → Verifies with Supabase → ✅ Page displays
```

**What happens on every page?**
1. **Middleware** intercepts the visit (like a security guard)
2. Reads user's **cookies**
3. Connects to **Supabase** to verify session
4. If valid, page is displayed
5. If invalid, redirects to login

### 5. 🔄 Real-time synchronization
```
Supabase changes → AuthContext updates → UI updates automatically → ✅ User sees changes immediately
```

**What happens when something changes?**
1. **Middleware** updates session on each request
2. **AuthContext** keeps state synchronized
3. **UI** updates automatically
4. User sees changes in real time

## 🚨 Error Handling

- **Authentication errors**: Redirect to error page
- **Loading states**: Visual indicators during operations
- **Form validation**: Required fields and data types
- **Expired session handling**: Automatic update

## 🔒 Security

- **Server Actions**: Authentication operations on server
- **Middleware**: Route protection and cookie management
- **Environment variables**: Secure credentials
- **Data validation**: Input sanitization

## 🎯 Use Cases

### Local development
- Complete authentication on `localhost:3000`
- Redirects configured for development
- Hot reload with real-time changes

### Production
- Configure production URLs in Supabase
- Environment variables on hosting platform
- Middleware working in production

## 📝 Important Notes

1. **Cookies**: Middleware handles session cookies automatically
2. **SSR**: Server client allows SSR operations
3. **Context**: AuthContext provides global authentication state
4. **Server Actions**: Auth operations are Server Actions for greater security
5. **OAuth**: Google OAuth requires additional configuration in Google Cloud Console

## ❓ Frequently Asked Questions for Beginners

### 🤔 "Why do I need two files to connect with Supabase?"
**Answer**: Because Next.js has two different environments:
- **Client**: The user's browser (where JavaScript runs)
- **Server**: The computer where your application is hosted

It's like having two different phones to call the same place.

### 🤔 "What is middleware and why is it important?"
**Answer**: Middleware is like a **security guard** that runs **before** showing any page. Without it, anyone could access private pages.

### 🤔 "Why do I use Server Actions instead of normal functions?"
**Answer**: For **security**. Login/registration operations are sensitive and we don't want the code to run in the browser where it could be manipulated.

### 🤔 "What are cookies and why do I need them?"
**Answer**: Cookies are like **identification cards** that are saved in the browser. They allow the application to remember if you're logged in or not.

### 🤔 "Why do I need an authentication context?"
**Answer**: Without context, you would have to pass user information from the parent component to the child, then to the grandchild... it would be very complicated!

## 🐛 Troubleshooting

### Error: "Supabase client can only be created on the client side"
**What does it mean?** You're trying to use the browser client on the server.

**How to fix it?**
- ✅ For browser components: use `createClient()` from `client.ts` file
- ✅ For server operations: use `createClient()` from `server.ts` file

### Error: "Invalid login credentials"
**What does it mean?** The credentials (email/password) are not correct.

**How to fix it?**
- ✅ Verify the user is registered
- ✅ Confirm the email is verified
- ✅ Check that the password is correct
- ✅ Verify Supabase configuration

### Error: "OAuth provider not configured"
**What does it mean?** Google OAuth is not configured correctly.

**How to fix it?**
- ✅ Configure Google OAuth in Supabase
- ✅ Verify Google Cloud Console credentials
- ✅ Make sure redirect URLs are configured

## 📚 Additional Resources

- [Official Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

## 🆘 Glossary for Beginners

### Basic Concepts

**🔐 Authentication**: Process of verifying who you are (like showing your ID)

**👤 User**: Person who uses your application

**🔑 Session**: Period of time when a user is "logged in"

**🍪 Cookie**: Small file that is saved in the browser to remember information

**🌐 Client vs Server**:
- **Client**: The user's browser (Chrome, Firefox, etc.)
- **Server**: The computer where your application is hosted

**📱 SSR (Server-Side Rendering)**: When pages are generated on the server before sending them to the browser

**🔄 OAuth**: System that allows users to log in using accounts from other services (Google, Facebook, etc.)

### Why this architecture?

**1. Security**: Sensitive operations are done on the server
**2. Speed**: Pages load faster
**3. Scalability**: You can handle many simultaneous users
**4. Maintainability**: Code is well organized and easy to understand

## 🤝 Contribution

This project is an educational example. If you find errors or want to improve the implementation, contributions are welcome.

---


**Note**: This README is designed to be a complete reference for implementing authentication with Supabase in Next.js. Follow the steps in order and make sure to properly configure all environment variables and Supabase configurations.
