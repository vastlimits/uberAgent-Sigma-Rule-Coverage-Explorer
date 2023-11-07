#!/usr/bin/env python3
import sys
import os
import json
import yaml
import argparse

from util import utility

from sigma.collection import SigmaCollection

from sigma.backends.uberagent import uberagent as uberagent_backend
from sigma.pipelines.uberagent import uberagent600, uberagent610, uberagent620, uberagent700, uberagent710, uberagent_develop

def get_backends():
    return {
        "uberAgent (develop)": convert_uberagent_develop,
        "uberAgent 7.1": convert_uberagent710,
        "uberAgent 7.0": convert_uberagent700,
        "uberAgent 6.2": convert_uberagent620,
        "uberAgent 6.1": convert_uberagent610,
        "uberAgent 6.0": convert_uberagent600,
    }


def convert_uberagent600(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent600()).convert(rule, "conf")


def convert_uberagent610(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent610()).convert(rule, "conf")


def convert_uberagent620(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent620()).convert(rule, "conf")


def convert_uberagent700(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent700()).convert(rule, "conf")


def convert_uberagent710(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent710()).convert(rule, "conf")


def convert_uberagent_develop(rule: SigmaCollection):
    return uberagent_backend(processing_pipeline=uberagent_develop()).convert(rule, "conf")


def test_rule(path: str) -> bool:
    result: dict = {}
    backends = get_backends()
    for backend in backends.keys():
        convert_function = backends[backend]
        try:
            # Need to read the rule collection each processing round to not have orphaned
            # attached processing items.
            rule_collection = SigmaCollection.from_yaml(utility.get_rule(path))
            output = convert_function(rule_collection)
        except:
            output = None

        result[backend] = output is not None and len(output) > 0

    return result


def get_rule(path: str) -> dict:

    def get_rule_yaml(file_path: str) -> dict:
        data = []
        with open(file_path, encoding="utf-8") as f:
            yaml_parts = yaml.safe_load_all(f)
            for part in yaml_parts:
                data.append(part)
        return data

    result = {
        "id": "",
        "title": "",
        "file": "",
        "status": None,
        "level": None,
        "logsource.category": None,
        "logsource.product": None
    }

    rule_yaml = get_rule_yaml(path)
    if len(rule_yaml) != 1:
        raise FileNotFoundError("Rule {} is a multi-document file and will be skipped.".format(path))

    rule_yaml = rule_yaml[0]
    result["id"] = rule_yaml["id"]
    result["title"] = rule_yaml["title"]
    result["file"] = os.path.relpath(path, os.getcwd()).replace("\\", "/")

    if "status" in rule_yaml:
        result["status"] = rule_yaml["status"]

    if "level" in rule_yaml:
        result["level"] = rule_yaml["level"]

    if "logsource" in rule_yaml:
        logsource = rule_yaml["logsource"]
        if "product" in logsource:
            result["logsource.product"] = logsource["product"]
        if "category" in logsource:
            result["logsource.category"] = logsource["category"]

    return result


def main() -> int:

    parser = argparse.ArgumentParser(description="Process the path to the rule directory")
    parser.add_argument('--rules', type=str, required=True, help='This parameter expects a string that specifies the path to the directory where the rules are located.')
    parser.add_argument('--output', type=str, required=True, help='This parameter expects a string that designates the path to the directory where the output file will be stored.')

    args = parser.parse_args()

    output_rules: [] = []
    output_backend_status: dict = {}
    count = 0

    rule_paths = utility.get_rule_paths(args.rules)
    for rule_path in rule_paths:
        count = count + 1

        print("Processing rule={}".format(rule_path))

        rule = get_rule(rule_path)
        output_rules.append(rule)

        rule_test_result = test_rule(rule_path)
        for backend in rule_test_result.keys():
            is_supported = rule_test_result[backend]
            if not (backend in output_backend_status):
                output_backend_status[backend] = []
            if is_supported:
                output_backend_status[backend].append(rule["id"])


    with open(args.output, mode="w", encoding="utf-8") as fp:
        json.dump({ "rules": output_rules, "status": output_backend_status }, fp)

    print("Processed {} rules.".format(count))
    return 0


if __name__ == "__main__":
    sys.exit(main())
