# EDUcord

Die ultimative Aufnahme App für Professoren und Dozenten.

### Features

-   Aufnahme.
-   Upload auf die covod Platform.
-   PDF Seitenerkennung mit Timestamp verlinkung.

### Maintainer

-   Louis
-   Michel
-   Luca

### Installation

Clone this repository and cd in the directory. Run the following command to install the dependencies:

```sh
$ npm i # install dependencies
```

### Build and Run

To build and start the app run the following commands:

```sh
$ npm run build # build the program
$ npm run start # start the program
```

If you want to do both at once, you can run:

```sh
$ npm run build:start # npm run build && npm run start
```

### Packaging

#### Target-Packaging

To package the application for your system, just run the following command:

```sh
$ npm run pack:<PLATFORM>
```

where `<PLATFORM>` is one of the following: `linux`, `win` or `mac` depending on your operating system.

#### Auto-Packaging

If you want to automatically package your application, run the following command:

```sh
$ npm run pack:auto
```

**NOTE**

This only supports `x64` architectures.