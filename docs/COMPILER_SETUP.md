# GCC Setup
## Table of Contents
1. [Windows](#Windows)
2. [Linux](#Linux)
3. [MacOS](#MacOs)
4. [WSL Example](#WSL)

### Windows
Install Tdm-gcc via the website. Click [ Tdm-gcc](https://jmeubank.github.io/tdm-gcc/download/ " Tdm-gcc") to download the Windows Tdm-gcc installer.
- Run the installer.
- Select create a new install
- Choose your **Architecture** and then select **Next** until complete.
- Restart your vscode

### Linux
- First, check to see whether GCC is already installed. To verify whether it is, open a Terminal window and enter the following command:

	`gcc -v`

- If GCC isn't installed, run the following command from the terminal window to update the **Ubuntu** package lists. An out-of-date Linux distribution can sometimes interfere with attempts to install new packages.

	`sudo apt-get update`

- Next install the GNU compiler tools and the GDB debugger with this command:

	`sudo apt-get install build-essential gdb`

### MacOS
On MacOS you can use gcc or clang, choose the one you prefer.

#### gcc
- Install [Homebrew]("https://brew.sh/").
- After Homebrew installs, type in the terminal:

`brew install gcc gdb`

#### Clang
- Ensure Clang is installed
- Clang may already be installed on your Mac. To verify that it is, open a macOS Terminal window and enter the following command:

	`clang --version`

- If Clang isn't installed, enter the following command to install the command line developer tools:

	`xcode-select --install`

### WSL

- Open the Bash shell for WSL. If you installed an Ubuntu distro, type "Ubuntu" in the Windows search box and then click on it in the result list. For Debian, type "Debian", and so on.
- The shell appears with a command prompt that by default consists of your user name and computer name, and puts you in your home directory. For Ubuntu it looks like this:
- Although you will be using VS Code to edit your source code, you'll be compiling the source code on Linux using the gcc or g++ compiler.
- From the WSL command prompt, first run apt-get update to update the Ubuntu package lists. An out-of-date distro can sometimes interfere with attempts to install new packages.

	`    sudo apt-get update
	`

- If you like, you can run sudo apt-get update && sudo apt-get dist-upgrade to also download the latest versions of the system packages, but this can take significantly longer depending on your connection speed.
- From the command prompt, install the GNU compiler tools by typing:

	`    sudo apt-get install build-essential gdb
	`

