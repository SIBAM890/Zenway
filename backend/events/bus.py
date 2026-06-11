import asyncio
import inspect
from typing import Dict, List, Callable, Any, Awaitable, Union
import logging

logger = logging.getLogger("zenway.event_bus")

class EventBus:
    def __init__(self):
        # Maps event_type -> list of handlers
        self._handlers: Dict[str, List[Callable[[Dict[str, Any]], Union[None, Awaitable[None]]]]] = {}

    def register(self, event_type: str, handler: Callable[[Dict[str, Any]], Union[None, Awaitable[None]]]):
        """Register a handler for a specific event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        if handler not in self._handlers[event_type]:
            self._handlers[event_type].append(handler)
            logger.info(f"Registered handler {handler.__name__} for event {event_type}")

    async def emit(self, event_type: str, payload: Dict[str, Any]):
        """Emit an event to all registered handlers asynchronously."""
        logger.info(f"Emitting event: {event_type}")
        if event_type not in self._handlers:
            return

        tasks = []
        for handler in self._handlers[event_type]:
            try:
                if inspect.iscoroutinefunction(handler):
                    tasks.append(handler(payload))
                else:
                    # Run synchronous handler in executor or call directly
                    handler(payload)
            except Exception as e:
                logger.error(f"Error preparing handler {handler} for event {event_type}: {e}")

        if tasks:
            # Gather tasks and handle exceptions gracefully
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for handler, res in zip(self._handlers[event_type], results):
                if isinstance(res, Exception):
                    logger.error(f"Error executing handler {handler} for event {event_type}: {res}")

# Global instance of EventBus
event_bus = EventBus()
