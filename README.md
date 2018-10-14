# C/C++ Compile Run extension

An extension running on [Visual Studio Code](https://code.visualstudio.com) to **Compile & Run** single c/c++ files easly

## Donation

If you like this extension, you can donate via **[PayPal](https://www.paypal.me/danielpinto8zz6)**. It will help me to spend more time improving this!

## Features

Compile & Run C/C++ opened file directly from the command pallet or by pressing 'f6'

## Requirements

* If you are on linux you must install gcc
* If you are on window you must install mingw

## How to use
Make sure you have .c or .cpp file open and press "F6", this will compile the file.
If you want to register gcc/g++ path manually you can set it under settings.
You can also set to save file before compiling.

## Extension Settings

## Known Issues

## Release Notes

### 0.3.0
- Compilation flags & args
- Restored g++ support
- Clear terminal + output channel

### 0.2.7
- Fix settings
- Fix compiler find on windows

### 0.2.5
- Allow to compile with flags
- Allow to run with argumets
- If compiler is not found you can set the new path on while compiling

### 0.2.4
- Allow to change compiler path
- Allow to save before compile

### 0.2.3
- Allow to compile or run without doing both
- Cleanup code

### 0.2.2
- Add project links
- Add donation information

### 0.2.0
- Rework compiling method + log
- Redirect errors to output
- Add info/error messages
- Only run in terminal if succeed

### 0.1.1
- Revert to old code

### 0.1.0
- Fix vulnerabilities
- Show output in Error/Info message
- Fix compilation on windows

### 0.0.6
- Only show command on c or cpp files

### 0.0.5
- Fix compile & run on windows
- Add icon

### 0.0.1

- Initial release
