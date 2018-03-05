"""empty message

Revision ID: f94c154af3b7
Revises: d43151b344d6
Create Date: 2018-03-05 18:37:31.885349

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f94c154af3b7'
down_revision = 'd43151b344d6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('property', sa.Column('guests_cnt', sa.String(length=5), nullable=True))
    op.add_column('property', sa.Column('private_bathroom', sa.String(length=15), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('property', 'private_bathroom')
    op.drop_column('property', 'guests_cnt')
    # ### end Alembic commands ###