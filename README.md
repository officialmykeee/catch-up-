https://officialmykeee.github.io/catch-up-/index.html

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

Best choice: Drogon

Avoid: Boost.Beast (too heavy), cpp-httplib (no async)

Libraries to Install:
--------------------

hiredis or redis-plus-plus (Valkey client)

simdjson (fastest JSON parsing, 5x faster than nlohmann)

liburing (if kernel 5.1+, for io_uring support)

moodycamel::ConcurrentQueue (lock-free message queues)

robin-hood-hashing (faster maps, 50% less memory)

Build System:
-----------
Use CMake with aggressive optimization flags

Enable -O3 -march=native -flto (Link Time Optimization)

Disable RTTI and exceptions (-fno-rtti -fno-exceptions)

Use static linking where possible to reduce memory


Use static linking where possible to reduce memory

Compilation Strategy:
---------------------
Build with Profile-Guided Optimization (PGO):

First build with profiling enabled
Run server under realistic load for 1 hour

Rebuild using the profile data (10-20% faster)

2.2 Valkey Configuration
-------------------------

Installation:

Use official Valkey Docker image (Alpine variant, smallest)

Or compile from source with jemalloc disabled (saves 20 MB)

Critical Settings in valkey.conf:
---------------------------------

maxmemory 80mb (strict limit, adjust based on shards)

maxmemory-policy volatile-lru (only evict keys with TTL)

save "" (disable RDB snapshots to save I/O)
