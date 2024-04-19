# Developers Guide
## Building Docker Images
These are some notes for developers. While following the Installation notes in readme.md, keep the following points in mind:
- Any time the source code is updated, **rebuild** the docker images.
    - This is currently necessary since the source code is copied into the docker image when it's built. This need to be improved (we can use volumes in development instead of copying the code)
    - updating a config variable (e.g. .env) should not require a rebuild of the docker image. Just make sure to stop the currently running container and restart it.
    - To see what environmental variables a particular container is using, you can run `docker inspect <container-name>`