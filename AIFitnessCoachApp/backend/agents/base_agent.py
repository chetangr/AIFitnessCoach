"""
Base Agent class for all specialized fitness agents using OpenAI SDK
"""
from openai import OpenAI
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import asyncio
from abc import ABC, abstractmethod

from openai.types.beta import Assistant, Thread
from utils.logger import setup_logger

logger = setup_logger(__name__)

class BaseFitnessAgent(ABC):
    """
    Abstract base class for all fitness agents
    """
    
    def __init__(self, api_key: str, user_id: str, agent_name: str, agent_role: str):
        self.client = OpenAI(api_key=api_key)
        self.user_id = user_id
        self.agent_name = agent_name
        self.agent_role = agent_role
        
        # Create assistant
        self.assistant = self._create_assistant()
        
        # Thread management
        self.thread_id: Optional[str] = None
        
    @abstractmethod
    def _get_instructions(self) -> str:
        """Get agent-specific instructions"""
        pass
    
    @abstractmethod
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get agent-specific tools"""
        pass
    
    def _create_assistant(self) -> Assistant:
        """Create the OpenAI Assistant"""
        assistant = self.client.beta.assistants.create(
            name=self.agent_name,
            instructions=self._get_instructions(),
            model="gpt-4o",
            tools=self._get_tools()
        )
        
        logger.info(f"Created {self.agent_name} assistant {assistant.id} for user {self.user_id}")
        return assistant
    
    async def get_or_create_thread(self) -> str:
        """Get existing thread or create new one"""
        if not self.thread_id:
            thread = self.client.beta.threads.create()
            self.thread_id = thread.id
            logger.info(f"Created new thread {self.thread_id} for {self.agent_name}")
        return self.thread_id
    
    async def send_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Send a message to the assistant and get response"""
        try:
            thread_id = await self.get_or_create_thread()
            
            # Add context to message if provided
            if context:
                message = f"Context: {json.dumps(context)}\n\nUser Query: {message}"
            
            # Add user message to thread
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )
            
            # Run the assistant
            run = self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant.id
            )
            
            # Wait for completion
            response = await self._wait_for_completion(thread_id, run.id)
            return response
            
        except Exception as e:
            logger.error(f"Error in {self.agent_name} send_message: {str(e)}")
            raise
    
    async def _wait_for_completion(self, thread_id: str, run_id: str) -> str:
        """Wait for run completion and handle tool calls"""
        while True:
            run = self.client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            
            if run.status == "completed":
                messages = self.client.beta.threads.messages.list(thread_id=thread_id)
                return messages.data[0].content[0].text.value
                
            elif run.status == "requires_action":
                tool_outputs = []
                for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                    output = await self._handle_tool_call(tool_call)
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps(output)
                    })
                
                self.client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread_id,
                    run_id=run_id,
                    tool_outputs=tool_outputs
                )
                
            elif run.status == "failed":
                logger.error(f"Run failed for {self.agent_name}: {run.last_error}")
                raise Exception(f"Assistant run failed: {run.last_error}")
                
            await asyncio.sleep(1)
    
    @abstractmethod
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle tool calls - must be implemented by subclasses"""
        pass
    
    def cleanup(self):
        """Clean up resources"""
        if hasattr(self, 'assistant') and self.assistant:
            try:
                self.client.beta.assistants.delete(self.assistant.id)
                logger.info(f"Deleted {self.agent_name} assistant {self.assistant.id}")
            except Exception as e:
                logger.error(f"Error deleting {self.agent_name} assistant: {e}")
    
    async def get_analysis(self, query: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Get specialized analysis from this agent"""
        context = {
            "agent_role": self.agent_role,
            "analysis_request": query,
            "data": data
        }
        
        response = await self.send_message(
            f"Analyze the following data and provide insights: {query}",
            context
        )
        
        return {
            "agent": self.agent_name,
            "analysis": response,
            "timestamp": datetime.now().isoformat()
        }