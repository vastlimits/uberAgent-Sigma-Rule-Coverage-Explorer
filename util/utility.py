import os
from typing import List

def get_rule_directory():
    return os.path.join(os.getcwd(), "rules")

def get_rule_paths(path) -> List[str]:

    result: List[str] = []

    def yield_next_rule_file_path(rule_path: str) -> str:
        for root, _, files in os.walk(rule_path):
            for file in files:
                if file.endswith(".yml"):
                    yield os.path.join(root, file)

    for file in yield_next_rule_file_path(rule_path=path):
        result.append(file)

    return result


def get_rule(path) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()
