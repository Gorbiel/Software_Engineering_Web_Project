from rest_framework import serializers

from apps.glazes.models import Glaze
from apps.tags.models import GlazeTag, Tag
from apps.users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email"]
        read_only_fields = ["id"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "tag_text", "creation_date"]
        read_only_fields = ["id", "creation_date"]


class GlazeSerializer(serializers.ModelSerializer):
    posting_user = UserBasicSerializer(read_only=True)
    posting_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="posting_user", required=False
    )
    receiving_user = UserBasicSerializer(read_only=True)
    receiving_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="receiving_user"
    )
    tags = TagSerializer(
        source="glazetag_set", many=True, read_only=True
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Glaze
        fields = [
            "id",
            "posting_user",
            "posting_user_id",
            "receiving_user",
            "receiving_user_id",
            "title",
            "body",
            "creation_date",
            "tags",
            "tag_ids",
        ]
        read_only_fields = ["id", "creation_date", "posting_user", "tags"]

    def validate(self, data):
        posting_user = data.get("posting_user")
        receiving_user = data.get("receiving_user")

        # Check if posting user is trying to send glaze to themselves
        if posting_user and receiving_user and posting_user == receiving_user:
            raise serializers.ValidationError(
                "A user cannot send a glaze to themselves."
            )

        return data

    def create(self, validated_data):
        tag_ids = self.initial_data.get("tag_ids", [])
        glaze = Glaze.objects.create(**validated_data)

        for tag_id in tag_ids:
            tag = Tag.objects.get(id=tag_id)
            GlazeTag.objects.create(glaze=glaze, tag=tag)

        return glaze

    def update(self, instance, validated_data):
        instance.title = validated_data.get("title", instance.title)
        instance.body = validated_data.get("body", instance.body)
        instance.save()

        # Update tags if provided
        tag_ids = self.initial_data.get("tag_ids")
        if tag_ids is not None:
            instance.glazetag_set.all().delete()
            for tag_id in tag_ids:
                tag = Tag.objects.get(id=tag_id)
                GlazeTag.objects.create(glaze=instance, tag=tag)

        return instance
