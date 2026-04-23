# Cómo desplegar FinanceApp

## 1. Configurar Supabase

### a) Crear proyecto
1. Ir a https://supabase.com → New Project
2. Elegir nombre, contraseña de DB y región (South America si está disponible)

### b) Ejecutar el schema
1. Ir a **SQL Editor** → New query
2. Copiar y pegar el contenido de `supabase/schema.sql`
3. Click en **Run**

### c) Obtener credenciales
1. Ir a **Project Settings** → **API**
2. Copiar **Project URL** y **anon public key**

### d) Crear tu usuario
1. Ir a **Authentication** → **Users** → **Add user**
2. Ingresar tu email y contraseña

---

## 2. Configurar variables de entorno

### Para desarrollo local
Crear archivo `.env.local` en la raíz del proyecto:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Para Vercel
En el dashboard de Vercel → Settings → Environment Variables:
- `VITE_SUPABASE_URL` = tu Project URL
- `VITE_SUPABASE_ANON_KEY` = tu anon public key

---

## 3. Desplegar en Vercel

```bash
# Instalar Vercel CLI (si no lo tenés)
npm install -g vercel

# Desde la carpeta del proyecto
vercel

# Seguir los prompts:
# - Link to existing project? No
# - Project name: financeapp
# - Directory: ./  (o la carpeta actual)
# - Override settings? No
```

O bien desde la web: https://vercel.com/new → Import Git Repository

---

## 4. CORS en Supabase

Supabase permite requests desde cualquier origen por defecto con la anon key.
Para restringirlo a tu dominio de Vercel:
1. **Project Settings** → **API** → **Allowed Origins**
2. Agregar `https://tu-app.vercel.app`

---

## 5. Seguridad activada

| Medida | Estado |
|--------|--------|
| Row Level Security (RLS) | ✅ Todas las tablas |
| Auth requerida para leer/escribir | ✅ Políticas `authenticated` |
| HTTPS forzado | ✅ HSTS en Vercel |
| X-Frame-Options: DENY | ✅ |
| Content-Security-Policy | ✅ |
| X-Content-Type-Options | ✅ |
| Referrer-Policy | ✅ |
