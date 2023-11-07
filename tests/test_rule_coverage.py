import os
from util import utility

def test_rule_directory():
   assert os.path.exists(utility.get_rule_directory())


def test_rules():
   assert len(utility.get_rules(utility.get_rule_directory())) > 0
