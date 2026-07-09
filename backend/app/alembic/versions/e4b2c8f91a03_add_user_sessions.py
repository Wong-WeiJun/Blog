"""add user sessions

Revision ID: e4b2c8f91a03
Revises: d8a1f3b20c41
Create Date: 2026-07-09 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = "e4b2c8f91a03"
down_revision = "d8a1f3b20c41"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "usersession",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("user_agent", sqlmodel.sql.sqltypes.AutoString(length=512), nullable=True),
        sa.Column("ip_address", sqlmodel.sql.sqltypes.AutoString(length=45), nullable=True),
        sa.Column("device", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("browser", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("os", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("device_type", sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_usersession_user_id"), "usersession", ["user_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_usersession_user_id"), table_name="usersession")
    op.drop_table("usersession")
