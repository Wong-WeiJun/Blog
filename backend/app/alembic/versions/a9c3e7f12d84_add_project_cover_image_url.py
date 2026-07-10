"""add project cover_image_url

Revision ID: a9c3e7f12d84
Revises: f1a2b3c4d5e6
Create Date: 2026-07-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = "a9c3e7f12d84"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "project",
        sa.Column(
            "cover_image_url",
            sqlmodel.sql.sqltypes.AutoString(length=1000),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("project", "cover_image_url")
