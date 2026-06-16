from rest_framework import serializers

from apps.teams.models import Team
from apps.users.models import User


class TeamUserSerializer(serializers.ModelSerializer):
    """Compact user representation for team membership lists."""

    rank_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "job_title",
            "profile_picture",
            "rank",
            "rank_name",
        ]
        read_only_fields = fields


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model."""

    members = serializers.SerializerMethodField()
    leaders = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ["id", "name", "creation_date", "members", "leaders"]
        read_only_fields = ["id", "creation_date", "members", "leaders"]

    def get_members(self, obj):
        users = User.objects.filter(teammember__team=obj).order_by("name", "id")
        return TeamUserSerializer(users, many=True, context=self.context).data

    def get_leaders(self, obj):
        users = User.objects.filter(teamleader__team=obj).order_by("name", "id")
        return TeamUserSerializer(users, many=True, context=self.context).data


class TeamUserMutationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("User does not exist.")
        return value

    @property
    def user(self):
        return User.objects.get(pk=self.validated_data["user_id"])
