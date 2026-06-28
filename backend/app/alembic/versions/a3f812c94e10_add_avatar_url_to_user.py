"""add avatar_url to user

Revision ID: a3f812c94e10
Revises: 54f062e2db2b
Create Date: 2026-06-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a3f812c94e10'
down_revision = '54f062e2db2b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column(
            'avatar_url',
            sqlmodel.sql.sqltypes.AutoString(length=1000),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column('user', 'avatar_url')
