Using Docker Dockploy, Traefik, Valkey

I'll use C++ 

1.1 Server Preparation
Get the VPS:
Sign up for the $1.99/month VPS
Choose Ubuntu 22.04 LTS or Debian 12 (minimal installs)
Enable SSH key authentication immediately
Disable password login for security

OS Optimization:
Update system: apt update && apt upgrade
Install only essentials: build tools (gcc, cmake, git), no GUI, no unnecessary services

Remove snapd, unattended-upgrades if present (saves 100+ MB RAM)

Configure swap: Create 1GB swap file on NVMe for emergency overflow

Kernel Tuning:

