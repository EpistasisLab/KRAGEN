# Developers Guide
## Building Docker Images
These are some notes for developers. While following the Installation notes in readme.md, keep the following points in mind:
- Any time a change happens in any source (or **configuration file**, e.g. .env) rebuild the docker images.
    - This is currently necessary since the source code is copied into the docker image when it's built. This need to be improved (we can use volumes in development instead of copying the code)