Using Docker Dockploy, Traefik, Valkey
-------------------------------
I'll use C++ 
-------------------
1.1 Server Preparation
----------------------
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
--------------
Edit /etc/sysctl.conf to increase:

Maximum file descriptors (100,000)

TCP connection limits (8,192 backlog)

Network buffer sizes (16 MB)

Enable TCP BBR congestion control

Fast connection recycling

Apply changes with sysctl -p


Phase 2: Core Technology Stack (Week 1-2)
-------------------------------

2.1 C++ Backend Setup
----------------------

-- Choose Your Framework: --

Best choice: uWebSockets (lightest, fastest for WebSockets)
