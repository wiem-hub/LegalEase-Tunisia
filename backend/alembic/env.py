import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.models.user import User
from app.core.database import Base, engine
from app.core.config import settings

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Définir les métadonnées cibles pour l'autogénération.
# Cela doit inclure toutes les tables de vos modèles.
# Assurez-vous que vos modèles sont importés quelque part (par exemple dans core/database.py ou ici)
target_metadata = Base.metadata

# Vous pouvez importer vos modèles ici pour être certain qu'ils sont enregistrés.
# Exemple : from app.models import User, Product   # (décommentez selon votre structure)
# Ou importer tout le module : import app.models

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Utiliser l'URL depuis les settings plutôt que depuis le fichier .ini
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Utiliser l'engine déjà configuré dans core.database
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()