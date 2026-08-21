# Guía: Cartics Frontend en Docker + acceso desde Electron y tablet

Esta guía asume que el repo ya trae `Dockerfile`, `nginx.conf`,
`docker-compose.yml`, `.dockerignore` y el `public/electron.js` ajustado
(vienen del pull). No hay que crear nada de cero — solo levantar el
contenedor y ajustar lo que sea específico de la máquina nueva.

> Antes de irte a la máquina nueva: confirma que estos archivos estén
> comiteados y subidos al repo (`git status`, `git add`, `git commit`,
> `git push`). Si se quedan sin subir, el pull no los trae.

Requisitos previos en la máquina nueva:
- Docker Desktop instalado y corriendo.
- Repo clonado o actualizado (`git pull`).
- Si el backend también corre en Docker en esa misma máquina, tenerlo ya
  levantado.

---

## 1. Clonar/actualizar el repo

```powershell
git pull
```

---

## 2. Verificar cómo llegar al backend desde esa máquina

Esto es lo único que puede cambiar entre máquinas — el `nginx.conf` y el
`docker-compose.yml` que vienen del repo apuntan al backend tal como está
configurado en la máquina original (`cartics-bff` en la red
`cartics_cartics_network`). Confirma que siga aplicando:

```powershell
docker network ls
docker inspect <nombre-del-contenedor-backend> --format "{{json .NetworkSettings.Networks}}"
```

- **Si el nombre de la red y del contenedor coinciden** con lo que ya trae
  `nginx.conf`/`docker-compose.yml` → no toques nada, pasa al paso 3.
- **Si son distintos**, edita:
  - `nginx.conf` → `proxy_pass http://<contenedor-backend>:<puerto>;`
  - `docker-compose.yml` → el nombre de la red bajo `networks:`
- **Si el backend NO corre en Docker en esa máquina** (está en otro servidor
  o corre nativo): en `nginx.conf` cambia el `proxy_pass` por la URL real
  (ej. `http://192.168.x.x:1313;` o `http://host.docker.internal:1313;` si
  corre en el host fuera de contenedores), y en `docker-compose.yml` elimina
  el bloque `networks:` completo.

---

## 3. Build y levantar el contenedor

```powershell
docker compose build
docker compose up -d
docker ps --filter name=cartics-frontend
```

Probar que sirve:
```powershell
curl http://localhost:3000/
```
Debe responder `200` con el HTML de la app.

Ver logs si algo falla:
```powershell
docker logs cartics-frontend --tail 50
```

---

## 4. Que el contenedor sobreviva a reinicios

Ya está cubierto por `restart: unless-stopped` en el compose (viene del
repo). Falta que **Docker Desktop** arranque solo al iniciar sesión en esta
máquina nueva. Dos formas de activarlo:

**Opción A — por PowerShell (Docker Desktop debe estar cerrado):**
```powershell
# 1. Cierra Docker Desktop por completo
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue

# 2. Respaldo por si algo sale mal
Copy-Item "$env:APPDATA\Docker\settings.json" "$env:APPDATA\Docker\settings.json.bak"

# 3. Activa autoStart
$settingsPath = "$env:APPDATA\Docker\settings.json"
$json = Get-Content $settingsPath -Raw | ConvertFrom-Json
$json.autoStart = $true
$json | ConvertTo-Json -Depth 20 | Set-Content $settingsPath -Encoding utf8

# 4. Vuelve a abrir Docker Desktop para que tome el cambio
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
Verificar que quedó activo:
```powershell
Get-Content "$env:APPDATA\Docker\settings.json" | Select-String "autoStart"
```

**Opción B — manual (más simple, sin riesgo de tocar el JSON):**
Docker Desktop → Settings (⚙) → General → activar
**"Start Docker Desktop when you sign in"** → Apply & restart.

Con cualquiera de las dos, al prender la compu: Docker Desktop arranca solo →
el contenedor (con restart policy) se levanta solo → no hay que abrir nada
manualmente.

---

## 5. Electron

`public/electron.js` ya viene del repo apuntando a `http://localhost:3000`
— no requiere cambios.

---

## 6. Acceso desde la tablet (misma WiFi)

1. Averigua la IP LAN de la compu:
   ```powershell
   ipconfig
   ```
   Busca el adaptador WiFi, campo "IPv4 Address" (ej. `192.168.1.50`).

2. Desde la tablet, conectada a la **misma red WiFi**, entra a:
   ```
   http://<esa-IP>:3000
   ```

---

## 7. Si la tablet no puede conectarse (checklist de red)

Esto fue lo que realmente bloqueaba el acceso en la máquina original —
revisa en este orden:

**a) Confirmar que el contenedor escucha en todas las interfaces:**
```powershell
netstat -an | findstr ":3000"
```
Debe verse `0.0.0.0:3000 ... LISTENING`.

**b) Ver la categoría de la red WiFi:**
```powershell
Get-NetConnectionProfile | Select-Object InterfaceAlias, NetworkCategory
```
Si dice `Public`, Windows Firewall bloquea por defecto casi todo el tráfico
entrante — incluida una regla nativa que bloquea específicamente el proceso
`com.docker.backend.exe` (el reenviador de puertos de Docker) en redes
Public. Esto es lo que pasó en la máquina original.

**c) La forma correcta de arreglarlo — marcar la red como confiable
(requiere Administrador):**
```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```
Esto solo afecta a esta red WiFi específica (la marca como confiable); otras
redes públicas a las que te conectes después siguen protegidas igual que
antes. Es preferible a deshabilitar la regla de bloqueo de Docker de forma
global, porque no expone los puertos en redes públicas futuras.

**d) Verificar conectividad básica con la tablet** (pide la IP de la tablet
en Ajustes → WiFi → tocar la red conectada):
```powershell
ping <IP-de-la-tablet>
arp -a
```

**e) Mientras alguien prueba desde la tablet, mirar si la petición llega:**
```powershell
docker logs cartics-frontend --since 1m
```
Si no aparece nada, el tráfico no está llegando a la máquina (revisar pasos
b-c). Si aparece la petición pero con error, el problema es de la app/proxy,
no de red.

---

## 8. Nota de seguridad

Marcar una red como `Private` no es "100% seguro" — sí evita exponer los
puertos de Docker en redes públicas futuras, pero **cualquier dispositivo
dentro de esa misma red WiFi confiable** puede llegar a los puertos publicados
(frontend, backend, y cualquier base de datos si está publicada al host).
Antes de replicar esto en la máquina nueva, confirma que:
- Ninguna base de datos publicada al host (ej. Postgres) tenga contraseña
  débil o por defecto.
- No haya API keys o secretos hardcodeados en variables `REACT_APP_*` (esas
  quedan visibles en el bundle JS que cualquiera en la red puede descargar).
