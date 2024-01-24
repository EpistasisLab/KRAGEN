# Release process
1.  **Update the `.env` file with a new version number.** Update the TAG environment variable in `.env` to the current production version
as per [semantic versioning](https://semver.org/) and the python package
version specification [PEP440](https://www.python.org/dev/peps/pep-0440).
Development images should have a tag indicating it is a
[pre-release](https://www.python.org/dev/peps/pep-0440/#pre-releases)
(for example, `a0`).
2. **Build production docker images with:**  
`bash release/generate_production_release.sh`
3. **Check that the docker images were pushed to DockerHub and tag the production git branch by
running:**  
`bash release/deploy_production_release.sh`