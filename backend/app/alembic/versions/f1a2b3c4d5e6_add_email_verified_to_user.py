"""add email_verified to user

Revision ID: f1a2b3c4d5e6
Revises: e4b2c8f91a03
Create Date: 2026-07-09 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f1a2b3c4d5e6"
down_revision = "e4b2c8f91a03"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "user",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute('UPDATE "user" SET email_verified = true')
    op.alter_column("user", "email_verified", server_default=None)


def downgrade():
    op.drop_column("user", "email_verified")
