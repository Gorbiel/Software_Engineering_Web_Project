from rest_framework.permissions import BasePermission

from apps.teams.models import TeamLeader
from apps.users.models import Admin


class IsTeamLeaderOrAdmin(BasePermission):
    """Allow access to GlazedIn admins or leaders of the team referenced in the URL.

    This permission expects the view to provide a `team_id` kwarg (e.g. from the
    URL pattern). If no `team_id` is present it falls back to denying access.
    """

    message = "Must be a team leader or GlazedIn admin."

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        # Admins always allowed
        if Admin.objects.filter(user=user).exists():
            return True

        team_id = view.kwargs.get("team_id")
        if not team_id:
            return False

        return TeamLeader.objects.filter(user=user, team_id=team_id).exists()
