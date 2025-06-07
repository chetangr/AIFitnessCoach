#!/usr/bin/env python3
"""Fix the multi_agent_coordinator.py file"""

import re

# Read the file
with open('agents/multi_agent_coordinator.py', 'r') as f:
    content = f.read()

# Find the _extract_action_items method and replace everything between it and _analyze_message_for_actions
pattern = r'(def _extract_action_items.*?return final_actions\[:5\]  # Limit to 5 most relevant actions)\n.*?(def _analyze_message_for_actions\(self, message: str, agent_type: AgentType\) -> List\[str\]:\n\s+"""Analyze message content to extract implied actions""")'

replacement = r'\1\n    \n    \2'

# Replace the pattern
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write the fixed content back
with open('agents/multi_agent_coordinator.py', 'w') as f:
    f.write(new_content)

print("Fixed multi_agent_coordinator.py")