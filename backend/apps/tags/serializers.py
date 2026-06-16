from rest_framework import serializers

from apps.tags.models import AchievementTag, GlazeTag, Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model with scope information"""

    is_global = serializers.BooleanField(read_only=True)
    team_name = serializers.CharField(
        source="team.name", read_only=True, allow_null=True
    )
    scope = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(
        source="created_by.name", read_only=True, allow_null=True
    )

    class Meta:
        model = Tag
        fields = [
            "id",
            "tag_text",
            "team",
            "team_name",
            "is_global",
            "scope",
            "created_by",
            "created_by_name",
            "creation_date",
        ]
        read_only_fields = ["id", "created_by", "creation_date"]

    def validate(self, data):
        """Validate tag creation permissions"""
        request = self.context.get("request")
        user = request.user if request else None

        team = data.get("team")

        if team is None:
            if not user:
                raise serializers.ValidationError("Authentication required.")
        else:
            raise serializers.ValidationError("Tags are global and cannot be scoped.")

        return data

    def get_scope(self, obj):
        """Return scope description"""
        if obj.is_global:
            return "Global"
        return f"Team: {obj.team.name}" if obj.team else "Unknown"

    def create(self, validated_data):
        """Set created_by to current user"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class TagListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing tags"""

    is_global = serializers.BooleanField(read_only=True)
    scope = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ["id", "tag_text", "is_global", "scope"]

    def get_scope(self, obj):
        """Return scope description"""
        if obj.is_global:
            return "Global"
        return f"Team: {obj.team.name}" if obj.team else "Unknown"


class AchievementTagSerializer(serializers.ModelSerializer):
    """Serializer for AchievementTag with tag details"""

    tag_details = TagListSerializer(source="tag", read_only=True)
    tag_id = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source="tag", write_only=True
    )

    class Meta:
        model = AchievementTag
        fields = ["id", "tag_id", "tag_details", "added_date"]
        read_only_fields = ["id", "added_date"]


class GlazeTagSerializer(serializers.ModelSerializer):
    """Serializer for GlazeTag with tag details"""

    tag_details = TagListSerializer(source="tag", read_only=True)
    tag_id = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source="tag", write_only=True
    )

    class Meta:
        model = GlazeTag
        fields = ["id", "tag_id", "tag_details", "added_date"]
        read_only_fields = ["id", "added_date"]


# Made with Bob
