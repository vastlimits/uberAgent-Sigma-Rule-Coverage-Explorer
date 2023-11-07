# uberAgent's Sigma Rules Coverage Insights

Explore the expansive reach of Sigma rules within uberAgent's Threat Detection Engine.

# Usage
The script imports all Sigma rules and evaluates the creation of rules for every supported version of the uberAgent pipeline. After this process, it compiles a model.json file that catalogs which rules are compatible and which are not.

Run the script:

```
python rule-coverage.py
```

## Run the test webserver.

### Converting to the latest uberAgent version
To preview the static website including the metadata about rules simply run:

```
cd www
python -m http.server
```
