# apps/teams/serializers.py

from rest_framework import serializers

from apps.teams.models import Team, TeamLeader, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    job_title = serializers.CharField(source="user.job_title", read_only=True)

    class Meta:
        model = TeamMember
        fields = ["user_id", "name", "email", "job_title", "rank"]


class TeamLeaderSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = TeamLeader
        fields = ["user_id", "name", "email"]


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(source="teammember_set", many=True, read_only=True)
    leaders = TeamLeaderSerializer(source="teamleader_set", many=True, read_only=True)

    # annotated fields — present only when queryset includes them
    member_count = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = Team
        fields = ["id", "name", "creation_date", "member_count", "leaders", "members"]
