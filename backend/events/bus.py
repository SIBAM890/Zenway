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

    async def emit(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Emit an event to all registered handlers asynchronously.
        
        Returns {"success": bool, "errors": list[str]} so callers can
        optionally inspect whether any handler failed.
        """
        logger.info(f"Emitting event: {event_type}")
        errors: List[str] = []

        if event_type not in self._handlers:
            return {"success": True, "errors": []}

        tasks = []
        async_handlers = []
        for handler in self._handlers[event_type]:
            try:
                if inspect.iscoroutinefunction(handler):
                    tasks.append(handler(payload))
                    async_handlers.append(handler)
                else:
                    handler(payload)
            except Exception as e:
                msg = f"Handler '{handler.__name__}' failed preparing for event '{event_type}': {e}"
                logger.error(msg)
                errors.append(msg)

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for handler, res in zip(async_handlers, results):
                if isinstance(res, Exception):
                    msg = f"Handler '{handler.__name__}' raised during event '{event_type}': {res}"
                    logger.error(msg)
                    errors.append(msg)

        return {"success": len(errors) == 0, "errors": errors}

# Global instance of EventBus
event_bus = EventBus()
