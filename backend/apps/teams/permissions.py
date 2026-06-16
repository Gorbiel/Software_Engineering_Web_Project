from rest_framework.permissions import BasePermission

from apps.teams.models import TeamLeader
from apps.users.models import Admin


def is_glazedin_admin(user):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return Admin.objects.filter(user=user).exists()


class IsTeamLeaderOrAdmin(BasePermission):
    """Allow GlazedIn admins or leaders of the team referenced in the URL."""

    message = "Must be a team leader or GlazedIn admin."

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        if is_glazedin_admin(user):
            return True

        team_id = view.kwargs.get("team_id") or view.kwargs.get("pk")
        if not team_id:
            return TeamLeader.objects.filter(user=user).exists()

        return TeamLeader.objects.filter(user=user, team_id=team_id).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if is_glazedin_admin(user):
            return True

        return TeamLeader.objects.filter(user=user, team=obj).exists()
