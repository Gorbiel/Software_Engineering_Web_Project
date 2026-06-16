from rest_framework import serializers

from apps.teams.models import Team


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model."""

    class Meta:
        model = Team
        fields = ["id", "name", "creation_date"]
        read_only_fields = ["id", "creation_date"]
