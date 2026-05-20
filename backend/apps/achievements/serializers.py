from rest_framework import serializers

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.tags.models import AchievementTag, Tag
from apps.users.models import User


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "tag_text", "creation_date"]
        read_only_fields = ["id", "creation_date"]


class AchievementTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    tag_id = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), write_only=True, source="tag"
    )

    class Meta:
        model = AchievementTag
        fields = ["id", "tag", "tag_id"]
        read_only_fields = ["id", "tag"]


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email"]
        read_only_fields = ["id"]


class AchievementConfirmationSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user", required=False
    )

    class Meta:
        model = AchievementConfirmation
        fields = ["id", "user", "user_id", "creation_date"]
        read_only_fields = ["id", "creation_date", "user"]


class ConfirmationRequestSerializer(serializers.ModelSerializer):
    receiving_user = UserBasicSerializer(read_only=True)
    receiving_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source="receiving_user",
        required=False,
    )

    class Meta:
        model = ConfirmationRequest
        fields = ["id", "receiving_user", "receiving_user_id", "creation_date"]
        read_only_fields = ["id", "creation_date"]


class AchievementSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user", required=False
    )
    confirmations = AchievementConfirmationSerializer(
        source="achievementconfirmation_set", many=True, read_only=True
    )
    confirmation_count = serializers.SerializerMethodField()
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )
    tags = TagSerializer(
        source="achievementtag_set", many=True, read_only=True
    )

    class Meta:
        model = Achievement
        fields = [
            "id",
            "user",
            "user_id",
            "title",
            "body",
            "creation_date",
            "confirmations",
            "confirmation_count",
            "tags",
            "tag_ids",
        ]
        read_only_fields = ["id", "creation_date", "user", "confirmations", "tags"]

    def get_confirmation_count(self, obj):
        return obj.achievementconfirmation_set.count()

    def create(self, validated_data):
        tag_ids = self.initial_data.get("tag_ids", [])
        achievement = Achievement.objects.create(**validated_data)

        for tag_id in tag_ids:
            tag = Tag.objects.get(id=tag_id)
            AchievementTag.objects.create(achievement=achievement, tag=tag)

        return achievement

    def update(self, instance, validated_data):
        instance.title = validated_data.get("title", instance.title)
        instance.body = validated_data.get("body", instance.body)
        instance.save()

        # Update tags if provided
        tag_ids = self.initial_data.get("tag_ids")
        if tag_ids is not None:
            instance.achievementtag_set.all().delete()
            for tag_id in tag_ids:
                tag = Tag.objects.get(id=tag_id)
                AchievementTag.objects.create(achievement=instance, tag=tag)

        return instance
