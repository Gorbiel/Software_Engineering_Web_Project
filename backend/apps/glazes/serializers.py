from rest_framework import serializers

from apps.glazes.models import Glaze
from apps.reactions.serializers import GlazeReactionSerializer
from apps.tags.models import GlazeTag, Tag
from apps.tags.serializers import TagListSerializer
from apps.users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "profile_picture"]
        read_only_fields = ["id"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "tag_text", "creation_date"]
        read_only_fields = ["id", "creation_date"]


class GlazeSerializer(serializers.ModelSerializer):
    posting_user = UserBasicSerializer(read_only=True)
    posting_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source="posting_user",
        required=False,
    )
    receiving_user = UserBasicSerializer(read_only=True)
    receiving_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="receiving_user"
    )
    reactions = GlazeReactionSerializer(
        source="glazereaction_set", many=True, read_only=True
    )
    reaction_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
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
            "reactions",
            "reaction_count",
            "tags",
            "tag_ids",
        ]
        read_only_fields = [
            "id",
            "creation_date",
            "posting_user",
            "reactions",
            "tags",
        ]

    def validate(self, data):
        posting_user = data.get("posting_user")
        receiving_user = data.get("receiving_user")

        # Check if posting user is trying to send glaze to themselves
        if posting_user and receiving_user and posting_user == receiving_user:
            raise serializers.ValidationError(
                "A user cannot send a glaze to themselves."
            )

        return data

    def validate_tag_ids(self, value):
        """Validate that no more than 5 tags are provided"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 tags allowed per glaze.")
        return value

    def get_reaction_count(self, obj):
        return obj.glazereaction_set.count()

    def get_tags(self, obj):
        tags = Tag.objects.filter(glazetag__glaze=obj).order_by("glazetag__added_date")
        return TagListSerializer(tags, many=True).data

    def create(self, validated_data):
        tags = validated_data.pop("tag_ids", [])
        glaze = Glaze.objects.create(**validated_data)

        for tag in tags:
            GlazeTag.objects.create(glaze=glaze, tag=tag)

        return glaze

    def update(self, instance, validated_data):
        tags = validated_data.pop("tag_ids", None)
        instance.title = validated_data.get("title", instance.title)
        instance.body = validated_data.get("body", instance.body)
        instance.save()

        # Update tags if provided
        if tags is not None:
            instance.glazetag_set.all().delete()
            for tag in tags:
                GlazeTag.objects.create(glaze=instance, tag=tag)

        return instance
