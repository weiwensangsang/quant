from dependency_injector import containers
from dependency_injector import providers

from app.core.config import settings


class ApplicationContainer(containers.DeclarativeContainer):
    config = providers.Configuration()


container = ApplicationContainer()
container.config.from_pydantic(settings)
