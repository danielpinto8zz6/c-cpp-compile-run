# GCC Setup
## Table of Contents
1. [Windows](#Windows)
2. [Linux](#Linux)
3. [MacOS](#MacOs)
4. [WSL Example](#WSL)

### Windows
Install Mingw-w64 via the SourceForge website. Click [ Mingw-w64](https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win32/Personal%20Builds/mingw-builds/installer/mingw-w64-install.exe/download " Mingw-w64") to download the Windows Mingw-w64 installer.
- Run the installer.
- For **Architecture** select **x86_64** and then select **Next**.
- On the Installation Folder page, use the default installation folder. Copy the location as you will need it later.
- Select Next to start the installation.
- Add the path to your Mingw-w64 **bin** folder to the Windows **PATH** environment variable by using the following steps:
	- 	In the Windows search bar, type 'settings' to open your Windows Settings.
	- 	Search for **Edit environment variables for your account**.
	- 	Choose the **Path** variable and then select Edit.
	- 	Select **New** and add the Mingw-w64 destination folder path to the system path. The exact path depends on which version of Mingw-w64 you have installed and where you installed it. If you used the settings above to install Mingw-w64, then add this to the path: `C:\Program Files\mingw-w64\x86_64-8.1.0-posix-seh-rt_v6-rev0\mingw64\bin`
	- 	Select **OK** to save the updated PATH. You will need to reopen any console windows for the new PATH location to be available.

### Linux
- First, check to see whether GCC is already installed. To verify whether it is, open a Terminal window and enter the following command:

	`gcc -v`

- If GCC isn't installed, run the following command from the terminal window to update the **Ubuntu** package lists. An out-of-date Linux distribution can sometimes interfere with attempts to install new packages.

	`sudo apt-get update`

- Next install the GNU compiler tools and the GDB debugger with this command:

	`sudo apt-get install build-essential gdb`

### MacOS
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

