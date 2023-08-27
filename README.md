![Logo](resources/logo.png)

# C/C++ Compile Run extension
<a href="https://www.buymeacoffee.com/danielpinto8zz6" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
[![Support via PayPal](resources/paypal-donate-button.png)](https://www.paypal.me/danielpinto8zz6/)

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/danielpinto8zz6.c-cpp-compile-run)](https://marketplace.visualstudio.com/items?itemName=danielpinto8zz6.c-cpp-compile-run)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/danielpinto8zz6.c-cpp-compile-run)](https://marketplace.visualstudio.com/items?itemName=danielpinto8zz6.c-cpp-compile-run)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/danielpinto8zz6.c-cpp-compile-run)](https://marketplace.visualstudio.com/items?itemName=danielpinto8zz6.c-cpp-compile-run&ssr=false#review-details)
[![Open VSX Version](https://img.shields.io/open-vsx/v/danielpinto8zz6/c-cpp-compile-run)](https://open-vsx.org/extension/danielpinto8zz6/c-cpp-compile-run)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/danielpinto8zz6/c-cpp-compile-run)](https://open-vsx.org/extension/danielpinto8zz6/c-cpp-compile-run)
[![Open VSX Rating](https://img.shields.io/open-vsx/rating/danielpinto8zz6/c-cpp-compile-run)](https://open-vsx.org/extension/danielpinto8zz6/c-cpp-compile-run/reviews)

An extension running on [Visual Studio Code](https://code.visualstudio.com) to **Compile, Run & Debug** single c/c++ files easily

![Extension](resources/extension.png)

## Features

Compile, Run & Debug C/C++ opened file directly from the command palette, by pressing 'f6', 'f7', 'f5', or by using status bar/menu icons.

## Requirements

* If you are on linux you must install gcc ([see instructions](docs/COMPILER_SETUP.md#Linux))
* If you are on window you must install tdm-gcc ([see instructions](docs/COMPILER_SETUP.md#Windows))
* If you are on mac os you must install clang/gcc ([see instructions](docs/COMPILER_SETUP.md#MacOS))

## How to use
Make sure you have .c or .cpp file open.
Press "F6", this will compile and run the file using default arguments in settings.
If you press "F7", this will use the arguments you specify for the program.
You can also debug by pressing "F5". Or you can use the status bar/menu items.

If you want to register gcc/g++ path manually, you can set it under settings.
You can also set to save file before compiling.

## Configurations
| Key                                         | Description                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| c-cpp-compile-run.c-compiler                | The C compiler path (e.g: /usr/bin/gcc or C:\\TDM-GCC-64\\bin\\gcc.exe) |
| c-cpp-compile-run.cpp-compiler              | The Cpp compiler path (e.g: /usr/bin/g++ C:\\TDM-GCC-64\\bin\\gcc.exe)  |
| c-cpp-compile-run.save-before-compile       | Whether should save the file before compiling                           |
| c-cpp-compile-run.c-flags                   | The C flags: e.g. -Wall. default: -Wall -Wextra -g3                     |
| c-cpp-compile-run.cpp-flags                 | The Cpp flags: e.g. -Wall. default: -Wall -Wextra -g3                   |
| c-cpp-compile-run.run-args                  | The run arguments                                                       |
| c-cpp-compile-run.run-in-external-terminal  | Whether should run in an external terminal                              |
| c-cpp-compile-run.should-show-notifications | Whether should show notifications                                       |
| c-cpp-compile-run.output-location           | Custom output location for the compiled file                            |
| c-cpp-compile-run.custom-run-prefix         | Prefix command before run (e.g: valgrind ./foobar)                      |

## Keybindings
| Linux  | Windows | Mac   | Description                                                     |
| ------ | ------- | ----- | --------------------------------------------------------------- |
| f6     | f6      | cmd+r | Compiles and runs the file                                      |
| crtl+6 | ctrl+6  | cmd+6 | Compiles and runs the file                                      |
| f8     | f8      | cmd+y | Compiles and run the file in external console                   |
| f7     | f7      | cmd+t | Compiles and run the file specifying custom arguments and flags |
| f5     | f5      | cmd+5 | Debugs the file (includes compile)                              |

## Release Notes

Refer to [CHANGELOG](CHANGELOG.md)
