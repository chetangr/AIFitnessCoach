# This file contains the fixed _extract_action_items method and subsequent methods

    def _extract_action_items(self, responses: List[AgentResponse]) -> List[Dict[str, Any]]:
        """Extract actionable items from all agent responses using AI"""
        all_action_items = []
        
        # Get context from the conversation
        context = getattr(self, '_current_context', {})
        
        # Use AI action extractor for each agent response
        for response in responses:
            # Extract actions using AI
            extracted_actions = ai_action_extractor.extract_actions(
                message=response.message,
                agent_type=response.agent_type.value,
                context=context
            )
            
            # Add agent-specific priority boost
            priority_boost = {
                AgentType.FORM_SAFETY: -2,      # Safety first (lower number = higher priority)
                AgentType.RECOVERY: -1,         # Recovery second
                AgentType.FITNESS_ACTION: 0,    # Fitness actions
                AgentType.PRIMARY_COACH: 1,     # General coaching
                AgentType.NUTRITION: 2,         # Nutrition
                AgentType.GOAL: 3              # Goal adjustments
            }.get(response.agent_type, 0)
            
            # Adjust priorities based on agent type
            for action in extracted_actions:
                action["priority"] = action.get("priority", 5) + priority_boost
                action["agent_confidence"] = response.confidence
                all_action_items.append(action)
        
        # Deduplicate actions - keep highest confidence version of each type
        action_map = {}
        for action in all_action_items:
            action_type = action["type"]
            if action_type not in action_map or action.get("confidence", 0) > action_map[action_type].get("confidence", 0):
                action_map[action_type] = action
        
        # Sort by priority and return as list
        final_actions = list(action_map.values())
        final_actions.sort(key=lambda x: (x.get("priority", 99), -x.get("confidence", 0)))
        
        # Log extracted actions for debugging
        logger.info(f"Extracted {len(final_actions)} actions from {len(responses)} agent responses")
        for action in final_actions:
            logger.debug(f"Action: {action['type']} - {action['label']} (priority: {action['priority']}, confidence: {action.get('confidence', 0)})")
        
        return final_actions[:5]  # Limit to 5 most relevant actions
    
    def _analyze_message_for_actions(self, message: str, agent_type: AgentType) -> List[str]:
        """Analyze message content to extract implied actions"""
        actions = []
        
        # Common action patterns
        action_patterns = {
            "add": ["add", "include", "incorporate", "put in"],
            "remove": ["remove", "take out", "delete", "skip"],
            "modify": ["change", "adjust", "modify", "update"],
            "schedule": ["schedule", "plan", "set up", "arrange"],
            "create": ["create", "make", "build", "design"],
            "view": ["show", "display", "view", "see"]
        }
        
        for action, keywords in action_patterns.items():
            if any(keyword in message for keyword in keywords):
                actions.append(action)
        
        return actions
    
    def _calculate_confidence(self, responses: List[AgentResponse]) -> float:
        """Calculate overall confidence score from all agents"""
        if not responses:
            return 0.0
        
        total_confidence = sum(r.confidence for r in responses)
        return round(total_confidence / len(responses), 2)