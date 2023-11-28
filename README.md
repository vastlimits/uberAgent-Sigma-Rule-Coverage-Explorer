# uberAgent Sigma Rule Coverage Explorer

This is a static, client-side-only web app that allows you to browse and explore the Sigma rules supported by uberAgent ESA's Threat Detection Engine for multiple versions of uberAgent.

# Usage

The script imports all Sigma rules and evaluates the creation of rules for every supported version of the uberAgent pipeline. After this process, it compiles a model.json file that catalogs which rules are compatible and which are not.

Run the script:

```
python rule-coverage.py --rules /path/to/rules --output model.json
```
