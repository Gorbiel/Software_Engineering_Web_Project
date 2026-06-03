from rest_framework import serializers

from apps.teams.models import TeamMember


class RankField(serializers.Field):
    """Accept either an integer rank or a textual rank name and normalize to int."""

    def to_internal_value(self, data):
        # Accept integer
        if isinstance(data, int):
            if 1 <= data <= 100:
                return data
            raise serializers.ValidationError("Rank must be between 1 and 100")

        # Accept string name
        if isinstance(data, str):
            try:
                return TeamMember.rank_value_from_name(data)
            except ValueError as exc:
                raise serializers.ValidationError("Invalid rank name") from exc

        raise serializers.ValidationError("Invalid type for rank")

    def to_representation(self, value):
        # Represent as integer
        return int(value)


class TeamMemberRankSerializer(serializers.Serializer):
    rank = RankField()


class TeamMemberResponseSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    rank = serializers.IntegerField()
    rank_name = serializers.SerializerMethodField()

    def get_rank_name(self, obj):
        # obj might be a dict passed by the view
        if isinstance(obj, dict):
            rank_val = obj.get("rank")
        else:
            rank_val = getattr(obj, "rank", None)

        try:
            return TeamMember.Rank(int(rank_val)).name.lower()
        except Exception:
            return "custom"
