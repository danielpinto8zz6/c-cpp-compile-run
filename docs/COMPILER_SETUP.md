# Compiler Setup Guide

## Table of Contents
1. [Windows](#windows)
2. [Linux](#linux)
3. [macOS](#macos)
4. [WSL (Windows Subsystem for Linux)](#wsl)

---

### Windows

To compile and debug C/C++ code on Windows, install **TDM-GCC**:

1. Download the installer from the [TDM-GCC website](https://jmeubank.github.io/tdm-gcc/download/).
2. Run the installer.
3. Select **Create a new install**.
4. Choose your system **Architecture** (e.g., 64-bit), then proceed with the default options until installation is complete.
5. Restart Visual Studio Code.

---

### Linux

Most Linux distributions provide GCC and GDB via their package manager.

1. **Check if GCC is installed:**
   ```sh
   gcc -v
   ```
2. **If not installed, update your package lists:**
   ```sh
   sudo apt-get update
   ```
3. **Install GCC, G++ and GDB:**
   ```sh
   sudo apt-get install build-essential gdb
   ```

---

### macOS

You can use either **GCC** or **Clang** on macOS.

#### Using GCC

1. Install [Homebrew](https://brew.sh/) if you haven't already.
2. In the Terminal, run:
   ```sh
   brew install gcc gdb
   ```

#### Using Clang

1. **Check if Clang is installed:**
   ```sh
   clang --version
   ```
2. **If not installed, install Xcode Command Line Tools:**
   ```sh
   xcode-select --install
   ```

---

### WSL (Windows Subsystem for Linux)

You can use GCC and GDB inside WSL for a Linux-like development environment on Windows.

1. Open your WSL terminal (e.g., Ubuntu, Debian).
2. **Update package lists:**
   ```sh
   sudo apt-get update
   ```
3. *(Optional)* Upgrade system packages:
   ```sh
   sudo apt-get dist-upgrade
   ```
4. **Install GCC, G++ and GDB:**
   ```sh
   sudo apt-get install build-essential gdb
   ```

---

> **Tip:** After installing the compiler and debugger, restart VS Code to ensure the extension detects