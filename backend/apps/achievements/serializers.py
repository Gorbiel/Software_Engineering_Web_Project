from rest_framework import serializers

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.reactions.serializers import AchievementReactionSerializer
from apps.tags.models import AchievementTag, Tag
from apps.tags.serializers import TagListSerializer
from apps.users.models import User


class AchievementSearchSerializer(serializers.ModelSerializer):
    """Serializer for achievement search results."""

    user = serializers.SerializerMethodField()
    confirmation_count = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = [
            "id",
            "user",
            "title",
            "body",
            "creation_date",
            "confirmation_count",
        ]
        read_only_fields = fields

    def get_user(self, obj):
        """Return minimal user info."""
        return {
            "id": obj.user.id,
            "name": obj.user.name,
            "profile_picture": (
                obj.user.profile_picture.url if obj.user.profile_picture else None
            ),
        }

    def get_confirmation_count(self, obj):
        return obj.achievementconfirmation_set.count()


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
        fields = ["id", "name", "email", "profile_picture"]
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
    achievement_id = serializers.IntegerField(source="achievement.id", read_only=True)
    achievement_title = serializers.CharField(
        source="achievement.title", read_only=True
    )
    requesting_user = UserBasicSerializer(source="achievement.user", read_only=True)
    receiving_user = UserBasicSerializer(read_only=True)
    receiving_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source="receiving_user",
        required=False,
    )

    class Meta:
        model = ConfirmationRequest
        fields = [
            "id",
            "achievement_id",
            "achievement_title",
            "requesting_user",
            "receiving_user",
            "receiving_user_id",
            "creation_date",
        ]
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
    reactions = AchievementReactionSerializer(
        source="achievementreaction_set", many=True, read_only=True
    )
    reaction_count = serializers.SerializerMethodField()
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )
    tags = serializers.SerializerMethodField()

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
            "reactions",
            "reaction_count",
            "tags",
            "tag_ids",
        ]
        read_only_fields = [
            "id",
            "creation_date",
            "user",
            "confirmations",
            "reactions",
            "tags",
        ]

    def validate_tag_ids(self, value):
        """Validate that no more than 5 tags are provided"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 tags allowed per achievement.")
        return value

    def get_confirmation_count(self, obj):
        return obj.achievementconfirmation_set.count()

    def get_reaction_count(self, obj):
        return obj.achievementreaction_set.count()

    def get_tags(self, obj):
        tags = Tag.objects.filter(achievementtag__achievement=obj).order_by(
            "achievementtag__added_date"
        )
        return TagListSerializer(tags, many=True).data

    def create(self, validated_data):
        tags = validated_data.pop("tag_ids", [])
        achievement = Achievement.objects.create(**validated_data)

        for tag in tags:
            AchievementTag.objects.create(achievement=achievement, tag=tag)

        return achievement

    def update(self, instance, validated_data):
        tags = validated_data.pop("tag_ids", None)
        instance.title = validated_data.get("title", instance.title)
        instance.body = validated_data.get("body", instance.body)
        instance.save()

        # Update tags if provided
        if tags is not None:
            instance.achievementtag_set.all().delete()
            for tag in tags:
                AchievementTag.objects.create(achievement=instance, tag=tag)

        return instance
