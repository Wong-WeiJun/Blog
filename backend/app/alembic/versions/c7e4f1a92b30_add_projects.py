"""add projects

Revision ID: c7e4f1a92b30
Revises: a3f812c94e10
Create Date: 2026-07-07 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'c7e4f1a92b30'
down_revision = 'a3f812c94e10'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'project',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('stack', sa.JSON(), nullable=False),
        sa.Column('status', sa.Enum('completed', 'in_progress', 'archived', name='projectstatus'), nullable=False),
        sa.Column('stars', sa.Integer(), nullable=False),
        sa.Column('forks', sa.Integer(), nullable=False),
        sa.Column('github_url', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('live_url', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('accent', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('category', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('project')
    op.execute('DROP TYPE IF EXISTS projectstatus')
