from tortoise import fields
from tortoise.models import Model


class BaseModel(Model):
    id = fields.BigIntField(pk=True, description="主键ID")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        abstract = True
