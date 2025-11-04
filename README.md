# Server Status

A simple and clean Node.js based web interface for your home server! This tool includes:

- **CPU** and **Temperature** monitoring
- **RAM** usage percentage monitoring
- **Disk** usage monitoring
- **Network** usage monitoring
- **Server Uptime** monitoring

## Table of Contents

- [Screenshots](#screenshots)
- [Background](#background)
- [Disclaimer](#disclaimer)
- [Installation](#installation)

## Screenshots

Default view of the tool:

![Default Screenshot](https://github.com/user-attachments/assets/3b60bb2c-96cd-4cc5-967c-9bcee4f49230)

This is what the default background looks like:

![Background Screenshot](https://github.com/user-attachments/assets/11b79782-7051-4a52-aabc-22e3eee30b17)

You can see a realtime demo of this tool [here](https://server-info.fixkr.my.id/).

## Background

You can change the background to your liking by replacing the file at:  ``public/backgrounds/background.png``


## Disclaimer

This tool is only tested in **Ubuntu Server 24.04**. I have tested it in Windows and it has many issues. Please consider using an Ubuntu server for this tool to work well.

## Installation

```bash
git clone https://github.com/Muvikri/server-status/
cd server-status
npm install
npm start
